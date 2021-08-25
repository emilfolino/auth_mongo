const database = require("../db/database.js");
const ObjectId = require('mongodb').ObjectId;

const data = {
    getAllDataForUser: async function (res, req) {
        // req contains user object set in checkToken middleware
        let db;

        try {
            db = await database.getDb();

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

            let userData = [];

            await cursor.forEach(function(element) {
                if (element.data) {
                    userData = element.data;
                }
            });

            return res.json({ data: userData });
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
            const options = { returnDocument: "after" };

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

    updateData: async function (res, req) {
        // req contains user object set in checkToken middleware
        if (req.body.id) {
            let _id = req.body.id;
            let newArtefact = req.body.artefact;
            let filter = {
                "users.data._id": ObjectId(_id)
            };
            let db;

            try {
                db = await database.getDb();

                const originalObject = await db.collection.findOne(filter);
                const documentId = originalObject["_id"];
                let copy = {};

                for (const [key, value] of Object.entries(originalObject)) {
                    if (!Array.isArray(value)) {
                        copy[key] = value;
                    }
                }

                copy.users = [];

                originalObject.users.forEach((user) => {
                    let newUser = {
                        email: user.email,
                        password: user.password,
                    };

                    if (user.data) {
                        let newData = [];

                        user.data.forEach((data) => {
                            let dataCopy = Object.assign({}, data);

                            if (data["_id"].equals(ObjectId(_id))) {
                                dataCopy.artefact = newArtefact;
                            }

                            newData.push(dataCopy);
                        });

                        newUser.data = newData;
                    }

                    copy.users.push(newUser);
                });

                const updateFilter = { _id: documentId };

                await db.collection.updateOne(updateFilter, { $set: copy });

                return res.status(204).send();
            } catch (e) {
                return res.status(500).json({
                    error: {
                        status: 500,
                        path: "PUT /data UPDATE",
                        title: "Database error",
                        message: e.message
                    }
                });
            } finally {
                await db.client.close();
            }
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

    deleteData: async function (res, req) {
        // req contains user object set in checkToken middleware
        if (req.body.id) {
            let _id = req.body.id;

            let filter = {
                "users.data._id": ObjectId(_id)
            };

            let deleteDoc = {
                $pull: {
                    "users.$.data": {
                        "_id": ObjectId(_id)
                    }
                }
            };

            let db;

            try {
                db = await database.getDb();

                await db.collection.updateOne(filter, deleteDoc);

                return res.status(204).send();
            } catch (e) {
                return res.status(500).json({
                    error: {
                        status: 500,
                        path: "DELETE /data DELETE",
                        title: "Database error",
                        message: e.message
                    }
                });
            } finally {
                await db.client.close();
            }
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
    }
};

module.exports = data;
