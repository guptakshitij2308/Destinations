/* eslint-disable import/no-extraneous-dependencies */
const dotenv = require("dotenv");
const mongoose = require("mongoose");

// uncaughtException are those which occur in synchronous functions and are not handled anywhere in our code.
process.on("uncaughtException", (err) => {
  console.log("Unhandled exception 💥 Shutting down.");
  console.log(err);
  process.exit(1);
});

dotenv.config({ path: "./config.env" });
const app = require("./app");

const DB = process.env.DATABASE.replace(
  "<USER>",
  process.env.DATABASE_USER,
).replace("<PASSWORD>", process.env.DATABASE_PASSWORD);

mongoose.connect(DB).then((con) => {
  // console.log(con.connections);
  console.log("DB connection established successfully.");
});
// .catch((err) => {
//   console.log(err.message);
// });

// console.log(app.get('env')); // by default environment set to 'development' by express
// console.log(process.env);

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`); // eslint-disable-line
});

process.on("unhandledRejection", (err) => {
  console.log("Unhandled rejection 💥 Shutting down.");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Representational states transfer ( Rest apis are stateless : state handled entirely on client and not on server )
// Enveloping of responses ( dsend )

// npm i eslint prettier eslint-config-prettier eslint-plugin-prettier eslint-config-airbnb eslint-plugin-node eslint-plugin-import eslint-plugin-react --save-dev
