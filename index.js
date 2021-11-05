const express = require('express');
const app = express();
const mongoose = require('mongoose');
const notes = require('./routes/notes');
const user = require('./routes/user');
const auth = require('./routes/auth');


//connect to db
const dbUrl = "mongodb://localhost:27017/notes";
mongoose.connect(dbUrl).then(()=> console.log("connected to db")).catch(console.log);

//middleware
app.use(express.json());

//endpoints
app.use('/api/notes', notes);
app.use('/api/user', user);
app.use('/api/auth', auth);

app.listen(3001, ()=>console.log("listen on port 3001..."))