// console.log("Hello from Node.js");
const express = require('express');
const app = express();

app.get('/', (req,res) => res.send("Hello CI!"));
console.log('Started');
module.exports = app;
