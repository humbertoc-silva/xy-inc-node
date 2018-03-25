'use strict';

const Ajv = require('ajv');
const modelSchema = require('../../utils/model-schema');

module.exports = function(req, res, next) {
    let ajv = new Ajv({allErrors: true});
    let isValid = ajv.validate(modelSchema, req.body);        

    if (!isValid) {
        let message = "The model definition is invalid. Errors: " + ajv.errorsText(ajv.errors);
        let err = new Error(message);
        err.status = 400;
        next(err);
        return;
    }
        
    next();
};