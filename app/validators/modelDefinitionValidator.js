'use strict';

module.exports = function(app) {
    return function(req, res, next) {
        var ajv = app.schemas.ajvValidator();
        var schema = app.schemas.model;
        var isValid = ajv.validate(schema, req.body);        

        if (!isValid) {
            var message = "The model definition is invalid. Errors: " + ajv.errorsText(ajv.errors);
            var err = new Error(message);
            err.status = 400;
            next(err);
            return;
        }
            
        next();
    }
};