FROM daocloud.io/chylvina/workspace:latest

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY ./* /usr/src/app
RUN npm install
