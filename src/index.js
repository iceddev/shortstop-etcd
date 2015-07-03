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

function listing(node){
  const nodes = _.get(node, 'nodes');
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

      const node = result.node;

      if(node.dir === true){
        cb(null, listing(node));
        return;
      }

      const value = parse(node.value);

      cb(null, value);
    });
  }

  return etcdHandler;
}

module.exports = shortstopEtcd;
