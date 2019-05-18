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

// app specific settings
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
app.use(helmet());

// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(express.static('public'))

// some middleware to log
app.use((req, res, next) => {
    var now = Date.now();
    next();
    var ms = Date.now() - now;
    var email = req.session.email;
    if (email === undefined)
    {
        console.log(`REQ: ${req.method} ${res.statusCode} ${req.originalUrl} ${ms} by Anonymous`);
    }
    else
    {
        console.log(`REQ: ${req.method} ${res.statusCode} ${req.originalUrl} ${ms} by ${email}`);
    }
})

// home page
app.get('/', (req, res) => {
    var email = req.session.email;
    if (email === undefined)
    {
        res.render('pages/login');
    }
    else
    {
        User.findOne({email: email}, (err, user) => {
            if (err) {
                throw err;
            }

            res.render('pages/index', {user: user, note: user.notes[0].id});
        });
    }
});

// login page
app.get('/login', (req, res) => {
    res.render('pages/login');
});

// logout request
app.get('/logout', (req, res) => {
    delete req.session.email;
    res.redirect('/');
});

// login request
app.post('/login', (req, res) => {
    var email = req.body.email;
    var password = req.body.password;

    if (!validateEmail(email)) {
        res.render('pages/login', {error: "Email is not in correct format, check again or choose another."});
    } else if(!validatePassword(password)) {
        res.render('pages/login', {error: "Ensure password contains 1 number, and 1 uppercase and lowercase letter."});
    } else {
        User.findOne({email: email}, (err, user) => {
            if (err) {
                throw err;
            }

            if (user) {
                bcrypt.compare(password, user.password, (err, response) => {
                    if (err || !response) {
                        res.render('pages/login', {error: "Login failed."});
                    } else {
                        // save cookie

                        if (!user.verified) {
                            res.render('pages/login', {error: "Verify your email!"});
                        } else {
                            console.log(`INFO: Succesful login by ${email}`);
                            req.session.email = email;
                            res.redirect("/");
                        }
                    }
                });
            } else {
                res.render('pages/login', {error: "Login failed."});
            }
        });
    }
});

// signup page
app.get('/signup', (req, res) => {
    res.render('pages/signup');
});

// signup request
app.post('/signup', (req, res) => {
    var email = req.body.email;
    var password = req.body.password;
    var confpassword = req.body.confpassword;

    if (!validateEmail(email)) {
        res.render('pages/signup', {error: "Email is not in correct format, check again or choose another."});
    } else if(!validatePasswords(password, confpassword)) {
        res.render('pages/signup', {error: "Ensure passwords are equal and it contains 1 number, and 1 uppercase and lowercase letter."});
    } else {
        // save user
        // TODO check for user already in DB
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) {
                throw err;
            }

            var user = new User({
                email: email,
                password: hash,
                guid: uuidv1(),
                notes: [new Note({title: 'Sample', content: 'This is your first note!'})]
            });

            user.save().then(() => res.render('pages/login', {success: "Signed up successfully. Please login."}));
            console.log(`INFO: Succesful signup by ${email}`);

            const msg = {
                to: user.email,
                from: 'chris@christophermcdonald.me',
                subject: "Welcome to the NoteNodeApp!",
                text: "NoteNodeApp-Text",
                html: "<p>NoteNodeApp-HTML</p>",
                templateId: 'd-18cdc73ec5564f0eb6d53f066300e5eb',
                dynamic_template_data: {
                    action: `https://${req.get('host')}/verify?user=${user.email}&guid=${user.guid}`
                },
            };
            sgMail.send(msg);
        });
    }
});

app.get('/password', (req, res) => {
    res.render('pages/password');
});

app.post('/password', (req, res) => {
    var email = req.body.email;
    User.findOne({email: email}, (err, user) => {
        if (err) {
            throw err;
        }

        if (!user) {
            res.render('pages/login', { success: "An email has been sent to that email to reset your password." });
        }

        console.log(`INFO: Succesful password reset by ${email}`);
        user.tempGuid = uuidv1();

        const msg = {
            to: user.email,
            from: 'chris@christophermcdonald.me',
            subject: "Welcome to the NoteNodeApp!",
            text: "NoteNodeApp-Text",
            html: "<p>NoteNodeApp-HTML</p>",
            templateId: 'd-79a7bafada544522a9b5fa8b80f7a476',
            dynamic_template_data: {
                action: `https://${req.get('host')}/passwordReset?user=${user.email}&guid=${user.tempGuid}`
            },
        };
        sgMail.send(msg);

        // return the same message as if user was not found, important for security
        user.save().then(() => res.render('pages/login', {success: "An email has been sent to that email to reset your password."}));
    });
});

