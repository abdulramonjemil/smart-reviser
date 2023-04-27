// eslint-disable-next-line import/prefer-default-export
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
