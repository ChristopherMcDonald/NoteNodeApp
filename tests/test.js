var request = require('supertest');
var sleep = require('thread-sleep');

// allows self-signed cert
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

describe('loading express', () => {
    var server;

    beforeEach(() => {
        server = require('../server');
    });

    afterEach(() => {
        server.close();
    });

    after(() => {
        server.MongoMemoryServer.stop();
    });

    // GET /
    it('responds to /', (done) => {
        request(server).get('/').expect(200, done);
    });

    // GET /note/fakeID
    it('redirects home', (done) => {
        request(server).get('/note/someId').expect(401, done);
    });

    // GET /foo/bar
    it('404 everything else', (done) => {
        request(server).get('/foo/bar').expect(404, done);
    });

    // GET /login
    it('responds to /login', (done) => {
        request(server).get('/login').expect(200, done);
    });

    // GET /signup
    it('responds to /signup', (done) => {
        request(server).get('/signup').expect(200, done);
    });

    it('/signup', (done) => {
        request(server)
        .post('/signup')
        .send({email: 'fakeemail6@email.com'})
        .send({password: 'superStrong10'})
        .send({confpassword: 'superStrong10'})
        .expect(200, done);
    });

    it('/signup w/ bad passwords', (done) => {
        request(server)
        .post('/signup')
        .send({email: 'fakeemail5@email.com'})
        .send({password: 'superStrong'})
        .send({confpassword: 'superStrong10'})
        .expect(422, done);
    });

    it('/signup w/ weak password', (done) => {
        request(server)
        .post('/signup')
        .send({email: 'fakeemail7@email.com'})
        .send({password: 'superStrong'})
        .send({confpassword: 'superStrong'})
        .expect(422, done);
    });

    it('/signup w/ bad email', (done) => {
        request(server)
        .post('/signup')
        .send({email: 'fakeemail3@email'})
        .send({password: 'superStrong10'})
        .send({confpassword: 'superStrong10'})
        .expect(422, done);
    });

    it('/verify', (done) => {
        request(server)
        .post('/signup')
        .send({email: 'fakeemail2@email.com'})
        .send({password: 'superStrong10'})
        .send({confpassword: 'superStrong10'})
        .expect(200)
        .then(res => {
            var path = server.MockMailClient.actions.pop().replace(/https:\/\/127\.0\.0\.1:[0-9]{1,}/, '');
            request(server)
            .get(path)
            .expect(200, done);
        });
    });

    it('/verify w/ bad guid', (done) => {
        request(server)
        .post('/signup')
        .send({email: 'fakeemail10@email.com'})
        .send({password: 'superStrong10'})
        .send({confpassword: 'superStrong10'})
        .expect(200)
        .then(res => {
            var path = server.MockMailClient.actions.pop().replace(/https:\/\/127\.0\.0\.1:[0-9]{1,}/, '');
            path += 'badGuid';
            request(server)
            .get(path)
            .expect(400, done);
        });
    });

    it('/resend', (done) => {
        request(server)
        .post('/signup')
        .send({email: 'fakeemail1@email.com'})
        .send({password: 'superStrong10'})
        .send({confpassword: 'superStrong10'})
        .expect(200)
        .then(res => {
            server.MockMailClient.actions.pop();
            request(server)
            .get(`/resend?email=fakeemail1@email.com`)
            .expect(200)
            .then(res => {
                var path = server.MockMailClient.actions.pop().replace(/https:\/\/127\.0\.0\.1:[0-9]{1,}/, '');
                request(server)
                .get(path)
                .expect(200, done);
            });
        });
    });

    it('/login', (done) => {
        request(server)
        .post('/signup')
        .send({email: 'fake@email.com'})
        .send({password: 'superStrong10'})
        .send({confpassword: 'superStrong10'})
        .expect(200)
        .then(res => {
            var path = server.MockMailClient.actions.pop().replace(/https:\/\/127\.0\.0\.1:[0-9]{1,}/, '');
            request(server)
            .get(path)
            .expect(200)
            .then(res => {
                request(server)
                .post('/login')
                .send({email: 'fake@email.com'})
                .send({password: 'superStrong10'})
                .expect(200, done);
            });
        });
    });

    it('/password reset', done => {
        request(server)
        .post('/signup')
        .send({email: 'fakeemail11@email.com'})
        .send({password: 'superStrong10'})
        .send({confpassword: 'superStrong10'})
        .expect(200)
        .then(() => {
            // password reset api call
            server.MockMailClient.actions.pop();
            request(server)
            .post('/password')
            .send({email: 'fakeemail11@email.com'})
            .expect(200)
            .then(() => {
                // read email, reset password
                var path = server.MockMailClient.actions.pop().replace(/https:\/\/127\.0\.0\.1:[0-9]{1,}/, '');
                request(server)
                .post(path)
                .expect(200, done)
            });
        });
    });

    it('/password reset bad', done => {
        request(server)
        .post('/signup')
        .send({email: 'fakeemail12@email.com'})
        .send({password: 'superStrong10'})
        .send({confpassword: 'superStrong10'})
        .expect(200)
        .then(() => {
            // password reset api call
            server.MockMailClient.actions.pop();
            request(server)
            .post('/password')
            .send({email: 'fakeemail12@email.com'})
            .expect(200)
            .then(() => {
                // read email, reset password
                var path = server.MockMailClient.actions.pop().replace(/https:\/\/127\.0\.0\.1:[0-9]{1,}/, '');
                request(server)
                .get(path + 'badGuid')
                .expect(400, done)
            });
        });
    });
});
