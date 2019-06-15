// server.js

// import config
const config = require('./config.json');

// db connection
const mongoose = require('mongoose');
var mongod;
if (config[process.argv[2]] && config[process.argv[2]].mongo) {
    mongoose.connect(config[process.argv[2]].mongo, {useNewUrlParser: true});
} else {
    var MongoMemoryServer = require('mongodb-memory-server');
    mongod = new MongoMemoryServer.MongoMemoryServer();
    mongod.getConnectionString().then(uri =>
        {
            mongoose.connect(uri, {useNewUrlParser: true});
        });
}

// Import models
var Models = require('./model/Models');
var User = Models.User;
var Note = Models.Note;

// API server stuff
var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var https = require('https');
var http = require('http');
var fs = require('fs');
var helmet = require('helmet');

// Password and security hashing stuff
const bcrypt = require('bcryptjs');
const uuidv1 = require('uuid/v1');

// email
var sgMail = require('@sendgrid/mail');
if (config[process.argv[2]] && config[process.argv[2]].email) {
    sgMail.setApiKey(config[process.argv[2]].email);
} else {
    sgMail = new (require('./tests/MockMailClient'))();
}

var app = express();
app.set('trust proxy', 1);
app.use(session({
    secret: (config[process.argv[2]] && config[process.argv[2]].sessionSecret) ? config[process.argv[2]].sessionSecret : "secret",
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
require('./controller/login')(app, User, bcrypt);
require('./controller/signup')(app, User, Note, sgMail, bcrypt);
require('./controller/note')(app, User, Note);

// error catching routes
require('./controller/error')(app);

var port = process.env.PORT || (config[process.argv[2]] && config[process.argv[2]].port) ? config[process.argv[2]].port : 8080;
// var server = https.createServer({
//   key: fs.readFileSync('server.key'),
//   cert: fs.readFileSync('server.cert')
// }, app).listen(port, () => {
//     console.log(`App listening on port ${port}`);
// });

var server = http.createServer(app).listen(port, () => { console.log(`App listening on port ${port}`); });

server.Mail = sgMail;
server.Mongo = mongod;
server.Models = Models;
module.exports = server;
