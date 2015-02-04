Provides a simple implementation of the HTTP Problem Spec

```bash
npm install http-problem
```

Nothing really all that fancy here. There are a few ways to create a problem object:

The following creates a simple default problem for an HTTP status code
```json
var problem = require('http-problem');

var p = problem.raise(400); // pass-in http status code
```

You can define then raise your own problem types:
```json
problem.define('http://example.org/foo','Validation Problem',400);

var p = problem.raise('http://example.org/foo');
```

You can provide additional detail:
```json
var p = problem.raise({status:404, detail: 'the file is missing', instance: 'http://example.org/foo'});
p.custom = 'extension-property';
```

Then, once you're ready to go, you can either throw using `p.throw()` or use the `send` method with express
```json
var problem = require('http-problem');

var express = require('express')
var app = express()

app.get('/', function (req, res) {

  problem.raise({status:404,detail:req.url}).throw();

})

app.use(function(err, req, res, next) {
  if (err.problem) {
    err.problem.send(res);
  } else {
    problem.send(res, {status:500,detail:err.message});
  }
});

var server = app.listen(3000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)
})
```