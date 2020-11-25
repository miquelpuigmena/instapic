FROM node
# Create app directory
WORKDIR /usr/src/instapic/frontend
# Install app dependencies
COPY package*.json ./
RUN npm install
# Bundle app source
COPY . .

# build production
RUN yarn run build
RUN npm install -g serve
