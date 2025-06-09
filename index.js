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

if(process.env.NODE_ENV !== 'test'){
app.listen(3000, () => {
  console.log("Server running at 3000");
})};
module.exports = app;
