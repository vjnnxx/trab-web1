//CONFIGURAÇÕES DO SERVIDOR
// É necessário rodar o arquivo 'db.js' para começar a utilizar

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const session = require('express-session');
const fs = require('fs');

const app = express();
const PORTA = 3000;
const mycss = {style:fs.readFileSync('./views/estilo.css')}

//Estabelece conexão com o banco de dados
const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "web1"
});


con.connect((err)=>{
  if (err) throw err;
  console.log('Conectado!')
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(session({
  secret: "trabalhoweb1",
  resave: true,
  saveUninitialized: true
}));


const miliParaAno = (tempo) => { //Transformar o tempo de ms para anos
  tempo = Number(tempo);
  var toSecond = tempo/1000; //Tempo em segundos
  var toMinute = toSecond/60; //Tempo em minutos
  var toHour = toMinute/60; //Tempo em horas
  var toDay = toHour/24; //Tempo em dias
  var toYear = toDay/365; //Tempo em anos

  return Math.floor(toYear); //Tempo arredondado pra baixo
}


app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use('/', express.static(path.join(__dirname,'static')));

//Path raiz
app.get('/', (req, res) =>{
    res.render('index.ejs', {aviso: '', mycss:mycss});
});

//Path da pagina de cadastro
app.get('/cadastro', (req, res) =>{
  res.render('cadastro.ejs', {aviso: '', mycss:mycss});
});

//Ir para a pagina de edição
app.get('/pag-inicial/editar', (req,res)=>{
  if(req.session.email == undefined){
    res.redirect('/');
  } else{
    console.log(req.session.email);
   
    let email = req.session.email;
    
    let nome, cpf, datanasc, telefone;
    let sql = 'SELECT nome, cpf, dataNasc, telefone FROM usuarios WHERE email = ' + mysql.escape(email);

    con.query(sql, (err, result)=>{
      if (err) throw err;
      nome = result[0].nome;
      cpf = result[0].cpf;
      datanasc = result[0].dataNasc;
      telefone = result[0].telefone;
      res.render('./editar.ejs', {nome: nome, email: email, cpf: cpf, telefone: telefone,datanasc: datanasc, mycss:mycss});
    });
  }
});

app.get('/pag-inicial', (req,res)=>{
  if(req.session.email == undefined){
    res.redirect('/');
  } else{
    console.log(req.session.email);
    res.render('pag-inicial.ejs', {resultados: [], aviso: '', mycss:mycss});
  }
});

//Excluir registro
app.get('/excluir', (req,res)=>{
  let sql = 'DELETE FROM usuarios WHERE email = ' + mysql.escape(req.session.email);
  con.query(sql, (err, result)=>{
    if (err) throw err;
    console.log('Cadastro excluido com sucesso!');
    req.session.destroy((err)=>{
      if (err){
        console.log('Erro ao destruir sessão.')
        throw err;
      } else {
        console.log('Sessão terminada com sucesso!')
        res.render('index.ejs', {aviso: '', mycss:mycss})
      }
    });
  });
});

//Path para sair do sistema
app.get('/sair', (req,res)=>{
  req.session.destroy((err)=>{
    if (err){
      console.log('Erro ao destruir sessão.')
      throw err;
    } else {
      console.log('Sessão terminada com sucesso!')
      res.redirect('/');
    }
  });
});

//Path para fazer login no site
app.post('/pag-inicial', (req, res)=>{
  
  let email = req.body.email.toString();
  let senha = req.body.senha.toString(); 
  let confLogin = false;
  
  
  //Query para buscar email e senha enviados dentro do bd
  let sql = ("SELECT email,senha from usuarios WHERE email = " + mysql.escape(email));
  let regEmail, emailOk;
  let regSenha, senhaOk;
  
  con.query(sql, (err, result) => { //Query para verificar se o email corresponde 
    if (err) throw err;

    if (result == false){
      return res.render('index.ejs', {aviso: 'Login ou senha inválidos!', mycss:mycss})
    }
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
        req.session.email = email;
        sql = "SELECT nome FROM usuarios WHERE email = " + mysql.escape(email);
        let nome;
        con.query(sql, (err, result)=>{
          if (err) throw err;

          if (result){
            nome = result[0].nome;
            console.log(nome);
            res.render('pag-inicial.ejs', {resultados: [], aviso: '', mycss:mycss, nome:nome});
          }
        });
        
      } else {
        res.render('index.ejs', {aviso: 'Login ou senha inválidos!', mycss:mycss});
      }
    });
  });
  

});

//Path para criar registro no sistema
app.post('/cadastrar', async (req, res) =>{
  
  //Validar dados do form

  const { nome, email,  cpf, telefone, datanasc, senha, confsenha } = req.body;


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


    let emailLivre;
    
    let sql = 'SELECT email FROM usuarios where email = ' + mysql.escape(emailForm);
    con.query(sql, async (err, result)=>{
      if (err) throw err;
      
      if (result == false || result == []){
        console.log(result);
        emailLivre = true;
        console.log(emailLivre)
        if (emailLivre == true){
          //Insere valores no banco de dados 
          sql = "INSERT INTO usuarios (nome, email, cpf, dataNasc, telefone, senha) VALUES (?)";
          let values = [[nomeForm, emailForm, cpfForm, datanascForm, telefoneForm, senhaEncriptada]];
            
          con.query(sql, values, async (err, result)=>{
            if (err) {
              throw err;
            };
            res.render('index', {aviso: '', mycss:mycss});
            console.log("Numero de registros inseridos: " + result.affectedRows);
          });
        } 
      } else {
        return res.render('cadastro.ejs', {aviso: 'Email já cadastrado!', mycss:mycss});
      }
    });


    
    
    
  }
});

