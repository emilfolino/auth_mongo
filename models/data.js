const database = require("../db/database.js");
var ObjectId = require('mongodb').ObjectId;

const data = {
    getAllDataForUser: async function (res, req) {
        // req contains user object set in checkToken middleware
        let db;

        try {
            db = await database.getDb();

            // let filter = {
            //     key: req.user.api_key,
            //     "users.email": req.user.email,
            // };

            let filter = {
                key: req.user.api_key,
                "users.email": req.user.email,
            };

            const cursor = db.collection.aggregate([
                {
                    "$match": filter,
                },
                {
                    "$unwind": "$users",
                },
                {
                    "$match": {
                        "users.email": req.user.email
                    }
                },
                {
                    "$replaceRoot": {
                        "newRoot": "$users"
                    }
                }
            ]);

            await cursor.forEach(function(element) {
                console.log(element);
            });

            let returnObject = [];

            return res.json({ data: returnObject });
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

    createData: async function(res, req) {
        // req contains user object set in checkToken middleware
        let apiKey = req.body.api_key;
        let email = req.user.email;
        let db;

        try {
            db = await database.getDb();

            const filter = { key: apiKey, "users.email": email };
            const updateDoc = {
                $push: {
                    "users.$.data": {
                        artefact: req.body.artefact,
                        _id: new ObjectId(),
                    }
                }
            };
            const options = { returnDocument : "after" };

            let result = await db.collection.findOneAndUpdate(
                filter,
                updateDoc,
                options,
            );

            if (result) {
                return res.status(201).json({
                    data: result.value
                });
            }
        } catch (e) {
            return res.status(500).json({
                error: {
                    status: 500,
                    path: "POST /data INSERT",
                    title: "Database error",
                    message: e.message
                }
            });
        } finally {
            await db.client.close();
        }
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
