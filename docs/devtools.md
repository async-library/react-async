# DevTools

React Async comes with a separate DevTools package which helps you Debug and develop your asynchronous application states. You can install it from npm:

```text
npm install --save react-async-devtools
```

Or if you're using Yarn:

```text
yarn add react-async-devtools
```

Then simply import it and render the`<DevTools />` component at the root of your app:

```jsx
import DevTools from "react-async-devtools"

export const Root = () => (
  <>
    <DevTools />
    <App />
  </>
)
```
