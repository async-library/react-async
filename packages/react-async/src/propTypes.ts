let PropTypes
try {
  PropTypes = require("prop-types")
} catch (e) {}

const childrenFn = PropTypes && PropTypes.oneOfType([PropTypes.node, PropTypes.func])
const stateObject =
  PropTypes &&
  PropTypes.shape({
    initialValue: PropTypes.any,
    data: PropTypes.any,
    error: PropTypes.instanceOf(Error),
    value: PropTypes.any,
    startedAt: PropTypes.instanceOf(Date),
    finishedAt: PropTypes.instanceOf(Date),
    status: PropTypes.oneOf(["initial", "pending", "fulfilled", "rejected"]),
    isInitial: PropTypes.bool,
    isPending: PropTypes.bool,
    isLoading: PropTypes.bool,
    isFulfilled: PropTypes.bool,
    isResolved: PropTypes.bool,
    isRejected: PropTypes.bool,
    isSettled: PropTypes.bool,
    counter: PropTypes.number,
    promise: PropTypes.instanceOf(Promise),
    run: PropTypes.func,
    reload: PropTypes.func,
    cancel: PropTypes.func,
    setData: PropTypes.func,
    setError: PropTypes.func,
  })

export default PropTypes && {
  Async: {
    children: childrenFn,
    promise: PropTypes.instanceOf(Promise),
    promiseFn: PropTypes.func,
    deferFn: PropTypes.func,
    watch: PropTypes.any,
    watchFn: PropTypes.func,
    initialValue: PropTypes.any,
    onResolve: PropTypes.func,
    onReject: PropTypes.func,
    reducer: PropTypes.func,
    dispatcher: PropTypes.func,
    debugLabel: PropTypes.string,
    suspense: PropTypes.bool,
  },
  Initial: {
    children: childrenFn,
    state: stateObject.isRequired,
    persist: PropTypes.bool,
  },
  Pending: {
    children: childrenFn,
    state: stateObject.isRequired,
    initial: PropTypes.bool,
  },
  Fulfilled: {
    children: childrenFn,
    state: stateObject.isRequired,
    persist: PropTypes.bool,
  },
  Rejected: {
    children: childrenFn,
    state: stateObject.isRequired,
    persist: PropTypes.bool,
  },
  Settled: {
    children: childrenFn,
    state: stateObject.isRequired,
    persist: PropTypes.bool,
  },
}
