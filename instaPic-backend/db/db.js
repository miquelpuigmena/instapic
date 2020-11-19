import pg from 'pg';
import util from 'util';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({
    user: process.env.DBUSER,
    host: process.env.DBHOST,
    database: process.env.DBNAME,
    password: process.env.DBPASS,
    port: process.env.DBPORT,
});

export const getDbPool = () => {
  console.log(util.inspect(pool));
  return pool;
}

export const loginUser = (username, sid) => {
  console.log(`Login User triggered with ${username}, ${sid}`);
  return new Promise(async (res, rej) => {
    try {
      let userId = await getUser(username);
      const result = await setUser2Session(userId, sid);
      console.debug(`Logged user ${username} to sid ${sid}`);
      return res(result);
    } catch (err) {
      console.error(`Error: unable to login user ${username} err='${err.message}'`);
      return rej(err);
    }
  });
}

const setUser2Session = (user_id, sid) => {
  return new Promise(async (res, rej) => {
    try {
      const result = await pool
        .query('UPDATE session SET user_id = $1 WHERE sid = $2', [user_id, sid]);
      console.debug(`Updated session ${sid} with user ${user_id}`);
      return res(result);
    } catch (err) {
      console.error(`Error: unable to set user_id ${user_id} to sessId ${sid} err='${err.message}'`);
      return rej(err);
    }
  });
}

export const getUserBySessionId = (sid) => {
  return new Promise(async (res, rej) => {
    try {
      const result = await pool
        .query('SELECT * FROM session WHERE sid = $1', [sid]);
      console.debug(`Fetched user_id ${result.rows[0]['user_id']} from sid ${sid}`);
      return res(result.rows[0]['user_id']);
    } catch (err) {
      console.error(`Error: unable to fetch user from sessId ${sid} err='${err.message}'`);
      return rej(err);
    }
  });
}

export const createUser = (name) => {  
  return new Promise(async (res, rej) => {
    try {
      const result = await pool
        .query('INSERT INTO users (name) VALUES ($1) RETURNING id', [name]);
      console.debug(`Inserted user ${name} with id ${result.rows[0]['id']}`);
      return res(result.rows[0]['id']);
    } catch (err) {
      console.error(`Error: unable to create user with err='${err.message}'`);
      return rej(err);
    }
  });
}

export const getUser = (name) => {
  return new Promise(async (res, rej) => {
    try {
      const result = await pool
        .query('SELECT * FROM users WHERE name = $1', [name]);
      console.debug(`Get username ${name} got id=${result.rows[0]['id']}`);
      return res(result.rows[0]['id']);
    } catch (err) {
      console.error(`Error: unable to fetch user with err='${err.message}'`);
      return rej(err);
    }
  });  
}

export const createPost = (userId, desc, imgPath) => {
  return new Promise(async (res, rej) => {
    try {
      const result = await pool
        .query('INSERT INTO posts (user_id, description, img_path) VALUES ($1, $2, $3) RETURNING id', [userId, desc, imgPath]);
      console.debug(`Created post with id ${result.rows[0]['id']}`);
      return res(result.rows[0]['id']);
    } catch (err) {
      console.error(`Error: unable to create post with err='${err.message}'`);
      return rej(err);
    }
  });
}
