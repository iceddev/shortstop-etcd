'use strict';

const _ = require('lodash');
const json5 = require('json5');
const EtcdClient = require('node-etcd');

function parse(value){
  try {
    return json5.parse(value);
  } catch(err){
    return value;
  }
}

function listing(result){
  const nodes = _.get(result, 'node.nodes');
  const items = _.pluck(nodes, 'value');
  const value = _.map(items, parse);
  return value;
}

function shortstopEtcd(...args){
  const etcd = new EtcdClient(...args);

  function etcdHandler(key, cb){
    etcd.get(key, (err, result) => {
      if(err){
        cb(err);
        return;
      }

      if(result.dir === true){
        const value = listing(result);
        cb(null, value);
        return;
      }

      const value = parse(result.node.value);

      cb(null, value);
    });
  }

  return etcdHandler;
}

module.exports = shortstopEtcd;
