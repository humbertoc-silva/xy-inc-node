'use strict';

const router = require('express').Router();
const modelDataWriteValidator = require('../middlewares/validators/model-data-write-validator');
const modelDataReadValidator = require('../middlewares/validators/model-data-read-validator');
const connectionFactory = require('../database/connection-factory');
const ModelDataRepository = require('../database/model-data-repository');

const MODEL_DATA_BUCKET = 'model_data';

function getConnection() {
    return connectionFactory.create(MODEL_DATA_BUCKET);
}

function getRepository(connection) {
    return new ModelDataRepository(connection);
}

// TODO: Adicionar um middleware para validar o schema da model.
router.post('/model-data/:model', modelDataWriteValidator, function(req, res, next) {
    let data = req.body;
    let model = req.params.model;
    let connection = getConnection();
    let repository = getRepository(connection);
    
    repository.create(`${model}/${data.id}`, data)
    .then((dataPersisted) => {
        res.status(201).json(dataPersisted.value);
    }).catch((err) => {
        next(err);
    }).finally(() => {
        connection.disconnect();
    });
});

router.get('/model-data/:model', modelDataReadValidator, function(req, res, next) {
    let model = req.params.model;
    let connection = getConnection();
    let repository = getRepository(connection);

    repository.findAll(model)
    .then((dataList) => {
        res.status(200).json(dataList.map((item) => {
            return item.model_data;
        }));
    }).catch((err) => {
        next(err);
    }).finally(() => {
        connection.disconnect();
    });
});

router.get('/model-data/:model/:id', modelDataReadValidator, function(req, res, next) {
    let model = req.params.model;
    let id = req.params.id;
    let connection = getConnection();
    let repository = getRepository(connection);

    repository.findById(`${model}/${id}`)
    .then((data) => {
        res.status(200).json(data.value);
    }).catch((err) => {
        next(err);
    }).finally(() => {
        connection.disconnect();
    });
});

// TODO: Adicionar um middleware para validar o schema da model sem o id.
router.put('/model-data/:model/:id', modelDataWriteValidator, function(req, res, next) {
    let model = req.params.model;
    let id = req.params.id;
    let data = req.body;
    let connection = getConnection();
    let repository = getRepository(connection);

    repository.update(`${model}/${id}`, data)
    .then((dataUpdated) => {
        res.status(200).json(dataUpdated.value);
    }).catch((err) => {
        next(err);
    }).finally(() => {
        connection.disconnect();
    });
});

router.delete('/model-data/:model/:id', modelDataReadValidator, function(req, res, next) {
    let model = req.params.model;
    let id = req.params.id;
    let connection = getConnection();
    let repository = getRepository(connection);

    repository.delete(`${model}/${id}`).then(() => {
        res.status(200).json({message: 'Resource successfuly deleted'});
    }).catch((err) => {
        next(err);
    }).finally(() => {
        connection.disconnect();
    });
});

module.exports = router;