function CPF(cpf) {
    if(typeof(cpf == "number")) cpf = cpf.toString();
    if(cpf.length > 11) {
        cpf = cpf.replace("-", "");
        cpf = cpf.split(".").join("");
    }

    if(cpf.length > 11 || cpf.length < 11) return false;
    
    let digitoResultado = 0;

    for(let i = 10; i > 1; i--) {
        digitoResultado += cpf[10-i] * i;
    } 

    digitoResultado = digitoResultado % 11 == 0 || digitoResultado % 11 == 1 ? 0 : 11 - digitoResultado % 11;

    if(digitoResultado != cpf[9]) return false;

    digitoResultado = 0;

    for(let i = 11; i > 1; i--) {
        digitoResultado += cpf[11-i] * i;
    }

    digitoResultado = digitoResultado % 11 == 0 || digitoResultado % 11 == 1 ? 0 : 11 - digitoResultado % 11;

    if(digitoResultado != cpf[10]) return false;

    return true;
}

export default validarCpf;