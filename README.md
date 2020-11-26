# Reap - InstaPic
This repository includes the fullstack application InstaPic.

It's divided by two main groups: backend and frontend. Each group has it's own documentation [backend-readme](./instaPic-backend/README.md), [frontend-readme](./instapic-frontend/README.md)

**URL public app front-end**: 

`http://52.59.72.136:5000` or click [here](http://52.59.72.136:5000)

**URL public API documentation**: 

`http://52.59.72.136:3000/api/v1/api-docs` or click [here](http://52.59.72.136:3000/api/v1/api-docs)

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

