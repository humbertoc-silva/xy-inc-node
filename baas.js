"use strict";

const http = require('http');
const app = require('./config/express')();
const port = process.env.PORT || 8080;

app.server = http.createServer(app);

app.server.listen(port, function() {
    console.log('Server listening on port %s', port);
});