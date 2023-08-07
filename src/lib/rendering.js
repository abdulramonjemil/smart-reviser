/**
 * This function enables throttling callbacks with the built in
 * requestAnimationFrame method. It makes sure the callback isn't actually
 * called until the browser is ready for a paint.
 */

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

  if (reducer === null) {
    return function throttledFunction(...params) {
      if (thereAreUnrenderedFrames) return
      thereAreUnrenderedFrames = true

      window.requestAnimationFrame(() => {
        func.call(this, ...params)
        thereAreUnrenderedFrames = false
      })
    }
  }

  return function throttledFunction(...params) {
    if (thereAreUnrenderedFrames) return

    // Params to pass is determined here because the function passed to
    // requestAnimationFrame is called asynchronously and the params to pass to the
    // real function should be detemined synchronously
    const paramToPass = reducer.call(null, ...params)
    thereAreUnrenderedFrames = true

    window.requestAnimationFrame(() => {
      func.call(this, paramToPass)
      thereAreUnrenderedFrames = false
    })
  }
}
