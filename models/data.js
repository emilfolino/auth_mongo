const database = require("../db/database.js");

const data = {
    getAllDataForUser: async function (res, req) {
        // req contains user object set in checkToken middleware



        try {
            const db = await database.getDb();

            let filter = {
                key: req.user.api_key,
                users: {
                    email: req.user.email
                }
            };

            const keyObject = await db.collection.findOne(filter);

            if (keyObject) {
                return res.json({ data: keyObject });
            }
        } catch (e) {
            return res.status(500).json({
                errors: {
                    status: 500,
                    path: "/data",
                    title: "Database error",
                    message: e.message
                }
            });
        } finally {
            await db.client.close();
        }
    },

    getData: function(res, dataId, status=200) {
        let sql = "SELECT ROWID as id, artefact FROM user_data " +
            "WHERE ROWID = ?";

        db.get(
            sql,
            dataId,
            function (err, row) {
                if (err) {
                    return res.status(500).json({
                        error: {
                            status: 500,
                            path: "GET /data/:id",
                            title: "Database error",
                            message: err.message
                        }
                    });
                }

                return res.status(status).json({ data: row });
            });
    },

    createData: function(res, req) {
        // req contains user object set in checkToken middleware

        let sql = "SELECT ROWID as id FROM users " +
            "WHERE email = ? and apiKey = ?";

        db.get(
            sql,
            req.user.email,
            req.user.api_key,
            function (err, row) {
                if (err) {
                    return res.status(500).json({
                        error: {
                            status: 500,
                            path: "POST /data SELECT userId",
                            title: "Database error",
                            message: err.message
                        }
                    });
                }

                let sql = "INSERT INTO user_data (artefact, userId, apiKey) " +
                    "VALUES (?, ?, ?)";

                db.run(
                    sql,
                    req.body.artefact,
                    row.id,
                    req.user.api_key,
                    function (err) {
                        if (err) {
                            return res.status(500).json({
                                error: {
                                    status: 500,
                                    path: "POST /data INSERT",
                                    title: "Database error",
                                    message: err.message
                                }
                            });
                        }

                        return data.getData(res, this.lastID, 201);
                    });
            });
    },

    updateData: function (res, req) {
        // req contains user object set in checkToken middleware
        if (Number.isInteger(parseInt(req.body.id))) {
            let sql = "SELECT ROWID as id FROM users " +
                "WHERE email = ? and apiKey = ?";

            db.get(
                sql,
                req.user.email,
                req.user.api_key,
                function (err, row) {
                    if (err) {
                        return res.status(500).json({
                            error: {
                                status: 500,
                                path: "PUT /data SELECT userId",
                                title: "Database error",
                                message: err.message
                            }
                        });
                    }

                    let sql = "UPDATE user_data SET artefact = ?" +
                        " WHERE userId = ? AND apiKey = ? AND ROWID = ?";

                    db.run(
                        sql,
                        req.body.artefact,
                        row.id,
                        req.user.api_key,
                        req.body.id,
                        function (err) {
                            if (err) {
                                return res.status(500).json({
                                    error: {
                                        status: 500,
                                        path: "PUT /data UPDATE",
                                        title: "Database error",
                                        message: err.message
                                    }
                                });
                            }

                            return res.status(204).send();
                        });
                });
        } else {
            return res.status(500).json({
                error: {
                    status: 500,
                    path: "PUT /data no id",
                    title: "No id",
                    message: "No data id provided"
                }
            });
        }
    },

    deleteData: function (res, req) {
        // req contains user object set in checkToken middleware

        if (Number.isInteger(parseInt(req.body.id))) {
            let sql = "SELECT ROWID as id FROM users " +
                "WHERE email = ? and apiKey = ?";

            db.get(
                sql,
                req.user.email,
                req.user.api_key,
                function (err, row) {
                    if (err) {
                        return res.status(500).json({
                            error: {
                                status: 500,
                                path: "DELETE /data SELECT userId",
                                title: "Database error",
                                message: err.message
                            }
                        });
                    }

                    let sql = "DELETE FROM user_data" +
                        " WHERE userId = ? AND apiKey = ? AND ROWID = ?";

                    db.run(
                        sql,
                        row.id,
                        req.user.api_key,
                        req.body.id,
                        function (err) {
                            if (err) {
                                return res.status(500).json({
                                    error: {
                                        status: 500,
                                        path: "DELETE /data DELETE",
                                        title: "Database error",
                                        message: err.message
                                    }
                                });
                            }

                            return res.status(204).send();
                        });
                });
        } else {
            return res.status(500).json({
                error: {
                    status: 500,
                    path: "DELETE /data no_id",
                    title: "No data id",
                    message: "No data id provided"
                }
            });
        }
    }
};

module.exports = data;
