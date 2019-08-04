export const statusTypes = {
  initial: "initial",
  pending: "pending",
  fulfilled: "fulfilled",
  rejected: "rejected",
}

export const getInitialStatus = (initialValue, skipOnMount, promise) => {
  if (initialValue instanceof Error) return statusTypes.rejected
  if (initialValue !== undefined && !skipOnMount) return statusTypes.fulfilled
  if (promise instanceof Promise) return statusTypes.pending
  if (typeof promise === "function" && !skipOnMount) return statusTypes.pending
  return statusTypes.initial
}

export const getIdleStatus = value => {
  if (value instanceof Error) return statusTypes.rejected
  if (value !== undefined) return statusTypes.fulfilled
  return statusTypes.initial
}

export const getStatusProps = status => ({
  status,
  isInitial: status === statusTypes.initial,
  isPending: status === statusTypes.pending,
  isLoading: status === statusTypes.pending, // alias
  isFulfilled: status === statusTypes.fulfilled,
  isResolved: status === statusTypes.fulfilled, // alias
  isRejected: status === statusTypes.rejected,
  isSettled: status === statusTypes.fulfilled || status === statusTypes.rejected,
})
