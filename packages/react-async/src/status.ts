import { PromiseFn } from "./types"

export enum statusTypes {
  initial = "initial",
  pending = "pending",
  fulfilled = "fulfilled",
  rejected = "rejected",
}

export const getInitialStatus = <T>(value?: T | Error, promise?: Promise<T> | PromiseFn<T>) => {
  if (value instanceof Error) return statusTypes.rejected
  if (value !== undefined) return statusTypes.fulfilled
  if (promise) return statusTypes.pending
  return statusTypes.initial
}

export const getIdleStatus = <T>(value?: T | Error) => {
  if (value instanceof Error) return statusTypes.rejected
  if (value !== undefined) return statusTypes.fulfilled
  return statusTypes.initial
}

export const getStatusProps = (status: statusTypes) => ({
  status,
  isInitial: status === statusTypes.initial,
  isPending: status === statusTypes.pending,
  isLoading: status === statusTypes.pending, // alias
  isFulfilled: status === statusTypes.fulfilled,
  isResolved: status === statusTypes.fulfilled, // alias
  isRejected: status === statusTypes.rejected,
  isSettled: status === statusTypes.fulfilled || status === statusTypes.rejected,
})
