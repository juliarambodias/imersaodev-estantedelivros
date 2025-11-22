let cardContainer = document.querySelector(".card-container");
let campoBusca = document.querySelector("#campo-busca");
let todosOsLivros = []; // Usaremos para guardar os livros em cache após o primeiro clique

function resetarPagina() {
    // Limpa os cards de livros da tela
    cardContainer.innerHTML = "";

    // Remove a classe que deixa o fundo transparente, fazendo as imagens voltarem ao normal
    document.body.classList.remove('conteudo-visivel');

    // Limpa o texto do campo de busca
    campoBusca.value = "";
}

// Função para carregar os livros do JSON (se ainda não foram carregados)
async function garantirLivrosCarregados() {
    // Se a lista de livros ainda não foi carregada, busca do arquivo
    if (todosOsLivros.length === 0) {
        try {
            const resposta = await fetch("data.json");
            const dados = await resposta.json();
            todosOsLivros = dados.livros; // Armazena os livros para não buscar de novo
            return true;
        } catch (error) {
            console.error("Erro ao carregar os livros:", error);
            cardContainer.innerHTML = "<p>Desculpe, não foi possível carregar os livros no momento.</p>";
            return false; // Indica que houve um erro
        }
    }
    return true; // Indica que os livros já estavam carregados
}

// Função para buscar os livros no JSON e depois filtrar
async function inciarBusca() {
    if (!await garantirLivrosCarregados()) return;

    const termoBusca = campoBusca.value.toLowerCase();

    // Filtra a lista de livros com base no termo de busca
    const livrosFiltrados = todosOsLivros.filter(livro => {
        const titulo = livro.titulo.toLowerCase();
        const autor = livro.autor.toLowerCase();
        const genero = livro.genero.toLowerCase();

        return titulo.includes(termoBusca) || autor.includes(termoBusca) || genero.includes(termoBusca);
    });

    renderizarCards(livrosFiltrados);
}

function renderizarCards(dados) {
    cardContainer.innerHTML = ""; // Limpa os cards existentes antes de renderizar novos

    // Adiciona uma classe ao body para indicar que o conteúdo principal está sendo exibido
    document.body.classList.add('conteudo-visivel');

    // Se a busca não retornou nenhum livro, exibe uma mensagem.
    if (dados.length === 0) {
        // Clona a caixa de recomendação do rodapé e a exibe aqui.
        const recomendacaoBoxOriginal = document.querySelector('.recomendacao-box');
        if (recomendacaoBoxOriginal) {
            // Cria um container para a mensagem e a caixa
            const containerVazio = document.createElement('div');
            containerVazio.innerHTML = `<p class="mensagem-vazio">Nenhum livro encontrado.</p>`;

            const cloneBox = recomendacaoBoxOriginal.cloneNode(true);
            // Altera o texto do clone para ser mais direto
            cloneBox.classList.add('recomendacao-busca'); // Adiciona uma classe para estilização específica
            cloneBox.querySelector('h2').textContent = 'Que tal me recomendar esse livro?';
            cloneBox.querySelector('p').textContent = 'Se você acha que eu vou amar, me conta aqui!';
            
            containerVazio.appendChild(cloneBox);
            cardContainer.appendChild(containerVazio);
        } else {
            cardContainer.innerHTML = `<p class="mensagem-vazio">Nenhum livro encontrado para sua busca.</p>`;
        }
        return;
    }

    for (let dado of dados) {
        let article = document.createElement("article");
        article.classList.add("card");

        // Adiciona a classe 'card-favorito' se o livro for recomendado
        if (dado.recomendado) {
            article.classList.add("card-favorito");
        }

        // Transforma a string de gêneros em tags clicáveis
        const generos = dado.genero.split(' / ').map(g => 
            `<button class="tag-genero" onclick="buscarPorGenero('${g.trim()}')">${g.trim()}</button>`
        ).join('');

        article.innerHTML = `
            <div class="card-header">
                <h2>${dado.titulo}</h2>
                ${dado.recomendado ? '<span class="estrela-favorito">⭐</span>' : ''}
            </div>
            <p><strong>Autor:</strong> ${dado.autor}</p>
            <div class="generos-container">
                <strong>Gênero:</strong>
                <div class="tags-wrapper">
                    ${generos}
                </div>
            </div>
            <p>"${dado.descricao}"</p>
        `;

        cardContainer.appendChild(article);
    }
}

// Nova função para buscar por gênero
async function buscarPorGenero(genero) {
    if (!await garantirLivrosCarregados()) return;

    // Filtra os livros que contêm o gênero clicado
    const livrosFiltrados = todosOsLivros.filter(livro => livro.genero.includes(genero));

    renderizarCards(livrosFiltrados);
}

// Nova função para mostrar apenas os livros recomendados
async function mostrarRecomendacoes() {
    if (!await garantirLivrosCarregados()) return;

    // Filtra a lista para pegar apenas os livros com "recomendado: true"
    const livrosRecomendados = todosOsLivros.filter(livro => livro.recomendado);

    renderizarCards(livrosRecomendados);
}

function enviarRecomendacao() {
    const titulo = document.getElementById('rec-titulo').value;
    const autor = document.getElementById('rec-autor').value;

    if (!titulo || !autor) {
        alert("Por favor, preencha o título e o autor do livro para enviar a sugestão.");
        return;
    }

    const seuEmail = "mjuliarambo@gmail.com"; // E-mail corrigido
    const assunto = "Sugestão de Livro para A Estante da Júlia";
    const corpoEmail = `Olá, Júlia! Tenho uma sugestão de livro para você:\n\nTítulo: ${titulo}\nAutor: ${autor}\n\nAbraços!`;

    // Cria o link mailto e abre o cliente de e-mail do usuário
    window.location.href = `mailto:${seuEmail}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpoEmail)}`;

    alert("Obrigada pela sugestão! Seu aplicativo de e-mail será aberto para você enviar a mensagem.");

    // Limpa os campos após o envio
    document.getElementById('rec-titulo').value = '';
    document.getElementById('rec-autor').value = '';
}
