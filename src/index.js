'use strict';

const json5 = require('json5');
const EtcdClient = require('node-etcd');

function parse(value){
  try {
    return json5.parse(value);
  } catch(err){
    return value;
  }
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
        cb(new Error(`Path "${key}" is a directory`));
        return;
      }

      const value = parse(result.node.value);

      cb(null, value);
    });
  }

  return etcdHandler;
}

module.exports = shortstopEtcd;
