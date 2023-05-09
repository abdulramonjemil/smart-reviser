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

  let userIsAuthenticated = false

  try {
    await SSR.Auth.currentAuthenticatedUser()
    userIsAuthenticated = true
  } catch (error) {
    console.log("User is not authenticated", error)
    userIsAuthenticated = false
  }

  if (!userIsAuthenticated) {
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
  let errorOccuredWhileLoadingLesson = false

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
    errorOccuredWhileLoadingLesson = true
  }

  if (errorOccuredWhileLoadingLesson) {
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
      console.log(
        "Lesson content word count is not up to the required minimum",
        "Lesson content:",
        lessonContent
      )

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
    (chunk) =>
      `SELECT lesson_quiz FROM mindsdb.lesson_quiz_generator WHERE questions_count = ${questionsCountPerPrompt} AND lesson_content = ${mysql.escape(
        chunk
      )}`
  )

  const quizGenerationQueries =
    quizGenerationQueriesAlt.length <= numberOfPromptChunksToUse
      ? quizGenerationQueriesAlt
      : getXRandomSequentialValuesFrom(
          quizGenerationQueriesAlt,
          numberOfPromptChunksToUse
        )

  let errorOccuredWhileConnectingWithMindsDB = false

  try {
    await MindsDB.connect({
      user: process.env.MINDSDB_CLOUD_USERNAME,
      password: process.env.MINDSDB_CLOUD_PASSWORD
    })
  } catch (error) {
    console.log("Error occured while connecting with MindsDB", error)
    errorOccuredWhileConnectingWithMindsDB = true
  }

  if (errorOccuredWhileConnectingWithMindsDB) {
    res.status(500).end()
    return
  }

  let errorOccuredWhileRunningQuery = false
  let singleQuizDetailsObjectToUse = null

  try {
    const queryResults = await Promise.all(
      quizGenerationQueries.map((query) => MindsDB.SQL.runQuery(query))
    )

    const someQueriesCompletedBadly = queryResults.some(
      (result) => result.rows.length < 1
    )
    if (someQueriesCompletedBadly) throw queryResults

    // Only one row of data is expected from the query and it should have the
    // lesson quiz entry
    const quizDetailsStringsArray = queryResults.map(
      (result) => result.rows[0].lesson_quiz
    )

    let quizDetailsStringsArrayHasMalformedJSON = false
    let quizDetailsObjectsArray = null

    try {
      quizDetailsObjectsArray = quizDetailsStringsArray.map(
        (quizDetailsString, index) => {
          // In case the model returns a value that's not directly a valid JSON,
          // we'll look for the first occurrence of an opening curly brace, and
          // the last occurrence of a closing curly brace in the string, extract
          // it, and try to parse as JSON instead of the whole string.
          const indexOfFirstOpeningCurlyBrace = quizDetailsString.indexOf("{")
          const indexOfLastClosingCurlyBrace =
            quizDetailsString.lastIndexOf("}")

          const thereIsNoOpeningCurlyBrace = indexOfFirstOpeningCurlyBrace < 0
          const thereIsNoClosingCurlyBrace = indexOfLastClosingCurlyBrace < 0
          const curlyBracesAreMisarranged =
            indexOfLastClosingCurlyBrace < indexOfFirstOpeningCurlyBrace

          if (
            thereIsNoOpeningCurlyBrace ||
            thereIsNoClosingCurlyBrace ||
            curlyBracesAreMisarranged
          ) {
            console.log("Got malformed JSON response:", quizDetailsString)
            console.log(
              "The query that resulted in the error:",
              quizGenerationQueries[index]
            )
            throw new Error()
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
              quizDetailsStringToValidate
            )

            console.log(
              "The query that resulted in the error:",
              quizGenerationQueries[index]
            )

            quizDetailsStringParsingErrorOccurred = true
          }

          if (quizDetailsStringParsingErrorOccurred) throw new Error()
          return quizDetailsObject
        }
      )
    } catch (error) {
      quizDetailsStringsArrayHasMalformedJSON = true
    }

    const everyQuizDetailsStringIsUsable =
      !quizDetailsStringsArrayHasMalformedJSON &&
      quizDetailsObjectsArray.every((quizDetailsObject, index) => {
        const objectIsValidQuizDetails = isValidQuizDetails(quizDetailsObject)

        if (!objectIsValidQuizDetails) {
          console.log(
            "Got invalid quiz details object:",
            JSON.stringify(quizDetailsObject, null, 2)
          )

          console.log(
            "The query that resulted in the error:",
            quizGenerationQueries[index]
          )
        }

        return objectIsValidQuizDetails
      })

    // eslint-disable-next-line no-unreachable
    if (!everyQuizDetailsStringIsUsable) throw queryResults

    let finalQuizDetailsArray = quizDetailsObjectsArray.reduce(
      (questionsArray, currentValue) => [
        ...questionsArray,
        ...currentValue.quizDetails
      ],
      []
    )

    if (finalQuizDetailsArray.length > maxQuestionsCount)
      finalQuizDetailsArray = getXRandomSequentialValuesFrom(
        finalQuizDetailsArray,
        maxQuestionsCount
      )

    singleQuizDetailsObjectToUse = { quizDetails: finalQuizDetailsArray }
    // eslint-disable-next-line no-unreachable
  } catch (error) {
    console.log("Error occured while running query", error)
    errorOccuredWhileRunningQuery = true
  }

  if (errorOccuredWhileRunningQuery) {
    res.status(500).end()
    return
  }

  res.status(200).json(singleQuizDetailsObjectToUse)
}
