/* istanbul ignore file */
/* eslint-disable react/prop-types */

import "@testing-library/jest-dom/extend-expect"
import React, { Suspense } from "react"
import { render, fireEvent } from "@testing-library/react"

export const resolveIn = ms => value => new Promise(resolve => setTimeout(resolve, ms, value))
export const resolveTo = resolveIn(0)
export const rejectIn = ms => err =>
  new Promise((resolve, reject) => setTimeout(reject, ms, new Error(err)))
export const rejectTo = rejectIn(0)
export const sleep = ms => resolveIn(ms)()

export const common = Async => () => {
  test("passes `data`, `error`, `promise`, metadata and methods as render props", async () => {
    render(
      <Async>
        {renderProps => {
          expect(renderProps).toHaveProperty("data")
          expect(renderProps).toHaveProperty("error")
          expect(renderProps).toHaveProperty("initialValue")
          expect(renderProps).toHaveProperty("startedAt")
          expect(renderProps).toHaveProperty("finishedAt")
          expect(renderProps).toHaveProperty("isInitial")
          expect(renderProps).toHaveProperty("isPending")
          expect(renderProps).toHaveProperty("isLoading")
          expect(renderProps).toHaveProperty("isFulfilled")
          expect(renderProps).toHaveProperty("isRejected")
          expect(renderProps).toHaveProperty("isSettled")
          expect(renderProps).toHaveProperty("counter")
          expect(renderProps).toHaveProperty("promise")
          expect(renderProps).toHaveProperty("run")
          expect(renderProps).toHaveProperty("reload")
          expect(renderProps).toHaveProperty("cancel")
          expect(renderProps).toHaveProperty("setData")
          expect(renderProps).toHaveProperty("setError")
          return null
        }}
      </Async>
    )
  })

  test("can be nested", async () => {
    const outerFn = () => resolveIn(0)("outer")
    const innerFn = () => resolveIn(100)("inner")
    const { findByText } = render(
      <Async promiseFn={outerFn}>
        {({ data: outer }) => (
          <Async promiseFn={innerFn}>
            {({ data: inner }) => {
              return outer + " " + inner
            }}
          </Async>
        )}
      </Async>
    )
    await findByText("outer undefined")
    await findByText("outer inner")
  })

  test("does not cancel on initial mount", async () => {
    const onCancel = jest.fn()
    const { findByText } = render(<Async onCancel={onCancel}>{() => "done"}</Async>)
    await findByText("done")
    expect(onCancel).not.toHaveBeenCalled()
  })

  // Skip when testing for backwards-compatibility with React 16.3
  const testSuspense = Suspense ? test : test.skip
  testSuspense("supports Suspense", async () => {
    const promiseFn = () => resolveIn(150)("done")
    const { findByText } = render(
      <Suspense fallback={<div>fallback</div>}>
        <Async suspense promiseFn={promiseFn}>
          {({ data }) => data || null}
        </Async>
      </Suspense>
    )
    await findByText("fallback")
    await findByText("done")
  })
}

export const withPromise = Async => () => {
  test("passes resolved data to children as render prop", async () => {
    const promise = resolveTo("done")
    const { findByText } = render(<Async promise={promise}>{({ data }) => data || null}</Async>)
    await findByText("done")
  })

  test("passes rejection error to children as render prop", async () => {
    const promise = rejectTo("oops")
    const { findByText } = render(
      <Async promise={promise}>{({ error }) => (error ? error.message : null)}</Async>
    )
    await findByText("oops")
  })

  test("sets `startedAt` when a promise is provided", async () => {
    const { findByText } = render(
      <Async promise={resolveTo("done")}>
        {({ data, startedAt }) => {
          expect(startedAt.getTime()).toBeCloseTo(new Date().getTime(), -2)
          return data || null
        }}
      </Async>
    )
    await findByText("done")
  })

  test("sets `finishedAt` when the provided promise settles", async () => {
    const { findByText } = render(
      <Async promise={resolveTo("done")}>
        {({ data, finishedAt }) => {
          if (data) expect(finishedAt.getTime()).toBeCloseTo(new Date().getTime(), -2)
          return data || null
        }}
      </Async>
    )
    await findByText("done")
  })

  test("invokes `onResolve` callback when the promise resolves", async () => {
    const onResolve = jest.fn()
    render(<Async promise={resolveTo("ok")} onResolve={onResolve} />)
    await sleep(10)
    expect(onResolve).toHaveBeenCalledWith("ok")
  })

  test("invokes `onReject` callback when the promise rejects", async () => {
    const onReject = jest.fn()
    render(<Async promise={rejectTo("err")} onReject={onReject} />)
    await sleep(10)
    expect(onReject).toHaveBeenCalledWith(new Error("err"))
  })

  test("cancels a pending promise when unmounted", async () => {
    const onCancel = jest.fn()
    const onResolve = jest.fn()
    const { unmount } = render(
      <Async promise={resolveTo("ok")} onCancel={onCancel} onResolve={onResolve} />
    )
    unmount()
    await sleep(10)
    expect(onCancel).toHaveBeenCalled()
    expect(onResolve).not.toHaveBeenCalled()
  })

  test("cancels and restarts the promise when `promise` changes", async () => {
    const promise1 = resolveTo("one")
    const promise2 = resolveTo("two")
    const onCancel = jest.fn()
    const onResolve = jest.fn()
    const { rerender } = render(
      <Async promise={promise1} onCancel={onCancel} onResolve={onResolve} />
    )
    rerender(<Async promise={promise2} onCancel={onCancel} onResolve={onResolve} />)
    await sleep(10)
    expect(onCancel).toHaveBeenCalled()
    expect(onResolve).not.toHaveBeenCalledWith("one")
    expect(onResolve).toHaveBeenCalledWith("two")
  })

  test("cancels the promise when `promise` is unset", async () => {
    const onCancel = jest.fn()
    const onResolve = jest.fn()
    const { rerender } = render(
      <Async promise={resolveTo()} onCancel={onCancel} onResolve={onResolve} />
    )
    rerender(<Async onCancel={onCancel} onResolve={onResolve} />)
    await sleep(10)
    expect(onCancel).toHaveBeenCalled()
    expect(onResolve).not.toHaveBeenCalled()
  })

  test("handles the promise settlement even when `initialValue` is provided", async () => {
    const { findByText } = render(
      <Async initialValue="init" promise={resolveTo("done")}>
        {({ data }) => data || null}
      </Async>
    )
    await findByText("init")
    await findByText("done")
  })

  test("exposes the wrapper promise", async () => {
    const onFulfilled = jest.fn()
    const onRejected = jest.fn()
    const { findByText } = render(
      <Async promise={resolveTo("done")}>
        {({ data, promise }) => {
          promise.then(onFulfilled).catch(onRejected)
          return data || null
        }}
      </Async>
    )
    await findByText("done")
    expect(onFulfilled).toHaveBeenCalledWith("done")
    expect(onRejected).not.toHaveBeenCalled()
  })

  test("the wrapper promise rejects on error", async () => {
    const onFulfilled = jest.fn()
    const onRejected = jest.fn()
    const { findByText } = render(
      <Async promise={rejectTo("err")}>
        {({ error, promise }) => {
          promise.then(onFulfilled).catch(onRejected)
          return error ? error.message : null
        }}
      </Async>
    )
    await findByText("err")
    expect(onFulfilled).not.toHaveBeenCalled()
    expect(onRejected).toHaveBeenCalledWith(new Error("err"))
  })
}

