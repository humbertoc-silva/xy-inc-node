"use strict";

//const http = require('http');
const app = require('./config/express')();
const port = 8080;

//app.server = http.createServer(app);

app.listen(port, function() {
    console.log('Server listening on port %s', port);
});

module.exports = app;