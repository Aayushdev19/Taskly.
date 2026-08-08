const mongoose = require("mongoose");
require("dotenv").config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/todo_db";

let useMock = false;

const getDbState = () => {
  return { useMock };
};

const setDbState = (mockState) => {
  useMock = mockState;
};

async function initDb() {
  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log("MongoDB database connected successfully.");
  } catch (err) {
    console.warn(
      "\n--- WARNING: MongoDB connection refused. Switching to In-Memory DB Mode. ---",
    );
    useMock = true;
  }
}

module.exports = {
  initDb,
  getDbState,
  setDbState,
};
