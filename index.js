/**
 * Copyright(c) 2015 James M Snell <jasnell@gmail.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 **/
'use strict';
var url = require('url');
var util = require('util');
var http = require('http-status');
var prefix = 'http://www.iana.org/assignments/http-status-codes#';

function absolute(uri) {
  var res = url.parse(uri);
  return res.protocol !== undefined && res.protocol !== null;
}

function constant(target,name,value,hidden) {
  var def = {
    configurable: false,
    enumerable: value !== undefined && !hidden,
    value: value
  };
  Object.defineProperty(target,name, def);
}

var statusDef = {
  configurable: false,
  enumerable: true,
  get: function () {
    return this[_status];
  },
  set: function (val) {
    if (val === undefined || val === null)
      delete this[_status];
    else {
      val = parseInt(val);
      if (isNaN(val) ||
          val < 200 ||
          val > 999) {
        throw new TypeError('Status must be a valid HTTP Error Status Code');
      }
      this[_status] = val;
    }
  }
};

function ProblemType(type, title, options) {
  options = options || {};
  options.ins = options.ins || Problem;
  if (!(this instanceof ProblemType))
    return new ProblemType(type,title);
  if (!absolute(type)) {
    throw new TypeError('type must be an absolute URI');
  }
  constant(this,'type',type);
  if (title) {
    constant(this,'title',String(title));
  }
  constant(this,'instance',options.ins);
  if (options.status !== undefined)
    this.status = options.status;
}
ProblemType.prototype = {
  toString: function() {
    var ret = this.type;
    if (this.title) {
      ret += ' [' + this.title + ']';
    }
    return ret;
  },
  valueOf: function() {
    return this.type;
  },
  raise : function(options) {
    var ins = this.instance;
    return new ins(this, options);
  },
  throw : function(options) {
    throw this.raise(options);
  }
};
Object.defineProperty(ProblemType.prototype, 'status', statusDef);

var registeredTypes = {};
function registerProblemType(type, title) {
  if (type instanceof ProblemType) {
    if (registeredTypes[type.type]) return false;
    constant(registeredTypes,type.type,type);
  } else if (typeof type === 'string' ) {
    if (registeredTypes[type]) return false;
    constant(registeredTypes,type,new ProblemType(type,title));
    return true;
  } else {
    throw new TypeError('Not a valid problem type');
  }
}
function lookupProblemType(type) {
  return registeredTypes[type];
}

function toProblemType(type) {
  if (!type) {
    return undefined;
  } else if (type instanceof ProblemType) {
    return type;
  } else if (typeof type === 'string') {
    return lookupProblemType(type) || new ProblemType(type);
  }
  else {
    throw new TypeError('type must be a string or Problem.Type');
  }
}

var _status = Symbol('status');
var _detail = Symbol('detail');
var _instance = Symbol('instance');

function Problem(type,options) {
  if (!(this instanceof Problem))
    return new Problem(type,options);
  options = options || {};
  var ptype = toProblemType(type) || Problem.BLANK;
  Error.captureStackTrace(this, this.constructor);
  constant(this,'name', 'HTTP-Problem',true);
  constant(this,'message',ptype.toString(),true);
  constant(this,'type',ptype.type);
  constant(this,'title',options.title || ptype.title);
  if (options.status !== undefined && options.status !== null) {
    options.status = parseInt(options.status);
    if (isNaN(options.status) ||
        options.status < 200 ||
        options.status > 999) {
      throw new TypeError('Status must be a valid HTTP Error Status Code');
    }
  }
  for (var key in options) {
    if (key === 'status')
      this.status = options.status;
    else if (key === 'detail')
      this.detail = options.detail;
    else if (key === 'instance')
      this.instance = options.instance;
    else if (key === 'type' || key === 'title') {
      continue;
    }
    else
      this.constant(key, options[key]);
  }
  if (!this.status && ptype.status) this.status = ptype.status;
}
util.inherits(Problem,Error);
Problem.prototype.toJSON = function() {
  var obj = {};
  for (var key in this) {
    obj[key] = this[key];
  }
  return obj;
};
Problem.prototype.send = function(res) {
  var status = this.status || 400;
  res.setHeader('Content-Type', 'application/problem+json');
  res.status(status).json(this);
};

Problem.prototype.constant = function(name,value) {
  constant(this,name,value);
  return this;
};

function property(target,name,getter,setter) {
  Object.defineProperty(target,name,{
    configurable: false,
    enumerable: true,
    get: getter,
    set: setter
  });
}

Object.defineProperty(Problem.prototype, 'status', statusDef);
Object.defineProperty(Problem.prototype, 'detail', {
  configurable: false,
  enumerable: true,
  get: function () {
    return this[_detail];
  },
  set: function (val) {
    if (val === undefined || val === null)
      delete this[_detail];
    else {
      this[_detail] = String(val);
    }
  }
});
Object.defineProperty(Problem.prototype, 'instance', {
  configurable: false,
  enumerable: true,
  get: function () {
    return this[_instance];
  },
  set: function (val) {
    if (val === undefined || val === null)
      delete this[_instance];
    else {
      this[_instance] = String(val);
    }
  }
});

function create() {
  var func = function CustomProblem(type,options) {
    if (!(this instanceof CustomProblem))
      return new CustomProblem(options);
    Problem.call(this,type,options);
  };
  util.inherits(func,Problem);
  return func;
}

function forCode(code) {
  return lookupProblemType(prefix + code);
}

function wrap(obj) {
  if (!obj) return undefined;
  if (typeof obj === 'string') {
    obj = JSON.parse(obj);
  }
  var type = obj.type;
  if (type === null) {
    throw new TypeError('type must be specified');
  }
  var ptype = lookupProblemType(type) ||
    new ProblemType(type,obj.title);
  return new Problem(ptype,obj);
}

constant(Problem,'create',create);
constant(Problem,'registerProblemType',registerProblemType);
constant(Problem,'lookupProblemType',lookupProblemType);
constant(Problem,'Type',ProblemType);
constant(Problem,'Blank',new ProblemType('about:blank'));
constant(Problem,'forStatus', forCode);
constant(Problem,'wrap', wrap);

Problem.registerProblemType(Problem.Blank);

for (var key in http) {
  if (isNaN(key)) {
    var code = http[key];
    if (code >= 200) {
      var type =
        new ProblemType(
          prefix + code,
          http[code], {status: code});
      constant(Problem, key, type);
      Problem.registerProblemType(type);
    }
  }
}

function middleware(err,req,res,next) {
  if (err instanceof Problem) {
    err.send(res);
  } else {
    next();
  }
}
constant(Problem, 'middleware', middleware);

module.exports = Problem;
