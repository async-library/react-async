import * as React from "react"

type ChildrenFunction = (state: object) => React.ReactNode

interface AsyncProps {
  children?: React.ReactNode | ChildrenFunction
  promiseFn?(props: object): Promise<any>
  deferFn?(props: object): Promise<any>
  watch?: any
  initialValue?: any
  onResolve?(data: any): any
  onReject?(error: Error): any
}

interface PendingProps {
  children?: React.ReactNode | ChildrenFunction
  persist?: boolean
}

interface LoadingProps {
  children?: React.ReactNode | ChildrenFunction
  initial?: boolean
}

interface ResolvedProps {
  children?: React.ReactNode | ChildrenFunction
  persist?: boolean
}

interface RejectedProps {
  children?: React.ReactNode | ChildrenFunction
  persist?: boolean
}

declare class Async extends React.Component<AsyncProps, any> {
  public static Pending: React.SFC<PendingProps>
  public static Loading: React.SFC<LoadingProps>
  public static Resolved: React.SFC<ResolvedProps>
  public static Rejected: React.SFC<RejectedProps>
}

declare function createInstance(defaultProps?: object): Async

export default createInstance