export const withPromiseFn = (Async, abortCtrl) => () => {
  test("invokes `promiseFn` on mount", () => {
    const promiseFn = jest.fn().mockReturnValue(resolveTo())
    render(<Async promiseFn={promiseFn} />)
    expect(promiseFn).toHaveBeenCalledTimes(1)
  })

  test("invokes `promiseFn` with props", () => {
    const promiseFn = jest.fn().mockReturnValue(resolveTo())
    render(<Async promiseFn={promiseFn} anotherProp="123" />)
    expect(promiseFn).toHaveBeenCalledWith({ promiseFn, anotherProp: "123" }, abortCtrl)
  })

  test("sets `startedAt` when the promise starts", async () => {
    const { findByText } = render(
      <Async promiseFn={() => resolveTo()}>
        {({ startedAt }) => {
          if (startedAt) {
            expect(startedAt.getTime()).toBeCloseTo(new Date().getTime(), -2)
            return "started"
          }
          return null
        }}
      </Async>
    )
    await findByText("started")
  })

  test("sets `finishedAt` when the promise settles", async () => {
    const { findByText } = render(
      <Async promiseFn={() => resolveTo("done")}>
        {({ data, finishedAt }) => {
          if (data) expect(finishedAt.getTime()).toBeCloseTo(new Date().getTime(), -2)
          return data || null
        }}
      </Async>
    )
    await findByText("done")
  })

  test("invokes `onResolve` callback when the promise resolves", async () => {
    const onResolve = jest.fn()
    render(<Async promiseFn={() => resolveTo("ok")} onResolve={onResolve} />)
    await sleep(10)
    expect(onResolve).toHaveBeenCalledWith("ok")
  })

  test("invokes `onReject` callback when the promise rejects", async () => {
    const onReject = jest.fn()
    render(<Async promiseFn={() => rejectTo("err")} onReject={onReject} />)
    await sleep(10)
    expect(onReject).toHaveBeenCalledWith(new Error("err"))
  })

  test("provides `reload` function that re-runs the promise", () => {
    const promiseFn = jest.fn().mockReturnValue(resolveTo())
    const { getByText } = render(
      <Async promiseFn={promiseFn}>
        {({ reload }) => {
          return <button onClick={reload}>reload</button>
        }}
      </Async>
    )
    expect(promiseFn).toHaveBeenCalledTimes(1)
    fireEvent.click(getByText("reload"))
    expect(promiseFn).toHaveBeenCalledTimes(2)
    expect(abortCtrl.abort).toHaveBeenCalledTimes(1)
  })

  test("re-runs the promise with new props when the value of `watch` changes", () => {
    class Counter extends React.Component {
      constructor(props) {
        super(props)
        this.state = { count: 0 }
        this.inc = () => this.setState(state => ({ count: state.count + 1 }))
      }
      render() {
        return (
          <div>
            <button onClick={this.inc}>increment</button>
            {this.props.children(this.state.count)}
          </div>
        )
      }
    }
    const promiseFn = jest.fn().mockReturnValue(resolveTo())
    const { getByText } = render(
      <Counter>{count => <Async promiseFn={promiseFn} watch={count} count={count} />}</Counter>
    )
    expect(promiseFn).toHaveBeenCalledTimes(1)
    expect(promiseFn).toHaveBeenLastCalledWith(
      expect.objectContaining({ count: 0 }),
      expect.any(Object)
    )
    fireEvent.click(getByText("increment"))
    expect(promiseFn).toHaveBeenCalledTimes(2)
    expect(promiseFn).toHaveBeenLastCalledWith(
      expect.objectContaining({ count: 1 }),
      expect.any(Object)
    )
    expect(abortCtrl.abort).toHaveBeenCalled()
    abortCtrl.abort.mockClear()
    fireEvent.click(getByText("increment"))
    expect(promiseFn).toHaveBeenCalledTimes(3)
    expect(promiseFn).toHaveBeenLastCalledWith(
      expect.objectContaining({ count: 2 }),
      expect.any(Object)
    )
    expect(abortCtrl.abort).toHaveBeenCalled()
  })

  test("re-runs the promise with new props when `watchFn` returns truthy", () => {
    class Counter extends React.Component {
      constructor(props) {
        super(props)
        this.state = { count: 0 }
        this.inc = () => this.setState(state => ({ count: state.count + 1 }))
      }
      render() {
        return (
          <div>
            <button onClick={this.inc}>increment</button>
            {this.props.children(this.state.count)}
          </div>
        )
      }
    }
    const promiseFn = jest.fn().mockReturnValue(resolveTo())
    const watchFn = ({ count }, prevProps) => count !== prevProps.count && count === 2
    const { getByText } = render(
      <Counter>{count => <Async promiseFn={promiseFn} watchFn={watchFn} count={count} />}</Counter>
    )
    expect(promiseFn).toHaveBeenCalledTimes(1)
    expect(promiseFn).toHaveBeenLastCalledWith(
      expect.objectContaining({ count: 0 }),
      expect.any(Object)
    )
    fireEvent.click(getByText("increment"))
    expect(promiseFn).toHaveBeenCalledTimes(1)
    expect(promiseFn).toHaveBeenLastCalledWith(
      expect.objectContaining({ count: 0 }),
      expect.any(Object)
    )
    expect(abortCtrl.abort).not.toHaveBeenCalled()
    fireEvent.click(getByText("increment"))
    expect(promiseFn).toHaveBeenCalledTimes(2)
    expect(promiseFn).toHaveBeenLastCalledWith(
      expect.objectContaining({ count: 2 }),
      expect.any(Object)
    )
    expect(abortCtrl.abort).toHaveBeenCalled()
  })

  test("cancels a pending promise when unmounted", async () => {
    const onCancel = jest.fn()
    const onResolve = jest.fn()
    const { unmount } = render(
      <Async promiseFn={() => resolveTo("ok")} onCancel={onCancel} onResolve={onResolve} />
    )
    unmount()
    await sleep(10)
    expect(onCancel).toHaveBeenCalled()
    expect(onResolve).not.toHaveBeenCalled()
    expect(abortCtrl.abort).toHaveBeenCalledTimes(1)
  })

  test("cancels and restarts the promise when `promiseFn` changes", async () => {
    const promiseFn1 = () => resolveTo("one")
    const promiseFn2 = () => resolveTo("two")
    const onCancel = jest.fn()
    const onResolve = jest.fn()
    const { rerender } = render(
      <Async promiseFn={promiseFn1} onCancel={onCancel} onResolve={onResolve} />
    )
    rerender(<Async promiseFn={promiseFn2} onCancel={onCancel} onResolve={onResolve} />)
    await sleep(10)
    expect(onCancel).toHaveBeenCalled()
    expect(onResolve).not.toHaveBeenCalledWith("one")
    expect(onResolve).toHaveBeenCalledWith("two")
  })

  test("cancels the promise when `promiseFn` is unset", async () => {
    const onResolve = jest.fn()
    const { rerender } = render(<Async promiseFn={() => resolveTo()} onResolve={onResolve} />)
    rerender(<Async onResolve={onResolve} />)
    await sleep(10)
    expect(onResolve).not.toHaveBeenCalled()
    expect(abortCtrl.abort).toHaveBeenCalledTimes(1)
  })

  test("does not run `promiseFn` on mount when `initialValue` is provided", async () => {
    const promiseFn = jest.fn().mockReturnValue(resolveTo())
    render(<Async promiseFn={promiseFn} initialValue={{}} />)
    await sleep(10)
    expect(promiseFn).not.toHaveBeenCalled()
  })

  test("does not start loading when using `initialValue`", async () => {
    const promiseFn = () => resolveTo("done")
    const states = []
    const { findByText } = render(
      <Async promiseFn={promiseFn} initialValue="done">
        {({ data, isPending }) => {
          states.push(isPending)
          return data || null
        }}
      </Async>
    )
    await findByText("done")
    expect(states).toEqual([false])
  })

  test("passes `initialValue` to children immediately", async () => {
    const promiseFn = () => resolveTo("done")
    const { findByText } = render(
      <Async promiseFn={promiseFn} initialValue="done">
        {({ data }) => data}
      </Async>
    )
    await findByText("done")
  })

  test("sets `error` instead of `data` when `initialValue` is an Error object", async () => {
    const promiseFn = () => resolveTo("done")
    const error = new Error("oops")
    const { findByText } = render(
      <Async promiseFn={promiseFn} initialValue={error}>
        {({ error }) => error.message}
      </Async>
    )
    await findByText("oops")
  })
}

