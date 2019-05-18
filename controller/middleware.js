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
};
