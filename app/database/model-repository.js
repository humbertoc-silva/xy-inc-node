'use strict';

const N1qlQuery = require('couchbase').N1qlQuery;
const KEY_NOT_FOUND = 13;

class ModelRepository {

    constructor(connection) {
        this._connection = connection;
    }

    upsert(modelId, model) {
        return this._connection.upsertAsync(modelId, model).then(() => {
            return this.findById(modelId);
        });
    }

    findAll() {
        return this._connection.queryAsync(N1qlQuery.fromString('SELECT META(model).id AS modelName, * FROM model'));
    }

    findById(modelId) {
        return this._connection.getAsync(modelId)
        .catch((err) => {
            this._handleKeyNotFoundError(err);
            throw err;
        });
    }

    delete(modelId) {
        return this._connection.removeAsync(modelId)
        .catch((err) => {
            this._handleKeyNotFoundError(err);
            throw err;
        });
    }

    _handleKeyNotFoundError(err) {
        if (!err.code || err.code !== KEY_NOT_FOUND) { return; }
        
        let keyNotFoundError = new Error('Resource not found');
        keyNotFoundError.status = 404;
        throw keyNotFoundError;
    }
}

module.exports = ModelRepository;