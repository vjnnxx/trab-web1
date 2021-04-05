/*const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');


app.use(bodyParser.urlencoded({extended: true}));
app.use('/public', express.static(path.join(__dirname,'static')));
app.get('/', (req, res) =>{
    res.sendFile(path.join(__dirname, 'static', 'index.html'));
});


app.post('/', (req, res) =>{
    res.sendFile(path.join(__dirname, 'static', 'pag-inicial.html'));
});

app.listen(3000);*/

var http = require('http');
var fs = require('fs');
http.createServer(function (req, res) {
  fs.readFile('index.html', function(err, data) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(data);
    return res.end();
  });
}).listen(8080);