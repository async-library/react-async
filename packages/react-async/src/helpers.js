import propTypes from "./propTypes"

const nullify = children => (children === undefined ? null : children)
const renderFn = (children, ...args) =>
  nullify(typeof children === "function" ? children(...args) : children)

/**
 * Renders only when no promise has started or completed yet.
 *
 * @prop {Function|Node} children Function (passing state) or React node
 * @prop {Object} state React Async state object
 * @prop {boolean} persist Show until we have data, even while pending (loading) or when an error occurred
 */
export const Initial = ({ children, persist, state = {} }) =>
  state.isInitial || (persist && !state.data) ? renderFn(children, state) : null

/**
 * Renders only while pending (promise is loading).
 *
 * @prop {Function|Node} children Function (passing state) or React node
 * @prop {Object} state React Async state object
 * @prop {boolean} initial Show only on initial load (data is undefined)
 */
export const Pending = ({ children, initial, state = {} }) =>
  state.isPending && (!initial || !state.value) ? renderFn(children, state) : null

/**
 * Renders only when promise is resolved.
 *
 * @prop {Function|Node} children Function (passing data and state) or React node
 * @prop {Object} state React Async state object
 * @prop {boolean} persist Show old data while pending (promise is loading)
 */
export const Fulfilled = ({ children, persist, state = {} }) =>
  state.isFulfilled || (persist && state.data) ? renderFn(children, state.data, state) : null

/**
 * Renders only when promise is rejected.
 *
 * @prop {Function|Node} children Function (passing error and state) or React node
 * @prop {Object} state React Async state object
 * @prop {boolean} persist Show old error while pending (promise is loading)
 */
export const Rejected = ({ children, persist, state = {} }) =>
  state.isRejected || (persist && state.error) ? renderFn(children, state.error, state) : null

/**
 * Renders only when promise is fulfilled or rejected.
 *
 * @prop {Function|Node} children Function (passing state) or React node
 * @prop {Object} state React Async state object
 * @prop {boolean} persist Show old data or error while pending (promise is loading)
 */
export const Settled = ({ children, persist, state = {} }) =>
  state.isSettled || (persist && state.value) ? renderFn(children, state) : null

if (propTypes) {
  Initial.propTypes = propTypes.Initial
  Pending.propTypes = propTypes.Pending
  Fulfilled.propTypes = propTypes.Fulfilled
  Rejected.propTypes = propTypes.Rejected
  Settled.propTypes = propTypes.Settled
}
