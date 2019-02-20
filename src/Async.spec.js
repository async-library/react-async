import "jest-dom/extend-expect"
import React from "react"
import { render, fireEvent, cleanup, waitForElement } from "react-testing-library"
import Async, { createInstance } from "./index"

const abortCtrl = { abort: jest.fn() }
window.AbortController = jest.fn().mockImplementation(() => abortCtrl)

beforeEach(abortCtrl.abort.mockClear)
afterEach(cleanup)

const resolveIn = ms => value => new Promise(resolve => setTimeout(resolve, ms, value))
const resolveTo = resolveIn(0)
const rejectIn = ms => err => new Promise((resolve, reject) => setTimeout(reject, ms, err))
const rejectTo = rejectIn(0)

describe("Async", () => {
  test("runs promiseFn on mount", () => {
    const promiseFn = jest.fn().mockReturnValue(Promise.resolve())
    render(<Async promiseFn={promiseFn} />)
    expect(promiseFn).toHaveBeenCalledTimes(1)
  })

  test("calls promiseFn with props", () => {
    const promiseFn = jest.fn().mockReturnValue(Promise.resolve())
    render(<Async promiseFn={promiseFn} anotherProp="123" />)
    expect(promiseFn).toHaveBeenCalledWith({ promiseFn, anotherProp: "123" }, abortCtrl)
  })

  test("passes resolved data to children as render prop", async () => {
    const promiseFn = () => resolveTo("done")
    const { getByText } = render(<Async promiseFn={promiseFn}>{({ data }) => data || null}</Async>)
    await waitForElement(() => getByText("done"))
  })

  test("passes rejection error to children as render prop", async () => {
    const promiseFn = () => Promise.reject("oops")
    const { getByText } = render(
      <Async promiseFn={promiseFn}>{({ error }) => error || null}</Async>
    )
    await waitForElement(() => getByText("oops"))
  })

  test("passes isLoading boolean while the promise is running", async () => {
    const promiseFn = () => resolveTo("done")
    const states = []
    const { getByText } = render(
      <Async promiseFn={promiseFn}>
        {({ data, isLoading }) => {
          states.push(isLoading)
          return data || null
        }}
      </Async>
    )
    await waitForElement(() => getByText("done"))
    expect(states).toEqual([true, true, false])
  })

  test("passes startedAt date when the promise starts", async () => {
    const promiseFn = () => resolveTo("done")
    const { getByText } = render(
      <Async promiseFn={promiseFn}>
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

  test("passes finishedAt date when the promise finishes", async () => {
    const promiseFn = () => resolveTo("done")
    const { getByText } = render(
      <Async promiseFn={promiseFn}>
        {({ data, finishedAt }) => {
          if (finishedAt) {
            expect(finishedAt.getTime()).toBeCloseTo(new Date().getTime(), -1)
            return data
          }
          return null
        }}
      </Async>
    )
    await waitForElement(() => getByText("done"))
  })

  test("passes reload function that re-runs the promise", () => {
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

  test("re-runs the promise when the value of 'watch' changes", () => {
    class Counter extends React.Component {
      state = { count: 0 }
      inc = () => this.setState(state => ({ count: state.count + 1 }))
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
    expect(abortCtrl.abort).toHaveBeenCalledTimes(1)
    fireEvent.click(getByText("increment"))
    expect(promiseFn).toHaveBeenCalledTimes(3)
    expect(abortCtrl.abort).toHaveBeenCalledTimes(2)
  })

  test("re-runs the promise when 'watchFn' returns truthy", () => {
    class Counter extends React.Component {
      state = { count: 0 }
      inc = () => this.setState(state => ({ count: state.count + 1 }))
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
    expect(abortCtrl.abort).toHaveBeenCalledTimes(0)
    fireEvent.click(getByText("increment"))
    expect(promiseFn).toHaveBeenCalledTimes(2)
    expect(abortCtrl.abort).toHaveBeenCalledTimes(1)
  })

  test("runs deferFn only when explicitly invoked, passing arguments, props and AbortController", () => {
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

  test("reload uses the arguments of the previous run", () => {
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

  test("invokes onResolve callback when promise resolves", async () => {
    const promiseFn = jest.fn().mockReturnValue(Promise.resolve("ok"))
    const onResolve = jest.fn()
    render(<Async promiseFn={promiseFn} onResolve={onResolve} />)
    await Promise.resolve()
    expect(onResolve).toHaveBeenCalledWith("ok")
  })

  test("invokes onReject callback when promise rejects", async () => {
    const promiseFn = jest.fn().mockReturnValue(Promise.reject("err"))
    const onReject = jest.fn()
    render(<Async promiseFn={promiseFn} onReject={onReject} />)
    await Promise.resolve()
    expect(onReject).toHaveBeenCalledWith("err")
  })

  test("cancels pending promise when unmounted", async () => {
    const promiseFn = jest.fn().mockReturnValue(Promise.resolve("ok"))
    const onResolve = jest.fn()
    const { unmount } = render(<Async promiseFn={promiseFn} onResolve={onResolve} />)
    unmount()
    await Promise.resolve()
    expect(onResolve).not.toHaveBeenCalled()
    expect(abortCtrl.abort).toHaveBeenCalledTimes(1)
  })

  test("cancels and restarts the promise when promiseFn changes", async () => {
    const promiseFn1 = jest.fn().mockReturnValue(Promise.resolve("one"))
    const promiseFn2 = jest.fn().mockReturnValue(Promise.resolve("two"))
    const onResolve = jest.fn()
    const { rerender } = render(<Async promiseFn={promiseFn1} onResolve={onResolve} />)
    rerender(<Async promiseFn={promiseFn2} onResolve={onResolve} />)
    await Promise.resolve()
    expect(onResolve).not.toHaveBeenCalledWith("one")
    expect(onResolve).toHaveBeenCalledWith("two")
    expect(abortCtrl.abort).toHaveBeenCalledTimes(1)
  })

  test("cancels the promise when promiseFn is unset", async () => {
    const promiseFn = jest.fn().mockReturnValue(Promise.resolve("one"))
    const onResolve = jest.fn()
    const { rerender } = render(<Async promiseFn={promiseFn} onResolve={onResolve} />)
    rerender(<Async onResolve={onResolve} />)
    await Promise.resolve()
    expect(onResolve).not.toHaveBeenCalledWith("one")
    expect(abortCtrl.abort).toHaveBeenCalledTimes(1)
  })

  test("does not run promiseFn on mount when initialValue is provided", () => {
    const promiseFn = jest.fn().mockReturnValue(Promise.resolve())
    render(<Async promiseFn={promiseFn} initialValue={{}} />)
    expect(promiseFn).not.toHaveBeenCalled()
  })

  test("does not start loading when using initialValue", async () => {
    const promiseFn = () => resolveTo("done")
    const states = []
    const { getByText } = render(
      <Async promiseFn={promiseFn} initialValue="done">
        {({ data, isLoading }) => {
          states.push(isLoading)
          return data
        }}
      </Async>
    )
    await waitForElement(() => getByText("done"))
    expect(states).toEqual([false])
  })

  test("passes initialValue to children immediately", async () => {
    const promiseFn = () => resolveTo("done")
    const { getByText } = render(
      <Async promiseFn={promiseFn} initialValue="done">
        {({ data }) => data}
      </Async>
    )
    await waitForElement(() => getByText("done"))
  })

  test("sets error instead of data when initialValue is an Error object", async () => {
    const promiseFn = () => resolveTo("done")
    const error = new Error("oops")
    const { getByText } = render(
      <Async promiseFn={promiseFn} initialValue={error}>
        {({ error }) => error.message}
      </Async>
    )
    await waitForElement(() => getByText("oops"))
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

  test("an unrelated change in props does not update the Context", async () => {
    let one
    let two
    const { rerender } = render(
      <Async>
        <Async.Pending>
          {value => {
            one = value
          }}
        </Async.Pending>
      </Async>
    )
    rerender(
      <Async someProp>
        <Async.Pending>
          {value => {
            two = value
          }}
        </Async.Pending>
      </Async>
    )
    expect(one).toBe(two)
  })
})

describe("Async.Resolved", () => {
  test("renders only after the promise is resolved", async () => {
    const promiseFn = () => resolveTo("ok")
    const deferFn = () => rejectTo("fail")
    const { getByText, queryByText } = render(
      <Async promiseFn={promiseFn} deferFn={deferFn}>
        <Async.Resolved>{(data, { run }) => <button onClick={run}>{data}</button>}</Async.Resolved>
        <Async.Rejected>{error => error}</Async.Rejected>
      </Async>
    )
    expect(queryByText("ok")).toBeNull()
    await waitForElement(() => getByText("ok"))
    expect(queryByText("ok")).toBeInTheDocument()
    expect(queryByText("fail")).toBeNull()
    fireEvent.click(getByText("ok"))
    await waitForElement(() => getByText("fail"))
    expect(queryByText("ok")).toBeNull()
    expect(queryByText("fail")).toBeInTheDocument()
  })

  test("with persist renders old data on error", async () => {
    const promiseFn = () => resolveTo("ok")
    const deferFn = () => rejectTo("fail")
    const { getByText, queryByText } = render(
      <Async promiseFn={promiseFn} deferFn={deferFn}>
        <Async.Resolved persist>
          {(data, { run }) => <button onClick={run}>{data}</button>}
        </Async.Resolved>
        <Async.Rejected>{error => error}</Async.Rejected>
      </Async>
    )
    expect(queryByText("ok")).toBeNull()
    await waitForElement(() => getByText("ok"))
    expect(queryByText("ok")).toBeInTheDocument()
    expect(queryByText("fail")).toBeNull()
    fireEvent.click(getByText("ok"))
    await waitForElement(() => getByText("fail"))
    expect(queryByText("ok")).toBeInTheDocument()
    expect(queryByText("fail")).toBeInTheDocument()
  })

  test("Async.Resolved works also with nested Async", async () => {
    const outer = () => resolveIn(0)("outer")
    const inner = () => resolveIn(100)("inner")
    const { getByText, queryByText } = render(
      <Async promiseFn={outer}>
        <Async.Resolved>
          {outer => (
            <Async promiseFn={inner}>
              <Async.Loading>{outer} loading</Async.Loading>
              <Async.Resolved>{inner => outer + " " + inner}</Async.Resolved>
            </Async>
          )}
        </Async.Resolved>
      </Async>
    )
    expect(queryByText("outer loading")).toBeNull()
    await waitForElement(() => getByText("outer loading"))
    expect(queryByText("outer inner")).toBeNull()
    await waitForElement(() => getByText("outer inner"))
    expect(queryByText("outer inner")).toBeInTheDocument()
  })
})

describe("Async.Loading", () => {
  test("renders only while the promise is loading", async () => {
    const promiseFn = () => resolveTo("ok")
    const { getByText, queryByText } = render(
      <Async promiseFn={promiseFn}>
        <Async.Loading>loading</Async.Loading>
        <Async.Resolved>done</Async.Resolved>
      </Async>
    )
    expect(queryByText("loading")).toBeInTheDocument()
    await waitForElement(() => getByText("done"))
    expect(queryByText("loading")).toBeNull()
  })
})

describe("Async.Pending", () => {
  test("renders only while the deferred promise is pending", async () => {
    const deferFn = () => resolveTo("ok")
    const { getByText, queryByText } = render(
      <Async deferFn={deferFn}>
        <Async.Pending>{({ run }) => <button onClick={run}>pending</button>}</Async.Pending>
        <Async.Loading>loading</Async.Loading>
        <Async.Resolved>done</Async.Resolved>
      </Async>
    )
    expect(queryByText("pending")).toBeInTheDocument()
    fireEvent.click(getByText("pending"))
    expect(queryByText("pending")).toBeNull()
    expect(queryByText("loading")).toBeInTheDocument()
    await waitForElement(() => getByText("done"))
    expect(queryByText("loading")).toBeNull()
  })
})

describe("Async.Rejected", () => {
  test("renders only after the promise is rejected", async () => {
    const promiseFn = () => rejectTo("err")
    const { getByText, queryByText } = render(
      <Async promiseFn={promiseFn}>
        <Async.Rejected>{err => err}</Async.Rejected>
      </Async>
    )
    expect(queryByText("err")).toBeNull()
    await waitForElement(() => getByText("err"))
    expect(queryByText("err")).toBeInTheDocument()
  })
})

describe("createInstance", () => {
  test("allows setting default props", async () => {
    const promiseFn = () => resolveTo("done")
    const onResolve = jest.fn()
    const CustomAsync = createInstance({ promiseFn, onResolve })
    const { getByText } = render(<CustomAsync>{({ data }) => data || null}</CustomAsync>)
    await waitForElement(() => getByText("done"))
    expect(onResolve).toHaveBeenCalledWith("done")
  })

  test("accepts watchFn from defaultProps and passes the defaultProps along", async () => {
    const promiseFn = () => resolveTo("done")
    const watchFn = jest.fn()
    const CustomAsync = createInstance({ promiseFn, watchFn })
    const { getByText } = render(<CustomAsync>{({ data }) => data || null}</CustomAsync>)
    await waitForElement(() => getByText("done"))
    expect(watchFn).toHaveBeenCalledWith(
      expect.objectContaining({ promiseFn, watchFn }),
      expect.objectContaining({ promiseFn, watchFn })
    )
  })

  test("custom instances also have helper components", async () => {
    const promiseFn = () => resolveTo("done")
    const CustomAsync = createInstance({ promiseFn })
    const { getByText } = render(
      <CustomAsync>
        <CustomAsync.Loading>loading</CustomAsync.Loading>
        <CustomAsync.Resolved>resolved</CustomAsync.Resolved>
      </CustomAsync>
    )
    await waitForElement(() => getByText("loading"))
    await waitForElement(() => getByText("resolved"))
  })

  test("custom instance also passes defaultProps to deferFn", async () => {
    const deferFn = jest.fn().mockReturnValue(resolveTo())
    const CustomAsync = createInstance({ deferFn })

    let counter = 1
    const { getByText } = render(
      <CustomAsync foo="bar">
        {({ run }) => <button onClick={() => run("go", counter++)}>run</button>}
      </CustomAsync>
    )
    const expectedProps = { deferFn, foo: "bar" }
    expect(deferFn).not.toHaveBeenCalled()
    fireEvent.click(getByText("run"))
    expect(deferFn).toHaveBeenCalledWith(
      ["go", 1],
      expect.objectContaining(expectedProps),
      abortCtrl
    )
    fireEvent.click(getByText("run"))
    expect(deferFn).toHaveBeenCalledWith(
      ["go", 2],
      expect.objectContaining(expectedProps),
      abortCtrl
    )
  })

  test("custom instance correctly passes props to deferFn on reload", async () => {
    const deferFn = jest.fn().mockReturnValue(resolveTo())
    const CustomAsync = createInstance({ deferFn })

    let counter = 1
    const { getByText } = render(
      <CustomAsync foo="bar">
        {({ run, reload }) =>
          counter === 1 ? (
            <button onClick={() => run("go", counter++)}>run</button>
          ) : (
            <button onClick={reload}>reload</button>
          )
        }
      </CustomAsync>
    )
    const expectedProps = { deferFn, foo: "bar" }
    expect(deferFn).not.toHaveBeenCalled()
    fireEvent.click(getByText("run"))
    expect(deferFn).toHaveBeenCalledWith(
      ["go", 1],
      expect.objectContaining(expectedProps),
      abortCtrl
    )
    fireEvent.click(getByText("reload"))
    expect(deferFn).toHaveBeenCalledWith(
      ["go", 1],
      expect.objectContaining(expectedProps),
      abortCtrl
    )
  })
})
