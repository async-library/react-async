import React from "react"
import { storiesOf } from "@storybook/react"

import { useAsync } from "../packages/react-async/src"
import DevTools from "../packages/react-async-devtools/src"
import "./photos.css"

const loadPhoto = ({ photoId }) =>
  fetch(`https://jsonplaceholder.typicode.com/photos/${photoId}`)
    .then(res => (res.ok ? res : Promise.reject(res)))
    .then(res => res.json())

const PhotoPlaceholder = () => (
  <div className="photo placeholder">
    <div className="img" />
    <div className="title">══════</div>
  </div>
)

const PhotoDetails = ({ data, reload }) => (
  <div className="photo">
    <img className="img" src={data.thumbnailUrl} alt="" />
    <div className="title">
      {data.title} <button onClick={reload}>reload</button>
    </div>
  </div>
)

const Photo = ({ photoId, ...props }) => {
  const { data, error, isPending, reload } = useAsync({
    promiseFn: loadPhoto,
    debugLabel: `loadPhoto${photoId}`,
    photoId,
    ...props,
  })
  if (isPending) return <PhotoPlaceholder />
  if (error) return <p>{error.message}</p>
  if (data) return <PhotoDetails data={data} reload={reload} />
  return null
}

const App = () => {
  return (
    <>
      <DevTools />
      <Photo photoId={1} />
      <Photo photoId={2} />
      <Photo photoId={3} />
    </>
  )
}

storiesOf("React Async", module).add("DevTools", () => <App />)
