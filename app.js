const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql');


const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'cad_usuarios'
});

conn.connect(function(err) {
    if (err) throw err;
        console.log("Conectado!");
  });

app.use(bodyParser.urlencoded({extended: true}));
app.use('/public', express.static(path.join(__dirname,'static')));
app.get('/', (req, res) =>{
    res.sendFile(path.join(__dirname, 'static', 'index.html'));
});


app.post('/', (req, res) =>{
    var test = document.getElementById('email').value;
    console.log(test);
    res.sendFile(path.join(__dirname, 'static', 'pag-inicial.html'));
});

app.listen(3000);