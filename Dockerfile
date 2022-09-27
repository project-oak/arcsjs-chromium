FROM ubuntu:focal

RUN apt-get update && apt-get install -y \
    autoconf \
    automake \
    bison \
    build-essential\
    clang \
    curl \
    doxygen \
    flex \
    g++ \
    git \
    grep \
    libffi-dev \
    libncurses5-dev \
    libtool \
    libsqlite3-dev \
    make \
    mcpp \
    python \
    sqlite \
    uuid-runtime \
    wget \
    zlib1g-dev \
    && echo "--Bust Cache--"

# Java is needed for some targets
RUN apt-get install default-jdk -y --no-install-recommends
ENV JAVA_HOME /usr/lib/jvm/default-java

# Set up baselisk.
ENV USE_BAZEL_VERSION=5.0.0
RUN wget https://github.com/bazelbuild/bazelisk/releases/download/v1.10.1/bazelisk-linux-amd64 \
    -O /usr/local/bin/bazelisk && chmod a+x /usr/local/bin/bazelisk

# Set up buildifier
RUN wget https://github.com/bazelbuild/buildtools/releases/download/4.2.5/buildifier-linux-amd64 \
    -O /usr/local/bin/buildifier && chmod a+x /usr/local/bin/buildifier


# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN curl -sL https://deb.nodesource.com/setup_12.x | bash - 
RUN apt-get install -y nodejs

RUN git clone https://github.com/google-research/raksha.git
WORKDIR /usr/src/app/raksha
COPY ../.bazelrc-docker ./.bazelrc
RUN bazelisk build //src/...

WORKDIR /usr/src/app

# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

RUN npm install

EXPOSE 3000
CMD [ "node", "index.js" ]
#CMD [ "bash" ]
