import { countWords } from "../lib/utilities"

export const QUIZ_GENERATION_PARAMS = {
  LESSON_ID: "lesson_id",
  MAX_QUESTIONS_COUNT: "max_questions_count"
}

export const QUIZ_GEN_LOWEST_MAX_QUESTIONS_COUNT = 3
export const QUIZ_GEN_HIGHEST_MAX_QUESTIONS_COUNT = 10

export const MAX_LESSON_CONTENT_CHAR_COUNT = 20000
export const MAX_LESSON_CONTENT_WORD_COUNT = 4000
export const MIN_LESSON_CONTENT_WORD_COUNT = 150

/**
 * Break lesson content in chunks to be used with quiz generation prompt on two
 * or more line breaks
 */
export const LESSON_CONTENT_SPLITTER_IN_CHUNKS = /\n{1,}/

/**
 * I would like to use a value greater than these for the two values below, but
 * I figured out after deploying to AWS Amplify that the requests time out after
 * thirty seconds. As a result, even though higher values work normally in
 * development, they don't really work when deployed to AWS Amplify. I'm still
 * finding a way to get around this, but until then, these lower values should
 * be used.
 *
 * I thought Amplify deployed API routes to AWS Lambda@-edge but it doesn't seem
 * to be so. If the values must be higher, I might have to manually deploy the
 * function to Lambda somehow instead of deploying it as an API route.
 */
export const MAX_WORDS_PER_LESSON_PROMPT_CHUNK = 100
export const HIGHEST_MAX_QUESTIONS_COUNT_PER_PROMPT = 3

// Used to make sure that very short chunks are not used alone when possible
export const MIN_SENSIBLE_WORD_COUNT_OF_LESSON_PROMPT_CHUNK = 40

export function toUsablePromptChunks(content) {
  if (typeof content !== "string")
    throw new TypeError("'content' must be a string")

  const contentChunks = content.split(LESSON_CONTENT_SPLITTER_IN_CHUNKS)
  const contentChunksWordCounts = contentChunks.map((chunk) =>
    countWords(chunk)
  )

  let lastSummedWordCount = 0

  const usablePromptChunks = contentChunks.reduce(
    (promptChunksArray, currentValue, index) => {
      if (index === 0) {
        promptChunksArray.push(currentValue)
        // eslint-disable-next-line prefer-destructuring
        lastSummedWordCount = contentChunksWordCounts[0]
        return promptChunksArray
      }

      const wordCountOfCurrentValue = contentChunksWordCounts[index]
      const wordCountOfNextValue = contentChunksWordCounts[index] || 0
      const wordCountOfCurrentPlusLastChunk =
        lastSummedWordCount + wordCountOfCurrentValue

      const lastIsShort =
        lastSummedWordCount < MIN_SENSIBLE_WORD_COUNT_OF_LESSON_PROMPT_CHUNK
      const currentShouldNormallyBeJoinedWithLast =
        lastIsShort ||
        wordCountOfCurrentPlusLastChunk <= MAX_WORDS_PER_LESSON_PROMPT_CHUNK

      const currentIsShort =
        wordCountOfCurrentValue < MIN_SENSIBLE_WORD_COUNT_OF_LESSON_PROMPT_CHUNK

      const currentWontBeJoinedWithNext =
        wordCountOfCurrentValue + wordCountOfNextValue >
        MAX_WORDS_PER_LESSON_PROMPT_CHUNK

      const currentIsLastChunk = index === contentChunks.length - 1
      const currentShouldAbnormallyBeJoinedWithLast =
        currentIsShort && (currentIsLastChunk || currentWontBeJoinedWithNext)

      if (
        currentShouldNormallyBeJoinedWithLast ||
        currentShouldAbnormallyBeJoinedWithLast
      ) {
        promptChunksArray[promptChunksArray.length - 1] += `\n${currentValue}`
        lastSummedWordCount = wordCountOfCurrentPlusLastChunk
      } else {
        promptChunksArray.push(currentValue)
        lastSummedWordCount = wordCountOfCurrentValue
      }

      return promptChunksArray
    },
    []
  )

  // In case the combination of a couple of chunks in the initial split array is
  // still not long enough
  const chunksCount = usablePromptChunks.length
  const finalLastChunk = usablePromptChunks[chunksCount - 1]
  const wordCountOfFinalLastChunk = lastSummedWordCount

  const finalLastChunkIsShort =
    wordCountOfFinalLastChunk < MIN_SENSIBLE_WORD_COUNT_OF_LESSON_PROMPT_CHUNK

  if (finalLastChunkIsShort && chunksCount > 1) {
    // Append last chunk to the one before it and remove it
    usablePromptChunks[chunksCount - 2] += `\n${finalLastChunk}`
    usablePromptChunks.pop()
  }

  return usablePromptChunks
}

/**
 * This validates the results returned by API calls to MindsDB. The result is
 * expected to be JSON and abide by the format defined in the prompt (located at
 * /src/quiz-gen-prompt.txt).
 */
export function isValidQuizDetails(resultObject) {
  if (typeof resultObject !== "object" || resultObject === null) return false

  const quizDetailsArray = resultObject.quizDetails

  if (!Array.isArray(quizDetailsArray)) return false
  if (quizDetailsArray.length === 0) return false

  const isValidQuestionObject = (value) => {
    if (typeof value !== "object" || value === null) return false
    const { question, options, answer, explanation } = value

    const isFilledString = (val) => typeof val === "string" && val !== ""
    if (!isFilledString(question)) return false
    if (typeof options !== "object" || options === null) return false

    const { A: optionA, B: optionB, C: optionC, D: optionD } = options
    const optionsArray = [optionA, optionB, optionC, optionD]

    const firstUndefinedOptionIndex = optionsArray.findIndex(
      (option) => option === undefined
    )

    // There must be at least two options
    if (firstUndefinedOptionIndex >= 0 && firstUndefinedOptionIndex < 2)
      return false

    const slicingEndIndex =
      firstUndefinedOptionIndex >= 0 ? firstUndefinedOptionIndex : 4
    const optionsToCheck = optionsArray.slice(0, slicingEndIndex)

    if (!optionsToCheck.every(isFilledString)) return false

    const optionLettersToCheckAgainst = ["A", "B", "C", "D"].slice(
      0,
      slicingEndIndex
    )

    if (!optionLettersToCheckAgainst.includes(answer)) return false
    if (!isFilledString(explanation)) return false
    return true
  }

  if (!quizDetailsArray.every(isValidQuestionObject)) return false
  return true
}
