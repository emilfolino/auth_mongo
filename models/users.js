const database = require("../db/database.js");

const users = {
    getAll: async function (res, apiKey) {
        let db;

        try {
            db = await database.getDb();

            const filter = { key: apiKey };
            const suppress = { users: { email: 1, password : 0 }};

            const keyObject = await db.collection.findOne(filter, suppress);

            let returnObject = [];

            if (keyObject.users) {
                returnObject = keyObject.users.map(function (user) {
                    return { email: user.email };
                });
            }
            
            return res.status(200).json({
                data: returnObject
            });
        } catch (err) {
            return res.status(500).json({
                error: {
                    status: 500,
                    path: "/users",
                    title: "Database error",
                    message: err.message
                }
            });
        } finally {
            await db.client.close();
        }
    }
};

module.exports = users;
