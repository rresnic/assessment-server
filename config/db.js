const knex = require("knex");

require("dotenv").config();

const { types } = require('pg');

// Override the parser for the DATE OID to return the value as a string
types.setTypeParser(types.builtins.DATE, (val) => val);
const {PGCONNECTIONURI} = process.env;

module.exports = {
    db: knex({
        client: 'pg',
        connection: {
            connectionString: PGCONNECTIONURI
        },
        ssl: {rejectUnauthorized: false}
    })
}