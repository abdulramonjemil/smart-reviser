import { withSSRContext } from "aws-amplify"
import MindsDB from "mindsdb-js-sdk"
import mysql from "mysql"

import * as queries from "../../graphql/queries"
import { countWords, getXRandomSequentialValuesFrom } from "../../lib/utilities"
import {
  HIGHEST_MAX_QUESTIONS_COUNT_PER_PROMPT,
  isValidQuizDetails,
  MIN_LESSON_CONTENT_WORD_COUNT,
  QUIZ_GENERATION_PARAMS,
  QUIZ_GEN_HIGHEST_MAX_QUESTIONS_COUNT,
  QUIZ_GEN_LOWEST_MAX_QUESTIONS_COUNT,
  toUsablePromptChunks
} from "../../shared/lesson-quiz"

export default async function quizGenerationHandler(req, res) {
  const SSR = withSSRContext({ req })

  if (req.method !== "GET") {
    res.status(405).end()
    return
  }

  try {
    await SSR.Auth.currentAuthenticatedUser()
  } catch (error) {
    res.status(401).end()
    return
  }

  const {
    [QUIZ_GENERATION_PARAMS.LESSON_ID]: lessonId,
    [QUIZ_GENERATION_PARAMS.MAX_QUESTIONS_COUNT]: maxQuestionsCountStr
  } = req.query

  if (typeof lessonId !== "string" || lessonId === "") {
    res
      .status(400)
      .end(`Invalid '${QUIZ_GENERATION_PARAMS.LESSON_ID}' query field`)
    return
  }

  const maxQuestionsCount = Number(maxQuestionsCountStr)
  if (
    typeof maxQuestionsCount !== "number" ||
    !Number.isInteger(maxQuestionsCount) ||
    maxQuestionsCount < QUIZ_GEN_LOWEST_MAX_QUESTIONS_COUNT ||
    maxQuestionsCount > QUIZ_GEN_HIGHEST_MAX_QUESTIONS_COUNT
  ) {
    res
      .status(400)
      .end(
        `Invalid '${QUIZ_GENERATION_PARAMS.MAX_QUESTIONS_COUNT}' query field`
      )
    return
  }

  let lessonContent = null

  try {
    const lessonFetchingResult = await SSR.API.graphql({
      query: queries.getLesson,
      variables: { id: lessonId }
    })

    const lessonContentToUse = lessonFetchingResult.data.getLesson.content
    if (typeof lessonContentToUse !== "string" || lessonContentToUse === "")
      throw lessonContentToUse

    lessonContent = lessonContentToUse
  } catch (error) {
    console.log("Error occured while loading lesson", error)
    res.status(500).end()
    return
  }

  // Mindsdb SQL errors when it encounters single quotes for some reason
  const finalLessonContentToUse = lessonContent.replace(/'/g, "ʼ")
  const chunksToUseInPrompts = toUsablePromptChunks(finalLessonContentToUse)

  if (chunksToUseInPrompts.length < 2) {
    if (
      chunksToUseInPrompts.length === 0 ||
      countWords(chunksToUseInPrompts[0]) < MIN_LESSON_CONTENT_WORD_COUNT
    ) {
      res
        .staus(400)
        .end("Lesson content word count is not up to the required minimum")
      return
    }
  }

  let questionsCountPerPrompt = 0
  let numberOfPromptChunksToUse = 0

  if (maxQuestionsCount >= chunksToUseInPrompts.length) {
    const potentialHighestQuestionsCountPerPrompt = Math.floor(
      maxQuestionsCount / chunksToUseInPrompts.length
    )

    questionsCountPerPrompt =
      potentialHighestQuestionsCountPerPrompt <
      HIGHEST_MAX_QUESTIONS_COUNT_PER_PROMPT
        ? potentialHighestQuestionsCountPerPrompt
        : HIGHEST_MAX_QUESTIONS_COUNT_PER_PROMPT
    numberOfPromptChunksToUse = chunksToUseInPrompts.length
  } else {
    questionsCountPerPrompt = 1
    numberOfPromptChunksToUse = maxQuestionsCount
  }

  // See the CREATE MODEL STATEMENT in /src/quiz-gen-prompt.txt and sample in
  // /src/quiz-gen-sample.txt
  const quizGenerationQueriesAlt = chunksToUseInPrompts.map(
    (chunk) => `
      SELECT lesson_quiz
      FROM mindsdb.lesson_quiz_generator
      WHERE questions_count = '${questionsCountPerPrompt}'
      AND lesson_content = ${mysql.escape(chunk)}
    `
  )

  try {
    await MindsDB.connect({
      user: process.env.MINDSDB_CLOUD_USERNAME,
      password: process.env.MINDSDB_CLOUD_PASSWORD
    })
  } catch (error) {
    console.log("Error occured while connecting with MindsDB", error)
    res.status(500).end()
    return
  }

  const quizGenerationQueries =
    quizGenerationQueriesAlt.length <= numberOfPromptChunksToUse
      ? quizGenerationQueriesAlt
      : getXRandomSequentialValuesFrom(
          quizGenerationQueriesAlt,
          numberOfPromptChunksToUse
        )

  try {
    const settledQueryResults = await Promise.allSettled(
      quizGenerationQueries.map((query) => MindsDB.SQL.runQuery(query))
    )

    const queriesWithNonEmptyRows = []
    const queryResultsWithNonEmptyRows = settledQueryResults.filter(
      (settledResult, index) => {
        const resultIsFulfilled = settledResult.status === "fulfilled"
        const resultHasRows =
          resultIsFulfilled && settledResult.value.rows.length > 0

        if (!resultIsFulfilled) {
          console.log(
            "Query returned unfulfilled:",
            settledResult.reason,
            "\nThe query that resulted in the error:",
            quizGenerationQueries[index]
          )
        } else if (!resultHasRows) {
          console.log(
            "Query retured no rows.",
            "Value returned:",
            settledResult.value,
            "\nThe query that resulted in the error:",
            quizGenerationQueries[index]
          )
        }

        const isAppropriateResult = resultIsFulfilled && resultHasRows
        if (isAppropriateResult)
          queriesWithNonEmptyRows.push(quizGenerationQueries[index])
        return isAppropriateResult
      }
    )

    // Only one row of data is expected from the query and it should have the
    // lesson quiz entry
    const quizStringsInResultsWithNonEmptyRows =
      queryResultsWithNonEmptyRows.map(
        (result) => result.value.rows[0].lesson_quiz
      )

    const INVALID_QUIZ_DETAILS_OBJECT_SYMBOL = Symbol(
      "INVALID_QUIZ_DETAILS_OBJECT"
    )

    const potentialQuizDetailsObjectsArray =
      quizStringsInResultsWithNonEmptyRows.map((quizDetailsString, index) => {
        // In case the model returns a value that's not directly a valid JSON,
        // we'll look for the first occurrence of an opening curly brace, and
        // the last occurrence of a closing curly brace in the string, extract
        // it, and try to parse as JSON instead of the whole string.
        const indexOfFirstOpeningCurlyBrace = quizDetailsString.indexOf("{")
        const indexOfLastClosingCurlyBrace = quizDetailsString.lastIndexOf("}")

        const thereIsNoOpeningCurlyBrace = indexOfFirstOpeningCurlyBrace < 0
        const thereIsNoClosingCurlyBrace = indexOfLastClosingCurlyBrace < 0
        const curlyBracesAreMisarranged =
          indexOfLastClosingCurlyBrace < indexOfFirstOpeningCurlyBrace

        if (
          thereIsNoOpeningCurlyBrace ||
          thereIsNoClosingCurlyBrace ||
          curlyBracesAreMisarranged
        ) {
          console.log(
            "Got malformed JSON response:",
            quizDetailsString,
            "\nThe query that resulted in the error:",
            queriesWithNonEmptyRows[index]
          )
          return INVALID_QUIZ_DETAILS_OBJECT_SYMBOL
        }

        const quizDetailsStringToValidate = quizDetailsString.substring(
          indexOfFirstOpeningCurlyBrace,
          indexOfLastClosingCurlyBrace + 1
        )

        let quizDetailsObject = null
        let quizDetailsStringParsingErrorOccurred = false

        try {
          quizDetailsObject = JSON.parse(quizDetailsStringToValidate)
        } catch (error) {
          console.log(
            "Got malformed JSON object string:",
            quizDetailsStringToValidate,
            "\nThe query that resulted in the error:",
            queriesWithNonEmptyRows[index]
          )

          quizDetailsStringParsingErrorOccurred = true
        }

        if (quizDetailsStringParsingErrorOccurred) {
          return INVALID_QUIZ_DETAILS_OBJECT_SYMBOL
        }

        return quizDetailsObject
      })

    const quizDetailsObjectsArray = potentialQuizDetailsObjectsArray.filter(
      (item, index) => {
        const itemIsParsedObject = item !== INVALID_QUIZ_DETAILS_OBJECT_SYMBOL
        const itemIsValidQuizDetailsObject =
          itemIsParsedObject && isValidQuizDetails(item)

        if (itemIsParsedObject && !itemIsValidQuizDetailsObject) {
          console.log(
            "Got invalid quiz details object:",
            JSON.stringify(item, null, 2),
            "\nThe query that resulted in the error:",
            queriesWithNonEmptyRows[index]
          )
        }

        return itemIsParsedObject && itemIsValidQuizDetailsObject
      }
    )

    let finalQuizDetailsArray = quizDetailsObjectsArray.reduce(
      (questionsArray, currentValue) => [
        ...questionsArray,
        ...currentValue.quizDetails
      ],
      []
    )

    if (finalQuizDetailsArray.length > maxQuestionsCount) {
      finalQuizDetailsArray = getXRandomSequentialValuesFrom(
        finalQuizDetailsArray,
        maxQuestionsCount
      )
    } else if (finalQuizDetailsArray.length === 0) {
      console.log(
        "All query results couldn't be combined to a valid quiz object"
      )

      res.status(500).end()
      return
    }

    const finalQuizObject = { quizDetails: finalQuizDetailsArray }
    res.status(200).json(finalQuizObject)
  } catch (error) {
    console.log("Error occured while running query", error)
    res.status(500).end()
  }
}
