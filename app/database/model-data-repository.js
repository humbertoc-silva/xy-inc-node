'use strict';

const N1qlQuery = require('couchbase').N1qlQuery;

const KEY_ALREADY_EXISTS = 12;
const KEY_NOT_FOUND = 13;

class ModelDataRepository {

    constructor(connection) {
        this._connection = connection;
    }

    create(id, data) {
        return this._connection.insertAsync(id, data).then(() => {
            return this.findById(id);
        }).catch((err) => {
            this._handleKeyAlreadyExists(err);
            throw err;
        });
    }

    findAll(model) {
        return this._connection.queryAsync(N1qlQuery.fromString(`SELECT * FROM model_data WHERE META(model_data).id LIKE '${model}/%'`));
    }

    findById(id) {
        return this._connection.getAsync(id)
        .catch((err) => {
            this._handleKeyNotFoundError(err);
            throw err;
        });
    }

    update(id, data) {
        return this._connection.replaceAsync(id, data).then(() => {
            return this.findById(id);
        }).catch((err) => {
            this._handleKeyNotFoundError(err);
            throw err;
        });;
    }

    delete(id) {
        return this._connection.removeAsync(id)
        .catch((err) => {
            this._handleKeyNotFoundError(err);
            throw err;
        });
    }

    _handleKeyAlreadyExists(err) {
        if (!err.code || err.code !== KEY_ALREADY_EXISTS) { return; }
        
        let keyAlreadyExistsError = new Error('The resource already exists');
        keyAlreadyExistsError.status = 409;
        throw keyAlreadyExistsError;
    }

    _handleKeyNotFoundError(err) {
        if (!err.code || err.code !== KEY_NOT_FOUND) { return; }
        
        let keyNotFoundError = new Error('Resource not found');
        keyNotFoundError.status = 404;
        throw keyNotFoundError;
    }
}

module.exports = ModelDataRepository;