'use strict';

const KEY_ALREADY_EXISTS = 12;
const KEY_NOT_FOUND = 13;

class ModelDefinitionRepository {

    constructor(connection) {
        this._connection = connection;
    }

    create(modelDefinition) {
        var modelName = modelDefinition.modelName;
        return this._connection.insertAsync(modelName, modelDefinition).then(() => {
            return this.findById(modelName);
        }).catch((err) => {
            this._handleKeyAlreadyExists(err);
            throw err;
        });
    }

    findAll() {

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
        
        var keyAlreadyExistsError = new Error('The model definition already existis, supply another model name.');
        keyAlreadyExistsError.status = 409;
        throw keyAlreadyExistsError;
    }

    _handleKeyNotFoundError(err) {
        if (!err.code || err.code !== KEY_NOT_FOUND) { return; }
        
        var keyNotFoundError = new Error('Model definition not found.');
        keyNotFoundError.status = 404;
        throw keyNotFoundError;
    }
}

module.exports = function() {
    return ModelDefinitionRepository;
}