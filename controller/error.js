module.exports = (app) => {
    // 500 handler
    app.use((err, req, res, next) => {
        // TODO log context of what request
        console.log(`ERROR: Error thrown ${err}`);
        res.status(500).render('pages/error/500');
    });

    // 404 handler
    app.use((req, res, next) => {
        res.status(404).render('pages/error/404');
    });
}
