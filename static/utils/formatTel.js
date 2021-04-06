var tel = document.getElementById('telefone');
tel.addEventListener('keypress', ()=>{
    if (tel.value.length == 0){
        tel.value = '(' + tel.value;
    }
            
    if (tel.value.length == 3){
        tel.value = tel.value + ')' + ' ';
    }
});
