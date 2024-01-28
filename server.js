const app = require('./app');

const port = 3000;

app.listen(port, function () {
  console.log(`Server running on port ${port}`);
});

// Representational states transfer ( Rest apis are stateless : state handled entirely on client and not on server )
// Enveloping of responses ( dsend )
