//Cria o banco de dados 'web1' e a tabela 'usuarios'
const mysql = require('mysql');
const criaTabela = require('./criaTabela');

const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  
  //Cria banco
  let sql = 'CREATE DATABASE IF NOT EXISTS web1;'
  con.query(sql , (err, result) => {
    if (err) throw err;
    criaTabela();
    console.log("Banco criado!")
    con.destroy();
  });
  
});