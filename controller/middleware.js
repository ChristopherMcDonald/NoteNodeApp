module.exports = (app) => {
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
    });

    // catch all function which updates the cookie every minute of activity
    app.use(function (req, res, next) {
        req.session.nowInMinutes = Math.floor(Date.now() / 60e3);
        next();
    });
};
