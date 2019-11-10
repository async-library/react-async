import { PromiseFn } from "./types"

export enum StatusTypes {
  initial = "initial",
  pending = "pending",
  fulfilled = "fulfilled",
  rejected = "rejected",
}

export const getInitialStatus = <T>(value?: T | Error, promise?: Promise<T> | PromiseFn<T>) => {
  if (value instanceof Error) return StatusTypes.rejected
  if (value !== undefined) return StatusTypes.fulfilled
  if (promise) return StatusTypes.pending
  return StatusTypes.initial
}

export const getIdleStatus = <T>(value?: T | Error) => {
  if (value instanceof Error) return StatusTypes.rejected
  if (value !== undefined) return StatusTypes.fulfilled
  return StatusTypes.initial
}

export const getStatusProps = (status: StatusTypes) => ({
  status,
  isInitial: status === StatusTypes.initial,
  isPending: status === StatusTypes.pending,
  isLoading: status === StatusTypes.pending, // alias
  isFulfilled: status === StatusTypes.fulfilled,
  isResolved: status === StatusTypes.fulfilled, // alias
  isRejected: status === StatusTypes.rejected,
  isSettled: status === StatusTypes.fulfilled || status === StatusTypes.rejected,
})
