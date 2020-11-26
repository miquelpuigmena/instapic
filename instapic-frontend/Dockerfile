FROM node
ARG REACT_APP_API_PORT
ARG REACT_APP_API_HOST
ARG REACT_APP_WEB_PATH

ENV REACT_APP_API_PORT=$REACT_APP_API_PORT
ENV REACT_APP_API_HOST=$REACT_APP_API_HOST

# Create app directory
WORKDIR $REACT_APP_WEB_PATH
# Install app dependencies
COPY package*.json ./
RUN npm install
# Bundle app source
COPY . .

# build production
RUN yarn run build
RUN npm install -g serve
