<p align="center">
  <a href="https://react-async.dev"><img src="https://raw.githubusercontent.com/async-library/react-async/HEAD/react-async.png" width="520" alt="React Async" /></a><br/>
  Handle promises with ease.
</p>
<br/>

<p align="center">
  <a href="https://www.npmjs.com/package/react-async">
    <img src="https://badgen.net/npm/v/react-async?icon=npm&label=react-async" alt="latest version">
  </a>
  <a href="https://www.npmjs.com/package/react-async">
    <img src="https://badgen.net/npm/dm/react-async" alt="montly downloads">
  </a>
  <a href="https://bundlephobia.com/result?p=react-async">
    <img src="https://badgen.net/bundlephobia/minzip/react-async" alt="minzipped size">
  </a>
  <a href="https://opensource.org/licenses/ISC">
    <img src="https://badgen.net/npm/license/react-async" alt="license">
  </a>
  <br/>
  <a href="https://circleci.com/gh/async-library/react-async">
    <img src="https://badgen.net/circleci/github/async-library/react-async/master?icon=circleci" alt="circleci status">
  </a>
  <a href="https://travis-ci.org/async-library/react-async">
    <img src="https://badgen.net/travis/async-library/react-async?icon=travis" alt="travis status">
  </a>
  <a href="https://codecov.io/gh/async-library/react-async">
    <img src="https://badgen.net/codecov/c/github/async-library/react-async/master?icon=codecov" alt="code coverage">
  </a>
  <a href="https://www.codefactor.io/repository/github/async-library/react-async">
    <img src="https://www.codefactor.io/repository/github/async-library/react-async/badge" alt="code quality">
  </a>
  <a href="https://deepscan.io/dashboard#view=project&tid=5549&pid=7406&bid=74183">
    <img src="https://deepscan.io/api/teams/5549/projects/7406/branches/74183/badge/grade.svg" alt="DeepScan grade">
  </a>
  <br/>
  <a href="https://discord.gg/CAYQ6mU">
    <img src="https://img.shields.io/badge/discord-join-7289DA.svg?logo=discord&longCache=true&style=flat" />
  </a>
  <a href="https://react-async.now.sh/examples/">
    <img src="https://badgen.net/badge/live%20examples/available/pink?icon=now" alt="live examples">
  </a>
  <a href="https://www.chromaticqa.com/builds?appId=5d7fff2b307e4b0020ae1be4">
    <img src="https://badgen.net/badge/tested%20with/chromatic/fc521f" alt="Chromatic">
  </a>
  <a href="#contributors"><img src="https://badgen.net/badge/all%20contributors/21/6d60e6" alt="All Contributors"></a>
</p>

React component and hook for declarative promise resolution and data fetching. Makes it easy to handle every
state of the asynchronous process, without assumptions about the shape of your data or the type of request.
Use it with `fetch`, Axios or other data fetching libraries, even GraphQL.

- Zero dependencies
- Works with promises, async/await and the Fetch API
- Now with experimental Suspense support
- Choose between Render Props, Context-based helper components or the `useAsync` and `useFetch` hooks
- Debug and develop every part of the loading sequence with the React Async DevTools
- Provides convenient `isPending`, `startedAt`, `finishedAt`, et al metadata
- Provides `cancel` and `reload` actions
- Automatic re-run using `watch` or `watchFn` prop
- Accepts `onResolve`, `onReject` and `onCancel` callbacks
- Supports [abortable fetch] by providing an AbortController
- Supports optimistic updates using `setData`
- Supports server-side rendering through `initialValue`
- Written in TypeScript, ships with type definitions
- Works well in React Native too!

[abortable fetch]: https://developers.google.com/web/updates/2017/09/abortable-fetch

