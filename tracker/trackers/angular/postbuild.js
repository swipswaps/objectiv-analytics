/*
 * Copyright 2021 Objectiv B.V.
 */

const fs = require('fs');

fs.copyFile('.npmrc', './dist/.npmrc', (err) => {
  if (err) throw err;
  console.log('✔ .npmrc  copied to ./dist/.npmrc');
});
