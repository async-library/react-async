/**
 * This provides a function which should be invoked on render, as a way to prevent infinite render
 * loops. The heuristic used for 'infinite' is 100 renders, each within 100ms after the last one.
 */

export default () => {
  let renderCount = 0
  let lastRender = 0
  return () => {
    renderCount = Date.now() - lastRender < 100 ? renderCount + 1 : 0
    if (renderCount > 100) {
      throw new Error("Infinite loop detected. Maybe you're creating a new promiseFn each render?")
    }
    lastRender = Date.now()
  }
}
