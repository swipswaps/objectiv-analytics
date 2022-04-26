#!/bin/bash

# install dependencies
npm install

# build
npm run build

# run tests
npm run test -- --watchAll=false

# cleanup
rm -rf build
