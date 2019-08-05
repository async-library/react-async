/* eslint-disable react/prop-types */

import "jest-dom/extend-expect"
import React from "react"
import { render, fireEvent, waitForElement } from "@testing-library/react"

export const resolveIn = ms => value => new Promise(resolve => setTimeout(resolve, ms, value))
export const resolveTo = resolveIn(0)
export const rejectIn = ms => err =>
  new Promise((resolve, reject) => setTimeout(reject, ms, new Error(err)))
export const rejectTo = rejectIn(0)
export const sleep = ms => resolveIn(ms)()

export const common = Async => () => {
  test("passes `data`, `error`, metadata and methods as render props", async () => {
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
          expect(renderProps).toHaveProperty("cancel")
          expect(renderProps).toHaveProperty("run")
          expect(renderProps).toHaveProperty("reload")
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
    const { getByText } = render(
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
    await waitForElement(() => getByText("outer undefined"))
    await waitForElement(() => getByText("outer inner"))
  })

  test("does not cancel on initial mount", async () => {
    const onCancel = jest.fn()
    const { getByText } = render(<Async onCancel={onCancel}>{() => "done"}</Async>)
    await waitForElement(() => getByText("done"))
    expect(onCancel).not.toHaveBeenCalled()
  })
}

export const withPromise = Async => () => {
  test("passes resolved data to children as render prop", async () => {
    const promise = resolveTo("done")
    const { getByText } = render(<Async promise={promise}>{({ data }) => data || null}</Async>)
    await waitForElement(() => getByText("done"))
  })

  test("passes rejection error to children as render prop", async () => {
    const promise = rejectTo("oops")
    const { getByText } = render(
      <Async promise={promise}>{({ error }) => (error ? error.message : null)}</Async>
    )
    await waitForElement(() => getByText("oops"))
  })

  test("sets `startedAt` when a promise is provided", async () => {
    const { getByText } = render(
      <Async promise={resolveTo("done")}>
        {({ data, startedAt }) => {
          expect(startedAt.getTime()).toBeCloseTo(new Date().getTime(), -2)
          return data || null
        }}
      </Async>
    )
    await waitForElement(() => getByText("done"))
  })

  test("sets `finishedAt` when the provided promise settles", async () => {
    const { getByText } = render(
      <Async promise={resolveTo("done")}>
        {({ data, finishedAt }) => {
          if (data) expect(finishedAt.getTime()).toBeCloseTo(new Date().getTime(), -2)
          return data || null
        }}
      </Async>
    )
    await waitForElement(() => getByText("done"))
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
    const { getByText } = render(
      <Async initialValue="init" promise={resolveTo("done")}>
        {({ data }) => data || null}
      </Async>
    )
    await waitForElement(() => getByText("init"))
    await waitForElement(() => getByText("done"))
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
    const { getByText } = render(
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
    await waitForElement(() => getByText("started"))
  })

  test("sets `finishedAt` when the promise settles", async () => {
    const { getByText } = render(
      <Async promiseFn={() => resolveTo("done")}>
        {({ data, finishedAt }) => {
          if (data) expect(finishedAt.getTime()).toBeCloseTo(new Date().getTime(), -2)
          return data || null
        }}
      </Async>
    )
    await waitForElement(() => getByText("done"))
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

  test("re-runs the promise when the value of `watch` changes", () => {
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
      <Counter>{count => <Async promiseFn={promiseFn} watch={count} />}</Counter>
    )
    expect(promiseFn).toHaveBeenCalledTimes(1)
    fireEvent.click(getByText("increment"))
    expect(promiseFn).toHaveBeenCalledTimes(2)
    expect(abortCtrl.abort).toHaveBeenCalled()
    abortCtrl.abort.mockClear()
    fireEvent.click(getByText("increment"))
    expect(promiseFn).toHaveBeenCalledTimes(3)
    expect(abortCtrl.abort).toHaveBeenCalled()
  })

  test("re-runs the promise when `watchFn` returns truthy", () => {
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
    fireEvent.click(getByText("increment"))
    expect(promiseFn).toHaveBeenCalledTimes(1)
    expect(abortCtrl.abort).not.toHaveBeenCalled()
    fireEvent.click(getByText("increment"))
    expect(promiseFn).toHaveBeenCalledTimes(2)
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
    const { getByText } = render(
      <Async promiseFn={promiseFn} initialValue="done">
        {({ data, isPending }) => {
          states.push(isPending)
          return data || null
        }}
      </Async>
    )
    await waitForElement(() => getByText("done"))
    expect(states).toEqual([false])
  })

  test("passes `initialValue` to children immediately", async () => {
    const promiseFn = () => resolveTo("done")
    const { getByText } = render(
      <Async promiseFn={promiseFn} initialValue="done">
        {({ data }) => data}
      </Async>
    )
    await waitForElement(() => getByText("done"))
  })

  test("sets `error` instead of `data` when `initialValue` is an Error object", async () => {
    const promiseFn = () => resolveTo("done")
    const error = new Error("oops")
    const { getByText } = render(
      <Async promiseFn={promiseFn} initialValue={error}>
        {({ error }) => error.message}
      </Async>
    )
    await waitForElement(() => getByText("oops"))
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
    const Parent = () => {
      const [count, setCount] = React.useState(0)
      return (
        <>
          <button onClick={() => setCount(count + 1)}>inc</button>
          {count && <Child count={count} />}
        </>
      )
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
    const { getByText } = render(
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
    await waitForElement(() => getByText("done"))
  })
}

export const withReducer = Async => () => {
  test("receives state, action and the original reducer", async () => {
    const promise = resolveTo("done")
    const reducer = jest.fn((state, action, asyncReducer) => asyncReducer(state, action))
    const { getByText } = render(
      <Async promise={promise} reducer={reducer}>
        {({ data }) => data || null}
      </Async>
    )
    await waitForElement(() => getByText("done"))
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
    const { getByText } = render(
      <Async promise={promise} reducer={reducer}>
        {({ data }) => data || null}
      </Async>
    )
    await waitForElement(() => getByText("cool"))
  })
}

export const withDispatcher = Async => () => {
  test("receives action, the original dispatch method and options", async () => {
    const promise = resolveTo("done")
    const dispatcher = jest.fn((action, dispatch) => dispatch(action))
    const props = { promise, dispatcher }
    const { getByText } = render(<Async {...props}>{({ data }) => data || null}</Async>)
    await waitForElement(() => getByText("done"))
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
    const { getByText } = render(
      <Async promise={promise} dispatcher={dispatcher}>
        {({ data }) => data || null}
      </Async>
    )
    await waitForElement(() => getByText("cool"))
  })

  test("allows dispatching additional actions", async () => {
    const promise = resolveTo("done")
    const customAction = { type: "custom" }
    const dispatcher = (action, dispatch) => {
      dispatch(action)
      dispatch(customAction)
    }
    const reducer = jest.fn((state, action, asyncReducer) => asyncReducer(state, action))
    const { getByText } = render(
      <Async promise={promise} dispatcher={dispatcher} reducer={reducer}>
        {({ data }) => data || null}
      </Async>
    )
    await waitForElement(() => getByText("done"))
    expect(reducer).toHaveBeenCalledWith(expect.anything(), customAction, expect.anything())
  })
}
