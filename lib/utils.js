"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.insertAtIndex = insertAtIndex;
exports.removeAtIndex = removeAtIndex;
exports.getRandomNumber = getRandomNumber;
exports.getRandomIndex = getRandomIndex;

/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
function insertAtIndex(array, index, item, insertExactlyAtIndex) {
  const copy = array.slice();
  copy.splice(index, insertExactlyAtIndex ? 1 : 0, item);
  return copy;
}

function removeAtIndex(array, index) {
  const copy = array.slice();
  copy.splice(index, 1);
  return copy;
}

function getRandomNumber(upperBound, lowerBound = 0) {
  const randomNumber = Math.floor(Math.random() * upperBound);
  return Math.max(randomNumber, lowerBound);
}

function getRandomIndex(array) {
  return getRandomNumber(array.length);
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/* eslint-enable @typescript-eslint/explicit-module-boundary-types */