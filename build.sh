if [[ $# -eq 0 || $# -gt 1 ]]
  then
    echo "Expecting single argument --tests-api, --test-web --test-all, --run or --clean"
    exit 0
fi

if [[ $1 ==  "--test-api" ]]
then
    set -a && source instapic-frontend/src/.test.env && source instaPic-backend/.env && docker-compose down
    docker-compose build
    docker-compose run --rm api npm test
    docker-compose down
elif [[ $1 == "--test-web" ]]
then
    set -a && source instapic-frontend/src/.test.env && source instaPic-backend/.env && docker-compose down
    set -a && source instapic-frontend/src/.test.env && source instaPic-backend/.env && docker-compose build
    set -a && source instapic-frontend/src/.test.env && source instaPic-backend/.env && docker-compose run --rm web bash -c "echo 'Waiting api to spawn...' && sleep 10 && npm test"
    set -a && source instapic-frontend/src/.test.env && source instaPic-backend/.env && docker-compose down
elif [[ $1 == "--test-all" ]]
then
    set -a && source instapic-frontend/src/.test.env && source instaPic-backend/.env && docker-compose down
    docker-compose build
    docker-compose run --rm api npm test
    docker-compose run --rm web bash -c "echo 'Waiting api to spawn...' && sleep 10 && npm test"
    docker-compose down
elif [[ $1 == "--run" ]]
then
    set -a && source instapic-frontend/src/.env && source instaPic-backend/.env && docker-compose down
    docker-compose build  
    MODE=PROD docker-compose up
elif [[ $1 == "--clean" ]]
then
    set -a && source instapic-frontend/src/.env && source instaPic-backend/.env && docker-compose down
else
   echo "Args accepted are --tests-api, --test-web --test-all, --run or --clean"
   exit 1
fi
exit 0