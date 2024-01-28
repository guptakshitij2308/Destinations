const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

const app = require("./app");

// console.log(app.get('env')); // by default environment set to 'development' by express
// console.log(process.env);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`); // eslint-disable-line
});

// Representational states transfer ( Rest apis are stateless : state handled entirely on client and not on server )
// Enveloping of responses ( dsend )

// npm i eslint prettier eslint-config-prettier eslint-plugin-prettier eslint-config-airbnb eslint-plugin-node eslint-plugin-import eslint-plugin-react --save-dev
