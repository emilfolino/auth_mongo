const express = require('express');
const router = express.Router();

const auth = require("../models/auth.js");

router.get('/api_key', (req, res) => {
    let data = {
        message: "",
        email: ""
    };

    res.render("api_key/form", data);
});

router.post('/api_key/confirmation', (req, res) => {
    if (req.body.gdpr && req.body.gdpr == "gdpr") {
        return auth.getNewAPIKey(res, req.body.email);
    }

    let data = {
        message: "Approve the terms and conditions.",
        email: req.body.email
    };

    res.render("api_key/form", data);
});

router.get('/api_key/deregister', (req, res) => {
    let data = {
        message: "",
        email: "",
        apikey: ""
    };

    res.render("api_key/deregister", data);
});

router.post('/api_key/deregister', (req, res) => {
    if (req.body.email && req.body.apikey &&
        req.body.email.length > 0 && req.body.apikey.length > 0) {
        return auth.deregister(res, req.body);
    }

    let data = {
        message: "Both E-mail and API-key is needed to deregister.",
        email: "",
        apikey: ""
    };

    res.render("api_key/deregister", data);
});

router.post('/login', (req, res) => auth.login(res, req.body));
router.post('/register', (req, res) => auth.register(res, req.body));

router.get('/', (req, res) => {
    res.redirect('/documentation.html');
});

module.exports = router;
