const mysql = require('mysql');

const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  
  //Cria tabela
  con.query(`
    CREATE DATABASE IF NOT EXITS web1;
    USE web1;
    CREATE TABLE IF NOT EXISTS usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    nome VARCHAR(60) NOT NULL,
    email VARCHAR(40) UNIQUE NOT NULL, 
    cpf VARCHAR(11) NOT NULL,
    dataNasc DATE NOT NULL,
    telefone VARCHAR(12) NOT NULL, 
    senha VARCHAR(255) NOT NULL
  );`, (err, result) => {
    if (err) throw err;
    console.log("Tabela criada!")
  });
});