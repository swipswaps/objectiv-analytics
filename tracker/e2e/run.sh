#!/bin/bash

for PROJECT in */
do
  echo "---------------------------------------------------------------"
  echo "Running $PROJECT"
  echo "---------------------------------------------------------------"

  (
    cd $PROJECT

    # install dependencies
    npm install

    # run tests
    npm run test

    # build
    npm run build

    # cleanup
    rm -rf build
  )
done
