'use strict';

const express = require('express');
const modelRoutes = require('../app/routes/models');
const modelDataRoutes = require('../app/routes/model-data');
global.Promise = require('bluebird');

module.exports = function() {
    var app = express();

    app.use(express.json());
    app.use(modelRoutes);
    app.use(modelDataRoutes);
    app.use(notFoundErrorHandler);
    app.use(httpErrorHandler);
    app.use(internalServerErrorHandler)

    return app;
};

function notFoundErrorHandler(req, res, next) {
    handleHttpError(res, 404, 'Not Found');
}

function httpErrorHandler(err, req, res, next) {
    (err.status) ? handleHttpError(res, err.status, err.message) : next(err);
}
function internalServerErrorHandler(err, req, res, next) {
    if (res.headersSent) {
        return next(err)
    }

    console.error(err.stack);
    handleHttpError(res, 500, "An unexpected error occured, please try later.");
}

function handleHttpError(res, status, errorMessage) {
    res.status(status).json({message: errorMessage});
}