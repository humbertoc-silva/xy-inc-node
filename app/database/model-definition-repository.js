'use strict';

const N1qlQuery = require('couchbase').N1qlQuery;

const KEY_ALREADY_EXISTS = 12;
const KEY_NOT_FOUND = 13;
const MODEL_DEFINITION_BUCKET = 'model_definition';

class ModelDefinitionRepository {

    constructor(connection) {
        this._connection = connection;
    }

    create(modelDefinition) {
        let modelName = modelDefinition.modelName;
        return this._connection.insertAsync(modelName, modelDefinition).then(() => {
            return this.findById(modelName);
        }).catch((err) => {
            this._handleKeyAlreadyExists(err);
            throw err;
        });
    }

    findAll() {
        return this._connection.queryAsync(N1qlQuery.fromString('SELECT * FROM model_definition'));
    }

    findById(modelDefinitionId) {
        return this._connection.getAsync(modelDefinitionId)
        .catch((err) => {
            this._handleKeyNotFoundError(err);
            throw err;
        });
    }

    update(modelDefinitionId, modelDefinition) {
        return this._connection.replaceAsync(modelDefinitionId, modelDefinition).then(() => {
            return this.findById(modelDefinitionId);
        }).catch((err) => {
            this._handleKeyNotFoundError(err);
            throw err;
        });;
    }

    delete(modelDefinitionId) {
        return this._connection.removeAsync(modelDefinitionId)
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

module.exports = ModelDefinitionRepository;