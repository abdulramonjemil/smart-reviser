// eslint-disable-next-line import/prefer-default-export
export function throttleWithAnimationFrame(func, reducer = null) {
  if (typeof func !== "function")
    throw new TypeError(
      "Expected a function to be passed to 'throttleWithAnimationFrame'"
    )

  if (reducer !== null && typeof reducer !== "function")
    throw new TypeError(
      "Expected reducer in 'throttleWithAnimationFrame' to be a function"
    )

  let thereAreUnrenderedFrames = false

  return function throttledFunction(...params) {
    if (thereAreUnrenderedFrames) return

    // Params to pass is determined here because the function passed to
    // requestAnimationFrame is called asynchronously. The params to pass to the
    // real function should be detemined synchronously
    const reducerReturnValue =
      reducer !== null ? reducer.call(null, ...params) : null

    window.requestAnimationFrame(() => {
      if (reducer !== null) func.call(this, reducerReturnValue)
      else func.call(this, ...params)
      thereAreUnrenderedFrames = false
    })
    thereAreUnrenderedFrames = true
  }
}
