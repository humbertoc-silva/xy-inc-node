#!/bin/bash
curl  -u Administrator:password -v -X POST http://172.17.0.3:8091/nodes/self/controller/settings \
  -d 'data_path=%2Fopt%2Fcouchbase%2Fvar%2Flib%2Fcouchbase%2Fdata& \
  index_path=%2Fopt%2Fcouchbase%2Fvar%2Flib%2Fcouchbase%2Fdata'

# Define RAM server quota
curl  -u Administrator:password -v -X POST http://172.17.0.3:8091/pools/default \
  -d 'memoryQuota=1024'

# Rename Node
curl  -u Administrator:password -v -X POST http://172.17.0.3:8091/node/controller/rename \
  -d 'hostname=127.0.0.1'

# Setup Services
curl  -u Administrator:password -v -X POST http://172.17.0.3:8091/node/controller/setupServices \
  -d 'services=kv%2Cn1ql%2Cindex%2Cfts'

# Setup Administrator username and password
curl  -u Administrator:password -v -X POST http://172.17.0.3:8091/settings/web \
  -d 'password=password&username=Administrator&port=SAME'

# Setup Bucket
curl  -u Administrator:password -v -X POST -d flushEnabled=1 -d threadsNumber=3 -d replicaIndex=0 -d replicaNumber=0 -d evictionPolicy=valueOnly -d ramQuotaMB=256 -d bucketType=couchbase -d name=model_definition -d authType=sasl http://172.17.0.3:8091/pools/default/buckets
curl  -u Administrator:password -v -X POST -d flushEnabled=1 -d threadsNumber=3 -d replicaIndex=0 -d replicaNumber=0 -d evictionPolicy=valueOnly -d ramQuotaMB=256 -d bucketType=couchbase -d name=model -d authType=sasl http://172.17.0.3:8091/pools/default/buckets
curl  -u Administrator:password -v -X POST -d flushEnabled=1 -d threadsNumber=3 -d replicaIndex=0 -d replicaNumber=0 -d evictionPolicy=valueOnly -d ramQuotaMB=256 -d bucketType=couchbase -d name=model_data -d authType=sasl http://172.17.0.3:8091/pools/default/buckets

# Setup Index Bucket
curl -u Administrator:password -X POST  http://172.17.0.3:8091/settings/indexes \
  -d 'indexerThreads=0' -d 'logLevel=info' -d 'maxRollbackPoints=5' -d 'memorySnapshotInterval=200' -d 'stableSnapshotInterval=5000' -d 'storageMode=forestdb' 
