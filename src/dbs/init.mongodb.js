'use strict';
const mongoose = require('mongoose');
const { db: { host, port, name } } = require('../configs/config.mongodb')
const connectString = `mongodb://${host}:${port}/${name}`;
const { countConnect } = require('../common/helpers/check.connect');
const _MAX_POOL_SIZE = 50;


class Database {
    constructor() {
        this.connect()
    }

    connect(type = 'mongodb') {
        if (1 === 1) {
            mongoose.set('debug', true);
            mongoose.set('debug', { colors: true });
            mongoose.set('strictQuery', false);
        }

        mongoose.connect(connectString, {
            maxPoolSize: _MAX_POOL_SIZE,
        })
            .then(_ => {
                console.log('Connect Mongodb Success!!!');
                countConnect();
            })
            .catch(err => { console.log('Connect Mongodb Error', err); });
    }

    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }
}

const instanceMongodb = Database.getInstance();
module.exports = instanceMongodb;