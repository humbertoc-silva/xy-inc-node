'use strict';

const Ajv = require('ajv');

function createAjvValidator() {
    return new Ajv({allErrors: true});
}

module.exports = function() {
    return createAjvValidator;
};