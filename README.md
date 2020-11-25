# Reap - InstaPic
This repository includes the fullstack application InstaPic.

It's divided by two main groups: backend and frontend. Each group has it's own documentation [backend-doc](./instaPic-backend/README.md), [frontend-doc](./instapic-frontend/README.md)

URL public app: myurl

or click [here](myurl)
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

Test module ABC
```
# Notice that there's only web and api modules.
./build.sh --test-ABC
```

