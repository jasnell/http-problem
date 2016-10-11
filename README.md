# HTTP-PROBLEM

Provides a simple implementation of the HTTP Problem Spec (JSON format only).

See: https://tools.ietf.org/html/draft-ietf-appsawg-http-problem

Note: Use v0.1.0 for Node v0.12.x. With v0.2.0, the code starts to make use of
newer ES6 features.

```bash
npm install http-problem
```

Nothing really all that fancy here. There are a few ways to create a problem object:

The following creates a simple default problem for an HTTP status code
```javascript
var Problem = require('http-problem');
var badrequest = Problem.BADREQUEST.raise();
throw badrequest;

```

You can define then throw your own problem types:
```javascript

var NoCreditType = new Problem.Type(
  'http://example.com/probs/out-of-credit',
  'You do not have enough credit.',
  {status:400});

NoCreditType.throw({
  detail: 'Your current balance is 30, but that costs 50.',
  instance: 'http://example.net/account/12345/msgs/abc',
  balance: 30,
  accounts: [
    'http://example.net/account/12345',
    'http://example.net/account/67890']
});
```

Standard connect middleware is provided. The middleware intercepts Problem
objects thrown as exceptions and serializes them appropriately in the HTTP
response.

```javascript
var express = require('express');
var server = express();

var router = express.Router();
router.get('/', function(req,res) {
  Problem.GONE.throw();
});
router.use(Problem.middleware);
server.use('/',router).listen(8888);
```

Use the `problem.wrap` method to parse out a received problem:

```javascript
var Problem = require('http-problem');

var obj = {
  type: 'http://example.org',
  status: 400
};

var problem = problem.wrap(obj);

// or
var str = JSON.stringify(obj);
problem = problem.wrap(str); // wrap from string
```

## API

### Constructor: `Problem([type][, options])`

Constructor for new Problem instances

 * `type` - either a Problem.Type instance or string with an absolute URL. Defaults to `Problem.BLANK` if unspecified.
   identifying the error
 * `options`
   * `status` - HTTP Status Code
   * `detail` - Human readable explanation of the problem
     that is specific to this instance.
   * `instance` - An Absolute URL identifying the specific
     occurence of the problem.

 Additional extension properties may be included as values on the `options`. When passed, these will become constant
 values on the generated Problem object

### Property: `<string> Problem.prototype.type`

Returns an absolute URL identifying the Problem type.

### Property: `<string> Problem.prototype.title`

Returns the Problem title.

### Property: `<number> Problem.prototype.status`

Returns the HTTP Status code for this problem.

### Property: `<string> Problem.prototype.detail`

Returns a human readable explanation specific to this instance of the problem.

### Property: `<string> Problem.prototype.instance`

Returns an absolute URL identifying the specific occurence of the problem.

### Method: `<void> Problem.prototype.send(res)`

Sends the Problem on the HTTP Response. The `res` parameter is
assumed to be an Express-style response object. The implementation of the `send` method is:

```
function(res) {
  var status = this.status || 400;
  res.setHeader('Content-Type', 'application/problem+json');
  res.status(status).json(this);
};
```

### Class Method: `<constructor> Problem.create()`

Create a new Problem class, allowing you to create your own Problem subclasses.

```
var MyProblem = Problem.create();
var myProblem = new MyProblem(Problem.BLANK);
myProblem.throw();
```

### Class Method: `<boolean> Problem.registerProblemType(type)`

Register a custom `Problem.Type`

```
var NoCreditType =
  new Problem.Type(
    'http://example.com/probs/out-of-credit',
    'You do not have enough credit.',
    {status:400});
Problem.registerProblemType(NoCreditType);
```

### Class Method: `<boolean> Problem.registerProblemType(uri[, title])`

Register a custom `Problem.Type`

```
Problem.registerProblemType(
  'http://example.com/probs/out-of-credit',
  'You do not have enough credit.');
```

### Class Method: `<Problem.Type> Problem.lookupProblemType(uri)`

Lookup a registered custom `Problem.Type`

### Class Method: `<Problem.Type> Problem.forStatus(status)`

Lookup the `Problem.Type` for a specific HTTP status code

### Class Method: `<Problem> Problem.wrap(obj)`

Wrap a JavaScript object as a Problem.

### Class Method: `<Problem> Problem.wrap(str)`

Parse the JSON string and wrap the resulting object as a Problem.

### Class Property: `<function> Problem.middleware`

Connect style middleware that can be used to intercept Problems thrown
as errors and serialize them correctly on an HTTP response.

