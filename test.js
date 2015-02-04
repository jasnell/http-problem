var problem = require('./index');

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
