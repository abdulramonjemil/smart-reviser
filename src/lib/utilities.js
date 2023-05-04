export function countWords(value) {
  if (typeof value !== "string") throw new TypeError("'value' must be a string")
  const splitArray = value.split(/\s+/)
  let splitLength = value.split(/\s+/).length

  // In case the string contains white at start or end
  if (splitArray[0] === "" && splitLength > 0) splitLength -= 1
  if (splitArray[splitArray.length - 1] === "" && splitLength > 0)
    splitLength -= 1
  return splitLength
}

export function getXSequentialValuesFrom(array, count, startIndex) {
  if (!Array.isArray(array) || array.length < 1)
    throw new TypeError("'array' must be a non-empty array")
  if (!Number.isInteger(count) || count < 1)
    throw new TypeError("'count' must be a positive integer")
  if (!Number.isInteger(startIndex) || startIndex < 0)
    throw new TypeError("'startIndex' must be a non-negative integer")

  const arrayLength = array.length

  if (count > arrayLength)
    throw new RangeError(
      "'count' can not be greater than the number of values in 'array'"
    )

  if (startIndex > arrayLength - 1)
    throw new RangeError(
      "'startIndex' can not be greater than the index of the last item in 'array'"
    )

  if (count === arrayLength) return [...array]

  if (startIndex + count <= arrayLength)
    return array.slice(startIndex, startIndex + count)

  const startIndexToEnd = array.slice(startIndex, arrayLength)
  const arrayStartToRequired = array.slice(0, startIndex + count - arrayLength)
  return arrayStartToRequired.concat(startIndexToEnd)
}

export function getXRandomSequentialValuesFrom(array, count) {
  if (!Array.isArray(array)) throw new TypeError("'array' must be an array")
  return getXSequentialValuesFrom(
    array,
    count,
    Math.floor(Math.random() * array.length)
  )
}
