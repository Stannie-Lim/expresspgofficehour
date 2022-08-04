const express = require('express');
const pg = require('pg');

// this makes a database that you can run sql on
// using client.query(some sql in here)
const client = new pg.Client('postgres://localhost/songsartists');

const app = express();

app.get('/', async (req, res, next) => {
  // this is where we will get the data from database
  const sqlToGetAllArtists = `SELECT * FROM artists;`;
  const artists = (await client.query(sqlToGetAllArtists)).rows;
  res.send(`
    <html>
      <body>
        <ul>
          ${artists.map(artist => `
          <a href='/artists/${artist.id}'>
            <li>${artist.name}</li>
          </a>
          `).join('')}
        </ul>
      </body>
    </html>
  `);
});

app.get('/artists/:id', async (req, res, next) => {
  // lets write some sql to get the artist whose id is req.params.id
  const artistsSql = `SELECT * FROM artists WHERE id=$1;`;

  // client.query takes in two args
  // 1. the sql query- it can have $1, $2, $3...... 
  // 2. an array
  // if the array is [req.params.id] and you have a $1 in in your sql,
  // the req.params.id gets injected in as your $1
  // cmd + d
  const artistsResponse = await client.query(artistsSql, [req.params.id])
  const artist = artistsResponse.rows[0];

  const songsSql = `SELECT * FROM songs WHERE artistId=$1`;
  const songsResponse = await client.query(songsSql, [req.params.id]);
  const songs = songsResponse.rows;

  res.send(`
    <html>
      <body>
        <div>
          <a href='/'>Back</a>
          <h1>${artist.name}</h1>
          <p>popularity: ${artist.popularity}</p>
          <ul>
            ${songs.map(song => `<li>${song.title}</li>`).join('')}
          </ul>
        </div>
      </body>
    </html>
  `);
});

const startServerAndSeed = async() => {
  try {
    const sql = `
    DROP TABLE IF EXISTS songs;
    DROP TABLE IF EXISTS artists;
    
    CREATE TABLE artists(
      id SERIAL PRIMARY KEY,
      name VARCHAR(255),
      popularity INTEGER
      );
      
      CREATE TABLE songs(
      id SERIAL PRIMARY KEY,
      title VARCHAR(255),
      rating INTEGER,
      artistId INTEGER REFERENCES artists(id) NOT NULL
      );
      
      INSERT INTO artists(name, popularity) VALUES ('rolling stones', 1000);
      INSERT INTO artists(name, popularity) VALUES ('bts', 42069);
      INSERT INTO artists(name, popularity) VALUES ('beatles', 1000000);

      INSERT INTO songs(title, rating, artistId) VALUES ('paint it black', 10, 1);
      INSERT INTO songs(title, rating, artistId) VALUES ('express is the best', 10, 1);
      INSERT INTO songs(title, rating, artistId) VALUES ('butter', 10, 2);
      INSERT INTO songs(title, rating, artistId) VALUES ('yesterday', 10, 3);
    `;
        
    // if you dont have this line of code, you'll get a "silent error"
    // a silent error is an error that you dont know happened
    await client.connect();
    // 'await' runs all the code after it
    // it will not just pause everything and wait
    await client.query(sql);
    console.log('hi it worked');

    app.listen(3000);
  } catch (error) {
    console.log(error);
  }
};

startServerAndSeed();

/**
 * 
 * 1. whenever i make an application like this, i usually start off with the data layer
 * 2. DO NOT FORGET SEMICOLONS IN SQL
 * 
 * 
 */

/*
1. a promise has two important parts-
  a. you dont know whether it'll be fulfilled or rejected (you dont know what will happen)
  b. you dont know WHEN it'll happen
*/
