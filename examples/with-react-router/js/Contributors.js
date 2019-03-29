import React from "react"

const Contributors = ({ data, error, isPending }) => {
  if (isPending) return "Loading Contributers..."
  if (error) return "Error"
  return (
    <ul>
      {data.map(e => (
        <li key={e.id}>{e.login}</li>
      ))}
    </ul>
  )
}

export default Contributors