app.get('/passwordReset', (req, res) => {
    var email = req.query.user;
    var guid = req.query.guid;

    User.findOne({email: email}, (err, user) => {
        if (err) {
            throw err;
        }

        if (!user) {
            res.redirect('/');
        }

        if (user.tempGuid != guid) {
            res.redirect('/');
        }

        // do not render email in HTML for security, set temp
        // tempEmail is only set AFTER successful passwordReset link is clicked
        req.session.tempEmail = email;

        res.render('pages/passwordReset');
    });
});

app.post('/passwordReset', (req, res) =>
{
    var email = req.session.tempEmail;
    var password = req.body.password;
    var confpassword = req.body.confpassword;

    if(!validatePasswords(password, confpassword)) {
        res.render('pages/passwordReset', {error: "Ensure passwords are equal and it contains 1 number, and 1 uppercase and lowercase letter."});
    } else {
        User.findOne({email: email}, (err, user) => {
            if (err) {
                throw err;
            }

            if (!user) {
                res.redirect('/');
            }

            bcrypt.hash(password, 10, (err, hash) => {
                if (err) {
                    throw err;
                }

                user.password = hash;

                user.save().then(() => res.render('pages/login', {success: "Password reset was successful. Please login."}));
                console.log(`INFO: Successful password reset by ${email}`);
            });
        });
    }
});

app.get('/note/:id', (req, res) => {
    var email = req.session.email;
    if (email === undefined)
    {
        res.redirect('/');
    }
    else
    {
        User.findOne({email: email}, (err, user) => {
            if (err) {
                throw err;
            }

            if (!user) {
                res.redirect('/');
            }

            res.render('pages/index', {user: user, note: req.params.id});
        });
    }
});

app.delete('/note/:id', (req, res) => {
    var email = req.session.email;
    if (email === undefined)
    {
        res.redirect('/');
    }
    else
    {
        User.findOne({email: email}, (err, user) => {
            if (err) {
                throw err;
            }

            if (!user) {
                res.redirect('/');
            }

            user.notes = user.notes.filter(n => n.id != req.params.id);
            user.save().then(() => res.render('pages/index', {user: user, note: user.notes[0].id}));
        });
    }
});

app.post('/note', (req, res) => {
    var email = req.session.email;
    if (email === undefined)
    {
        res.redirect('/');
    }
    else
    {
        User.findOne({email: email}, (err, user) => {
            if (err) {
                throw err;
            }

            if (!user) {
                res.redirect('/');
            }

            if (req.body.id) {
                // this is an edit
                console.log(`INFO: Editing note ${req.body.id}`);

                user.notes.filter(n => n.id == req.body.id)[0].title = req.body.title;
                user.notes.filter(n => n.id == req.body.id)[0].content = req.body.content;
                user.save().then(() => res.redirect(`/note/${req.body.id}`));
            } else {
                console.log(`INFO: Adding new note`);
                user.notes.push(new Note({title: 'Sample', content: 'This note was added!'}));
                user.save().then(() => res.redirect(`/note/${user.notes[user.notes.length - 1].id}`));
            }
        });
    }
});

app.get('/verify', (req, res) => {
    var email = req.query.user;
    var guid = req.query.guid;

    User.findOne({email: email}, (err, user) => {
        if (err) {
            throw err;
        }

        if (!user) {
            res.render('pages/login', {error: "That link wasn't quite correct..."});
        }

        if (user.guid === guid) {
            // this is an edit
            console.log(`INFO: Verifying user ${user.email}`);

            user.verified = true;
            user.save().then(() => res.render('pages/login', {success: "Verified! Please log in."}));
        } else {
            res.render('pages/login', {error: "That link wasn't quite correct..."});
        }
    });
});

// 500 handler
app.use((err, req, res, next) => {
    // TODO log context of what request
    console.log(`ERROR: Error thrown ${err}`);
    res.status(500).render('pages/error/500');
});

// 404 handler
app.use((req, res, next) => {
    res.status(404).render('pages/error/404');
});

https.createServer({
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
}, app).listen(8080, () => {
    console.log(`App listening on port ${8080}`);
});

// Helper functions
function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function validatePasswords(password, confpassword) {
    var strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{6,})");
    return strongRegex.test(password) && (password === confpassword);
}

function validatePassword(password) {
    var strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{6,})");
    return strongRegex.test(password);
}
