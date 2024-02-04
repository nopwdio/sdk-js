import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const app = initializeApp({
  apiKey: "AIzaSyBjTQ_iVYlxQn6vrKybtDa4L5QLA72-h5k",
  projectId: "nopwdio",
});

export const getStore = function () {
  return getFirestore(app);
};
