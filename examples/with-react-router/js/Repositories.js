import React from "react"

const Repositories = ({ data, error, isPending }) => {
  if (isPending) return "Loading Repositories..."
  if (error) return "Error"
  return (
    <ul>
      {data.map(e => (
        <li key={e.id}>{e.name}</li>
      ))}
    </ul>
  )
}

export default Repositories
