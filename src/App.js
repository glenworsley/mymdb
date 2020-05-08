/* src/App.js */
import React, { useEffect, useState } from 'react'
import { API, graphqlOperation } from 'aws-amplify'
import { createMovie } from './graphql/mutations'
import { listMovies } from './graphql/queries'

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
      <div className="jumbotron text-center">
        <h2>My Movie Collection</h2>
      </div>
      {/* Add new movie */}
      <div className="">
        <h3>Add new movie</h3>
        <input
          onChange={event => setInput('title', event.target.value)}
          style={styles.input}
          value={formState.name} 
          placeholder="Title"
        />
        <input
          onChange={event => setInput('genre', event.target.value)}
          style={styles.input}
          value={formState.description}
          placeholder="Genre"
        />
        <button style={styles.button} onClick={addMovie}>Create Movie</button>
      </div>
      {/* List all movies */}
      <div className="">
        {
          movies.map((movie, index) => (
            <div key={movie.id ? movie.id : index} style={styles.movie}>
              <p style={styles.movieName}>{movie.title}</p>
              <p style={styles.movieDescription}>{movie.genre}</p>
            </div>
          ))
      }
      </div>
    </div>
  )
}

const styles = {
  container: {  },
  todo: {  marginBottom: 15 },
  input: {  },
  todoName: { },
  todoDescription: {  },
  button: {  }
}

export default App