/* global it describe before */

process.env.NODE_ENV = 'test';

//Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const HTMLParser = require('node-html-parser');

const server = require('../app.js');

chai.should();

const database = require("../db/database.js");
const collectionName = "keys";

chai.use(chaiHttp);

let apiKey = "";
let token = "";
let _id = "";

describe('user_data', () => {
    before(() => {
        return new Promise(async (resolve) => {
            const db = await database.getDb();

            db.db.listCollections(
                { name: collectionName }
            )
                .next()
                .then(async function(info) {
                    if (info) {
                        await db.collection.drop();
                    }
                })
                .catch(function(err) {
                    console.error(err);
                })
                .finally(async function() {
                    await db.client.close();
                    resolve();
                });
        });
    });

    describe('GET /api_key', () => {
        it('200 HAPPY PATH getting form', (done) => {
            chai.request(server)
                .get("/api_key")
                .end((err, res) => {
                    res.should.have.status(200);

                    done();
                });
        });

        it('should get 200 as we get apiKey', (done) => {
            let user = {
                email: "test@data.com",
                gdpr: "gdpr"
            };

            chai.request(server)
                .post("/api_key/confirmation")
                .send(user)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.text.should.be.a("string");

                    let HTMLResponse = HTMLParser.parse(res.text);
                    let apiKeyElement = HTMLResponse.querySelector('#apikey');

                    apiKeyElement.should.be.an("object");

                    apiKey = apiKeyElement.childNodes[0].rawText;

                    apiKey.length.should.equal(32);

                    done();
                });
        });

        it('should get 200 as we get apiKey', (done) => {
            let user = {
                email: "test@datadata.com",
                gdpr: "gdpr"
            };

            chai.request(server)
                .post("/api_key/confirmation")
                .send(user)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.text.should.be.a("string");

                    let HTMLResponse = HTMLParser.parse(res.text);
                    let apiKeyElement = HTMLResponse.querySelector('#apikey');

                    apiKeyElement.should.be.an("object");

                    apiKeyElement.childNodes[0].rawText.length.should.equal(32);

                    done();
                });
        });

        it('should get 200 but no apikey element not a valid email', (done) => {
            let user = {
                email: "test",
                gdpr: "gdpr"
            };

            chai.request(server)
                .post("/api_key/confirmation")
                .send(user)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.text.should.be.a("string");

                    let HTMLResponse = HTMLParser.parse(res.text);
                    let apiKeyElement = HTMLResponse.querySelector('#apikey');

                    (apiKeyElement === null).should.be.true;

                    let messageElement = HTMLResponse.querySelector('#error');

                    messageElement.should.be.an("object");

                    let message = messageElement.childNodes[0].rawText;

                    message.should.equal("A valid email address is required to obtain an API key.");

                    done();
                });
        });

        it('should get 200 but no apikey element no gdpr', (done) => {
            let user = {
                email: "test@auth.com"
            };

            chai.request(server)
                .post("/api_key/confirmation")
                .send(user)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.text.should.be.a("string");

                    let HTMLResponse = HTMLParser.parse(res.text);
                    let apiKeyElement = HTMLResponse.querySelector('#apikey');

                    (apiKeyElement === null).should.be.true;

                    let messageElement = HTMLResponse.querySelector('#error');

                    messageElement.should.be.an("object");

                    let message = messageElement.childNodes[0].rawText;

                    message.should.equal("Approve the terms and conditions.");

                    done();
                });
        });

        it('should get 200 but no apikey element not correct gdpr', (done) => {
            let user = {
                email: "test@auth.com",
                gdpr: "gdprgdpr"
            };

            chai.request(server)
                .post("/api_key/confirmation")
                .send(user)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.text.should.be.a("string");

                    let HTMLResponse = HTMLParser.parse(res.text);
                    let apiKeyElement = HTMLResponse.querySelector('#apikey');

                    (apiKeyElement === null).should.be.true;

                    let messageElement = HTMLResponse.querySelector('#error');

                    messageElement.should.be.an("object");

                    let message = messageElement.childNodes[0].rawText;

                    message.should.equal("Approve the terms and conditions.");

                    done();
                });
        });
    });

    describe('GET /users', () => {
        it('should get 401 as we do not provide valid api_key', (done) => {
            chai.request(server)
                .get("/users")
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.an("object");
                    res.body.errors.status.should.be.equal(401);

                    done();
                });
        });

        it('200 getting users for api key', (done) => {
            chai.request(server)
                .get("/users?api_key=" + apiKey)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property("data");
                    res.body.data.should.be.an("array");
                    res.body.data.length.should.equal(0);

                    done();
                });
        });

        it('should get 201 registering user for apiKey', (done) => {
            let user = {
                email: "test@example.com",
                password: "123test",
                api_key: apiKey
            };

            chai.request(server)
                .post("/register")
                .send(user)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.an("object");
                    res.body.should.have.property("data");
                    res.body.data.should.have.property("message");
                    res.body.data.message.should.equal("User successfully registered.");

                    done();
                });
        });

        it('200 getting users for api key, 1 user', (done) => {
            chai.request(server)
                .get("/users?api_key=" + apiKey)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property("data");
                    res.body.data.should.be.an("array");
                    res.body.data.length.should.equal(1);

                    done();
                });
        });

        it('should get 201 registering user for apiKey', (done) => {
            let user = {
                email: "test2@example.com",
                password: "test123",
                api_key: apiKey
            };

            chai.request(server)
                .post("/register")
                .send(user)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.an("object");
                    res.body.should.have.property("data");
                    res.body.data.should.have.property("message");
                    res.body.data.message.should.equal("User successfully registered.");

                    done();
                });
        });

        it('200 getting users for api key, 2 user', (done) => {
            chai.request(server)
                .get("/users?api_key=" + apiKey)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property("data");
                    res.body.data.should.be.an("array");
                    res.body.data.length.should.equal(2);

                    done();
                });
        });
    });

    describe('GET /data', () => {
        it('should get 401 as we do not provide valid api_key', (done) => {
            chai.request(server)
                .get("/data")
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.an("object");
                    res.body.errors.status.should.be.equal(401);

                    done();
                });
        });

        it('should get 401 as we do not provide valid token', (done) => {
            chai.request(server)
                .get("/data?api_key=" + apiKey)
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.an("object");
                    res.body.errors.status.should.be.equal(401);

                    done();
                });
        });

        it('should get 200 login user', (done) => {
            let user = {
                email: "test@example.com",
                password: "123test",
                api_key: apiKey
            };

            chai.request(server)
                .post("/login")
                .send(user)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.should.have.property("data");
                    res.body.data.should.have.property("message");
                    res.body.data.message.should.equal("User logged in");

                    res.body.data.should.have.property("user");
                    res.body.data.user.should.have.property("email");
                    res.body.data.user.email.should.equal("test@example.com");

                    res.body.data.should.have.property("token");
                    token = res.body.data.token;

                    done();
                });
        });

        it('should get 200 as we do provide token', (done) => {
            chai.request(server)
                .get("/data?api_key=" + apiKey)
                .set("x-access-token", token)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.data.should.be.an("array");
                    res.body.data.length.should.equal(0);

                    done();
                });
        });

        it('should get 401 as we do not provide api key', (done) => {
            const artefact = {
                latitude: 56.18185835,
                longitude: 15.5911037,
                place: "BTH"
            };

            const data = {
                artefact: JSON.stringify(artefact),
                // api_key: apiKey
            };

            chai.request(server)
                .post("/data")
                .send(data)
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.an("object");
                    res.body.errors.status.should.be.equal(401);

                    done();
                });
        });

        it('should get 401 as we do not provide valid token', (done) => {
            const artefact = {
                latitude: 56.18185835,
                longitude: 15.5911037,
                place: "BTH"
            };

            const data = {
                artefact: JSON.stringify(artefact),
                api_key: apiKey
            };

            chai.request(server)
                .post("/data")
                .send(data)
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.an("object");
                    res.body.errors.status.should.be.equal(401);

                    done();
                });
        });

        it('should get 201 as we create artefact', (done) => {
            const artefact = {
                latitude: 56.18185835,
                longitude: 15.5911037,
                place: "BTH"
            };

            const data = {
                artefact: JSON.stringify(artefact),
                api_key: apiKey
            };

            chai.request(server)
                .post("/data")
                .send(data)
                .set("x-access-token", token)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.an("object");
                    res.body.should.have.property("data");
                    res.body.data.users[0].data[0].should.have.property("_id");
                    res.body.data.users[0].data[0].should.have.property("artefact");

                    res.body.data.users[0].data[0].artefact.should.equal(JSON.stringify(artefact));

                    _id = res.body.data.users[0].data[0]["_id"];

                    done();
                });
        });

        it('should get 200 with 1 artefact', (done) => {
            chai.request(server)
                .get("/data?api_key=" + apiKey)
                .set("x-access-token", token)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.data.should.be.an("array");
                    res.body.data.length.should.equal(1);

                    done();
                });
        });

        it('should get 401 as we do not provide valid token', (done) => {
            const artefact = {
                latitude: 56.26116,
                longitude: 15.626451,
                place: "Rödeby Skidbacke"
            };

            const data = {
                id: _id,
                artefact: JSON.stringify(artefact),
                api_key: apiKey
            };

            chai.request(server)
                .put("/data")
                .send(data)
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.an("object");
                    res.body.errors.status.should.be.equal(401);

                    done();
                });
        });

        it('should get 500 as we do not provide id', (done) => {
            const artefact = {
                latitude: 56.26116,
                longitude: 15.626451,
                place: "Rödeby Skidbacke"
            };

            const data = {
                // id: _id,
                artefact: JSON.stringify(artefact),
                api_key: apiKey
            };

            chai.request(server)
                .put("/data")
                .set("x-access-token", token)
                .send(data)
                .end((err, res) => {
                    res.should.have.status(500);

                    done();
                });
        });

        it('should get 204 as we do provide valid token', (done) => {
            const artefact = {
                latitude: 56.26116,
                longitude: 15.626451,
                place: "Rödeby Skidbacke"
            };

            const data = {
                id: _id,
                artefact: JSON.stringify(artefact),
                api_key: apiKey
            };

            chai.request(server)
                .put("/data")
                .set("x-access-token", token)
                .send(data)
                .end((err, res) => {
                    res.should.have.status(204);

                    done();
                });
        });

        it('should get 200 with 1 changed artefact', (done) => {
            chai.request(server)
                .get("/data?api_key=" + apiKey)
                .set("x-access-token", token)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.data.should.be.an("array");
                    res.body.data.length.should.equal(1);

                    res.body.data[0].should.have.property("artefact");
                    let parsedArtefact = JSON.parse(res.body.data[0].artefact);

                    parsedArtefact.should.be.an("object");
                    parsedArtefact.should.have.property("place");
                    parsedArtefact.place.should.equal("Rödeby Skidbacke");

                    done();
                });
        });

        it('should get 401 as we do not provide valid token', (done) => {
            const data = {
                id: _id,
                api_key: apiKey
            };

            chai.request(server)
                .delete("/data")
                .send(data)
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.an("object");
                    res.body.errors.status.should.be.equal(401);

                    done();
                });
        });

        it('should get 500 as we do not provide id', (done) => {
            const data = {
                // id: _id,
                api_key: apiKey
            };

            chai.request(server)
                .delete("/data")
                .set("x-access-token", token)
                .send(data)
                .end((err, res) => {
                    res.should.have.status(500);

                    done();
                });
        });

        it('should get 204 as we do provide valid token', (done) => {
            const data = {
                id: _id,
                api_key: apiKey
            };

            chai.request(server)
                .delete("/data")
                .set("x-access-token", token)
                .send(data)
                .end((err, res) => {
                    res.should.have.status(204);

                    done();
                });
        });

        it('should get 200 with 0 artefacts', (done) => {
            chai.request(server)
                .get("/data?api_key=" + apiKey)
                .set("x-access-token", token)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.data.should.be.an("array");
                    res.body.data.length.should.equal(0);

                    done();
                });
        });
    });
});
