const mongoose = require('mongoose');
const config = require('config');
const express = require('express');
const app = express();
const notes = require('./routes/notes');
const user = require('./routes/user');
const auth = require('./routes/auth');


//connect to db
const dbUrl = config.get('db');
mongoose.connect(dbUrl).then(()=> console.log("connected to db")).catch(console.log);

//middleware
app.use(express.json());

//endpoints
app.use('/api/notes', notes);
app.use('/api/user', user);
app.use('/api/auth', auth);

const port = config.get('port');
app.listen(port, ()=> console.log(`listen on port ${port}...`));