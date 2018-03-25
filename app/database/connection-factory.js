'use strict';

const couchbase = require("couchbase");

class ConnectionFactory {

    constructor() {
        this._cluster = new couchbase.Cluster('couchbase://172.17.0.3');
    }

    create(bucketName) {
        let bucket = this._cluster.openBucket(bucketName);
        return Promise.promisifyAll(bucket);
    }
}

let connectionFactory = new ConnectionFactory();
module.exports = connectionFactory;
