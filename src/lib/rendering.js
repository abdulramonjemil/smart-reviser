// eslint-disable-next-line import/prefer-default-export
export function throttleWithAnimationFrame(func) {
  if (typeof func !== "function")
    throw new TypeError(
      "Expected a function to be passed to 'throttleWithAnimationFrame'"
    )

  let thereAreUnrenderedFrames = false
  return function throttledFunction(...params) {
    if (thereAreUnrenderedFrames) return
    window.requestAnimationFrame(() => {
      func.call(this, ...params)
      thereAreUnrenderedFrames = false
    })
    thereAreUnrenderedFrames = true
  }
}
