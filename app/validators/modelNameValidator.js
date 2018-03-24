'use strict';

module.exports = function() {
    return function(req, res, next) {
        var id = req.params.id;
        var bodyId = req.body.modelName;

        if (id != bodyId) {
            var invalidModelNameError = new Error('Changing modelName on updates is not allowed.');
            invalidModelNameError.status = 422;
            next(invalidModelNameError);
            return;
        }

        next();
    }
};