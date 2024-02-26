'use strict'

const _ = require('lodash');
const { Types } = require('mongoose');
const crypto = require('node:crypto');
const util = require('util');
const { BadrequestError } = require('../core/error.response');


const handleObject = (object = {}) => {
    const fixObject = util.inspect(object, { depth: null, breakLength: 50 })
    return fixObject
}

const toObjectId = id => {
    try {
        return new Types.ObjectId(id)
    } catch (error) {
        console.log('error', error)
    }
};

const getInfoData = ({ fields = [], object = {} }) => {
    return _.pick(object, fields)
}

const generatePublicPrivateToken = () => {
    try {
        const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: 'pkcs1',
                format: 'pem'
            },
            privateKeyEncoding: {
                type: 'pkcs1',
                format: 'pem'
            }
        })
        return { privateKey, publicKey };
    } catch (error) {
        throw new BadrequestError(properties.get('v1000'))
    }
}

const getSelectData = (select = []) => {
    return Object.fromEntries(select.map(el => [el, 1]));
}

const getUnSelectData = (select = []) => {
    return Object.fromEntries(select.map(el => [el, 0]));
}

const removeUndefinedObject = (obj) => {
    Object.keys(obj).forEach(key => {
        if (obj[key] == null)
            delete obj[key];
    });
    return obj;
}

const updateNestedObjectParser = object => {
    const final = {};

    Object.keys(object || {}).forEach(key => {
        if (typeof object[key] === 'object' && !Array.isArray(object[key])) {
            const response = updateNestedObjectParser(object[key]);

            Object.keys(response || {}).forEach(a => {
                final[`${key}.${a}`] = response[a];
            });
        } else {
            final[key] = object[key];
        }
    });

    return final;
}

const checkUndefinedFinanceItem = (item = {}) => {
    if (item.Name && item.Cost) {
        return true;
    }
    return false;
}

const isStrongPassword = (value) => {
    const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,32}$/;
    return passwordRegex.test(value);
}

const typeOf = value => Object.prototype.toString.call(value).slice(8, -1)

module.exports = {
    getInfoData,
    isStrongPassword,
    generatePublicPrivateToken,
    getSelectData,
    getUnSelectData,
    removeUndefinedObject,
    updateNestedObjectParser,
    toObjectId,
    handleObject,
    checkUndefinedFinanceItem,
    typeOf
}