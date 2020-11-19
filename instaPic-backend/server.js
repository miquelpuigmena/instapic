import express from 'express';
import multer from 'multer';
import cookieparser from 'cookie-parser';
import session from 'express-session';
import connectpgsimple from 'connect-pg-simple';
import { createUser, createPost, getUserBySessionId, loginUser, getDbPool } from './db/db.js';
import util from 'util';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
// App settings
const port = process.env.PORT || 3000;
app.set('port', port)

// MIDDLEWARE
app.use(express.json())
app.use(cookieparser());

var pgSession = connectpgsimple(session)
app.use(session({
    store: new pgSession({
      pool : getDbPool(),
      tableName : 'session'
    }),
    secret: process.env.SESSION_SECRET,
    // depracated messages
    resave: false,
    // cookie's params
    cookie: { maxAge: 30 * 60 * 1000 } // 30 min
  }));

// Auth MW
const authMW = async (req, res, next) => {
    let sessId = req.sessionID;
    try {
        const userId = await getUserBySessionId(sessId);
        req.user = userId
    } catch(err) {
        console.log(`Error: ${err}`);
        req.user = undefined
    }
    next(); 
}
app.use(authMW);

// Custom mylogger MW
const myloggerMW = (req, res, next) => {
    console.debug(`Incoming Request sid=${req.sessionID}, body=${util.inspect(req.body)}, user=${req.user}`);
    next();
}
app.use(myloggerMW);

// ROUTES
app.post('/register', async (req, res) => {
    const username = req.body.name;
    if(!isUserValid(username)) {
        return res.status(401).json({message: `Wrong username`});
    }
    try {
        const userId = await createUser(username)
        console.log(`New User created with name='${username}'`);
        return res.status(200).json({message: `User '${username}' registered`});
    } catch (err) {
        console.log(`Error: ${err}`);
        return res.status(500).json({message: `Server failed to process username`});
    }
})

app.post('/login', async (req, res) => {
    let sid = req.sessionID;
    let username = req.body.name;
    console.log(`API login sid=${sid}, name=${username}`);
    if(!isUserValid(username)) {
        return res.status(401).json({message: `Wrong username`});
    } else {
        try {
            const result = await loginUser(username, sid)
            console.log(`Login of '${username}' successful`);
            return res.status(200).json({message: `Login of '${username}' successful`});
        } catch (err) {
            console.log(`Error: ${err}`);
            return res.status(500).json({message: `Server failed to process username`});
        }  
    }
});

app.get('/restricted', async (req, res) => {
    const userId = req.user;
    console.log(`API restricted user_id=${userId}`);
    if (userId == undefined || userId == 0) {
        return res.status(401).json({message: `Unauthorized access`});
    }
    return res.status(200).json({message: `OK`});
});

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, __dirname + '/uploads');
    },
    filename: function (req, file, cb) {
        // pseudo-random
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.mimetype.split('/')[1]);
    }
  });

var maxSize = 5 * 1024 * 1024; // 5MB
const fileFilter = (req, file, cb) => {
    if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

let upload = multer({ storage: storage, fileFilter: fileFilter, limits: { fileSize: maxSize } });


app.post('/upload', upload.single('image'), async (req, res) => {
    const userId = req.user;
    if (userId == undefined || userId == 0) {
        return res.status(401).json({message:`Unauthorized access`});
    }

    // let errMsg = await upload(req, res, function(err) {
    //     // req.file contains information of uploaded file
    //     // req.body contains information of text fields, if there were any
    //     console.log(`req in upload ${util.inspect(req.file)}`);

    //     let errMsg = undefined;
    //     if (req.fileValidationError) {
    //         console.log(`Error: ${req.fileValidationError}`);
    //         errMsg = `File format incorrect`;
    //     }
    //     else if (!req.file) {
    //         console.log(`Error: Empty file`);
    //         errMsg = `No file found`;
    //     }
    //     else if (err instanceof multer.MulterError) {
    //         console.log(`Error: ${err}`);
    //         errMsg = `Unable to process file`;
    //     }
    //     else if (err) {
    //         console.log(`Error: ${err}`);
    //         errMsg = `Unable to process file`;
    //     }
    //     return errMsg
    // });
    // if (errMsg != undefined) {
    //     return res.status(400).json({message: errMsg});
    // }
    const desc = req.body.description;
    console.log(`req ${util.inspect(req)}`);
    const imagePath = req.file.filename;
    console.log(`API pic user_id=${userId}, desc=${desc}, img=${imagePath}`);
    try {
        let result = await createPost(userId, desc, imagePath);
        console.log(`Pic post successful`);
        return res.status(200).json({message: `OK`}); 
    } catch (err) {
        console.log(`Error: ${err}`);
        return res.status(500).json({messgae: `Server failed to post picture`});
    }
});

// Utils
const isUserValid = (name) => {
    return name != undefined && name.length <= 30 && name.length > 0;
}

export default {
    app
}
