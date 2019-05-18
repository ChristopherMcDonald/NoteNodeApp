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
            User.findOne({email: email}, (err, user) => {
                if (err) {
                    throw err;
                }

                res.render('pages/index', {user: user, note: user.notes[0].id});
            });
        }
    });
}
