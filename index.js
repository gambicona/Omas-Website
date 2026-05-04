const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello from Omas-Website!');
});

app.listen(port, () => {
  console.log(`Omas-Website listening at http://localhost:${port}`);
});