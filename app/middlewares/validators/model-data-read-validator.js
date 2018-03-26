'use strict';

const Ajv = require('ajv');
const modelDataSchema = require('../../utils/model-data-schema');
const connectionFactory = require('../../database/connection-factory');
const ModelRepository = require('../../database/model-repository');
const MODEL_BUCKET = 'model';

module.exports = function(req, res, next) {
    let modelName = req.params.model;
    let connection = connectionFactory.create(MODEL_BUCKET);
    let repository = new ModelRepository(connection);

    repository.findById(modelName)
    .then((model) => {
        next();
    }).catch((err) => {
        next(err);
    }).finally(() => {
        connection.disconnect();
    });
};