const express = require('express');
const connectDB = require('./db');
const notesRoutes = require('./routes/notes');

const app = express();
const PORT = 3000;

connectDB();

app.use(express.json()); // for parsing application/json
app.use('/notes', notesRoutes); // Mount notes API

app.get('/', (req, res) => {
  res.send('Welcome to Notes API');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
module.exports = app;
