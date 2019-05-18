module.exports = function(app, User, Note, bcrypt) {

    var PasswordHelper = require('../helper/password');
    var validatePasswords = PasswordHelper.validatePasswords;
    var validateEmail = PasswordHelper.validateEmail;
    var validatePassword = PasswordHelper.validatePassword;

    // login page
    app.get('/login', (req, res) => {
        res.render('pages/login');
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

    // logout request
    app.get('/logout', (req, res) => {
        delete req.session.email;
        res.redirect('/');
    });
}
