// Setting up the Express Server

const express = require('express');
const app = express();

// Listen on port set by env variable or 5000
const port = process.env.PORT || 5000;

// Load all routes from the routes folder
const routes = require('./routes/index');

app.use(routes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;
