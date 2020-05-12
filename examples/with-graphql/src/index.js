import React from "react"
import { useAsync, IfPending, IfFulfilled, IfRejected } from "react-async"
import ReactDOM from "react-dom"
import DevTools from "react-async-devtools"
import { request } from "graphql-request"
import "./index.css"

const query = /* GraphQL */ `
  query getMovie($slug: String!) {
    Movie(slug: $slug) {
      title
      releaseDate
      actors {
        id
        name
      }
    }
  }
`

const loadMovie = async variables => {
  const { Movie } = await request("https://api.graph.cool/simple/v1/movies", query, variables)
  return Movie
}

const MovieDetails = ({ data }) => (
  <div className="movie">
    <h1>{data.title}</h1>
    <dl>
      <dt>Released</dt>
      <dd>{data.releaseDate.substr(0, 10)}</dd>
      <dt>Featuring</dt>
      {data.actors.map(actor => (
        <dd key={actor.id}>{actor.name}</dd>
      ))}
    </dl>
  </div>
)

const Movie = ({ slug }) => {
  const state = useAsync({ promiseFn: loadMovie, debugLabel: slug, context: { slug } })
  return (
    <>
      <IfPending state={state}>
        <p>Loading...</p>
      </IfPending>
      <IfFulfilled state={state}>{data => <MovieDetails data={data} />}</IfFulfilled>
      <IfRejected state={state}>{error => <p>{error.message}</p>}</IfRejected>
    </>
  )
}

export const App = () => (
  <>
    <DevTools />
    <Movie slug="inception" />
    <Movie slug="dark-knight" />
    <Movie slug="batman-begins" />
  </>
)

if (process.env.NODE_ENV !== "test") ReactDOM.render(<App />, document.getElementById("root"))
