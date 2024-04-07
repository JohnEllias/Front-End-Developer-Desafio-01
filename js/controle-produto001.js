const URL = 'http://localhost:3400/produtos'

let listaProduto = [];
let btnAdicionar = document.querySelector('#btn-adicionar');
let tabelaProduto= document.querySelector('table>tbody');
let modalProduto = new bootstrap.Modal(document.getElementById('modal-produto'));

let modoEdicao = false;

let formModal = {

    titulo: document.querySelector('h4.modal-title'),
    id: document.querySelector("#id"),
    nome: document.querySelector("#nome"),
    valor: document.querySelector("#valor"),
    quantidadeEstoque: document.querySelector("#quantidadeEstoque"),
    observacao: document.querySelector("#observacao"),
    dataCadastro: document.querySelector("#dataCadastro"),
    btnSalvar:document.querySelector("#btn-salvar"),
    btnCancelar:document.querySelector("#btn-cancelar")
}


btnAdicionar.addEventListener('click', () =>{
    modoEdicao = false;
    formModal.titulo.textContent = "Adicionar Produto"

    limparModalProduto();
    modalProduto.show();
});

// Obter os produtos da API
function obterProduto() {
    
    fetch(URL, {
        method: 'GET',
        headers: {
            'Authorization' : obterToken()
        }
    })
    .then(response => response.json())
    .then(produto => {
        listaProduto = produto;
        popularTabela(produto);
    })
    .catch((erro) => {});
}

obterProduto();

function popularTabela(produto){

    // Limpando a tabela para popular
    tabelaProduto.textContent = '';

    produto.forEach(produto => { 
        criarLinhaNaTabela(produto);
    });
}

function criarLinhaNaTabela(produto){

    //1° Criando um tr, é uma linha na tabela.
    let tr  = document.createElement('tr');

    //2° Criar as tds dos conteudos da tabela
    let  tdId = document.createElement('td');
    let  tdNome = document.createElement('td');
    let  tdValor = document.createElement('td');
    let  tdQuantidadeEstoque = document.createElement('td');
    let  tdObservacao = document.createElement('td');
    let  tdDataCadastro = document.createElement('td');
    let  tdAcoes = document.createElement('td');

    // 3° Atualizar as tds com base no produto
    tdId.textContent = produto.id
    tdNome.textContent = produto.nome;
    tdValor.textContent = produto.valor;
    tdQuantidadeEstoque.textContent = produto.quantidadeEstoque;
    tdObservacao.textContent = produto.observacao;
    tdDataCadastro.textContent = new Date(produto.dataCadastro).toLocaleDateString();
    tdAcoes.innerHTML = `<button onclick="editarProduto(${produto.id})" class="btn btn-outline-primary btn-sm mr-3">
                                Editar
                            </button>
                            <button onclick="excluirProduto(${produto.id})" class="btn btn-outline-primary btn-sm mr-3">
                                Excluir
                        </button>`

    // 4° Adicionando as TDs à Tr
    tr.appendChild(tdId);
    tr.appendChild(tdNome);
    tr.appendChild(tdValor);
    tr.appendChild(tdQuantidadeEstoque);
    tr.appendChild(tdObservacao);
    tr.appendChild(tdDataCadastro);
    tr.appendChild(tdAcoes);

    // 5° Adicionar a tr na tabela.
    tabelaProduto.appendChild(tr);
}


formModal.btnSalvar.addEventListener('click', () => {

    // 1° Capturar os dados da tela do modal e transformar em um produto
    let produto = obterProdutoDoModal();

    // 2° Verificar se os campos obrigatorios foram preenchidos

    if(!produto.validar()){
        alert("Nome e Valor são obrigatórios.");
        return;
    }

    // 3° Adicionar na api - Backend
    if(modoEdicao){
        atualizarProdutoNoBackend(produto);
    }

    else{

    adicionarProdutoNoBackend(produto);
    }
});

function atualizarProdutoNoBackend(produto){
    fetch(`${URL}/${produto.id} `,{
        method: "PUT",
        headers:{
            Authorization: obterToken(),
            "Content-Type": "ap'plication/json"
        },
        body: JSON.stringify(produto)
    
   
   
    } )
    .then( () => {
atualizarProdutoNaTabela(produto);

    })
}
 
function atualizarProdutoNaTabela(produto){
    let indice = listaProduto.findIndex(p => p.id == produto.id);

    listaProduto.splice(indice, 1 ,produto);

    popularTabela(listaProduto)

    swal.fire({
        icon: "success",
        title: `Produto ${produto.nome}, foi atualizado com sucesso!`,
        showConfirmButton: false,
        timer : 6000,
    })

    modalProduto.hide();
}
function obterProdutoDoModal(){
    return new Produto({
        id: formModal.id.value,
        nome: formModal.nome.value,
        valor: formModal.valor.value,
        quantidadeEstoque: formModal.quantidadeEstoque.value,
        observacao: formModal.observacao.value,
        dataCadastro: (formModal.dataCadastro.value)
            ? new Date(formModal.dataCadastro.value).toISOString()
            : new Date().toISOString()
    });
}

function adicionarProdutoNoBackend(produto){

    fetch(URL, {
        method: 'POST',
        headers: {
            Authorization: obterToken(),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(produto)
    })
    .then(response => response.json())
    .then(response => {
        let novoProduto = new Produto(response);
        listaProduto.push(novoProduto);

        popularTabela(listaProduto);

        // Fechar modal
        
        modalProduto.hide();

        swal.fire({
            icon: "success",
            title: `Produto ${produto.nome}, foi cadastrado com sucesso!`,
            showConfirmButton: false,
            timer : 6000,
        })

        // Mandar mensagem de cliente cadastrado com sucesso!
        
    })
}

function limparModalProduto() {

    formModal.id.value = "";
    formModal.nome.value = "";
    formModal.valor.value = "";
    formModal.quantidadeEstoque.value = "";
    formModal.observacao.value = "";
    formModal.dataCadastro.value = "";

} 

function editarProduto(id){
    modoEdicao = true;
    formModal.titulo.textContent = "Editar Produto"
    modalProduto.show();

    let produto = listaProduto.find(p => p.id == id);

    atualizarModalProduto(produto);
    }
    function atualizarModalProduto(produto){
        formModal.id.value = produto.id;
        formModal.nome.value = produto.nome;
        formModal.valor.value = produto.valor;
        formModal.quantidadeEstoque.value = produto.quantidadeEstoque;
        formModal.observacao.value = produto.observacao;
        formModal.dataCadastro.value = produto.dataCadastro.substring(0,10);

    }


function excluirProduto(id){
    let produto = listaProduto.find(produto => produto.id == id);

    if(confirm("Deseja realmente excluir o produto " + produto.nome)){
        excluirProdutoNoBackEnd(id);
    }
}

function excluirProdutoNoBackEnd(id){
    fetch(`${URL}/${id}`, {
        method: 'DELETE',
        headers: {
            Authorization: obterToken()
        }
    })
    .then(() => {
        removerProdutoDaLista(id);
        popularTabela(listaProduto);
    })
}

function removerProdutoDaLista(id){

    let indice = listaProduto.findIndex(produto => produto.id == id);

    listaProduto.splice(indice, 1);
}