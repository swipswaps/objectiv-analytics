#!/bin/bash

for PROJECT in */
do
  echo "---------------------------------------------------------------"
  echo "Running $PROJECT"
  echo "---------------------------------------------------------------"

  (
    cd $PROJECT
    ./run.sh
  )
done
