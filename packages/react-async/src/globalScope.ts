/* istanbul ignore file */

declare type GlobalScope = {
  __REACT_ASYNC__: any
  AbortController?: typeof AbortController
  fetch: typeof fetch
}

/**
 * Universal global scope object. In the browser this is `self`, in Node.js and React Native it's `global`.
 * This file is excluded from coverage reporting because these globals are environment-specific so we can't test them all.
 */
const globalScope = (() => {
  if (typeof self === "object" && self.self === self) return self
  if (typeof global === "object" && global.global === global) return global
  if (typeof global === "object" && global.GLOBAL === global) return global
  return {} // fallback that relies on imported modules to be singletons
})() as GlobalScope

/**
 * Globally available object used to connect the DevTools to all React Async instances.
 */
globalScope.__REACT_ASYNC__ = globalScope.__REACT_ASYNC__ || {}

export const noop = () => {}
export class MockAbortController implements AbortController {
  public abort = noop
  readonly signal = {} as AbortSignal
}

export default globalScope
