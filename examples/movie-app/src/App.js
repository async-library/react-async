import React, { Component, Fragment } from "react"
import Async from "react-async"
import "./App.css"

const apiRoot = "https://api.tmdb.org/3"
const apiKey = "aac95dd4fa440999d92dcc8191cab0ee"

const delay = ms => value => new Promise(resolve => setTimeout(resolve, ms, value))

const fetchMovies = () =>
  fetch(`${apiRoot}/movie/popular?api_key=${apiKey}`)
    .then(res => (res.ok ? res : Promise.reject(res)))
    .then(res => res.json())
    .then(data => data.results)
    .then(delay(500))

const fetchMovieDetails = ({ id }) =>
  fetch(`${apiRoot}/movie/${id}?api_key=${apiKey}`)
    .then(res => (res.ok ? res : Promise.reject(res)))
    .then(res => res.json())
    .then(delay(500))

const fetchMovieReviews = ({ id }) =>
  fetch(`${apiRoot}/movie/${id}/reviews?api_key=${apiKey}`)
    .then(res => (res.ok ? res : Promise.reject(res)))
    .then(res => res.json())
    .then(data => data.results)
    .then(delay(1500))

const Movie = ({ title, vote_average, release_date, onSelect, overview, backdrop_path }) => (
  <div
    className="Movie"
    onClick={onSelect}
    style={{ backgroundImage: `url(https://image.tmdb.org/t/p/w500${backdrop_path})` }}
  >
    <div className="content">
      <span className="title">{title}</span>
      <span className="info">
        {vote_average * 10}% · {release_date}
      </span>
      <span className="desc">{overview}</span>
    </div>
  </div>
)

const TopMovies = ({ handleSelect }) => (
  <Fragment>
    <h1>
      Top Box Office{" "}
      <span role="img" aria-label="">
        🍿
      </span>
    </h1>
    <Async promiseFn={fetchMovies} debugLabel={`Movies`}>
      <Async.Pending>
        <p>Loading...</p>
      </Async.Pending>
      <Async.Fulfilled>
        {movies =>
          movies.map(movie => <Movie {...movie} key={movie.id} onSelect={handleSelect(movie)} />)
        }
      </Async.Fulfilled>
    </Async>
  </Fragment>
)

const Review = ({ author, content }) => (
  <div className="review">
    <p>{content}</p>
    <small>{author}</small>
  </div>
)

const Details = ({ onBack, id }) => (
  <div className="Details">
    <button onClick={onBack}>
      <span role="img" aria-label="Back">
        👈
      </span>
    </button>
    <Async
      promiseFn={fetchMovieDetails}
      debugLabel={`Details ${id}`}
      context={{ id }}
      onResolve={console.log}
    >
      <Async.Pending>
        <p>Loading...</p>
      </Async.Pending>
      <Async.Fulfilled>
        {movie => (
          <Fragment>
            <div className="main">
              <img
                src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                alt=""
                style={{ borderRadius: 5 }}
              />
              <div className="info">
                <h1>{movie.title}</h1>
                <div className="ratings">
                  <div className="rating">
                    <div className="title">Rating</div>
                    <div className="score">{movie.vote_average * 10}%</div>
                  </div>
                </div>
                <div className="rating">
                  <p>{movie.overview}</p>
                </div>
              </div>
            </div>
            <div className="reviews">
              <Async
                promiseFn={fetchMovieReviews}
                debugLabel={`Reviews ${id}`}
                context={{ id }}
                onResolve={console.log}
              >
                <Async.Pending>
                  <p>Loading...</p>
                </Async.Pending>
                <Async.Fulfilled>{reviews => reviews.map(Review)}</Async.Fulfilled>
              </Async>
            </div>
          </Fragment>
        )}
      </Async.Fulfilled>
    </Async>
  </div>
)

class App extends Component {
  state = { selectedMovie: undefined }
  select = movie => () => this.setState({ selectedMovie: movie.id })
  render() {
    const { selectedMovie } = this.state
    return (
      <div className="App">
        {selectedMovie ? (
          <Details id={selectedMovie} onBack={this.select({})} />
        ) : (
          <TopMovies handleSelect={this.select} />
        )}
      </div>
    )
  }
}

export default App
