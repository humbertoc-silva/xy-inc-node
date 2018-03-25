'use strict';

module.exports = function(req, res, next) {
    let id = req.params.id;
    let bodyId = req.body.modelName;

    if (id != bodyId) {
        var invalidModelNameError = new Error('Changing modelName on updates is not allowed');
        invalidModelNameError.status = 422;
        next(invalidModelNameError);
        return;
    }

    next();
};