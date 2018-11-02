const mongoose = require('mongoose');
const URL = "mongodb://localhost:27017/friends";

var database = mongoose.connection;

mongoose.connect(URL, { useNewUrlParser: true }, (err, db) => {
  if(err) throw err;
});

database.on('error', () => console.log("Error occured..."));
database.once('connected', () => console.log("Connected to the MongoDB Database successfully..."));

var friendSchema = mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  email: { type: String, required: false }
});

var Friend = module.exports = mongoose.model('Friend', friendSchema);
