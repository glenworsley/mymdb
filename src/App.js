/* src/App.js */
import React, { useEffect, useState } from "react";
import { API, graphqlOperation } from "aws-amplify";
import { createMovie, deleteMovie } from "./graphql/mutations";
import { listMovies } from "./graphql/queries";
import { withAuthenticator } from "@aws-amplify/ui-react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

const initialState = { title: "", genre: "" };

const App = () => {
  const [formState, setFormState] = useState(initialState);
  const [movies, setMovies] = useState([]);
  const [show, setShow] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    fetchMovies();
  }, []);

  function setInput(key, value) {
    setFormState({ ...formState, [key]: value });
  }

  //for the Delete Movie modal
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleDelete = (key) => {
    console.log("in handleDelete function, with key = " + key);
    setShow(true);
    setSelectedId(key);
  };

  const handleDeleteConfirmation = () => {
    deleteMovieInBackend(selectedId);
    setMovies(movies.filter((m) => m.id !== selectedId));
    setSelectedId(null);
    setShow(false);
  };

  async function fetchMovies() {
    try {
      const movieData = await API.graphql(graphqlOperation(listMovies));
      const movies = movieData.data.listMovies.items;
      setMovies(movies);
    } catch (err) {
      console.log("error fetching movies");
    }
  }

  async function addMovie() {
    try {
      if (!formState.title || !formState.genre) return;
      const movie = { ...formState };
      setFormState(initialState);
      const createdMovieData = await API.graphql(
        graphqlOperation(createMovie, { input: movie })
      );
      setMovies([...movies, createdMovieData.data.createMovie]);
    } catch (err) {
      console.log("error creating movie:", err);
    }
  }

  async function deleteMovieInBackend(key) {
    console.log("deleting movie: ", key);
    try {
      await API.graphql(graphqlOperation(deleteMovie, { input: { id: key } }));
    } catch (err) {
      console.log("error deleting movie:", err);
    }
  }

  return (
    <div className="container">
      <div className="mb-3">
        <img
          src="/MyMovieDB.png"
          width="100%"
          height="auto"
          alt="My Movie Database"
        />
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
            {movies.map((movie, index) => (
              <tr key={movie.id}>
                <td>{movie.title}</td>
                <td>{movie.genre}</td>
                <td>
                  <button
                    className="btn btn-danger mr-3"
                    onClick={() => handleDelete(movie.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Add new movie */}
      <div className="form-inline">
        <label className="mr-sm-2">Title:</label>
        <input
          onChange={(event) => setInput("title", event.target.value)}
          className="form-control"
          value={formState.title}
          placeholder="Enter Title"
        />
        <label className="ml-sm-2 mr-sm-2">Genre:</label>
        <input
          onChange={(event) => setInput("genre", event.target.value)}
          className="form-control"
          value={formState.genre}
          placeholder="Enter Genre"
        />
        <Button className="btn btn-success ml-3" onClick={addMovie}>
          Add Movie
        </Button>
      </div>
      {/* delete movie modal */}
      <Modal show={show} onHide={handleClose} animation={false}>
        <Modal.Header closeButton>
          <Modal.Title>Are you sure?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Do you really want to delete this movie from the database? This action
          cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirmation}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default withAuthenticator(App);
