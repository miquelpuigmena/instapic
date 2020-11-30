# Reap - InstaPic
This repository includes the fullstack application InstaPic.

It's divided by two main groups: backend and frontend. Each group has it's own documentation [backend-readme](./instaPic-backend/README.md), [frontend-readme](./instapic-frontend/README.md)

## Deployment
**URL public app front-end**: 

`http://3.120.243.130:5000` or click [here](http://3.120.243.130:5000)

**URL public API documentation**: 

`http://3.120.243.130:3000/api/v1/api-docs` or click [here](http://3.120.243.130:3000/api/v1/api-docs)

Bash history of AWS EC2 8GM RAM to deploy:
```
# install docker, docker-compose
git clone https://github.com/miquelpuigmena/reap-instapic
cd reap-instapic
mv instaPic-backend/.env.example instaPic-backend/.env
mv instapic-frontend/src/.env.example instapic-frontend/src/.env
vim instapic-frontend/src/.env
# Update arg REACT_APP_API_HOST=52.59.72.136
./build.sh --test-all
./build.sh --run
```

## Build me
Find a [docker-compose.yml](./docker-compose.yml) file to facilitate building task. To abstract the building process even more, a [build.sh](./build.sh) is provided.

**Docker must be installed in system**

Deploy
```
./build.sh
```
Clean 
```
./build.sh --clean
```

## Test me
**Docker must be installed in system**

Test all
```
./build.sh --test-all
```

Test module web only
```
./build.sh --test-web
```
Test module api only
```
./build.sh --test-api
```

