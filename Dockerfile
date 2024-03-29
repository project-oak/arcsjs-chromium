FROM gcr.io/gcp-runtimes/ubuntu_20_0_4

RUN apt-get update && apt-get install -y curl
RUN curl -s https://deb.nodesource.com/setup_16.x | bash
RUN apt-get install nodejs -y

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .


EXPOSE 3000
CMD [ "node", "index.js" ]

