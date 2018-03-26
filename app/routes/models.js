'use strict';

const router = require('express').Router();
const connectionFactory = require('../database/connection-factory');
const ModelRepository = require('../database/model-repository');
const modelValidator = require('../middlewares/validators/model-validator');
const modelSchema = require('../utils/model-schema');

const MODEL_BUCKET = 'model';

function getConnection() {
    return connectionFactory.create(MODEL_BUCKET);
}

function getRepository(connection) {
    return new ModelRepository(connection);
}

router.get('/models/schema', function(req, res, next) {
    res.json(modelSchema);
});

router.get('/models', function(req, res, next) {
    let connection = getConnection();
    let repository = getRepository(connection);

    repository.findAll()
    .then((modelList) => {
        res.status(200).json(modelList.map((item) => {
            item.model.modelName = item.modelName;
            return item.model;
        }));
    }).catch((err) => {
        next(err);
    }).finally(() => {
        connection.disconnect();
    });
});

router.get('/models/:id', function(req, res, next) {
    let id = req.params.id;
    let connection = getConnection();
    let repository = getRepository(connection);

    repository.findById(id)
    .then((model) => {
        res.status(200).json(model.value);
    }).catch((err) => {
        next(err);
    }).finally(() => {
        connection.disconnect();
    });
});

router.put('/models/:id', modelValidator, function(req, res, next) {
    let id = req.params.id;
    let model = req.body;
    let connection = getConnection();
    let repository = getRepository(connection);

    repository.upsert(id, model)
    .then((modelPersisted) => {
        res.status(200).json(modelPersisted.value);
    }).catch((err) => {
        next(err);
    }).finally(() => {
        connection.disconnect();
    });
});

router.delete('/models/:id', function(req, res, next) {
    let id = req.params.id;
    let connection = getConnection();
    let repository = getRepository(connection);

    repository.delete(id).then(() => {
        res.status(200).json({message: 'Model successfuly deleted'});
    }).catch((err) => {
        next(err);
    }).finally(() => {
        connection.disconnect();
    });
});

module.exports = router;