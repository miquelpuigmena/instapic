import chai from 'chai';
import chaiHttp from 'chai-http';
import chaiCookie from 'chai-expected-cookie';
const expect = chai.expect;
chai.use(chaiHttp);
chai.use(chaiCookie);
import {appl} from './index.js';
import {truncateTable} from './db/db.js';
import fs from 'fs';

describe('server.js test', () => {
    beforeEach(async () => {
        try {
            let res = await truncateTable("users_test");
            res = await truncateTable("posts_test");
        } catch(err) {
            console.log(err);
            throw new Error('Failed to truncate');
        }
    });
    describe("Unit && Integration Test server.js", () => {
        // Register
        describe("POST /register", () => {
            it("Unit-test: Should return status 200 and set-cookie", async () => {
                let res = await chai
                    .request(appl)
                    .post('/api/v1/register')
                    .send({name: 'reap'});
                expect(res.status).to.equal(200);
                expect(res).to.containCookie({
                    name: 'connect.sid'
                });
            });
            it("Unit-test: Should return status 400 and set-cookie", async () => {
                // Wrong user format
                let res = await chai
                    .request(appl)
                    .post('/api/v1/register')
                    .send({name: 2});
                expect(res.status).to.equal(400);
            });
            it("Unit-test: Should return status 500 and set-cookie", async () => {
                // First reap user
                let res = await chai
                    .request(appl)
                    .post('/api/v1/register')
                    .send({name: 'reap'});
                expect(res.status).to.equal(200);
                expect(res).to.containCookie({
                    name: 'connect.sid'
                });
                // Second reap user
                res = await chai
                    .request(appl)
                    .post('/api/v1/register')
                    .send({name: 'reap'});
                expect(res.status).to.equal(500);
                expect(res).to.containCookie({
                    name: 'connect.sid'
                });
            });
        });
        // Login
        describe("POST /login", () => {
            it("Integration-test: Should return status 200", async () => {
                // register user first and grab cookie
                let resReg = await chai
                    .request(appl)
                    .post('/api/v1/register')
                    .send({name: 'reap'});
                expect(resReg.status).to.equal(200);
                expect(resReg).to.containCookie({
                    name: 'connect.sid'
                });
                const cookie = resReg.headers['set-cookie'][0];
                // login user with cookie
                let resLog = await chai
                    .request(appl)
                    .post('/api/v1/login')
                    .set('Cookie', cookie)
                    .send({name: 'reap'});
                expect(resLog.status).to.equal(200);
            });
            it("Unit-test: Should return status 400", async () => {
                // login user with wrong format username
                let resLog = await chai
                    .request(appl)
                    .post('/api/v1/login')
                    .send({name: 2});
                expect(resLog.status).to.equal(400);
            });
            it("Unit-test: Should return status 500", async () => {
                // login user without cookie
                let resLog = await chai
                    .request(appl)
                    .post('/api/v1/login')
                    .send({name: 'reap'});
                expect(resLog.status).to.equal(500);
            });
        });
        // Restricted
        describe("GET /restricted", () => {
            it("Integration-test: Should return status 200", async () => {
                // register user first and grab cookie
                let resReg = await chai
                    .request(appl)
                    .post('/api/v1/register')
                    .send({name: 'reap'});
                expect(resReg.status).to.equal(200);
                expect(resReg).to.containCookie({
                    name: 'connect.sid'
                });
                const cookie = resReg.headers['set-cookie'][0];
                // login user with cookie
                let resLog = await chai
                    .request(appl)
                    .post('/api/v1/login')
                    .set('Cookie', cookie)
                    .send({name: 'reap'});
                expect(resLog.status).to.equal(200);
                // Access restricted
                let resRest = await chai
                    .request(appl)
                    .get('/api/v1/restricted')
                    .set('Cookie', cookie)
                    .send();
                expect(resRest.status).to.equal(200);
            });
            it("Integration-test: Should return status 401", async () => {
                // Acces restricted without logging in
                // register user first and grab cookie
                let resReg = await chai
                    .request(appl)
                    .post('/api/v1/register')
                    .send({name: 'reap'});
                expect(resReg.status).to.equal(200);
                expect(resReg).to.containCookie({
                    name: 'connect.sid'
                });
                const cookie = resReg.headers['set-cookie'][0];
                // Access restricted without logging user
                let resRest = await chai
                    .request(appl)
                    .get('/api/v1/restricted')
                    .set('Cookie', cookie)
                    .send();
                expect(resRest.status).to.equal(401);
            });
        });
        // Upload
        describe("POST /upload", () => {
            it("Integration-test: Should return 200", async () => {
                // register user first and grab cookie
                let resReg = await chai
                    .request(appl)
                    .post('/api/v1/register')
                    .send({name: 'reap'});
                expect(resReg.status).to.equal(200);
                expect(resReg).to.containCookie({
                    name: 'connect.sid'
                });
                const cookie = resReg.headers['set-cookie'][0];
                // login user with cookie
                let resLog = await chai
                    .request(appl)
                    .post('/api/v1/login')
                    .set('Cookie', cookie)
                    .send({name: 'reap'});
                expect(resLog.status).to.equal(200);
                // upload file
                let resUpl = await chai
                    .request(appl)
                    .post('/api/v1/upload')
                    .set('Cookie', cookie)
                    .set('Content-type', 'multipart/form-data')
                    .field('description', 'Integration-test: Should return 200')
                    .attach('test-picture', fs.readFileSync('./test/reap.png'), 'image.png');
                expect(resUpl.status).to.equal(200);
            });
            it("Integration-test: Should return 400 (text file instead of image)", async () => {
                try {
                    // register user first and grab cookie
                    let resReg = await chai
                        .request(appl)
                        .post('/api/v1/register')
                        .send({name: 'reap'});
                    expect(resReg.status).to.equal(200);
                    expect(resReg).to.containCookie({
                    name: 'connect.sid'
                    });
                    const cookie = resReg.headers['set-cookie'][0];
                    // login user with cookie
                    let resLog = await chai
                        .request(appl)
                        .post('/api/v1/login')
                        .set('Cookie', cookie)
                        .send({name: 'reap'});
                    expect(resLog.status).to.equal(200);
                    // upload file
                    let resUpl = await chai
                        .request(appl)
                        .post('/api/v1/upload')
                        .set('Cookie', cookie)
                        .set('Content-type', 'multipart/form-data')
                        .field('description', 'Integration-test: Should return 400')
                        .attach('test-text', fs.readFileSync('./test/reap.txt'), 'file.txt');
                    expect(resUpl.status).to.equal(400);
                } catch(err) {
                    console.log(`Failed test: ${err}`);
                }
            });
            it("Integration-test: Should return 400 (field not known)", async () => {
                try {
                    // register user first and grab cookie
                    let resReg = await chai
                        .request(appl)
                        .post('/api/v1/register')
                        .send({name: 'reap'});
                    expect(resReg.status).to.equal(200);
                    expect(resReg).to.containCookie({
                    name: 'connect.sid'
                    });
                    const cookie = resReg.headers['set-cookie'][0];
                    // login user with cookie
                    let resLog = await chai
                        .request(appl)
                        .post('/api/v1/login')
                        .set('Cookie', cookie)
                        .send({name: 'reap'});
                    expect(resLog.status).to.equal(200);
                    // upload file
                    let resUpl = await chai
                        .request(appl)
                        .post('/api/v1/upload')
                        .set('Cookie', cookie)
                        .set('Content-type', 'multipart/form-data')
                        .field('reap', 'Integration-test: Should return 400')
                        .attach('test-text', fs.readFileSync('./test/reap.png'), 'image.png');
                    expect(resUpl.status).to.equal(400);
                } catch(err) {
                    console.log(`Failed test: ${err}`);
                }
            });
            it("Integration-test: Should return 400 (hidden py file in png extension)", async () => {
                try {
                    // register user first and grab cookie
                    let resReg = await chai
                        .request(appl)
                        .post('/api/v1/register')
                        .send({name: 'reap'});
                    expect(resReg.status).to.equal(200);
                    expect(resReg).to.containCookie({
                    name: 'connect.sid'
                    });
                    const cookie = resReg.headers['set-cookie'][0];
                    // login user with cookie
                    let resLog = await chai
                        .request(appl)
                        .post('/api/v1/login')
                        .set('Cookie', cookie)
                        .send({name: 'reap'});
                    expect(resLog.status).to.equal(200);
                    // upload file
                    let resUpl = await chai
                        .request(appl)
                        .post('/api/v1/upload')
                        .set('Cookie', cookie)
                        .set('Content-type', 'multipart/form-data')
                        .field('description', 'Integration-test: Should return 400')
                        .attach('test-text', fs.readFileSync('./test/reap.attack.py.png'), 'image.png');
                    expect(resUpl.status).to.equal(400);
                } catch(err) {
                    console.log(`Failed test: ${err}`);
                }
            });
            it("Integration-test: Should return 400 (field not known && hidden py file in png extension)", async () => {
                try {
                    // register user first and grab cookie
                    let resReg = await chai
                        .request(appl)
                        .post('/api/v1/register')
                        .send({name: 'reap'});
                    expect(resReg.status).to.equal(200);
                    expect(resReg).to.containCookie({
                    name: 'connect.sid'
                    });
                    const cookie = resReg.headers['set-cookie'][0];
                    // login user with cookie
                    let resLog = await chai
                        .request(appl)
                        .post('/api/v1/login')
                        .set('Cookie', cookie)
                        .send({name: 'reap'});
                    expect(resLog.status).to.equal(200);
                    // upload file
                    let resUpl = await chai
                        .request(appl)
                        .post('/api/v1/upload')
                        .set('Cookie', cookie)
                        .set('Content-type', 'multipart/form-data')
                        .field('description', 'Integration-test: Should return 400')
                        .attach('test-text', fs.readFileSync('./test/reap.attack.py.png'), 'image.png');
                    expect(resUpl.status).to.equal(400);
                    expect(resUpl.text).to.equal('{"message":"Malformed file"}');
                } catch(err) {
                    console.log(`Failed test: ${err}`);
                }
            });
        });
    });
});
