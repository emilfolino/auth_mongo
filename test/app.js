/* global it describe */

process.env.NODE_ENV = 'test';

//Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app.js');
const HTMLParser = require('node-html-parser');

chai.should();

chai.use(chaiHttp);

describe('app', () => {
    describe('GET /', () => {
        it('200 HAPPY PATH getting base', (done) => {
            chai.request(server)
                .get("/")
                .end((err, res) => {
                    res.should.have.status(200);

                    done();
                });
        });

        it('page should contain H1 with auth', (done) => {
            chai.request(server)
                .get("/")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.text.should.be.a("string");

                    let HTMLResponse = HTMLParser.parse(res.text);
                    let h1Element = HTMLResponse.querySelector('h1');

                    h1Element.should.be.an("object");

                    var h1Text = h1Element.childNodes[0].rawText;

                    h1Text.should.equal("auth Documentation");

                    done();
                });
        });
    });
});