> ## Upgrading to v9
>
> Version 9 comes with a minor breaking change.
> See [Upgrading](https://docs.react-async.com/getting-started/upgrading) for details.

# Documentation

- [Introduction](https://docs.react-async.com/)

## Getting started

- [Installation](https://docs.react-async.com/getting-started/installation)
- [Upgrading](https://docs.react-async.com/getting-started/upgrading)
- [Usage](https://docs.react-async.com/getting-started/usage)
- [DevTools](https://docs.react-async.com/getting-started/devtools)

## API

- [Interfaces](https://docs.react-async.com/api/interfaces)
- [Configuration options](https://docs.react-async.com/api/options)
- [State properties](https://docs.react-async.com/api/state)
- [Helper components](https://docs.react-async.com/api/helpers)

## Guide

- [Async components](https://docs.react-async.com/guide/async-components)
- [Separating view and logic](https://docs.react-async.com/guide/separating-view-logic)
- [Async actions](https://docs.react-async.com/guide/async-actions)
- [Optimistic updates](https://docs.react-async.com/guide/optimistic-updates)
- [Server-side rendering](https://docs.react-async.com/guide/server-side-rendering)

## Contributing

- [Introduction](https://docs.react-async.com/contributing/introduction)
- [Setting up](https://docs.react-async.com/contributing/setting-up)
- [Development](https://docs.react-async.com/contributing/development)
- [Testing](https://docs.react-async.com/contributing/testing)
- [Releasing](https://docs.react-async.com/contributing/releasing)

# Contributors

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://medium.com/@ghengeveld"><img src="https://avatars1.githubusercontent.com/u/321738?v=4" width="75px;" alt=""/><br /><sub><b>Gert Hengeveld</b></sub></a><br /><a href="https://github.com/async-library/react-async/commits?author=ghengeveld" title="Code">💻</a> <a href="https://github.com/async-library/react-async/pulls?q=is%3Apr+reviewed-by%3Aghengeveld" title="Reviewed Pull Requests">👀</a> <a href="#question-ghengeveld" title="Answering Questions">💬</a></td>
    <td align="center"><a href="https://github.com/Khartir"><img src="https://avatars3.githubusercontent.com/u/5592420?v=4" width="75px;" alt=""/><br /><sub><b>Khartir</b></sub></a><br /><a href="https://github.com/async-library/react-async/commits?author=Khartir" title="Code">💻</a> <a href="#platform-Khartir" title="Packaging/porting to new platform">📦</a></td>
    <td align="center"><a href="https://twitter.com/phry"><img src="https://avatars1.githubusercontent.com/u/4282439?v=4" width="75px;" alt=""/><br /><sub><b>Lenz Weber</b></sub></a><br /><a href="https://github.com/async-library/react-async/commits?author=phryneas" title="Code">💻</a> <a href="#platform-phryneas" title="Packaging/porting to new platform">📦</a> <a href="#ideas-phryneas" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/Avi98"><img src="https://avatars1.githubusercontent.com/u/26133749?v=4" width="75px;" alt=""/><br /><sub><b>Avinash</b></sub></a><br /><a href="https://github.com/async-library/react-async/pulls?q=is%3Apr+reviewed-by%3AAvi98" title="Reviewed Pull Requests">👀</a> <a href="https://github.com/async-library/react-async/commits?author=Avi98" title="Documentation">📖</a></td>
    <td align="center"><a href="http://www.fredkschott.com"><img src="https://avatars1.githubusercontent.com/u/622227?v=4" width="75px;" alt=""/><br /><sub><b>Fred K. Schott</b></sub></a><br /><a href="#tool-FredKSchott" title="Tools">🔧</a></td>
    <td align="center"><a href="https://bycedric.com"><img src="https://avatars2.githubusercontent.com/u/1203991?v=4" width="75px;" alt=""/><br /><sub><b>Cedric van Putten</b></sub></a><br /><a href="https://github.com/async-library/react-async/commits?author=byCedric" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/tomshane"><img src="https://avatars1.githubusercontent.com/u/11005356?v=4" width="75px;" alt=""/><br /><sub><b>Tom Shane</b></sub></a><br /><a href="https://github.com/async-library/react-async/pulls?q=is%3Apr+reviewed-by%3Atomshane" title="Reviewed Pull Requests">👀</a></td>
  </tr>
  <tr>
    <td align="center"><a href="http://philippeterson.com/"><img src="https://avatars1.githubusercontent.com/u/1326208?v=4" width="75px;" alt=""/><br /><sub><b>Philip Peterson</b></sub></a><br /><a href="https://github.com/async-library/react-async/commits?author=philip-peterson" title="Code">💻</a></td>
    <td align="center"><a href="https://twitter.com/sseraphini"><img src="https://avatars3.githubusercontent.com/u/2005841?v=4" width="75px;" alt=""/><br /><sub><b>Sibelius Seraphini</b></sub></a><br /><a href="https://github.com/async-library/react-async/pulls?q=is%3Apr+reviewed-by%3Asibelius" title="Reviewed Pull Requests">👀</a></td>
    <td align="center"><a href="https://jimthedev.com"><img src="https://avatars0.githubusercontent.com/u/108938?v=4" width="75px;" alt=""/><br /><sub><b>Jim Cummins</b></sub></a><br /><a href="https://github.com/async-library/react-async/pulls?q=is%3Apr+reviewed-by%3Ajimthedev" title="Reviewed Pull Requests">👀</a></td>
    <td align="center"><a href="http://mihkel.sokk.ee"><img src="https://avatars3.githubusercontent.com/u/231978?v=4" width="75px;" alt=""/><br /><sub><b>Mihkel Sokk</b></sub></a><br /><a href="https://github.com/async-library/react-async/pulls?q=is%3Apr+reviewed-by%3Amsokk" title="Reviewed Pull Requests">👀</a></td>
    <td align="center"><a href="https://github.com/brabeji"><img src="https://avatars3.githubusercontent.com/u/2237954?v=4" width="75px;" alt=""/><br /><sub><b>Jiří Brabec</b></sub></a><br /><a href="https://github.com/async-library/react-async/commits?author=brabeji" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/unorsk"><img src="https://avatars0.githubusercontent.com/u/25188?v=4" width="75px;" alt=""/><br /><sub><b>Andrii U</b></sub></a><br /><a href="#example-unorsk" title="Examples">💡</a></td>
    <td align="center"><a href="http://matthisk.nl"><img src="https://avatars0.githubusercontent.com/u/602837?v=4" width="75px;" alt=""/><br /><sub><b>Matthisk Heimensen</b></sub></a><br /><a href="https://github.com/async-library/react-async/commits?author=matthisk" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/dhurlburtusa"><img src="https://avatars3.githubusercontent.com/u/4006431?v=4" width="75px;" alt=""/><br /><sub><b>Danny Hurlburt</b></sub></a><br /><a href="#ideas-dhurlburtusa" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/async-library/react-async/commits?author=dhurlburtusa" title="Documentation">📖</a></td>
    <td align="center"><a href="https://noelyoo.github.io/resume"><img src="https://avatars2.githubusercontent.com/u/25740248?v=4" width="75px;" alt=""/><br /><sub><b>Noel Yoo</b></sub></a><br /><a href="https://github.com/async-library/react-async/commits?author=noelyoo" title="Tests">⚠️</a> <a href="https://github.com/async-library/react-async/commits?author=noelyoo" title="Code">💻</a> <a href="#ideas-noelyoo" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/aratcliffe"><img src="https://avatars3.githubusercontent.com/u/491126?v=4" width="75px;" alt=""/><br /><sub><b>Adam Ratcliffe</b></sub></a><br /><a href="https://github.com/async-library/react-async/commits?author=aratcliffe" title="Code">💻</a></td>
    <td align="center"><a href="https://kentcdodds.com"><img src="https://avatars0.githubusercontent.com/u/1500684?v=4" width="75px;" alt=""/><br /><sub><b>Kent C. Dodds</b></sub></a><br /><a href="https://github.com/async-library/react-async/commits?author=kentcdodds" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/walter-ind"><img src="https://avatars2.githubusercontent.com/u/52423075?v=4" width="75px;" alt=""/><br /><sub><b>walter-ind</b></sub></a><br /><a href="https://github.com/async-library/react-async/commits?author=walter-ind" title="Documentation">📖</a></td>
    <td align="center"><a href="https://twitter.com/arthurdenture"><img src="https://avatars3.githubusercontent.com/u/80536?v=4" width="75px;" alt=""/><br /><sub><b>Jacob Lee</b></sub></a><br /><a href="https://github.com/async-library/react-async/commits?author=artdent" title="Code">💻</a></td>
    <td align="center"><a href="http://rokoroku.github.io"><img src="https://avatars1.githubusercontent.com/u/5208632?v=4" width="75px;" alt=""/><br /><sub><b>Youngrok Kim</b></sub></a><br /><a href="https://github.com/async-library/react-async/commits?author=rokoroku" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://munir.dev"><img src="https://avatars3.githubusercontent.com/u/5339664?v=4" width="75px;" alt=""/><br /><sub><b>Munir Ahmed Elsangedy</b></sub></a><br /><a href="#ideas-elsangedy" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/AlixWang"><img src="https://avatars0.githubusercontent.com/u/5417459?v=4" width="75px;" alt=""/><br /><sub><b>AlixWang</b></sub></a><br /><a href="https://github.com/async-library/react-async/commits?author=AlixWang" title="Documentation">📖</a></td>
    <td align="center"><a href="http://salolivares.com"><img src="https://avatars0.githubusercontent.com/u/1812749?v=4" width="75px;" alt=""/><br /><sub><b>Sal Olivares</b></sub></a><br /><a href="https://github.com/async-library/react-async/commits?author=salolivares" title="Code">💻</a> <a href="https://github.com/async-library/react-async/issues?q=author%3Asalolivares" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/nealeu"><img src="https://avatars1.githubusercontent.com/u/264594?v=4" width="75px;" alt=""/><br /><sub><b>Neale Upstone</b></sub></a><br /><a href="https://github.com/async-library/react-async/commits?author=nealeu" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/mbark"><img src="https://avatars1.githubusercontent.com/u/1579384?v=4" width="75px;" alt=""/><br /><sub><b>Martin Barksten</b></sub></a><br /><a href="https://github.com/async-library/react-async/commits?author=mbark" title="Documentation">📖</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

## Similar projects

- [@slorber/react-async-hook](https://github.com/slorber/react-async-hook)
- [@dai-shi/react-hooks-async](https://github.com/dai-shi/react-hooks-async)
- [@cristovao-trevisan/async-resource](https://github.com/cristovao-trevisan/async-resource)
- [@ilyalesik/react-fetch-hook](https://github.com/ilyalesik/react-fetch-hook)
- [@marcin-piela/react-fetching-library](https://github.com/marcin-piela/react-fetching-library)
