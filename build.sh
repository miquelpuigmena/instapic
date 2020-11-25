if [[ $# -eq 0 || $# -gt 1 ]]
  then
    echo "Expecting single argument --tests-api, --test-web --test-all, --run or --clean"
    exit 0
fi

if [[ $1 ==  "--test-api" ]]; 
  then
    docker-compose build
    docker-compose run --rm api npm test
elif [[ $1 == "--test-web" ]];
  then
    docker-compose build
    docker-compose run --rm web npm test
elif [[ $1 == "--test-all" ]];
  then
    docker-compose build
    docker-compose run --rm api npm test
    docker-compose run --rm web npm test
elif [[ $1 == "--run" ]];
  then
    docker-compose build  
    set -a && source instapic-frontend/.env && source instaPic-backend/.env && docker-compose down
    set -a && source instapic-frontend/.env && source instaPic-backend/.env && docker-compose up
elif [[ $1 == "--clean" ]];
  then
    set -a && source instapic-frontend/.env && source instaPic-backend/.env && docker-compose down
else
   echo "Args accepted are --tests-api, --test-web --test-all, --run or --clean"
   exit 0
fi
exit 0
