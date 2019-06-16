var request = require('supertest');

describe('loading express', () => {
    var server;

    before(() => {
        server = require('../server');
    });

    it('POST /note', (done) => {
        request(server)
        .post('/signup')
        .send({email: 'fake6543@email.com'})
        .send({password: 'superStrong10'})
        .send({confpassword: 'superStrong10'})
        .expect(200)
        .then(res => {
            var path = server.Mail.actions.pop().replace(/https:\/\/127\.0\.0\.1:[0-9]{1,}/, '');
            request(server)
            .get(path)
            .expect(200)
            .then(res => {
                request(server)
                .post('/login')
                .send({email: 'fake6543@email.com'})
                .send({password: 'superStrong10'})
                .expect(302)
                .then(res => {
                    request(server)
                    .post('/note')
                    .expect(302, done);
                });
            });
        });
    });
});
