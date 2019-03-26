export const statusTypes = {
  pending: "pending",
  loading: "loading",
  fulfilled: "fulfilled",
  rejected: "rejected",
}

export const getInitialStatus = (value, promise) => {
  if (value instanceof Error) return statusTypes.rejected
  if (value !== undefined) return statusTypes.fulfilled
  if (promise) return statusTypes.loading
  return statusTypes.pending
}

export const getIdleStatus = value => {
  if (value instanceof Error) return statusTypes.rejected
  if (value !== undefined) return statusTypes.fulfilled
  return statusTypes.pending
}

export const getStatusProps = status => ({
  status,
  isPending: status === statusTypes.pending,
  isLoading: status === statusTypes.loading,
  isFulfilled: status === statusTypes.fulfilled,
  isRejected: status === statusTypes.rejected,
})
