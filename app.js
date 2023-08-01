const express = require("express");
const { open } = require("sqlite");

const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "moviesData.db");

const app = express();

app.use(express.json());

let db = null;

const initialDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initialDbAndServer();

//1
const convertMovieNametoPascalCase = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getQuery = `
  SELECT
   movie_name
  FROM 
    movie;`;
  const ply = await db.all(getQuery);
  response.send(
    ply.map((moviename) => convertMovieNametoPascalCase(moviename))
  );
});

//2
app.post("/movies/", async (request, response) => {
  const moviesDetails = request.body;
  const { directorId, movieName, leadActor } = moviesDetails;
  const addM = `
INSERT INTO
movie (director_id,movie_name,lead_actor)
VALUES
(
${directorId},
'${movieName}',
'${leadActor}');`;

  const dbResponse = await db.run(addM);
  response.send("Movie Successfully Added");
});

//3
const convertMovieADD = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getPlayerQuery = `
    SELECT
    *
    FROM
    movie
    WHERE
      movie_id=${movieId};`;
  const player = await db.get(getPlayerQuery);
  response.send(convertMovieADD(player));
});

//4
app.put("/movies/:movieId/", async (request, response) => {
  const movieDd = request.body;
  const { directorId, movieName, leadActor } = movieDd;
  const { movieId } = request.params;
  const updatePlayerQuery = `
     UPDATE
     movie
     SET
     director_id=${directorId},
     movie_name='${movieName}',
     lead_actor='${leadActor}'
     WHERE
     movie_id=${movieId};`;

  await db.run(updatePlayerQuery);
  response.send("Movie Details Updated");
});

//5
app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const ff = `
    DELETE FROM
    movie WHERE
    movie_id=${movieId};`;

  await db.run(ff);
  response.send("Movie Removed");
});

//6
const dDirector = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

app.get("/directors/", async (request, response) => {
  const getPlayerQuery = `
    SELECT
    *
    FROM
       director;`;

  const player = await db.all(getPlayerQuery);
  response.send(player.map((director) => dDirector(director)));
});

//7
const hh = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getPlayerQuery = `
    SELECT
    movie_name
    FROM
      director INNER JOIN movie
      ON director.director_id=movie.director_id 
    WHERE
      director.director_id=${directorId};`;
  const movies = await db.all(getPlayerQuery);
  response.send(movies.map((movienames) => hh(movienames)));
});

module.exports = app;
