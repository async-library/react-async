import React, { useState, useEffect, useMemo } from "react"
import { useAsync } from "react-async"
import ReactDOM from "react-dom"
import faker from "faker"
import debounce from "debounce"
import DevTools from "react-async-devtools"

import "./index.css"

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function loadSearchResults() {
  await sleep(500)

  const result = []

  for (let i = 0; i < 10; i++) {
    result.push(faker.name.findName())
  }

  return result
}

function SearchResults({ searchTerm }) {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm)
  const results = useAsync({
    promiseFn: loadSearchResults,
    watch: debouncedSearchTerm,
    skipOnMount: true,
  })

  const debouncedUpdate = useMemo(
    () =>
      debounce(nextSearchTerm => {
        setDebouncedSearchTerm(nextSearchTerm)
      }, 300),
    []
  )

  useEffect(() => {
    debouncedUpdate(searchTerm)
    return () => debouncedUpdate.clear()
  }, [searchTerm, debouncedUpdate])

  if (results.isPending || !results.data) return <p>Loading...</p>

  return (
    <ul>
      {results.data.map(result => (
        <li key={result}>{result}</li>
      ))}
    </ul>
  )
}

function Search() {
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <>
      <input
        type="text"
        placeholder="Search"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />
      {searchTerm.length > 0 ? <SearchResults searchTerm={searchTerm} /> : <p>Main view</p>}
    </>
  )
}

export const App = () => (
  <>
    <DevTools />
    <Search />
  </>
)

if (process.env.NODE_ENV !== "test") ReactDOM.render(<App />, document.getElementById("root"))
