// To connect with your mongoDB database
const mongoose = require("mongoose");
// Connecting to database
require("dotenv").config();

const { MONGO_URI } = process.env;

connectToServer = () => {
    mongoose.connect(
        MONGO_URI,
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        }).then(()=> console.log("Database connected")).catch((e)=>console.log(e))
}

module.exports = {connectToServer}