export const withDeferFn = (Async, abortCtrl) => () => {
  test("runs `deferFn` only when explicitly invoked, passing arguments, props and AbortController", () => {
    let counter = 1
    const deferFn = jest.fn().mockReturnValue(resolveTo())
    const { getByText } = render(
      <Async deferFn={deferFn} foo="bar">
        {({ run }) => {
          return <button onClick={() => run("go", counter++)}>run</button>
        }}
      </Async>
    )
    const props = { deferFn, foo: "bar" }
    expect(deferFn).not.toHaveBeenCalled()
    fireEvent.click(getByText("run"))
    expect(deferFn).toHaveBeenCalledWith(["go", 1], expect.objectContaining(props), abortCtrl)
    fireEvent.click(getByText("run"))
    expect(deferFn).toHaveBeenCalledWith(["go", 2], expect.objectContaining(props), abortCtrl)
  })

  test("always passes the latest props", async () => {
    const deferFn = jest.fn().mockReturnValue(resolveTo())
    const Child = ({ count }) => (
      <Async deferFn={deferFn} count={count}>
        {({ run }) => (
          <>
            <button onClick={() => run(count)}>run</button>
            <div data-testid="counter">{count}</div>
          </>
        )}
      </Async>
    )
    class Parent extends React.Component {
      constructor(props) {
        super(props)
        this.state = { count: 0 }
      }
      render() {
        const inc = () => this.setState(state => ({ count: state.count + 1 }))
        return (
          <>
            <button onClick={inc}>inc</button>
            {this.state.count && <Child count={this.state.count} />}
          </>
        )
      }
    }
    const { getByText, getByTestId } = render(<Parent />)
    fireEvent.click(getByText("inc"))
    expect(getByTestId("counter")).toHaveTextContent("1")
    fireEvent.click(getByText("inc"))
    expect(getByTestId("counter")).toHaveTextContent("2")
    fireEvent.click(getByText("run"))
    expect(deferFn).toHaveBeenCalledWith(
      [2],
      expect.objectContaining({ count: 2, deferFn }),
      abortCtrl
    )
  })

  test("`reload` uses the arguments of the previous run", () => {
    let counter = 1
    const deferFn = jest.fn().mockReturnValue(resolveTo())
    const { getByText } = render(
      <Async deferFn={deferFn}>
        {({ run, reload }) => {
          return (
            <div>
              <button onClick={() => run("go", counter++)}>run</button>
              <button onClick={reload}>reload</button>
            </div>
          )
        }}
      </Async>
    )
    expect(deferFn).not.toHaveBeenCalled()
    fireEvent.click(getByText("run"))
    expect(deferFn).toHaveBeenCalledWith(["go", 1], expect.objectContaining({ deferFn }), abortCtrl)
    fireEvent.click(getByText("run"))
    expect(deferFn).toHaveBeenCalledWith(["go", 2], expect.objectContaining({ deferFn }), abortCtrl)
    fireEvent.click(getByText("reload"))
    expect(deferFn).toHaveBeenCalledWith(["go", 2], expect.objectContaining({ deferFn }), abortCtrl)
  })

  test("only accepts the last invocation of the promise", async () => {
    let i = 0
    const resolves = [resolveIn(10)("a"), resolveIn(20)("b"), resolveIn(10)("c")]
    const { getByText, findByText } = render(
      <Async deferFn={i => resolves[i]}>
        {({ data, run }) => {
          if (data) {
            expect(data).toBe("c")
            return "done"
          }
          return <button onClick={() => run(i)}>run</button>
        }}
      </Async>
    )
    fireEvent.click(getByText("run"))
    i++
    fireEvent.click(getByText("run"))
    i++
    fireEvent.click(getByText("run"))
    await findByText("done")
  })
}

