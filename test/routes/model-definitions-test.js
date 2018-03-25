'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../server');
const should = chai.should();
const connectionFactory = require('../../app/database/connection-factory');
const ModelDefinitionRepository = require('../../app/database/model-definition-repository');
const MODEL_DEFINITION_BUCKET = 'model_definition';

chai.use(chaiHttp);

describe('Model Definitions', () => {
    let connection;
    let repository;

    before(() => {
        connection = connectionFactory.create(MODEL_DEFINITION_BUCKET);
        repository = new ModelDefinitionRepository(connection);
    });

    afterEach((done) => {
        repository.delete('Car').then(() => {
            done();
        }).catch(() => {
            done();
        });
    });

    after(() => {
        connection.disconnect();
    });
    
    describe('GET /model-definitions/schema', () => {
        it('should get the model schema', (done) => {
            chai.request(server)
            .get('/model-definitions/schema')
            .end((err, res) => {
                res.should.has.a.status(200);
                res.body.should.be.a('object');
                res.body.should.has.a.property('type');
                res.body.should.has.a.property('properties');
                res.body.properties.should.has.a.property('modelName');
                res.body.properties.should.has.a.property('id');
                res.body.properties.should.has.a.property('fields');
                res.body.should.has.a.property('required');
                res.body.should.has.a.property('additionalProperties');

                done();
            });
        });
    });

    describe('POST /model-definitions', () => {
        it('should create a model definition', (done) => {
            let carModelDefinition = {
                modelName: "Car",
                id: "string",
                fields: {
                    model: "string",
                    color: "string"
                }
            };
            
            chai.request(server)
            .post('/model-definitions')
            .send(carModelDefinition)
            .end((err, res) => {
                res.should.has.a.status(201);
                res.body.should.deep.be.equal(carModelDefinition);
                done();
            });
        });

        it('should not create an invalid model schema definition', (done) => {
            let invalidCarModelDefinition = {
                name: "Car",
                id: "string",
                field: {
                    model: "string",
                    color: "string"
                }
            };
            
            chai.request(server)
            .post('/model-definitions')
            .send(invalidCarModelDefinition)
            .end((err, res) => {
                res.should.has.status(400);
                res.body.message.should.include('Errors');
                
                done();
            });
        });

        it('should not create a duplicated model schema definition', (done) => {
            let carModelDefinition = {
                modelName: "Car",
                id: "string",
                fields: {
                    model: "string",
                    color: "string"
                }
            };

            repository.create(carModelDefinition).then((modelDefinitionPersisted) => {
                chai.request(server)
                .post('/model-definitions')
                .send(carModelDefinition)
                .end((err, res) => {
                    res.should.has.a.status(409);
                    res.body.should.has.a.property('message');
                    res.body.message.should.be.equal('The resource already exists');
                    
                    done();
                });
            });
        });
    });
    
    describe('GET /model-definitions', () => {
        it('should get all model definitions', (done) => {
            let carModelDefinition = {
                modelName: "Car",
                id: "string",
                fields: {
                    model: "string",
                    color: "string"
                }
            };

            // Delay this so that the Couchbase is able to index de document before the query.
            repository.create(carModelDefinition).delay(1000).then((modelDefinitionPersisted) => {
                chai.request(server)
                .get('/model-definitions')
                .end((err, res) => {
                    res.should.has.a.status(200);
                    res.body.should.be.a('array');
                    res.body.should.has.lengthOf(1);
                    res.body[0].model_definition.should.deep.be.equal(modelDefinitionPersisted.value);
                    
                    done();
                });
            });
        });
    });

    describe('GET /model-definitions/:id', () => {
        it('should get a model definition by id', (done) => {
            let carModelDefinition = {
                modelName: "Car",
                id: "string",
                fields: {
                    model: "string",
                    color: "string"
                }
            };
            
            let connection = connectionFactory.create(MODEL_DEFINITION_BUCKET);
            let repository = new ModelDefinitionRepository(connection);
            repository.create(carModelDefinition).then((modelDefinitionPersisted) => {
                chai.request(server)
                .get('/model-definitions/Car')
                .end((err, res) => {
                    res.should.has.a.status(200);
                    res.body.should.be.a('object');
                    res.body.should.deep.be.equal(modelDefinitionPersisted.value);
                    
                    done();        
                });
            });
        });

        it('should not return a model definition with an invalid id', (done) => {
            chai.request(server)
            .get('/model-definitions/User')
            .end((err, res) => {
                res.should.has.a.status(404);
                res.body.should.has.a.property('message');
                res.body.message.should.be.equal('Resource not found');

                done();
            });
        });
    });

    describe('PUT /model-definitions/:id', () => {
        it('should update a model definition', (done) => {
            let carModelDefinition = {
                modelName: "Car",
                id: "string",
                fields: {
                    model: "string",
                    color: "string"
                }
            };
            
            repository.create(carModelDefinition).then((modelDefinitionPersisted) => {
                carModelDefinition.fields.year = 'string';
                
                chai.request(server)
                .put('/model-definitions/Car')
                .send(carModelDefinition)
                .end((err, res) => {
                    res.should.has.a.status(200);
                    res.body.should.be.a('object');
                    res.body.fields.should.has.a.property('year');
                    
                    done();        
                });
            });
        });

        it('should not update an invalid model schema definition', (done) => {
            let invalidCarModelDefinition = {
                name: "Car",
                id: "string",
                field: {
                    model: "string",
                    color: "string"
                }
            };
            
            chai.request(server)
            .put('/model-definitions/Car')
            .send(invalidCarModelDefinition)
            .end((err, res) => {
                res.should.has.status(400);
                res.body.message.should.include('Errors');
                
                done();
            });
        });

        it('should not update a model definition with a invalid name', (done) => {
            let carModelDefinition = {
                modelName: "Car",
                id: "string",
                fields: {
                    model: "string",
                    color: "string"
                }
            };
            
            chai.request(server)
            .put('/model-definitions/Cars')
            .send(carModelDefinition)
            .end((err, res) => {
                res.should.has.status(422);
                res.body.message.should.be.equal('Changing modelName on updates is not allowed');
                
                done();
            });
        });

        it('should not update a model definition with an invalid id', (done) => {
            let carModelDefinition = {
                modelName: "Car",
                id: "string",
                fields: {
                    model: "string",
                    color: "string"
                }
            };
            
            chai.request(server)
            .put('/model-definitions/Car')
            .send(carModelDefinition)
            .end((err, res) => {
                res.should.has.a.status(404);
                res.body.should.has.a.property('message');
                res.body.message.should.be.equal('Resource not found');
                
                done();        
            });
        });
    });

    describe('DELETE /model-definitions/:id', () => {
        it('should delete a model definition', (done) => {
            let carModelDefinition = {
                modelName: "Car",
                id: "string",
                fields: {
                    model: "string",
                    color: "string"
                }
            };
            
            repository.create(carModelDefinition).then((modelDefinitionPersisted) => {
                chai.request(server)
                .delete('/model-definitions/Car')
                .end((err, res) => {
                    res.should.has.a.status(200);
                    res.body.should.has.a.property('message');
                    res.body.message.should.be.equal('Model definition successfuly deleted');
                    
                    done();        
                });
            });
        });

        it('should not delete a model definition with an invalid id', (done) => {
            chai.request(server)
            .delete('/model-definitions/Car')
            .end((err, res) => {
                res.should.has.a.status(404);
                res.body.should.has.a.property('message');
                res.body.message.should.be.equal('Resource not found');
                
                done();        
            });
        });
    });
});