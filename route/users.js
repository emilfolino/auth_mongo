const express = require('express');
const router = express.Router();

const users = require("../models/users.js");

router.get('/', (req, res) => users.getAll(res, req.query.api_key));
router.get('/:id', (req, res) => users.getUser(
    res,
    req.query.api_key,
    req.params.id
));

module.exports = router;
