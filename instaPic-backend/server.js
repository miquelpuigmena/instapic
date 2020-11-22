import express from 'express';
import fileType from 'file-type';
import fs from 'fs';
import Busboy from 'busboy';
import swaggerUi from 'swagger-ui-express';
import cookieparser from 'cookie-parser';
import session from 'express-session';
import connectpgsimple from 'connect-pg-simple';
import { createUser, createPost, getUserBySessionId, loginUser, getDbPool } from './db/db.js';
import util from 'util';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import {log} from './logger.js';
import {finished} from 'stream';

class APIError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
    }
}

// Util constants
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const port = process.env.PORT || 3000;

// db C
const dbSessionTableName = process.env.DBSESSION;
const dbSessSecret = process.env.SESSION_SECRET;

// Swagger doc
const rawdata = fs.readFileSync('./swagger.json');
let swaggerDoc = JSON.parse(rawdata);

// max size post
const MAX_SIZE = 1000000; /* 1MB */ 
// App & Router
const app = express();
app.set('port', port);
const router = express.Router();

// Init MWs
const jsonMW = express.json();
const cookieparserMW = cookieparser();
var pgSession = connectpgsimple(session);
const sessionMW = session({
    store: new pgSession({
        pool: getDbPool(),
        tableName: dbSessionTableName
    }),
    secret: dbSessSecret,
    // depracated messages
    resave: false,
    // cookie's params
    cookie: { maxAge: 30 * 60 * 1000 } // 30 min
});
const myloggerMW = (req, res, next) => {
    log.info(`Incoming Request sid=${req.sessionID}, body=${util.inspect(req.body)}, user=${req.user}`);
    next();
}
const ErrorHandler = (err, req, res, next) => {
    log.error(`Error: ${err.message}\n ${err.stack}`);
    if (!err.status) res.status(500);
    else res.writeHead(err.status, { 'Connection': 'close', 'Content-type': 'application/json'});
    return res.end(JSON.stringify({ message: err.message }));
}
const IsAuthMW = async (req, res, next) => {
    try {
        let sessId = req.sessionID;
        log.info(`IsAuth function sess_id=${sessId}`);
        let userId = await getUserBySessionId(sessId);
        if (userId == 0) {
            // Cookie exists but not logged in
            throw new Error();
        }
        req.user = userId;
    } catch (err) {
        return next(new APIError(`Unauthorized user`, 401));
    }
    next();
}
// Utils
const isUserValid = (name) => {
    return name != undefined && name.length <= 30 && name.length > 0;
}
// Routes
const registerPost = async (req, res, next) => {
    const username = req.body.name;
    if (!isUserValid(username)) {
        return next(new APIError(`Malformed username`, 400));
    }
    try {
        const userId = await createUser(username);
        log.info(`New User created with name='${username}'`);
        return res.status(200).json({ message: `User '${username}' registered` });
    } catch (err) {
        log.error(`Error: ${err}`);
        next(new APIError(`Internal error`, 500));
    }
}
const loginPost = async (req, res, next) => {
    let sid = req.sessionID;
    let username = req.body.name;
    log.info(`API login sid=${sid}, name=${username}`);
    if (!isUserValid(username)) {
        return next(new APIError(`Malformed username`, 400));
    } else {
        try {
            const result = await loginUser(username, sid);
            log.info(`Login of '${username}' successful`);
            return res.status(200).json({ message: `Login of '${username}' successful` });
        } catch (err) {
            log.error(`Error: ${err}`);
            next(new APIError(`Internal error`, 500));
        }
    }
}
const restrictedGet = async (req, res, next) => {
    return res.status(200).json({ message: `OK` });
}

const isMagicNumbersValid = async (b) => {
    // first chunk of 64KB including mime type
    const type = await fileType.fromBuffer(b);
    log.info(`Type file is ${util.inspect(type)}`);
    return type && (type.ext === 'jpg' || type.ext === 'png');
}