export const withReducer = Async => () => {
  test("receives state, action and the original reducer", async () => {
    const promise = resolveTo("done")
    const reducer = jest.fn((state, action, asyncReducer) => asyncReducer(state, action))
    const { findByText } = render(
      <Async promise={promise} reducer={reducer}>
        {({ data }) => data || null}
      </Async>
    )
    await findByText("done")
    expect(reducer).toHaveBeenCalledWith(
      expect.objectContaining({ status: expect.any(String) }),
      expect.objectContaining({ type: expect.any(String) }),
      expect.any(Function)
    )
  })

  test("allows overriding state updates", async () => {
    const promise = resolveTo("done")
    const reducer = (state, action, asyncReducer) => {
      if (action.type === "fulfill") action.payload = "cool"
      return asyncReducer(state, action)
    }
    const { findByText } = render(
      <Async promise={promise} reducer={reducer}>
        {({ data }) => data || null}
      </Async>
    )
    await findByText("cool")
  })
}

export const withDispatcher = Async => () => {
  test("receives action, the original dispatch method and options", async () => {
    const promise = resolveTo("done")
    const dispatcher = jest.fn((action, dispatch) => dispatch(action))
    const props = { promise, dispatcher }
    const { findByText } = render(<Async {...props}>{({ data }) => data || null}</Async>)
    await findByText("done")
    expect(dispatcher).toHaveBeenCalledWith(
      expect.objectContaining({ type: expect.any(String) }),
      expect.any(Function),
      expect.objectContaining(props)
    )
  })

  test("allows overriding actions before dispatch", async () => {
    const promise = resolveTo("done")
    const dispatcher = (action, dispatch) => {
      if (action.type === "fulfill") action.payload = "cool"
      dispatch(action)
    }
    const { findByText } = render(
      <Async promise={promise} dispatcher={dispatcher}>
        {({ data }) => data || null}
      </Async>
    )
    await findByText("cool")
  })

  test("allows dispatching additional actions", async () => {
    const promise = resolveTo("done")
    const customAction = { type: "custom" }
    const dispatcher = (action, dispatch) => {
      dispatch(action)
      dispatch(customAction)
    }
    const reducer = jest.fn((state, action, asyncReducer) => asyncReducer(state, action))
    const { findByText } = render(
      <Async promise={promise} dispatcher={dispatcher} reducer={reducer}>
        {({ data }) => data || null}
      </Async>
    )
    await findByText("done")
    expect(reducer).toHaveBeenCalledWith(expect.anything(), customAction, expect.anything())
  })
}
