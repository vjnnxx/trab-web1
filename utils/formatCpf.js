var cpf = document.getElementById('cpf');
cpf.addEventListener('keypress', ()=>{
    if (cpf.value.length == 3){
        cpf.value = cpf.value + '.';
    }
            
    if (cpf.value.length == 7){
        cpf.value = cpf.value + '.';
    }

    if (cpf.value.length == 11){
        cpf.value = cpf.value + '-';
    }
});