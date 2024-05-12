const db = require('./src/configs/db.config');
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const auth = require("./src/middlewares/auth");
const cors = require('cors');
require("dotenv").config();

const { API_PORT } = process.env;
const port = process.env.PORT || API_PORT;

const app = express(); // creates an express server

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views' , './src/views');
app.use(bodyParser.json());
app.use(express.urlencoded({extended: false}))
app.use(cors());
db.connectToServer();

// Keep all the routes above error handler
app.use('/api/users', auth, require('./src/routes/api/users'))
app.use('/api/templates', require('./src/routes/api/templates'))
app.use('/api/authentication', require('./src/routes/api/authentication'))
app.use('/api/invoice', require('./src/routes/api/pdfgenerator'))


// Route which does not match any, For Error handling
app.use((req, res, next) => {
    const error = new Error("Not found");
    error.status = 404;
    next(error);
   });

// error handler middleware
app.use((error, req, res, next) => {
    res.status(error.status || 500).send({
    error: {
    status: error.status || 500,
    message: error.message || "Internal Server Error",
    },
    });
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})