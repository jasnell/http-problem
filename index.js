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
var Buffer = require('buffer').Buffer;
var Readable = require('stream').Readable;

function Problem() {}
Problem.prototype = {
  toJSON: function() {
    var ret = {};
    var current = this;
    while(current && current instanceof Problem) {
      var keys = Object.keys(current);
      for (var n = 0; n < keys.length; n++) {
        ret[keys[n]] = ret[keys[n]] || current[keys[n]];
      }
      current = Object.getPrototypeOf(current);
    }
    return ret;
  },
  toString: function(space) {
    return JSON.stringify(this,null,space);
  },
  valueOf: function() {
    return this.type;
  },
  'throw': function() {
    var msg = this.type;
    if (this.title)
      msg = this.title + ' <' + msg + '>';
    if (this.status)
      msg += ' [' + this.status + ']';
    if (this.detail)
      msg += ': ' + this.detail;
    var err = new Error(msg);
    err.problem = this;
    throw err;
  },
  inspect: function() {
    return this.toString(2);
  },
  send: function(res,space) {
    res.status(this.status || 500);
    res.set({
      'Content-Type': 'application/problem+json'
    });
    res.end(this.toString(space),'utf-8');
  }
};

var default_titles = {
200: 'OK',
201: 'Created',
202: 'Accepted',
203: 'Non-Authoritative Information',
204: 'No Content',
205: 'Reset Content',
206: 'Partial Content',
207: 'Multi-Status',
208: 'Already Reported',
226: 'IM Used',
300: 'Multiple Choices',
301: 'Moved Permanently',
302: 'Found',
303: 'See Other',
304: 'Not Modified',
305: 'Use Proxy',
307: 'Temporary Redirect',
308: 'Permanent Redirect',
400: 'Bad Request',
401: 'Unauthorized',
402: 'Payment Required',
403: 'Forbidden',
404: 'Not Found',
405: 'Method Not Allowed',
406: 'Not Acceptable',
407: 'Proxy Authentication Required',
408: 'Request Timeout',
409: 'Conflict',
410: 'Gone',
411: 'Length Required',
412: 'Precondition Failed',
413: 'Payload Too Large',
414: 'URI Too Long',
415: 'Unsupported Media Type',
416: 'Range Not Satisfiable',
417: 'Expectation Failed',
422: 'Unprocessable Entity',
423: 'Locked',
424: 'Failed Dependency',
426: 'Upgrade Required',
428: 'Precondition Required',
429: 'Too Many Requests',
431: 'Request Header Fields Too Large',
500: 'Internal Server Error',
501: 'Not Implemented',
502: 'Bad Gateway',
503: 'Service Unavailable',
504: 'Gateway Timeout',
505: 'HTTP Version Not Supported',
506: 'Variant Also Negotiates',
507: 'Insufficient Storage',
508: 'Loop Detected',
510: 'Not Extended',
511: 'Network Authentication Required'
};

definitions = {};
definitions['about:blank'] = define('about:blank');

function create(type, title, status) {
  var props = {
    type: {
      enumerable: true,
      configurable: false,
      value: type
    }
  };
  if (title || (status && default_titles[status])) {
    props.title = {
      enumerable: true,
      configurable: false,
      value: title || default_titles[status]
    };
  }
  if (status) {
    props.status = {
      enumerable: true,
      configurable: false,
      value: status
    };
  }
  return Object.create(new Problem(title||type), props);
}

function define(type, title, status) {
  var def = definitions[type] = create(type,title,status);
  return def;
};

exports.define = function(type, title, status) {
  if (type === 'about:blank') 
    throw new Error('Cannot define "about:blank" as a problem');
  if (typeof title === 'number') {
    status = title;
    title = default_titles[status];
  }
  define(type,title,status);
  return this;
}

exports.raise = function(type, options) {
  var _type = typeof type;
  if (_type === 'object') {
    options = type;
    type = undefined;
  } else if (_type === 'number') {
    options = {status:type};
    type = undefined;
  }
  type = type || 'about:blank';
  options = options || {};
  var def = definitions[type] || create(type, options.title, options.status);
  var props = {};
  if (options.instance) {
    props.instance = {
      enumerable:true,
      value: options.instance
    };
  }
  if (options.detail) {
    props.detail = {
      enumerable:true,
      value: options.detail
    };
  }
  if (options.status) {
    props.status = {
      enumerable: true,
      value: options.status
    }
  }
  if (!options.title && type === 'about:blank' && options.status && default_titles[options.status]) {
    props.title = {
      enumerable:true,
      value: default_titles[options.status]
    };
  } else if (options.title) {
    props.title = {
      enumerable: true,
      value: options.title
    };
  }
  return Object.create(def,props);
};

exports.send = function(res, type, options) {
  exports.raise(type, options).send(res);
};

exports.throw = function(type, options) {
  exports.raise(type, options).throw();
};

function attempt(fn,arguments,callback) {
  if (typeof callback !== 'function')
    throw new Error('A callback function MUST be provided');
  try {
    var ret = fn.apply(fn,arguments);
    callback(null,ret);
  } catch (err) {
    callback(err);
  }
}

exports.parse = function(input, callback) {
  if (typeof callback !== 'function')
    throw new Error('A callback function MUST be provided');

  var complete = function(input) {
    var _type = typeof input;
    if (_type === 'string' || input instanceof Buffer) {
      attempt(JSON.parse,[input],function(err,res) {
        if (err) {
          callback(err);
          return;
        }
        callback(null,exports.raise(res.type,res));
      });
    } else if (_type === 'object') {
      callback(null,exports.raise(input.type,input));
    } else return parse(input.toString(), callback); // last ditch attempt
  }

  if (!input) return null;
  if (input instanceof Readable) {
    var data = '';
    input.on('end', function() {
      complete(data);
    });
    input.on('data', function(chunk) {
      if (chunk) data += chunk;
    });
  } else {
    complete(input);
  }
};

exports.middleware = function(err, req, res, next) {
  if (err.problem) {
    err.problem.send(res);
  } else {
    problem.send(res, {status:500,detail:err.message});
  }
};
