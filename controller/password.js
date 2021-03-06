module.exports = function(app, User, sgMail, bcrypt, uuidv1){

    var PasswordHelper = require('../helper/password');
    var validatePasswords = PasswordHelper.validatePasswords;

    var EmailHelper = require('../helper/email');

    app.get('/password', (req, res) => {
        res.render('pages/password');
    });

    app.post('/password', (req, res) => {
        var email = req.body.email;
        User.get(email, (err, user) => {
            if (err) {
                throw err;
            }

            if (!user) {
                // render
                res.render('pages/login', { success: "An email has been set to account to reset your password." });
            } else {
                console.log(`INFO: Succesful password reset by ${email}, user: ${user.email}`);
                user.tempGuid = uuidv1();

                EmailHelper.sendPasswordResetEmail(sgMail, user, req.get('host'), req.secure);

                // return the same message as if user was not found, important for security
                user.save().then(() => res.render('pages/login', {success: "An email has been set to this account to reset your password."}));
            }
        });
    });

    app.get('/passwordReset', (req, res) => {
        var email = req.query.user;
        var guid = req.query.guid;

        User.get(email, (err, user) => {
            if (err) {
                throw err;
            }

            // mask all errors as 400 for security purposes
            if (!user) {
                return res.redirect('/');
            }

            if (user.tempGuid != guid) {
                return res.redirect('/');
            }

            // do not render email in HTML for security, set temp
            // tempEmail is only set AFTER successful passwordReset link is clicked
            req.session.tempEmail = email;

            res.render('pages/passwordReset');
        });
    });

    app.post('/setPassword', (req, res) => {

        // this is only run when user is logged in
        var email = req.session.email;
        var password = req.body.password;
        var confpassword = req.body.confpassword;

        User.get(email, (err, user) => {
            if (err) {
                throw err;
            }

            if (!user) {
                return res.redirect('/');
            }

            if (!validatePasswords(password, confpassword)) {
                res.render('pages/index', {user: user, note: user.notes[0].id, error: "Ensure passwords are equal and it contains 1 number, and 1 uppercase and lowercase letter."});
            }

            bcrypt.hash(password, 10, (err, hash) => {
                if (err) {
                    throw err;
                }

                user.password = hash;

                user.save().then(() => res.render('pages/index', {user: user, note: user.notes[0].id, success: "Password reset was successful."}));
                console.log(`INFO: Successful password reset by ${email}`);
            });
        });
    });

    app.post('/passwordReset', (req, res) =>
    {
        // session.tempEmail must be set for this browser making request
        // and therefore successful password reset must've been called
        var email = req.session.tempEmail;
        var password = req.body.password;
        var confpassword = req.body.confpassword;

        if(!validatePasswords(password, confpassword)) {
            res.render('pages/passwordReset', {error: "Ensure passwords are equal and it contains 1 number, and 1 uppercase and lowercase letter."});
        } else {
            User.get(email, (err, user) => {
                if (err) {
                    throw err;
                }

                if (!user) {
                    return res.redirect('/');
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
}
