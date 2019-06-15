module.exports = function(app, User, Note, sgMail, bcrypt) {

    var PasswordHelper = require('../helper/password');
    var validatePasswords = PasswordHelper.validatePasswords;
    var validateEmail = PasswordHelper.validateEmail;
    var validatePassword = PasswordHelper.validatePassword;

    var EmailHelper = require('../helper/email');

    // signup page
    app.get('/signup', (req, res) => {
        res.render('pages/signup');
    });

    // signup page
    app.get('/resend', (req, res) => {
        var email = req.query.email;

        User.get(email, (err, user) => {
            if (err) {
                throw err;
            }

            if (!user) {
                res.render('pages/login', {error: "That link wasn't quite correct..."});
            }

            EmailHelper.sendSignupEmail(sgMail, user, req.get('host'));
            res.render('pages/login', {success: "The verification email has been resent."});
        });
    });

    // signup request
    app.post('/signup', (req, res) => {
        var email = req.body.email;
        var password = req.body.password;
        var confpassword = req.body.confpassword;

        if (!validateEmail(email)) {
            res.status(422).render('pages/signup', {error: "Email is not in correct format, check again or choose another."});
        } else if(!validatePasswords(password, confpassword)) {
            res.status(422).render('pages/signup', {error: "Passwords must be equal, at least 6 characters long and contain an uppercase letter, lowercase letter and a number."});
        } else {
            // save user

            User.get(email, (err, user) => {
                if (err) {
                    throw err;
                }

                if (user) {
                    return res.render('pages/login', {success: "Woops! I think you have already signed up. Check your email for verification and login."});
                }
                else {
                    bcrypt.hash(password, 10, (err, hash) => {
                        if (err) {
                            throw err;
                        }

                        User.create(email, hash, (user) => {
                            EmailHelper.sendSignupEmail(sgMail, user, req.get('host'));
                            res.render('pages/login', {success: "Signed up successfully, we sent you an email! Please verify before logging in."});
                            console.log(`INFO: Succesful signup by ${email}`);
                        });
                    });
                }
            });
        }
    });

    app.get('/verify', (req, res) => {
        var email = req.query.user;
        var guid = req.query.guid;

        User.get(email, (err, user) => {
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
                res.status(400).render('pages/login', {error: "That link wasn't quite correct..."});
            }
        });
    });
}
