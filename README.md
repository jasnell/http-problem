Provides a simple implementation of the HTTP Problem Spec (JSON format only)

See: https://tools.ietf.org/html/draft-ietf-appsawg-http-problem

```bash
npm install http-problem
```

Nothing really all that fancy here. There are a few ways to create a problem object:

The following creates a simple default problem for an HTTP status code
```javascript
var problem = require('http-problem');

var p = problem.raise(400); // pass-in http status code
```

You can define then raise your own problem types:
```javascript
problem.define('http://example.org/foo','Validation Problem',400);

var p = problem.raise('http://example.org/foo');
```

You can provide additional detail:
```javascript
var p = problem.raise({status:404, detail: 'the file is missing', instance: 'http://example.org/foo'});
p.custom = 'extension-property';
```

Then, once you're ready to go, you can either throw using `p.throw()` or use the `send` method with express
```javascript
var problem = require('http-problem');
var express = require('express')
var app = express()

app.use(problem.middleware);

app.get('/', function (req, res) {
  problem.throw({status:404,detail:req.url});
})

var server = app.listen(3000, function () {
  var host = server.address().address
  var port = server.address().port
  console.log('Example app listening at http://%s:%s', host, port)
})
```

Use the `problem.parse` method to parse out a received problem:

```javascript
var problem = require('http-problem');

problem.parse(
  '{"type": "http://example.org", "status": 123}',
  function(err, p) {
    console.log(p);
  });

var Buffer = require('buffer').Buffer;
var buf = new Buffer('{"type": "http://example.org", "status": 123}', 'utf-8');
problem.parse(
  buf,
  function(err, p) {
    console.log(p);
  });

var readable = //... a readable stream
problem.parse(
  readable,
  function(err, p) {
    console.log(p);
  });
```


