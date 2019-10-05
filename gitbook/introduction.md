# Introduction

React Async is a utility belt for declarative promise resolution and data fetching. It makes it easy to handle asynchronous UI states, without assumptions about the shape of your data or the type of request. React Async consists of a React component and several hooks. You can use it with `fetch`, Axios or other data fetching libraries, even GraphQL.

## Rationale

React Async is different in that it tries to resolve data as close as possible to where it will be used, while using declarative syntax, using just JSX and native promises. This is in contrast to systems like Redux where you would configure any data fetching or updates on a higher \(application global\) level, using a special construct \(actions/reducers\).

React Async works well even in larger applications with multiple or nested data dependencies. It encourages loading data on-demand and in parallel at component level instead of in bulk at the route/page level. It's entirely decoupled from your routes, so it works well in complex applications that have a dynamic routing model or don't use routes at all.

React Async is promise-based, so you can resolve anything you want, not just `fetch` requests.

## Concurrent React and Suspense

The React team is currently working on a large rewrite called [Concurrent React](https://github.com/sw-yx/fresh-concurrent-react/blob/master/Intro.md#introduction-what-is-concurrent-react), previously known as "Async React". Part of this rewrite is Suspense, which is a generic way for components to suspend rendering while they load data from a cache. It can render a fallback UI while loading data, much like `<Async.Pending>`.

React Async has no direct relation to Concurrent React. They are conceptually close, but not the same. React Async is meant to make dealing with asynchronous business logic easier. Concurrent React will make those features have less impact on performance and usability. When Suspense lands, React Async will make full use of Suspense features. In fact, you can already **start using React Async right now**, and in a later update, you'll **get Suspense features for free**. In fact, React Async already has experimental support for Suspense, by passing the `suspense` option.

