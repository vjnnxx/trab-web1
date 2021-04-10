const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql');

//Estabelece conexão com o banco de dados
const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "cad_usuarios"
});

app.use(bodyParser.urlencoded({extended: true}));
app.use('/', express.static(path.join(__dirname,'static')));
app.get('/', (req, res) =>{
    res.sendFile(path.join(__dirname, 'static', 'index.html'));
});

app.get('/cadastro', (req, res) =>{
  res.sendFile(path.join(__dirname, 'static', 'cadastro.html'));
});

app.post('/', (req, res) =>{
    res.sendFile(path.join(__dirname, 'static', 'pag-inicial.html'));
    const nome = req.body.nome;
});

app.post('/index.html', (req, res) =>{
  
  //Validar dados do form

  const { nome, email,  cpf, telefone, datanasc, senha, confsenha } = req.body;

  console.log(req.body);

  if(nome == "") {
    console.log("O nome não pode ficar vazio!");
    return res.redirect("/cadastro");
  } if (senha !== confsenha) {
    console.log("As senhas não coincidem!");
     return res.redirect("/cadastro");
  }if(senha == "" || confsenha == ""){
    console.log("Os campos de senha não podem ficar vazios!")
    return res.redirect("/cadastro");
  } if (email == ""){
    console.log("Preencha o campo de email corretamente!");
    return res.redirect("/cadastro");
  } if (cpf == ""){
    console.log("Preencha o campo de CPF corretamente!");
    return res.redirect("/cadastro");
  } if(telefone == ""){
    console.log("Preencha o campo de telefone corretamente!");
    return res.redirect("/cadastro");
  } if (datanasc == ""){
    console.log("Preencha a data de nascimento corretamente!");
    return res.redirect("/cadastro");
  } else {
    // Garante que os valores do form são strings
    let nomeForm = nome.toString();
    let emailForm = email.toString();
    let cpfForm = cpf.toString();
    let telefoneForm = telefone.toString();
    let datanascForm = datanasc.toString();
    let senhaForm = senha.toString();
    let confsenhaForm = senha.toString();

    // Remove caracteres inválidos dos valores
    cpfForm = cpf.replace(/[^0-9]/g, '');
    telefoneForm = telefone.replace(/[^0-9]/g, '');

    //Insere valores no banco de dados 
    con.connect((err)=>{
      if (err) throw err;
      console.log('Conectado!')
      let sql = "INSERT INTO usuarios (nome, email, cpf, dataNasc, telefone, senha) VALUES (?)";
      let values = [[nomeForm, emailForm, cpfForm, datanascForm, telefoneForm, senhaForm]];
      
      

      con.query(sql, values, (err, result)=>{
        if (err) throw err;
        console.log("Numero de registros inseridos: " + result.affectedRows);
      });
      
    });


    //Redireciona o usuario para a pagina inicial
    res.sendFile(path.join(__dirname, 'static', 'index.html'));
  }
});

app.listen(3000);