var problem = require('./index');

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