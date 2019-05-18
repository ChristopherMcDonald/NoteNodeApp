// server.js

// import config
const config = require('./config.json');

// db connection
const mongoose = require('mongoose');
mongoose.connect(config[process.argv[2]].mongo, {useNewUrlParser: true});

// Import models
var Models = require('./model/Models');
var User = Models.User;
var Note = Models.Note;

// API server stuff
var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var https = require('https');
var fs = require('fs');
var helmet = require('helmet');

// Password and security hashing stuff
const bcrypt = require('bcrypt');
const uuidv1 = require('uuid/v1');

// email
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(config[process.argv[2]].email);

var app = express();
app.set('trust proxy', 1);
app.use(session({
    secret: config[process.argv[2]].sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true, httpOnly: true }
}));

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// adds security features, masks fields in HTTP response
app.use(helmet());

// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(express.static('public'))

// some middleware to log
require('./controller/middleware')(app);

// regular routes
require('./controller/home')(app, User);
require('./controller/password')(app, User, sgMail, bcrypt, uuidv1);
require('./controller/login')(app, User, Note, bcrypt);
require('./controller/signup')(app, User, Note, sgMail, bcrypt, uuidv1);
require('./controller/note')(app, User, Note);

// error catching routes
require('./controller/error')(app);

https.createServer({
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
}, app).listen(8080, () => {
    console.log(`App listening on port ${8080}`);
});
