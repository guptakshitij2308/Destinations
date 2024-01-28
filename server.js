/* eslint-disable import/no-extraneous-dependencies */
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config({ path: "./config.env" });
const app = require("./app");

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

// console.log(app.get('env')); // by default environment set to 'development' by express
// console.log(process.env);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`); // eslint-disable-line
});

// Representational states transfer ( Rest apis are stateless : state handled entirely on client and not on server )
// Enveloping of responses ( dsend )

// npm i eslint prettier eslint-config-prettier eslint-plugin-prettier eslint-config-airbnb eslint-plugin-node eslint-plugin-import eslint-plugin-react --save-dev
