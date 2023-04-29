import { countWords } from "./counter"

export const QUIZ_GENERATION_PARAMS = {
  LESSON_ID: "lesson_id",
  MAX_QUESTIONS_COUNT: "max_questions_count"
}

export const GENERATION_LIMITS = {
  MIN_MAX_QUESTIONS_COUNT: 3,
  MAX_MAX_QUESTIONS_COUNT: 10
}

export const MAX_WORDS_PER_LESSON_PROMPT_CHUNK = 1200
export const LESSON_CONTENT_SPLITTER_IN_CHUNKS = "\n\n"

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
      const newCombinedWordCount = lastSummedWordCount + wordCountOfCurrentValue

      if (newCombinedWordCount <= MAX_WORDS_PER_LESSON_PROMPT_CHUNK) {
        promptChunksArray[
          promptChunksArray.length - 1
        ] += `${LESSON_CONTENT_SPLITTER_IN_CHUNKS}${currentValue}`
        lastSummedWordCount = newCombinedWordCount
      } else {
        promptChunksArray.push(currentValue)
        lastSummedWordCount = wordCountOfCurrentValue
      }

      return promptChunksArray
    },
    []
  )

  return usablePromptChunks
}

/**
 * This validates the results returned by API calls to MindsDB. The result is
 * expected to be JSON and abide by the format defined in the prompt (located at
 * /src/quiz-gen-prompt.txt).
 */
export function isValidQuizDetails(resultString) {
  if (typeof resultString !== "string") return false

  let parsedJSON = null
  let errorOccured = false

  try {
    parsedJSON = JSON.parse(resultString)
  } catch (error) {
    errorOccured = true
  }

  if (errorOccured) return false
  if (typeof parsedJSON !== "object" || parsedJSON === null) return false

  const quizDetailsArray = parsedJSON.quizDetails

  if (!Array.isArray(quizDetailsArray)) return false
  if (quizDetailsArray.length === 0) return false

  function isValidQuestionObject(value) {
    if (typeof value !== "object" || value === null) return false
    const { question, options, answer, explanation } = value

    function isNonEmptyString(val) {
      return typeof val === "string" && val !== ""
    }

    if (!isNonEmptyString(question)) return false
    if (typeof options !== "object" || options === null) return false

    const { A: optionA, B: optionB, C: optionC, D: optionD } = options
    if (
      !isNonEmptyString(optionA) ||
      !isNonEmptyString(optionB) ||
      !isNonEmptyString(optionC) ||
      !isNonEmptyString(optionD)
    ) {
      return false
    }

    if (!["A", "B", "C", "D"].includes(answer)) return false
    if (!isNonEmptyString(explanation) && explanation !== null) return false
    return true
  }

  if (!quizDetailsArray.every(isValidQuestionObject)) return false
  return true
}
