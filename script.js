const produtos = [];

function adicionarAoCarrinho(produto) {
    produtos.push(produto);
    alert(`${produto} foi adicionado ao carrinho!`);
    // Aqui você pode adicionar lógica para atualizar o carrinho no servidor
}

function exibirCarrinho() {
    const carrinhoElement = document.getElementById('carrinho');
    carrinhoElement.innerHTML = '';
    produtos.forEach(produto => {
        const item = document.createElement('div');
        item.textContent = produto;
        carrinhoElement.appendChild(item);
    });
}

function finalizarCompra() {
    // Aqui você adicionaria lógica para finalizar a compra usando moedas FiveM
    alert('Compra finalizada com moedas FiveM!');
}

function login(nome, senha) {
    // Aqui você adicionaria lógica para verificar o login no servidor
    if (nome === 'admin' && senha === 'admin') {
        alert('Login realizado com sucesso!');
        window.location.href = 'painel.html';
    } else {
        alert('Nome ou senha incorretos!');
    }
}

function registrar(email, senha, confirmacaoSenha, nome) {
    if (senha !== confirmacaoSenha) {
        alert('As senhas não coincidem!');
        return;
    }
    // Aqui você adicionaria lógica para registrar o usuário no servidor
    alert(`Usuário ${nome} registrado com sucesso!`);
    window.location.href = 'login.html';
}
