'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../server');
const should = chai.should();
const connectionFactory = require('../../app/database/connection-factory');
const ModelRepository = require('../../app/database/model-repository');
const MODEL_BUCKET = 'model';

chai.use(chaiHttp);

describe('Models', () => {
    let connection;
    let repository;
    let id = 'car';
    let carModel = {
        id: {
            type: "string"
        },
        model: {
            type: "string" 
        },
        color: {
            type: "string"
        }
    };

    before(() => {
        connection = connectionFactory.create(MODEL_BUCKET);
        repository = new ModelRepository(connection);
    });

    afterEach((done) => {
        repository.delete(id).then(() => {
            done();
        }).catch(() => {
            done();
        });
    });

    after(() => {
        connection.disconnect();
    });
    
    describe('GET /models/schema', () => {
        it('should get the model schema', (done) => {
            chai.request(server)
            .get('/models/schema')
            .end((err, res) => {
                res.should.has.a.status(200);
                res.body.should.be.a('object');

                done();
            });
        });
    });
    
    describe('GET /models', () => {
        it('should get all models', (done) => {
            // Delay this so that the Couchbase is able to index de document before the query.
            repository.upsert(id, carModel).delay(1000).then((modelPersisted) => {
                chai.request(server)
                .get('/models')
                .end((err, res) => {
                    res.should.has.a.status(200);
                    res.body.should.be.a('array');
                    res.body.should.has.lengthOf(1);
                    res.body[0].should.has.a.property('modelName');
                    res.body[0].modelName.should.be.equal(id);
                    
                    done();
                });
            });
        });
    });

    describe('GET /model/:id', () => {
        it('should get a model by id', (done) => {
            repository.upsert(id, carModel).then((modelPersisted) => {
                chai.request(server)
                .get(`/models/${id}`)
                .end((err, res) => {
                    res.should.has.a.status(200);
                    res.body.should.be.a('object');
                    res.body.should.deep.be.equal(modelPersisted.value);
                    
                    done();        
                });
            });
        });

        it('should not get a model with an id that does not exists', (done) => {
            chai.request(server)
            .get('/models/user')
            .end((err, res) => {
                res.should.has.a.status(404);
                res.body.should.has.a.property('message');
                res.body.message.should.be.equal('Resource not found');

                done();
            });
        });
    });

    describe('PUT /models/:id', () => {
        it('should create a model', (done) => {
            chai.request(server)
            .put(`/models/${id}`)
            .send(carModel)
            .end((err, res) => {
                res.should.has.a.status(200);
                res.body.should.be.a('object');
                res.body.should.deep.be.equal(carModel);
                
                done();        
            });
        });
        
        it('should update a model', (done) => {
            repository.upsert(id, carModel).then((modelPersisted) => {
                modelPersisted.value.year = {
                    type: 'string'
                };
                
                chai.request(server)
                .put(`/models/${id}`)
                .send(modelPersisted.value)
                .end((err, res) => {
                    res.should.has.a.status(200);
                    res.body.should.be.a('object');
                    res.body.should.has.a.property('year');
                    
                    done();        
                });
            });
        });

        it('should not create/update an invalid model schema', (done) => {
            let invalidCarModel = {
                model: {
                    type: "string" 
                },
                color: {
                    type: "string"
                }
            };
            
            chai.request(server)
            .put(`/models/${id}`)
            .send(invalidCarModel)
            .end((err, res) => {
                res.should.has.status(400);
                res.body.message.should.include('Errors');
                
                done();
            });
        });
    });

    describe('DELETE /models/:id', () => {
        it('should delete a model', (done) => {
            repository.upsert(id, carModel).then((modelPersisted) => {
                chai.request(server)
                .delete(`/models/${id}`)
                .end((err, res) => {
                    res.should.has.a.status(200);
                    res.body.should.has.a.property('message');
                    res.body.message.should.be.equal('Model successfuly deleted');
                    
                    done();        
                });
            });
        });

        it('should not delete a model with an id that does not exists', (done) => {
            chai.request(server)
            .delete(`/models/${id}`)
            .end((err, res) => {
                res.should.has.a.status(404);
                res.body.should.has.a.property('message');
                res.body.message.should.be.equal('Resource not found');
                
                done();        
            });
        });
    });
});