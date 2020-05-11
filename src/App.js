/* src/App.js */
import React, { useEffect, useState } from 'react'
import { API, graphqlOperation } from 'aws-amplify'
import { createMovie } from './graphql/mutations'
import { listMovies } from './graphql/queries'
import { withAuthenticator } from '@aws-amplify/ui-react'

const initialState = { name: '', description: '' }

const App = () => {
  const [formState, setFormState] = useState(initialState)
  const [movies, setMovies] = useState([])

  useEffect(() => {
    fetchMovies()
  }, [])

  function setInput(key, value) {
    setFormState({ ...formState, [key]: value })
  }

  async function fetchMovies() {
    try {
      const movieData = await API.graphql(graphqlOperation(listMovies))
      const movies = movieData.data.listMovies.items
      setMovies(movies)
    } catch (err) { console.log('error fetching movies') }
  }

  async function addMovie() {
    try {
      if (!formState.name || !formState.description) return
      const movie = { ...formState }
      setMovies([...movies, movie])
      setFormState(initialState)
      await API.graphql(graphqlOperation(createMovie, {input: movie}))
    } catch (err) {
      console.log('error creating movie:', err)
    }
  }

  return (
    <div className="container">
      <h2 className="text-center">My Movie Collection</h2>
      <div className="mb-3">
        <img src="/Cinema.png" width="100%" height="auto" alt="cinema"/>
      </div>
      {/* List all movies */}
      <div className="p3">
        <h3>Movies:</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Genre</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
          {
            movies.map((movie, index) => (
              <tr key={index}>
                <td>{movie.title}</td>
                <td>{movie.genre}</td>
                <td><button className="btn btn-warning mr-3">Edit</button><button className="btn btn-danger mr-3">Delete</button></td>
              </tr>
            ))
          }
          </tbody>
        </table>
      </div>
      {/* Add new movie */}
      <div className="form-inline">
        <label className="mr-sm-2">Title:</label>
        <input
          onChange={event => setInput('title', event.target.value)}
          className="form-control"
          value={formState.name} 
          placeholder="Enter Title"
        />
        <label className="ml-sm-2 mr-sm-2">Genre:</label>
        <input
          onChange={event => setInput('genre', event.target.value)}
          className="form-control"
          value={formState.description}
          placeholder="Enter Genre"
        />
        <button className="btn btn-success ml-3" onClick={addMovie}>Add Movie</button>
      </div>
    </div>
  )
}


export default withAuthenticator(App)