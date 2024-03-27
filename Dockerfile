# Simple multi-stage build dockerfile to build a yarn project and serve it with port 80. Use vite for development.
# Build with: docker build -t starname-marketplace .
# Run with: docker run -p 8080:80 starname-marketplace

# Build stage
FROM node:16-buster AS build
ARG NODE_ENV=production
ARG PROTOBUF_VERSION=3.14.0

ENV GENERATE_SOURCEMAP=false
ENV REACT_APP_ENV=${NODE_ENV}
ENV PROTOC_FILENAME="protoc-${PROTOBUF_VERSION}-linux-x86_64.zip"


WORKDIR /app
COPY package.json yarn.lock ./

# Install dependencies of this app
# RUN apt update && apt upgrade -y && \
#     apt install -y git wget zip protoc python3 make pkgconfig

RUN apt update && apt upgrade -y && \
    apt install -y git wget zip python3 make pkg-config protobuf-compiler g++ gcc

RUN echo "Installing protoc ${PROTOBUF_VERSION}..." && \
    echo "Protoc filename: ${PROTOC_FILENAME}" && \
    echo "Protoc version: ${PROTOBUF_VERSION}" && \
    echo "Protoc url: https://github.com/google/protobuf/releases/download/v${PROTOBUF_VERSION}/${PROTOC_FILENAME}"

RUN wget "https://github.com/google/protobuf/releases/download/v${PROTOBUF_VERSION}/${PROTOC_FILENAME}" && \
    unzip ${PROTOC_FILENAME} -d /usr/local 

# ENV PATH="$HOME/protoc/bin:$PATH"

# RUN --mount=type=cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn yarn global add \
RUN yarn global add \
    mkdirp \
    # protoc \
    patch-package \
    ts-proto \
    # google-protobuf \
    # eslint \
    # eslint-plugin-react \
    eslint \
    prettier \
    typescript \
    eslint-plugin-react \ 
    eslint-plugin-simple-import-sort \
    @typescript-eslint/parser \ 
    @typescript-eslint/parser \ 
    @typescript-eslint/eslint-plugin \ 
    eslint-config-prettier \ 
    eslint-plugin-prettier \ 
    react-scripts  \
    ts-jest \
    --prefix /usr/local

# Install dependencies of lint https://typescript-eslint.io/getting-started/
# RUN yarn add -D \
#     eslint-plugin-react \ 
#     eslint-plugin-simple-import-sort \
#     @typescript-eslint/parser \ 
#     @typescript-eslint/parser \ 
#     @typescript-eslint/eslint-plugin \ 
#     eslint-config-prettier \ 
#     eslint-plugin-prettier \ 
#     react-scripts  \
#     ts-jest \
#     eslint \
#     prettier \
#     enzyme-to-json \
#     --prefix /usr/local

 
RUN protoc --version


COPY ./proto ./proto
# COPY ./patches ./patches


# Install the app
RUN env NODE_ENV=development yarn install
COPY . .
RUN yarn generate-types
RUN yarn lint
RUN yarn test
RUN yarn build

# Serve stage
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
