// eslint-disable-next-line import/prefer-default-export
export function throttleWithAnimationFrame(func) {
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
