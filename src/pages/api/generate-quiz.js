import { withSSRContext } from "aws-amplify"
import MindsDB from "mindsdb-js-sdk"
import mysql from "mysql"

import * as queries from "../../graphql/queries"
import {
  GENERATION_LIMITS,
  isValidQuizDetails,
  QUIZ_GENERATION_PARAMS,
  toUsablePromptChunks
} from "../../lib/quiz-generation"

export default async function handler(req, res) {
  const SSR = withSSRContext({ req })

  if (req.method !== "GET") {
    res.status(405).end()
    return
  }

  let userIsAuthenticated = false
  try {
    await await SSR.Auth.currentAuthenticatedUser()
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
    maxQuestionsCount < GENERATION_LIMITS.MIN_MAX_QUESTIONS_COUNT ||
    maxQuestionsCount > GENERATION_LIMITS.MAX_MAX_QUESTIONS_COUNT
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

  const chunksToUseInPrompts = toUsablePromptChunks(lessonContent)

  let questionsCountPerPrompt = 0
  let numberOfPromptChunksToUse = chunksToUseInPrompts.length

  if (maxQuestionsCount >= chunksToUseInPrompts.length) {
    questionsCountPerPrompt = Math.floor(
      maxQuestionsCount / chunksToUseInPrompts.length
    )
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

  const quizGenerationQueries = quizGenerationQueriesAlt.slice(
    0,
    numberOfPromptChunksToUse
  )

  let errorOccuredWhileConnectingWithMindsDB = false

  console.log(
    "process.env.MINDSDB_CLOUD_USERNAME",
    process.env.MINDSDB_CLOUD_USERNAME
  )
  console.log(
    "process.env.MINDSDB_CLOUD_PASSWORD",
    process.env.MINDSDB_CLOUD_PASSWORD
  )

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
    if (!quizDetailsStringsArray.every(isValidQuizDetails)) throw queryResults

    const quizDetailsObjectsArray = quizDetailsStringsArray.map(
      (detailsString) => JSON.parse(detailsString)
    )

    const finalQuizDetailsArray = quizDetailsObjectsArray.reduce(
      (questionsArray, currentValue) => [
        ...questionsArray,
        ...currentValue.quizDetails
      ],
      []
    )

    singleQuizDetailsObjectToUse = { quizDetails: finalQuizDetailsArray }
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
