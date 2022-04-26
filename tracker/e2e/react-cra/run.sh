#!/bin/bash

# install dependencies
npm install

# build
npm run build

# start the app
./node_modules/pm2/bin/pm2 start npm --name react-cra -- run start

# run tests
./node_modules/wait-on/bin/wait-on http://localhost:3000 && npm run test

# stop the app
./node_modules/pm2/bin/pm2 stop react-cra
./node_modules/pm2/bin/pm2 delete react-cra

# cleanup
rm -rf build
