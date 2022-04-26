#!/bin/bash

declare -a TAGS=(
  "latest"
  "next"
)


for PROJECT in */
do
  cd $PROJECT

  for TAG in "${TAGS[@]}"
  do
    echo "---------------------------------------------------------------"
    echo "$PROJECT: building with tag: $TAG"
    echo "---------------------------------------------------------------"
    cp package.template.json package.json
    sed -i '' "s/{TAG}/$TAG/g" package.json
	  npm install
	  npm run build
  done

  cd ..
done
