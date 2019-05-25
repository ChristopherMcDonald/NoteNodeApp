module.exports = function(app, User, Note, sgMail, bcrypt, uuidv1) {

    var PasswordHelper = require('../helper/password');
    var validatePasswords = PasswordHelper.validatePasswords;
    var validateEmail = PasswordHelper.validateEmail;
    var validatePassword = PasswordHelper.validatePassword;

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
                    notes: [Note.create('Sample', 'This is your first note!')]
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
                res.render('pages/login', {error: "That link wasn't quite correct..."});
            }
        });
    });
}
