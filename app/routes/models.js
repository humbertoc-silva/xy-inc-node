'use strict';

const MODEL_DEFINITION_BUCKET = 'model_definition';
const KEY_ALREADY_EXISTS = 12;
const KEY_NOT_FOUND = 13;

function getConnection(app) {
    return new app.persistence.ConnectionFactory().create(MODEL_DEFINITION_BUCKET);
}

function getRepository(app, connection) {
    return new app.persistence.ModelDefinitionRepository(connection);
}

module.exports = function(app) {
    
    app.post('/models', app.validators.modelDefinitionValidator, function(req, res, next) {
        var modelDefinition = req.body;
        var connection = getConnection(app);
        var repository = getRepository(app, connection);
        
        repository.create(modelDefinition)
        .then((modelDefinitionPersisted) => {
            res.status(201).json(modelDefinitionPersisted.value);
            connection.disconnect();
        }).catch((err) => {
            next(err);
            connection.disconnect();
        });
    })

    app.get('/models', function(req, res, next) {
        res.json({ 'message': 'recovery all' });
    });

    app.get('/models/schema', function(req, res, next) {
        res.json(app.schemas.model);
    });
    
    app.get('/models/:id', function(req, res, next) {
        var id = req.params.id;
        var connection = getConnection(app);
        var repository = getRepository(app, connection);

        repository.findById(id)
        .then((modelDefinition) => {
            res.status(200).json(modelDefinition.value);
            connection.disconnect();
        }).catch((err) => {
            next(err);
            connection.disconnect();
        });
    });

    app.put('/models/:id',
        app.validators.modelDefinitionValidator,
        app.validators.modelNameValidator, function(req, res, next) {
        
        var id = req.params.id;
        var modelDefinition = req.body;
        var connection = getConnection(app);
        var repository = getRepository(app, connection);

        repository.update(id, modelDefinition)
        .then((modelDefinitionUpdated) => {
            res.status(200).json(modelDefinitionUpdated.value);
            connection.disconnect();
        }).catch((err) => {
            next(err);
            connection.disconnect();
        });
    });

    app.delete('/models/:id', function(req, res, next) {
        var id = req.params.id;
        var connection = getConnection(app);
        var repository = getRepository(app, connection);

        repository.delete(id).then(() => {
            res.status(200).json({message: `Model ${    id} deleted successfuly.`});
            connection.disconnect();
        }).catch((err) => {
            next(err);
            connection.disconnect();
        });
    });
};