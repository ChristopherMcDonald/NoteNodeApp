module.exports = function(app, User, Note) {
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

                if (user == null) {
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
}
