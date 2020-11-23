FROM node
# Create app directory
WORKDIR /usr/src/instapic
# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .