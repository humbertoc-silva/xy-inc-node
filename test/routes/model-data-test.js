'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../server');
const should = chai.should();
const connectionFactory = require('../../app/database/connection-factory');
const ModelRepository = require('../../app/database/model-repository');
const ModelDataRepository = require('../../app/database/model-data-repository');
const MODEL_BUCKET = 'model';
const MODEL_DATA_BUCKET = 'model_data';

chai.use(chaiHttp);

describe('Model Data', () => {
    let modelConnection;
    let modelRepository;
    let modelDataConnection;
    let modelDataRepository;

    let carModel = 'car';
    let carData = {
        id: 1,
        model: "Fox",
        color: "Preto"
    };
    let invalidCarData = {
        id: "invalid",
        model: "Fox",
        color: "Preto"
    };

    before((done) => {
        modelConnection = connectionFactory.create(MODEL_BUCKET);
        modelRepository = new ModelRepository(modelConnection);
        
        modelRepository.upsert(carModel, {
             "id": {
                 "type": "integer"	
             },
             "model": {
                 "type": "string" 
             },
             "color": {
                 "type": "string"
             }
        }).then(() => {
            modelDataConnection = connectionFactory.create(MODEL_DATA_BUCKET);
            modelDataRepository = new ModelDataRepository(modelDataConnection);
            done();
        });
    });

    afterEach((done) => {
        modelDataRepository.delete(`${carModel}/${carData.id}`).then(() => {
            done();
        }).catch(() => {
            done();
        });
    });

    after((done) => {
        modelRepository.delete(carModel).finally(() => {
             modelConnection.disconnect();
             modelDataConnection.disconnect();
             done();
        });
    });

    describe('POST /model-data/:model', () => {
        it('should create a car', (done) => {
            chai.request(server)
            .post(`/model-data/${carModel}`)
            .send(carData)
            .end((err, res) => {
                res.should.has.a.status(201);
                res.body.should.deep.be.equal(carData);
                done();
            });
        });

        it('should not create a duplicated car', (done) => {
            modelDataRepository.create(`${carModel}/${carData.id}`, carData).then(() => {
                chai.request(server)
                .post(`/model-data/${carModel}`)
                .send(carData)
                .end((err, res) => {
                    res.should.has.a.status(409);
                    res.body.should.has.a.property('message');
                    res.body.message.should.be.equal('The resource already exists');
                    
                    done();
                });
            });
        });

        it('should not create a car with an invalid model data schema', (done) => {
            chai.request(server)
            .post(`/model-data/${carModel}`)
            .send(invalidCarData)
            .end((err, res) => {
                res.should.has.status(400);
                res.body.message.should.include('Errors');
                
                done();
            });
        });

        it('should not create a car with a model that does not exists', (done) => {
            chai.request(server)
            .post('/model-data/cars')
            .send(carData)
            .end((err, res) => {
                res.should.has.a.status(404);
                res.body.should.has.a.property('message');
                res.body.message.should.be.equal('Resource not found');
                
                done();
            });
        });
    });
    
    describe('GET /model-data/:model', () => {
        it('should get all cars', (done) => {
            // Delay this so that the Couchbase is able to index de document before the query.
            modelDataRepository.create(`${carModel}/${carData.id}`, carData).delay(1000).then(() => {
                chai.request(server)
                .get(`/model-data/${carModel}`)
                .end((err, res) => {
                    res.should.has.a.status(200);
                    res.body.should.be.a('array');
                    res.body.should.has.lengthOf(1);
                    res.body[0].should.deep.be.equal(carData);
                    
                    done();
                });
            });
        });

        it('should not get all cars with a model that does not exists', (done) => {
            chai.request(server)
            .get('/model-data/cars')
            .end((err, res) => {
                res.should.has.a.status(404);
                res.body.should.has.a.property('message');
                res.body.message.should.be.equal('Resource not found');
                
                done();        
            });
        });
    });

    describe('GET /model-data/:model/:id', () => {
        it('should get a car by id', (done) => {
            modelDataRepository.create(`${carModel}/${carData.id}`, carData).then(() => {
                chai.request(server)
                .get(`/model-data/${carModel}/${carData.id}`)
                .end((err, res) => {
                    res.should.has.a.status(200);
                    res.body.should.be.a('object');
                    res.body.should.deep.be.equal(carData);
                    
                    done();        
                });
            });
        });

        it('should not get a car by id with a model that does not exists', (done) => {
            chai.request(server)
            .get(`/model-data/cars/${carData.id}`)
            .end((err, res) => {
                res.should.has.a.status(404);
                res.body.should.has.a.property('message');
                res.body.message.should.be.equal('Resource not found');
                
                done();        
            });
        });

        it('should not get a car by id with an id that does not exists', (done) => {
            chai.request(server)
            .delete(`/model-data/${carModel}/2`)
            .end((err, res) => {
                res.should.has.a.status(404);
                res.body.should.has.a.property('message');
                res.body.message.should.be.equal('Resource not found');
                
                done();        
            });
        });
    });

    describe('PUT /model-data/:model/:id', () => {
        it('should update a car', (done) => {
            modelDataRepository.create(`${carModel}/${carData.id}`, carData).then(() => {
                carData.color = 'Branco';
                
                chai.request(server)
                .put(`/model-data/${carModel}/${carData.id}`)
                .send(carData)
                .end((err, res) => {
                    res.should.has.a.status(200);
                    res.body.should.be.a('object');
                    res.body.color.should.be.equal('Branco');
                    
                    done();        
                });
            });
        });

        it('should not update a car with an invalid model data schema', (done) => {
            chai.request(server)
            .put(`/model-data/${carModel}/${carData.id}`)
            .send(invalidCarData)
            .end((err, res) => {
                res.should.has.status(400);
                res.body.message.should.include('Errors');
                
                done();
            });
        });

        it('should not update a car with a model that does not exists', (done) => {
            chai.request(server)
            .put(`/model-data/cars/${carData.id}`)
            .send(carData)
            .end((err, res) => {
                res.should.has.a.status(404);
                res.body.should.has.a.property('message');
                res.body.message.should.be.equal('Resource not found');
                
                done();        
            });
        });

        it('should not update a car with an id that does not exists', (done) => {
            chai.request(server)
            .put(`/model-data/${carModel}/2`)
            .send(carData)
            .end((err, res) => {
                res.should.has.a.status(404);
                res.body.should.has.a.property('message');
                res.body.message.should.be.equal('Resource not found');
                
                done();        
            });
        });
    });

    describe('DELETE /model-data/:model/:id', () => {
        it('should delete a car', (done) => {
            modelDataRepository.create(`${carModel}/${carData.id}`, carData).then(() => {
                chai.request(server)
                .delete(`/model-data/${carModel}/${carData.id}`)
                .end((err, res) => {
                    res.should.has.a.status(200);
                    res.body.should.has.a.property('message');
                    res.body.message.should.be.equal('Resource successfuly deleted');
                    
                    done();        
                });
            });
        });

        it('should not delete a car with a model that does not exists', (done) => {
            chai.request(server)
            .delete(`/model-data/cars/${carData.id}`)
            .end((err, res) => {
                res.should.has.a.status(404);
                res.body.should.has.a.property('message');
                res.body.message.should.be.equal('Resource not found');
                
                done();        
            });
        });

        it('should not delete a car with an id that does not exists', (done) => {
            chai.request(server)
            .delete(`/model-data/${carModel}/2`)
            .end((err, res) => {
                res.should.has.a.status(404);
                res.body.should.has.a.property('message');
                res.body.message.should.be.equal('Resource not found');
                
                done();        
            });
        });
    });
});