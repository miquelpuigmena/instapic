FROM node
ARG API_PORT
ARG API_PATH

# Create app directory
WORKDIR $API_PATH
# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

EXPOSE ${API_PORT}