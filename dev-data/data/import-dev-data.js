/* eslint-disable import/no-extraneous-dependencies */
const fs = require("fs");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Tour = require("../../models/tourModel");

dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE.replace(
  "<USER>",
  process.env.DATABASE_USER,
).replace("<PASSWORD>", process.env.DATABASE_PASSWORD);

mongoose
  .connect(DB)
  .then((con) => {
    // console.log(con.connections);
    console.log("DB connection established successfully.");
  })
  .catch((err) => {
    console.log(err.message);
  });

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, "utf-8"));

const importData = async () => {
  try {
    await Tour.create(tours);
    console.log("Database added successfully.");
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log("Database deleted successfully.");
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
}
