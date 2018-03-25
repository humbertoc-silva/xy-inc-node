'use strict';

const router = require('express').Router();
const connectionFactory = require('../database/connection-factory');
const ModelDefinitionRepository = require('../database/model-definition-repository');
const modelDefinitionValidator = require('../middlewares/validators/model-definition-validator');
const modelNameValidator = require('../middlewares/validators/model-name-validator');
const modelSchema = require('../utils/model-schema');

const MODEL_DEFINITION_BUCKET = 'model_definition';

function getConnection() {
    return connectionFactory.create(MODEL_DEFINITION_BUCKET);
}

function getRepository(connection) {
    return new ModelDefinitionRepository(connection);
}

router.get('/model-definitions/schema', function(req, res, next) {
    res.json(modelSchema);
});

router.post('/model-definitions', modelDefinitionValidator, function(req, res, next) {
    let modelDefinition = req.body;
    let connection = getConnection();
    let repository = getRepository(connection);
    
    repository.create(modelDefinition)
    .then((modelDefinitionPersisted) => {
        res.status(201).json(modelDefinitionPersisted.value);
    }).catch((err) => {
        next(err);
    }).finally(() => {
        connection.disconnect();
    });
});

router.get('/model-definitions', function(req, res, next) {
    let connection = getConnection();
    let repository = getRepository(connection);

    repository.findAll()
    .then((modelDefinitionList) => {
        res.status(200).json(modelDefinitionList);
    }).catch((err) => {
        next(err);
    }).finally(() => {
        connection.disconnect();
    });
});

router.get('/model-definitions/:id', function(req, res, next) {
    let id = req.params.id;
    let connection = getConnection();
    let repository = getRepository(connection);

    repository.findById(id)
    .then((modelDefinition) => {
        res.status(200).json(modelDefinition.value);
    }).catch((err) => {
        next(err);
    }).finally(() => {
        connection.disconnect();
    });
});

router.put('/model-definitions/:id', modelDefinitionValidator, modelNameValidator, function(req, res, next) {
    let id = req.params.id;
    let modelDefinition = req.body;
    let connection = getConnection();
    let repository = getRepository(connection);

    repository.update(id, modelDefinition)
    .then((modelDefinitionUpdated) => {
        res.status(200).json(modelDefinitionUpdated.value);
    }).catch((err) => {
        next(err);
    }).finally(() => {
        connection.disconnect();
    });
});

router.delete('/model-definitions/:id', function(req, res, next) {
    let id = req.params.id;
    let connection = getConnection();
    let repository = getRepository(connection);

    repository.delete(id).then(() => {
        res.status(200).json({message: `Model definition successfuly deleted`});
    }).catch((err) => {
        next(err);
    }).finally(() => {
        connection.disconnect();
    });
});

module.exports = router;