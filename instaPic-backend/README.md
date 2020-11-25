# Back-end
1. [Presenting the problem](#presenting-the-problem)
1. [Highlights of the solution](#highlights-of-solution) 
1. [API](#api)
1. [Defining ENV vars](#define-env-vars)
1. [Build me](#build-me)
1. [Test me](#testing)

## Presenting the problem
You will create a mock image sharing website, InstaPic.
Create a simple REST API where a user can upload a picture. Feel free to use any language or framework that's most comfortable for you.

### Requirements
- [x] Implement a RESTful backend API in any stack of your choice (Python, Node, Ruby, Java, etc.)
- [x] Users can register by username
- [x] Users can submit post that includes an image and short text description
- [x] Validation and error handling
- [x] Automated tests

### Optional
- [ ] Can sort all posts by time created, or filter posts by a specific user.
- [x] Performance optimization
- [ ] Pagination

### Deliverable
Please share your repo with us and publish on a platform of your choice (Heroku, AWS, etc). Have a README that documents how to run your source.
- [x] Production URL (Heroku, Netlify, etc.)
- [x] Source code (Github, Bitbucket, etc.)
- [x] Documentation on how to run the source code
- [x] Documentation on your API

## Highlights of Solution
Developed with **Node using Express library** as a server.

Aspects to highlight are:
- Usage of streams to read uploaded file for performance
- Validation of incoming file with mime and magic numbers
- Session-cookie storage in Postgres db
- Persistance of server data in Postgres db and rollback handle if error encountered
- Dockerization of service
- Swagger API Documentation

Ideas I didn't implement because of limited time:
- Rest of the optionals
- Compression of files when storing
- Encryption client-server

## API
### API Documentation
Find Swagger Documentation at `/api/v1/api-docs`
Available routes:
- [POST /register](#post-register-/api/v1/register)
- [POST /login](#post-login-/api/v1/login)
- [GET /restricted](#get-restricted-/api/v1/restricted)
- [POST /upload](#post-upload-/api/v1/upload)
- [GET /api-docs](#get-api-docs)

#### Post register /api/v1/register
```
Register a new user to service. It creates a username instatnce in db.
```
Expecting
```
{
    username: string
}
```
Returns
```
200 - User $USER registered
400 - Malformed user
500 - InternalError
```

#### Post login /api/v1/login
```
Login a new user to service. It binds an existing user to a cookie and sends back cookie to client.
```
Expecting
```
{
    username: string
}
```
Returns
```
200 - Login of $USER successful
400 - Malformed user
500 - InternalError
```

#### Get restricted /api/v1/restricted
```
For testing purposes. Return message if user is logged in.
```
Expecting
```
Valid Cookie in headers
```
Returns
```
200 - OK
401 - Unauthorized user
```

#### POST upload /api/v1/upload
```
Uploads an image and description to server if user is logged in. Checks size of file. Checks that mime type of request is either jpg or png. Checks that magic numbers of file are of jpg or png. If all correct, store file in disk and persist post in db.
```
Expects
```
Content-type: multipart/form-data
field 'description'
file 'image either png or jpg'
```
Returns
```
200 - OK
400 - Malformed file
400 - File exceeds max size
400 - Unexpected field key
401 - Unauthorized user
500 - Internal Error
```

#### Get api-docs
Find api-docs Swagger at `http://IP:PORT/api/v1/api-docs`

### Request jump story
An incoming petition will jump along middlewares. Listed you have a generic request's "jump story".
1. **access-control**: Control type of accepted request
1. **express.json()**: to Jsonify input
1. **cookie-parser**: to parse inputted cookies
1. **express-session**: to handle client sessions (Connected to a Postgres db for persistance)
1. **myLoggerMW**: To log info of incoming requests
1. **IsAuthMW**: Authentication for selected routes
1. **router**: Apply backend functionallity according to endpoint in request
1. **extend-endpoint**: Add /api/v1 to all routes
1. **ErrorHandler**: Handle all errors triggered in backend
1. **NotFound**: Endpoint not found

## Define env vars
Backend module expects to a `.env` file located at the top folder of the module (same level as index.js).

Defining env vars 
```
API_PORT=3000 #Port to start API
API_PATH=/usr/src/api #Path to be used inside of Docker container
POSTGRES_USER=admin #User at Postgres db
POSTGRES_HOST=dbinstapic #IP of db reachable by API. Use docker-compose network!
POSTGRES_DB=instapic #DB name
POSTGRES_PASSWORD=XXXX #A secret
POSTGRES_PORT=5432 #Port to find Postgres db
POSTGRES_SESSION_SECRET=YYYY #A secret for API's sessions
```

## Build me
**REMEMEBER, YOU NEED AN ACTIVE POSTGRES DB LISTENING IN PORT AND WITH AUTH DEFINED IN .env FILE**

As linux machine
```
# from instapic-backend folder
npm install
npm start
```

As a Docker service
```
# from instapic-backend folder
docker pull postgres
docker build -t backendinstapic .
docker run --name postgres -d -p 5432:5432 postgres
docker run --name backendinstapic -d -p 3000:3000 backendinstapic
```

## Testing
**REMEMEBER, YOU NEED AN ACTIVE POSTGRES DB LISTENING IN PORT AND WITH AUTH DEFINED IN .env FILE**
From linux machine
```
npm install
npm test
```

From Docker
```
docker pull postgres
docker run --name postgres -d -p 5432:5432 postgres
docker build -t backendinstapic .
docker exec -it ${HASH_CONTAINER} bash
container$ npm test
```