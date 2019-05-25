module.exports = function(app, User, sgMail, bcrypt, uuidv1){

    var PasswordHelper = require('../helper/password');
    var validatePasswords = PasswordHelper.validatePasswords;

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
                res.render('pages/login', { success: "An email has been sent to that email to reset your password." });
            } else {
                console.log(`INFO: Succesful password reset by ${email}, user: ${user}`);
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
            User.get(email, (err, user) => {
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
}
