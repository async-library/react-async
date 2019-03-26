export const statusTypes = {
  waiting: "waiting",
  pending: "pending",
  fulfilled: "fulfilled",
  rejected: "rejected",
}

export const getInitialStatus = (value, promise) => {
  if (value instanceof Error) return statusTypes.rejected
  if (value !== undefined) return statusTypes.fulfilled
  if (promise) return statusTypes.pending
  return statusTypes.waiting
}

export const getIdleStatus = value => {
  if (value instanceof Error) return statusTypes.rejected
  if (value !== undefined) return statusTypes.fulfilled
  return statusTypes.waiting
}

export const getStatusProps = status => ({
  status,
  isWaiting: status === statusTypes.waiting,
  isPending: status === statusTypes.pending,
  isLoading: status === statusTypes.pending, // alias
  isFulfilled: status === statusTypes.fulfilled,
  isResolved: status === statusTypes.fulfilled, // alias
  isRejected: status === statusTypes.rejected,
  isSettled: status === statusTypes.fulfilled || status === statusTypes.rejected,
})
