import pg from 'pg';
import util from 'util';
import dotenv from 'dotenv';
import {log} from './../logger.js';

dotenv.config();

var tablePrefix = "";
if (process.env.ENV_MODE == "TEST") {
  tablePrefix = "_test";
}
const { Pool } = pg;
const pool = new Pool({
    user: process.env.DBUSER,
    host: process.env.DBHOST,
    database: process.env.DBNAME,
    password: process.env.DBPASS,
    port: process.env.DBPORT,
});

export const getDbPool = () => {
  log.info(util.inspect(pool));
  return pool;
}

export const loginUser = (username, sid) => {
  log.info(`Login User triggered with ${username}, ${sid}`);
  return new Promise(async (res, rej) => {
    try {
      let userId = await getUser(username);
      const result = await setUser2Session(userId, sid);
      log.info(`Logged user ${username} to sid ${sid}`);
      return res(result);
    } catch (err) {
      log.error(`Error: unable to login user ${username} err='${err.message}'`);
      return rej(err);
    }
  });
}

const setUser2Session = (user_id, sid) => {
  return new Promise(async (res, rej) => {
    try {
      const result = await pool
        .query('UPDATE session SET user_id = $1 WHERE sid = $2', [user_id, sid]);
      log.info(`Updated session ${sid} with user ${user_id}`);
      return res(result);
    } catch (err) {
      log.error(`Error: unable to set user_id ${user_id} to sessId ${sid} err='${err.message}'`);
      return rej(err);
    }
  });
}

export const getUserBySessionId = (sid) => {
  return new Promise(async (res, rej) => {
    try {
      const result = await pool
        .query('SELECT * FROM session WHERE sid = $1', [sid]);
      log.info(`Fetched user_id ${result.rows[0]['user_id']} from sid ${sid}`);
      return res(result.rows[0]['user_id']);
    } catch (err) {
      log.error(`Error: unable to fetch user from sessId ${sid} err='${err.message}'`);
      return rej(err);
    }
  });
}

export const createUser = (name) => {  
  return new Promise(async (res, rej) => {
    try {
      const result = await pool
        .query(`INSERT INTO users${tablePrefix} (name) VALUES ($1) RETURNING id`, [name]);
      log.info(`Inserted user ${name} with id ${result.rows[0]['id']}`);
      return res(result.rows[0]['id']);
    } catch (err) {
      log.error(`Error: unable to create user ${name} at table users${tablePrefix} with err='${err.message}'`);
      return rej(err);
    }
  });
}

export const getUser = (name) => {
  return new Promise(async (res, rej) => {
    try {
      const result = await pool
        .query(`SELECT * FROM users${tablePrefix} WHERE name = $1`, [name]);
      log.info(`Get username ${name} got id=${result.rows[0]['id']}`);
      return res(result.rows[0]['id']);
    } catch (err) {
      log.error(`Error: unable to fetch user with err='${err.message}'`);
      return rej(err);
    }
  });  
}

export const createPost = (userId, desc, imgPath) => {
  return new Promise(async (res, rej) => {
    try {
      const result = await pool
        .query(`INSERT INTO posts${tablePrefix} (user_id, description, img_path) VALUES ($1, $2, $3) RETURNING id`, [userId, desc, imgPath]);
      log.info(`Created post with id ${result.rows[0]['id']}`);
      return res(result.rows[0]['id']);
    } catch (err) {
      log.error(`Error: unable to create post with err='${err.message}'`);
      return rej(err);
    }
  });
}

export const truncateTable = (tableName) => {
  return new Promise(async (res, rej) => {
    try {
      const result = await pool
        .query(`TRUNCATE TABLE ${tableName}`);
      log.info(`Table ${tableName} truncated`);
      return res(null);
    } catch(err) {
      log.error(`Error: unable to clean table ${tableName} err='${err.message}'`);
      return rej(err);
    }
  });
};
