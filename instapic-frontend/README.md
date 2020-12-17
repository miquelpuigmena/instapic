# Front-end
1. [Highlights of the solution](#highlights-of-solution) 
1. [API](#api)
1. [Defining ENV vars](#define-env-vars)
1. [Build me](#build-me)
1. [Test me](#testing)

### Requirements
- [x] Implement frontend
- [x] Users can submit post that includes an image and short text description
- [x] Validation and error handling
- [x] Automated tests

### Optional
- [ ] Users can view all posts sorted by time
- [ ] Users can view posts from a specific user
- [x] Performance optimization
- [x] Integrate with Redux and React Router

### Deliverable
Please share your repo with us and publish on a platform of your choice (Heroku, AWS, etc). Have a README that documents how to run your source.
- [x] Production URL (Heroku, Netlify, etc.)
- [x] Source code (Github, Bitbucket, etc.)
- [x] Documentation on how to run the source code
- [x] Documentation on your API

## Highlights of Solution
Developed with **React with Redux**.

Aspects to highlight are:
- Usage of Router && history for redirecting app flow
- Redux and React Router
- Cookies integration for selected functionalities (the ones with auth)
- Dockerization of service

Ideas I didn't implement because of limited time:
- Gathering posts uploaded beforehand and filtering
- Local Storage of store state to persist after refresh
- Testing end 2 end due to being unable to mock a valid cookie for the API
- Encryption client-server

## Define env vars
Backend module expects a `.env` file located inside of `/src` folder. Find an example [here](./src/.env.example)

Defining env vars 
```
REACT_APP_WEB_PORT=5000
REACT_APP_WEB_PATH=/usr/src/instapic/frontend
REACT_APP_API_HOST=backendinstapic
REACT_APP_API_PORT=3000
```

## Build me
**REMEMEBER, YOU NEED AN ACTIVE POSTGRES DB LISTENING IN PORT AND WITH AUTH DEFINED IN .env FILE**

As linux machine
```
# from instapic-frontend folder
npm build
```

## Testing
**REMEMEBER, YOU NEED AN ACTIVE POSTGRES DB LISTENING IN PORT AND WITH AUTH DEFINED IN .env FILE**
From linux machine
```
npm install
npm test
```

Output of last coverage
```
-------------------|---------|----------|---------|---------|---------------------------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s                     
-------------------|---------|----------|---------|---------|---------------------------------------
All files          |   89.68 |    78.33 |   84.95 |   90.31 |                                       
 src               |     100 |      100 |     100 |     100 |                                       
  App.js           |     100 |      100 |     100 |     100 |                                       
 src/features      |   89.64 |    78.33 |   84.78 |   90.27 |                                       
  Auth.js          |   84.62 |       75 |      75 |   90.91 | 30                                    
  Home.js          |   71.43 |       50 |      60 |   71.43 | 10,23                                 
  Login.js         |   96.92 |    86.67 |   95.45 |   96.55 | 128,136                               
  Navbar.js        |   69.23 |       50 |      70 |      75 | 11,20,40                              
  NotFound.js      |     100 |      100 |     100 |     100 |                                       
  Signup.js        |   98.39 |    91.67 |   95.45 |   98.18 | 124                                   
  SuccessUpload.js |     100 |      100 |     100 |     100 |                                       
  Upload.js        |   84.15 |    73.91 |   76.92 |   85.33 | 32,54-55,59-60,79,132-133,138,159,174 
  store.js         |   71.43 |       50 |     100 |   66.67 | 25-26                                 
-------------------|---------|----------|---------|---------|---------------------------------------
```
