export function classNames(...classList) {
  return classList.join(" ")
}

export function uniqueId(prefix = "uuid") {
  if (typeof prefix !== "string" || prefix === "")
    throw new TypeError("'prefix' must be a non-empty string")

  const timeStamp = String(Date.now())
  const firstRandomString = String(Math.random()).slice(2)
  const secondRandomString = String(Math.random()).slice(2)
  return `${prefix}__${timeStamp}-${firstRandomString}-${secondRandomString}`
}