//Atualizar dados cadastrados
app.post('/editar', async (req,res)=>{
  const { nome, email,  cpf, telefone, datanasc, senha, confsenha } = req.body;
 

  if(nome == "") {
    console.log("O nome não pode ficar vazio!");
    return res.redirect("/editar");
  } if (senha !== confsenha) {
    console.log("As senhas não coincidem!");
     return res.render("/editar.ejs");
  }if(senha == "" || confsenha == ""){
    console.log("Os campos de senha não podem ficar vazios!")
    return res.render("/editar.ejs");
  } if (email == ""){
    console.log("Preencha o campo de email corretamente!");
    return res.render("/editar.ejs");
  } if (cpf == ""){
    console.log("Preencha o campo de CPF corretamente!");
    return res.render("/editar.ejs");
  } if(telefone == ""){
    console.log("Preencha o campo de telefone corretamente!");
    return res.render("/editar.ejs");
  } if (datanasc == ""){
    console.log("Preencha a data de nascimento corretamente!");
    return res.render("/editar.ejs");
    
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

    //Atualizar nome
    let sql = "UPDATE usuarios SET nome = " + mysql.escape(nomeForm) + " WHERE email = " + mysql.escape(req.session.email);
    con.query(sql, (err, result)=>{
      if (err) throw err;
      console.log('Número de linhas afetadas' + result.affectedRows);
      
    });

    //Atualizar email
    sql = "UPDATE usuarios SET email = " + mysql.escape(emailForm) + " WHERE email = " + mysql.escape(req.session.email);
    con.query(sql, (err, result)=>{
      if (err) throw err;
      console.log('Número de linhas afetadas' + result.affectedRows);
      
    });

    //Atualizar cpf 

    
    sql = "UPDATE usuarios SET cpf = " + mysql.escape(cpfForm) + " WHERE email = " + mysql.escape(req.session.email);
    con.query(sql, (err, result)=>{
      if (err) throw err;
      console.log('Número de linhas afetadas' + result.affectedRows);
      
    });

    //Atualizar telefone
    sql = "UPDATE usuarios SET telefone = " + mysql.escape(telefoneForm) + " WHERE email = " + mysql.escape(req.session.email);
    con.query(sql, (err, result)=>{
      if (err) throw err;
      console.log('Número de linhas afetadas' + result.affectedRows);
      
    });

    //Atualizar data de nascimento
    sql = "UPDATE usuarios SET dataNasc = " + mysql.escape(datanascForm) + " WHERE email = " + mysql.escape(req.session.email);
    con.query(sql, (err, result)=>{
      if (err) throw err;
      console.log('Número de linhas afetadas' + result.affectedRows);
      
    });

    //Atualizar senha
    sql = "UPDATE usuarios SET senha = " + mysql.escape(senhaEncriptada) + " WHERE email = " + mysql.escape(req.session.email);
    con.query(sql, (err, result)=>{
      if (err) throw err;
      console.log('Número de linhas afetadas' + result.affectedRows);
      
    });

    res.render('pag-inicial.ejs', {aviso: 'Dados alterados com sucesso!', resultados: '', mycss:mycss});

  }
});

//Buscar dados no banco
app.post('/busca', (req,res)=>{
  
  if(req.session.email == undefined){
    res.redirect('/');
  } else{
    //console.log(req.session.email);
    
    let busca = req.body.busca;

    if (busca == ''){
      res.render('./pag-inicial.ejs', {resultados: [], aviso: 'A barra de busca não pode ficar vazia!', mycss:mycss})
    } else {
      let sql = `SELECT nome, email, dataNasc FROM usuarios WHERE nome LIKE '` + busca + `%'`;
      //let sql = 'SELECT nome, email FROM usuarios'
      var resultados = [];
      con.query(sql, (err, result)=>{
        if (err) throw err;
        
      
        var dataAtual = new Date();
        //console.log('Data de nascimento: ' + datanasc + 'Data atual: ' + dataAtual);
        
        for (x in result){
          let datanasc = result[x].dataNasc;
          var idade = dataAtual - datanasc;
          idade = miliParaAno(idade);
          resultados[x] = {nome: result[x].nome, email: result[x].email, idade: idade};
        };
        
        //Verifica se algum resultado foi encontrados
        if(resultados == ''){
          res.render('./pag-inicial.ejs', {resultados: resultados, aviso: 'Nenhum resultado encontrado!', mycss:mycss});
        } else {
          res.render('./pag-inicial.ejs', {resultados: resultados, aviso: '', mycss:mycss});
        }
        
      });
    }
  }
  
});


app.listen(PORTA, (err)=>{
  if (err) console.log ("Erro ao iniciar o servidor");
  console.log("Servidor rodando na porta: " + PORTA);
});