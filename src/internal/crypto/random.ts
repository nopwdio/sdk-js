import { arrayTo64 } from "./encoding.js";

export const generateRandom = function (numBytes: number) {
  const array = new Uint8Array(numBytes);
  window.crypto.getRandomValues(array);
  return array;
};

export const generateRandomString = function (numBytes: number) {
  const array = generateRandom(numBytes);
  return arrayTo64(array);
};
