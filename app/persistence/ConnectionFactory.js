'use strict';

const couchbase = require("couchbase");

class ConnectionFactory {

    constructor() {
        this._cluster = new couchbase.Cluster('couchbase://172.17.0.3');
    }

    create(bucketName) {
        var bucket = this._cluster.openBucket(bucketName);
        return Promise.promisifyAll(bucket);
    }
}

module.exports = function() {
    return ConnectionFactory;
}