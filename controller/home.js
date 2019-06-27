module.exports = (app, User) => {
    // home page
    app.get('/', (req, res) => {
        var email = req.session.email;
        if (email === undefined)
        {
            res.render('pages/login');
        }
        else
        {
            User.get(email, (err, user) => {
                if (err) {
                    throw err;
                }

                res.render('pages/index', {user: user, note: user.notes[0].id});
            });
        }
    });

    app.get('/delete', (req, res) => {
        var email = req.session.email;
        if (email === undefined)
        {
            res.render('pages/login');
        }
        else
        {
            User.get(email, (err, user) => {
                if (err) {
                    throw err;
                }

                if (!user) {
                    return res.redirect('/');
                }

                // delete user from MongoDB
                User.delete(email, function (err) {
                    if (err) {
                        throw err;
                    }

                    // delete user session
                    delete req.session.email;

                    return res.render('pages/signup', {success: 'Your account and notes have been deleted. We are sorry to see you go!'});
                });
            });
        }
    });
}
