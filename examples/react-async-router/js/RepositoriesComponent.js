import React from 'react';

const RepositoriesComponent = ({data, error, isLoading}) => {
  if (isLoading) return 'Loading Repositories...'
  if (error) return 'Error'
  return (<ul>{data.map(e => (<li key={e.id}>{e.name}</li>))}</ul>)
}

export default RepositoriesComponent;