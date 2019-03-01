import React from "react"

const ContributorsComponent = ({ data, error, isLoading }) => {
  if (isLoading) return "Loading Contributers..."
  if (error) return "Error"
  return (
    <ul>
      {data.map(e => (
        <li key={e.id}>{e.login}</li>
      ))}
    </ul>
  )
}

export default ContributorsComponent