```javascript
var express = require('express');
var server = express();

var router = express.Router();
router.get('/', function(req,res) {
  Problem.GONE.throw();
});
router.use(Problem.middleware);
server.use('/',router).listen(8888);
```

### Constructor: `Problem.Type(url[, title][, options])`

Creates a new `Problem.Type`.

 * `url` - The absolute URL identifying the problem type.
 * `title` - The common title of the proble.
 * `options` -
   * `status` - The default HTTP status code for problems of
     this type.
   * `ins` - The instance constructor for problems of this
     type.

```
var MyType = new Problem.Type(
  'http://example.org', 'MyProblem', {status:400});
MyType.throw();
```
### Property: `<string> Problem.Type.prototype.type`

The absolute URL identifying the problem type.

### Property: `<string> Problem.Type.prototype.title`

The common title of the problem type.

### Property: `<number> Problem.Type.prototype.status`

The default HTTP status code for problems of this type.

### Method: `<void> Problem.Type.prototype.throw([options])`

Create a new instance of this problem type and throw it as an
Error. The `options` argument is the same as the `options` for
the `Problem` constructor.

### Method: `<Problem> Problem.Type.prototype.raise([options])`

Create a new instance of this problem type and return it. The
`options` argument is the same as the `options` for the
`Problem` constructor.

### Method: `<void> Problem.Type.prototype.reject([options])`

Create a new instance of this problem type and create a rejected
Promise with the Error. The `options` argument is the same as the
`options` for the `Problem` constructor.

### Constants:

 *  `<Problem.Type> Problem.BLANK` - The `about:blank` Problem Type
 *  `<Problem.Type> Problem.OK`
 *  `<Problem.Type> Problem.CREATED`
 *  `<Problem.Type> Problem.ACCEPTED`
 *  `<Problem.Type> Problem.NON_AUTHORITATIVE_INFORMATION`
 *  `<Problem.Type> Problem.NO_CONTENT`
 *  `<Problem.Type> Problem.RESET_CONTENT`
 *  `<Problem.Type> Problem.PARTIAL_CONTENT`
 *  `<Problem.Type> Problem.MULTIPLE_CHOICES`
 *  `<Problem.Type> Problem.MOVED_PERMANENTLY`
 *  `<Problem.Type> Problem.FOUND`
 *  `<Problem.Type> Problem.SEE_OTHER`
 *  `<Problem.Type> Problem.NOT_MODIFIED`
 *  `<Problem.Type> Problem.USE_PROXY`
 *  `<Problem.Type> Problem.TEMPORARY_REDIRECT`
 *  `<Problem.Type> Problem.BAD_REQUEST`
 *  `<Problem.Type> Problem.UNAUTHORIZED`
 *  `<Problem.Type> Problem.PAYMENT_REQUIRED`
 *  `<Problem.Type> Problem.FORBIDDEN`
 *  `<Problem.Type> Problem.NOT_FOUND`
 *  `<Problem.Type> Problem.METHOD_NOT_ALLOWED`
 *  `<Problem.Type> Problem.NOT_ACCEPTABLE`
 *  `<Problem.Type> Problem.PROXY_AUTHENTICATION_REQUIRED`
 *  `<Problem.Type> Problem.REQUEST_TIMEOUT`
 *  `<Problem.Type> Problem.CONFLICT`
 *  `<Problem.Type> Problem.GONE`
 *  `<Problem.Type> Problem.LENGTH_REQUIRED`
 *  `<Problem.Type> Problem.PRECONDITION_FAILED`
 *  `<Problem.Type> Problem.REQUEST_ENTITY_TOO_LARGE`
 *  `<Problem.Type> Problem.REQUEST_URI_TOO_LONG`
 *  `<Problem.Type> Problem.UNSUPPORTED_MEDIA_TYPE`
 *  `<Problem.Type> Problem.REQUESTED_RANGE_NOT_SATISFIABLE`
 *  `<Problem.Type> Problem.EXPECTATION_FAILED`
 *  `<Problem.Type> Problem.UNPROCESSABLE_ENTITY`
 *  `<Problem.Type> Problem.TOO_MANY_REQUESTS`
 *  `<Problem.Type> Problem.INTERNAL_SERVER_ERROR`
 *  `<Problem.Type> Problem. NOT_IMPLEMENTED`
 *  `<Problem.Type> Problem.BAD_GATEWAY`
 *  `<Problem.Type> Problem.SERVICE_UNAVAILABLE`
 *  `<Problem.Type> Problem.GATEWAY_TIMEOUT`
 *  `<Problem.Type> Problem.HTTP_VERSION_NOT_SUPPORTED`
