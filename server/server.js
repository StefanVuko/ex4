const express = require("express");
const path = require("path");
const http = require("http");
const bodyParser = require("body-parser");
const movieModel = require("./movie-model.js");

const app = express();

// Parse urlencoded bodies
app.use(bodyParser.json());

// Serve static content in directory 'files'
app.use(express.static(path.join(__dirname, "files")));

app.get("/movies", function (req, res) {
  let movies = Object.values(movieModel);
  const queriedGenre = req.query.genre;
  if (queriedGenre) {
    movies = movies.filter((movie) => movie.Genres.indexOf(queriedGenre) >= 0);
  }
  res.send(movies);
});

// Configure a 'get' endpoint for a specific movie
app.get("/movies/:imdbID", function (req, res) {
  const id = req.params.imdbID;
  const exists = id in movieModel;

  if (exists) {
    res.send(movieModel[id]);
  } else {
    res.sendStatus(404);
  }
});

app.put("/movies/:imdbID", function (req, res) {
  const id = req.params.imdbID;
  const exists = id in movieModel;

  movieModel[req.params.imdbID] = req.body;

  if (!exists) {
    res.status(201);
    res.send(req.body);
  } else {
    res.sendStatus(200);
  }
});

app.get("/genres", function (req, res) {
  const genres = [
    ...new Set(Object.values(movieModel).flatMap((movie) => movie.Genres)),
  ];
  genres.sort();
  res.send(genres);
});

/* Task 1.1. Add the GET /search endpoint: Query omdbapi.com and return
   a list of the results you obtain. Only include the properties 
   mentioned in the README when sending back the results to the client */

app.get("/search", function (req, res) {
  if (!req.query.query) {
    res.sendStatus(400);
    return;
  }

  const http = require("http");
  const search = req.query.query
  const APIrequest = `http://www.omdbapi.com/?apikey=f41b90d6&s=${search}`

  http.get(APIrequest, (response) => {
    let data = "";
    response.on("data", (chunk) => {
      data += chunk
    });
    response.on("end", () => {
      dataParse = JSON.parse(data)
      let filteredData = []

      if (dataParse.Response == "True") {

        dataParse.Search.forEach(movie => {
          let ok = {}
          ok.Title = movie.Title;
          let yearNumber = Number(movie.Year)
          if (yearNumber.toString().length >= 4) {
            ok.Year = yearNumber;
          }
          else {
            ok.Year = null
          }
          ok.imdbID = movie.imdbID;
          filteredData.push(ok)
        });
      }

      res.send(filteredData)
    })
      .on("error", (error) => {
        console.log(error)
      })
  });
})




/* Task 2.2 Add a POST /movies endpoint that receives an array of imdbIDs that the
   user selected to be added to the movie collection. Search them on omdbapi.com,
   convert the data to the format we use since exercise 1 and add the data to the
   movie collection. */

app.post("/movies", function (req, res) {
  let data = req.body

  data.forEach(movie => {
    const http = require("http");
    const APIrequest = `http://www.omdbapi.com/?apikey=f41b90d6&i=${movie}`

    http.get(APIrequest, (response) => {
      let apiData = "";
      let movieObject = {}
      response.on("data", (chunk) => {
        apiData += chunk
      });
      response.on("end", () => {
        apiData = JSON.parse(apiData)
        movieObject.Poster = apiData.Poster
        movieObject.Released = apiData.Released
        movieObject.imdbID = apiData.imdbID
        apiData.Runtime === "N/A" ? movieObject.Runtime = null : apiData.Runtime
        let genres = apiData.Genre.split(",")
        if (genres.length == 1) {
          movieObject.Genre = apiData.Genre
        }
        else {
          movieObject.Genres = genres
        }
        let directors = apiData.Genre.split(",")
        if (directors.length == 1) {
          movieObject.Director = apiData.Genre
        }
        else {
          movieObject.Directors = directors
        }
        let writers = apiData.Genre.split(",")
        if (writers.length == 1) {
          movieObject.Writer = apiData.Writer
        }
        else {
          movieObject.Writers = writers
        }
        movieObject.Actors = apiData.Actors.split(",")
        apiData.Metascore === "N/A" ? movieObject.Metascore = null : apiData.Metascore
        movieObject.imdbRating = apiData.imdbRating

        movieModel[movie] = movieObject
      })
        .on("error", (error) => {
          console.log(error)
        })
    });
  });

  res.sendStatus(200)
})


app.delete("/movies/:imdbID", function (req, res) {
  const id = req.params.imdbID;
  delete movieModel[id]
  res.sendStatus(200)
})
/* Task 3.2. Add the DELETE /movies/:imdbID endpoint which removes the movie
   with the given imdbID from the collection. */

app.listen(3000);

console.log("Server now listening on http://localhost:3000/");