const getRandomFileStream = (fieldname, mimetype) => {
    var saveTo = (fieldname, mimetype) => {
        // pseudo-random
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        return fieldname + '-' + uniqueSuffix + '.' + mimetype.split('/')[1];
    }
    let filepath = __dirname + '/uploads/' + saveTo(fieldname, mimetype);
    return fs.createWriteStream(filepath);
}

const processFile = (file, wStream) => {
    return new Promise((res, rej) => {
        let cntChunks = 0;

        file.on('data', async data => {
            // On data chunk received
            //      check magic numbers if it's chunk0
            //      count chunks if other
            if (cntChunks == 0) {
                // First chunk
                if (await isMagicNumbersValid(data)) {
                    log.info(`Magic Numbers are either jpg or png`);
                } else {
                    // Invalid post, magic numbers not jpg or png
                    wStream.emit('error', new APIError(`Malformed file`, 400));
                    wStream.destroy();
                    file.resume();
                }
            }
            cntChunks++;
        });
        wStream.on('error', err => {
            rej(err);
        });
        wStream.on('finish', () => {
            res();
        });
    });
}

const uploadPost = async (req, res, next) => {
    var busboy = new Busboy({ headers: req.headers, limits: { files: 1, fileSize: MAX_SIZE } });
    let newpost = new Map();
    let hasErr = false;
    busboy.on('limit', ()  =>  {
        if (!hasErr) {
            // File exceeded allowed size
            busboy.emit('error', new APIError(`File exceeds max size ${MAX_SIZE}`, 400));
            hasErr = true;
        }
    });

    busboy.on('field', (fieldname, val) => {
        if (!hasErr) {
            // On field description received, store description; else trigger error
            if (fieldname != 'description') {
                log.error(`Field key not expected ${fieldname}`);
                busboy.emit('error', new APIError(`Unexpected field key`, 400));
                hasErr = true;
            } else {
                newpost.set(fieldname, val);
            }
        }
    });

    busboy.on('file', async function (fieldname, file, filename, encoding, mimetype) {
        if (!hasErr) {
            // Deal with input file if fields are correct
            let wStream = getRandomFileStream(fieldname, mimetype);
            newpost.set('filepath', wStream.path);
            file.pipe(wStream);
            if (filename.length <= 0 || (mimetype != 'image/png' && mimetype != 'image/jpeg')) {
                // mime types not allowed
                busboy.emit('error', new APIError(`Malformed file`, 400));
            } else {
                // let's process the file with streams
                processFile(file, wStream)
                    .then(async () => {
                        try {
                            log.info(`Upload complete... Let's persist it`);
                            const result = await createPost(req.user, newpost.get('description'), newpost.get('filepath'));
                            res.writeHead(200, { Connection: 'close' });
                            res.end(`{\"message\": \"OK\"}`);
                        } catch(err) {
                            log.error(`Unable to persist post, rolling back. ${err}`);
                            busboy.emit('error', new APIError(`Internal error`, 500));
                        }
                    })
                    .catch(err => {busboy.emit('error', err)});
            }
        } // else it's handled on Error
    });
    busboy.on('error', err => {
        if (newpost.get('filepath')) {
            // Only delete if stream of file started parsing
            fs.unlink(newpost.get('filepath'), function (err) {
                if (err) log.error(`Unable to delete file`);
                // if no error, file has been deleted successfully
                else log.info('File deleted!');
            });  
        }
        // closeConnection(err.status, err.message);
        req.unpipe(busboy);
        next(err);
    });
    return req.pipe(busboy);
}

// MIDDLEWARES
app.use(jsonMW);
app.use(cookieparserMW);
app.use(sessionMW);
app.use(myloggerMW);
// ROUTES
router.post('/register', registerPost);
router.post('/login', loginPost);
router.get('/restricted', IsAuthMW, restrictedGet);
router.post('/upload', IsAuthMW, uploadPost);
router.use('/api-docs', swaggerUi.serve);
router.get('/api-docs', swaggerUi.setup(swaggerDoc));
// ROUTES
app.use('/v1', router);
app.use(ErrorHandler);
//The 404 Route
app.use('*', function(req, res){
    res.status(404).send('Not found');
});
  
export default {
    app
}
