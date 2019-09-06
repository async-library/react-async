import { any } from "prop-types"

/* istanbul ignore file */

/**
 * Universal global scope object. In the browser this is `self`, in Node.js and React Native it's `global`.
 * This file is excluded from coverage reporting because these globals are environment-specific so we can't test them all.
 */
const globalScope = ((): {
  __REACT_ASYNC__?: any
  AbortController?: typeof AbortController
  fetch: Window["fetch"]
} => {
  if (typeof self === "object" && self.self === self) return self as any
  if (typeof global === "object" && global.global === global) return global as any
  if (typeof global === "object" && global.GLOBAL === global) return global as any
  return {} as any // fallback that relies on imported modules to be singletons
})()

/**
 * Globally available object used to connect the DevTools to all React Async instances.
 */
globalScope.__REACT_ASYNC__ = globalScope.__REACT_ASYNC__ || {}

export default globalScope
