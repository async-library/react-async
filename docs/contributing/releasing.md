# Releasing

All ongoing development is done on the `next` branch. When preparing for a release, we'll create a `release` branch
which will eventually be merged into `master`. This way, what's on `master` is always what's published on `npm`.

Release management is currently a manual process, to be performed by core team members only. Here's the process:

1. Create a `release` branch, usually based on `next`.
2. Open a pull request for `release` -> `master`
3. Write the release notes in the PR description.
4. Run `yarn bump` to increment the version number. Take care to follow semver.
5. Tag the release with `git tag vX.X.X` (using the correct version number).
6. Push the release commit AND tag: `git push --follow-tags`
7. Publish each package (in `./packages`) to npm using the script below.
8. Create a new release on GitHub and copy the release notes there.

```
cd packages/react-async
npm publish pkg
cd ../react-async-devtools
npm publish pkg
```

Take care to publish the `pkg` directory!
