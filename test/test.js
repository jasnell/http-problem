var Problem = require('../');
var assert = require('assert');
var util = require('util');

describe('Problem', function() {

  it ('should not error', function(done) {
    var type = Problem.Type('urn:test', 'my type');
    Problem.registerProblemType(type);
    var problem = new Problem('urn:test');
    assert.equal(problem.type, 'urn:test');
    assert.equal(problem.title, 'my type');
    assert(problem instanceof Error);
    done();
  });

  it ('should allow extension', function(done) {

    var NoCreditType =
      new Problem.Type(
        'http://example.com/probs/out-of-credit',
        'You do not have enough credit.',
        {status:400});
    var noCredit = NoCreditType.raise({
      detail: 'Your current balance is 30, but that costs 50.',
      instance: 'http://example.net/account/12345/msgs/abc',
      balance: 30,
      accounts: [
        'http://example.net/account/12345',
        'http://example.net/account/67890']
    });

    var check = JSON.parse(JSON.stringify(noCredit));
    assert.equal(check.balance,30);
    assert(check.accounts);
    assert.equal(check.status, 400); // status defaults from type
    assert.equal(
      check.accounts.length, 2);
    assert.equal(
      check.type,
      'http://example.com/probs/out-of-credit');
    assert.equal(
      check.title,
      'You do not have enough credit.');
    assert.equal(
      check.instance,
      'http://example.net/account/12345/msgs/abc');
    assert.equal(
      check.detail,
      'Your current balance is 30, but that costs 50.');

    done();
  });

  it ('should support common HTTP status codes', function(done) {

    var error = Problem.GONE.raise();
    assert(error);
    assert.equal(error.status, 410);
    done();

  });

  it('should wrap the object', function(done) {
    var obj = {
      'type': 'http://example.com/probs/out-of-credit',
      'title': 'You do not have enough credit.',
      'detail': 'Your current balance is 30, but that costs 50.',
      'instance': 'http://example.net/account/12345/msgs/abc',
      'balance': 30,
      'accounts': ['http://example.net/account/12345',
                   'http://example.net/account/67890']
    };
    var problem = Problem.wrap(obj);
    done();
  });

  it('should throw', function(done) {
    var obj = {
      'type': 'http://example.com/probs/out-of-credit',
      'title': 'You do not have enough credit.',
      'detail': 'Your current balance is 30, but that costs 50.',
      'instance': 'http://example.net/account/12345/msgs/abc',
      'balance': 30,
      'accounts': ['http://example.net/account/12345',
                   'http://example.net/account/67890']
    };
    var problem = Problem.wrap(obj);
    assert.throws(function() {
      problem.throw();
    });
    done();
  });

});

describe('Problem.middleware', function() {
  var express = require('express');
  var request = require('request');
  var server = express();
  before(function(done) {
    var router = express.Router();
    router.get('/', function(req,res) {
      Problem.GONE.throw();
    });
    router.use(Problem.middleware);
    server.use('/',router).listen(8888, function() {
      done();
    });
  });
  it('should return a problem body', function(done) {
    request.get('http://localhost:8888/', function(err,res,body) {
      assert.equal(res.statusCode,410);
      var problem = Problem.wrap(body);
      assert.equal(
        problem.type,
        'http://www.iana.org/assignments/http-status-codes#410');
      done();
    });
  });
});
