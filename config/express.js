'use strict';

const express = require('express');
const consign = require('consign');
global.Promise = require('bluebird');

module.exports = function() {
    var app = express();

    app.use(express.json());

    consign({ cwd: 'app' })
        .include('persistence')
        .include('schemas')
        .include('validators')    
        .include('routes')
        .into(app);

    app.use(defaultNotFoundErrorHandler);
    app.use(badRequestErrorHandler);
    app.use(notFoundErrorHandler);
    app.use(conflictErrorHandler);
    app.use(unprocessableEntityErrorHandler);
    app.use(internalServerErrorHandler)

    return app;
};

function defaultNotFoundErrorHandler(req, res, next) {
    handleHttpError(res, 404, err.message);
}

function badRequestErrorHandler(err, req, res, next) {
    (err.status === 400) ? handleHttpError(res, 400, err.message) : next(err);
}

function notFoundErrorHandler(err, req, res, next) {
    (err.status === 404) ? handleHttpError(res, 404, err.message) : next(err);
}

function conflictErrorHandler(err, req, res, next) {
    (err.status === 409) ? handleHttpError(res, 409, err.message) : next(err);
}

function unprocessableEntityErrorHandler(err, req, res, next) {
    (err.status === 422) ? handleHttpError(res, 422, err.message) : next(err);
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