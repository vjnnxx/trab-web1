const mysql = require('mysql');

const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "cad_usuarios"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  
  //Cria tabela
  con.query(`CREATE TABLE IF NOT EXISTS usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    nome VARCHAR(60) NOT NULL,
    email VARCHAR(40) NOT NULL, 
    cpf VARCHAR(11) UNIQUE NOT NULL,
    dataNasc DATE NOT NULL,
    telefone VARCHAR(12) NOT NULL, 
    senha VARCHAR(50) NOT NULL
  )`, (err, result) => {
    if (err) throw err;
    console.log("Tabela criada!")
  });
});