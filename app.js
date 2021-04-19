const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const app = express();
const loginController = require('./controller/loginController')

//Estabelece conexão com o banco de dados
const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "cad_usuarios"
});


con.connect((err)=>{
  if (err) throw err;
  console.log('Conectado!')
});

//Funções
const cadastraUsuarios = (nome, email, cpf, dataNasc, telefone, senha ) =>{
  
    let sql = "INSERT INTO usuarios (nome, email, cpf, dataNasc, telefone, senha) VALUES (?)";
    let values = [[nome, email, cpf, dataNasc, telefone, senha]];
      
    con.query(sql, values, (err, result)=>{
      if (err) throw err;
      console.log("Numero de registros inseridos: " + result.affectedRows);
    });
    
}


app.use(bodyParser.urlencoded({extended: true}));
app.use('/', express.static(path.join(__dirname,'static')));

//Path raiz
app.get('/', (req, res) =>{
    res.sendFile(path.join(__dirname, 'static', 'index.html'));
});

//Path da pagina de cadastro
app.get('/cadastro', (req, res) =>{
  res.sendFile(path.join(__dirname, 'static', 'cadastro.html'));
});

//Path para fazer login no site
app.post('/', (req, res)=>{
  
  let email = req.body.email.toString();
  let senha = req.body.senha.toString(); 
  let confLogin = false;
  

  //Query para buscar enviado dentro do bd
  let sql = ("SELECT email,senha from usuarios WHERE email = " + mysql.escape(email));
  let regEmail, emailOk;
  let regSenha, senhaOk;
  
  con.query(sql, (err, result) => { //Query para verificar se o email corresponde 
    if (err) throw err;

      regEmail = result[0].email;
      regSenha = result[0].senha; 
      
      if(email == regEmail) {
        emailOk = true;
        
      } 

      bcrypt.compare(senha, regSenha, (err, result)=>{
        if (err) throw err;
          
        senhaOk = result;
        
        
        if(senhaOk == true && emailOk == true){ 
          confLogin = true;
        }
        
        if(confLogin == true){
          res.sendFile(path.join(__dirname, 'static', 'pag-inicial.html'));
        } else {
          res.redirect('/');
        }
      });
  });
  
});

//Path para criar registro no sistema
app.post('/index.html', async (req, res) =>{
  
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

    //Encripta a senha 
    let senhaEncriptada = await bcrypt.hash(senhaForm, 10);
  

    // Remove caracteres inválidos dos valores
    cpfForm = cpf.replace(/[^0-9]/g, '');
    telefoneForm = telefone.replace(/[^0-9]/g, '');

    //Insere valores no banco de dados 
    
    cadastraUsuarios(nomeForm, emailForm, cpfForm, datanascForm, telefoneForm, senhaEncriptada);

    res.sendFile(path.join(__dirname, 'static', 'index.html'));
  }
});

app.listen(3000);