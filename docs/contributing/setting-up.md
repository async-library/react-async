# Setting up your development environment

## Prerequisites

In order to develop React Async on your local machine, you'll need `git`, `node` and `yarn`.

### Git

To clone the repository, commit your changes and push them upstream, you'll need to have `git` [installed][install git].

[install git]: https://www.atlassian.com/git/tutorials/install-git

### Node.js

As a JavaScript project, we rely heavily on Node.js. It's recommended to use a version manager such as [fnm] for Mac /
Linux or [nvm-windows] for Windows to install the latest Node.js with.

[fnm]: https://github.com/Schniz/fnm
[nvm-windows]: https://github.com/coreybutler/nvm-windows

### Yarn

This repo relies on Yarn workspaces, so you should [install][install yarn] and use `yarn@1.3.2` or higher as the package
manager for this project.

[install yarn]: https://yarnpkg.com/en/docs/install

## Project setup

To start working on React Async, clone the repository and bootstrap the project by running the following commands
one-by-one:

```sh
git clone https://github.com/async-library/react-async.git
cd react-async
yarn install
yarn bootstrap
yarn test
```

This should install all dependencies, build and link the react-async and react-async-devtools packages to the examples,
and finally run the unit tests. In the end it should succeed with a message (numbers may change):

```
Test Suites: 6 passed, 6 total
Tests:       136 passed, 136 total
```

> Note that all work is done against the `next` branch, we only merge to `master` when doing a release.

## Editor setup

We recommend using [Visual Studio Code](https://code.visualstudio.com/) with the following extensions:

- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [DeepScan](https://marketplace.visualstudio.com/items?itemName=DeepScan.vscode-deepscan)
- [Oceanic Plus](https://marketplace.visualstudio.com/items?itemName=marcoms.oceanic-plus)

Make sure to enable `editor.formatOnSave`, so Prettier will automatically apply the right code style. For the full
immersive experience you can also install and use the [Overpass Mono](https://overpassfont.org/) font.
