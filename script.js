const apiKey = "ff4463bc420ab3b4715d557d1e4cfd3c";
const inputCidade=document.getElementById('cidadeInput');
const listaSugestoes=document.getElementById('listaSugestoes');
let timer; // Variável para controlar o tempo de digitação

// Detecta quando o usuário digita
inputCidade.addEventListener('input', function(){
    const termo=this.value.trim();
    clearTimeout(timer); // Limpa o timer anterior se o usuário continuar digitando
    
    // Se tiver menos de 3 letras, esconde a lista e para
    if(termo.length < 3){
        listaSugestoes.style.display = 'none';
        return;
    };

    // Cria um novo timer: só chama a API se o usuário parar de digitar por 500ms
    timer=setTimeout(() => {
        buscarSugestoes(termo);
    }, 500);
});

// Função para buscar as cidades
async function buscarSugestoes(termo){
    const url= `https://api.openweathermap.org/geo/1.0/direct?q=${termo}&limit=5&appid=${apiKey}`;

    try{const response = await fetch(url);
        const cidades = await response.json();
        mostrarLista(cidades); // Chama a função que desenha a lista
    }catch(error){
        console.error("Erro ao buscar sugestões:", error);
    };
};

// Função para mostrar a lista na tela
function mostrarLista(cidades){
    listaSugestoes.innerHTML = ''; // Limpa lista antiga
    const nomesVistos = new Set(); // Controla duplicatas visuais

    if (cidades.length === 0) {
        listaSugestoes.style.display='none';
        return;
    };

    cidades.forEach(cidade => {
        // Monta o texto: Nome, Estado, País
        let textoDisplay = `${cidade.name}`;
        if(cidade.state) textoDisplay += `, ${cidade.state}`;
        textoDisplay += `, ${cidade.country}`;

        // Se esse nome já apareceu na lista, pula para o próximo
        if(nomesVistos.has(textoDisplay)) return;
        nomesVistos.add(textoDisplay);

        const li = document.createElement('li');
        li.classList.add('list-group-item', 'list-group-item-action', 'cursor-pointer');
        li.textContent = textoDisplay;

        // Ao clicar na sugestão
        li.addEventListener('click', () => {
            inputCidade.value = textoDisplay; // preenche o input visualmente
            listaSugestoes.style.display = 'none'; // Esconde a lista
            
            // Chama a busca de clima passando Latitude, Longitude e o nome da cidade
            buscarClima(cidade.lat, cidade.lon, textoDisplay); 
        });
        listaSugestoes.appendChild(li);
    });
    listaSugestoes.style.display = 'block';
};

// Fecha a lista se clicar fora dela
document.addEventListener('click', (e) => {
    if (!inputCidade.contains(e.target) && !listaSugestoes.contains(e.target)) {
        listaSugestoes.style.display = 'none';
    };
});

// Faz o card central com as informações
async function buscarClima(lat=null, lon=null, cidadeNome=null){
    const elementoResultado=document.getElementById('resultado');
    let url="";

    if(lat !== null && lon !== null){
        url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=pt_br`;
    }else{
        const cidadeTexto = inputCidade.value;
        if(!cidadeTexto){
            alert("Por favor, digite o nome de uma cidade!");
            return;
        };
        url = `https://api.openweathermap.org/data/2.5/weather?q=${cidadeTexto}&appid=${apiKey}&units=metric&lang=pt_br`;
    };

    try{const response=await fetch(url);
        const data=await response.json();

        if(response.ok){
            const temperatura = Math.floor(data.main.temp);
            const descricao = data.weather[0].description;
            const icone = data.weather[0].icon;
            const umidade = data.main.humidity;

            // Se veio 'cidadeNome' (do clique), usa ele. Se não, usa o da API.
            let nomeFinal;
            if(cidadeNome){
                nomeFinal=cidadeNome; 
            }else{
                nomeFinal=data.name;
            };

            elementoResultado.innerHTML = 
            `<h3>${nomeFinal}</h3>
            <p>
                <strong><span id="dado-temp">${temperatura}</span>°C</strong> - 
                <span>${descricao}</span>
            </p>
            <img src="https://openweathermap.org/img/wn/${icone}@2x.png" alt="Icone do clima">
            <p>Umidade: ${umidade}%</p>`;

            mensagemDinamica();
        }else{
            elementoResultado.innerHTML = `<p class="text-danger">Cidade não encontrada.</p>`;
        };
    }catch(error){
        console.error("Erro:", error);
        elementoResultado.innerHTML = "Erro ao conectar com a API.";
    };
};
buscarClima(-29.9440222, -50.9930938, `Gravataí, Rio Grande do Sul, BR`); // Deixa uma cidade por padrão

// 
function mensagemDinamica(){
    // Verifica se o elemento existe antes de tentar pegar
    const elTemp = document.getElementById('dado-temp');

    if(elTemp){
        let temperatura = elTemp.innerText; // Pega o valor
        let tempNumero = Number(temperatura); // Transforma em numero
        const mensagens = document.querySelectorAll('.h5');
        let texto = '';

        if(tempNumero < -30){
            texto= 'Frio extremo com risco de vida! Não saia de casa a menos que seja uma emergência absoluta e você tenha equipamento polar.';
        }else if(tempNumero <= -25){
            texto= 'O frio é severo e congela a pele exposta em minutos. Se precisar sair, cubra cada centímetro do corpo com roupas térmicas.';
        }else if(tempNumero <= -20){
            texto= 'Temperaturas muito perigosas. Roupas térmicas, gorro, luvas grossas e botas isolantes são obrigatórios.';
        }else if(tempNumero <= -15){
            texto= 'Está congelante lá fora. Use várias camadas de roupa, proteja o rosto e evite ficar parado ao ar livre.';
        }else if(tempNumero <= -10){
            texto= 'Frio intenso. Um casaco pesado, luvas e cachecol são essenciais para evitar a perda de calor.';
        }else if(tempNumero <= -5){
            texto= 'Está abaixo de zero! Cuidado com gelo na pista. Use um casaco impermeável e mantenha as extremidades (mãos e pés) bem aquecidas.';
        }else if(tempNumero <= 0){
            texto= 'Estamos no ponto de congelamento. Luvas e um bom casaco são necessários, prepare-se para ver a sua respiração virar fumaça.';
        }else if(tempNumero <= 5){
            texto= 'Está bem frio, é melhor usar um casaco que te aqueça bastante e se proteger do vento.';
        }else if(tempNumero <= 10){
            texto= 'Frio considerável. Um suéter grosso ou uma jaqueta de inverno com um cachecol já ajudam a manter o conforto.';
        }else if(tempNumero <= 15){
            texto= 'Um clima fresquinho. Um moletom, um corta-vento ou uma jaqueta leve são ideais para agora.';
        }else if(tempNumero <= 20){
            texto= 'Clima agradável, mas instável. Dá para usar manga curta, mas leve um casaquinho leve só por precaução.';
        }else if(tempNumero <= 25){
            texto= 'Temperatura agradável! Clima confortável para usar camisetas e roupas leves, aproveite o dia.';
        }else if(tempNumero <= 30){
            texto= 'O calor está começando a aparecer. Roupas frescas são bem-vindas e não esqueça de beber água.';
        }else if(tempNumero <= 35){
            texto= 'Está muito calor! Passar protetor solar, beber muita água e se manter na sombra é uma boa ideia.';
        }else if(tempNumero <= 40){
            texto= 'Calor excessivo! Evite exercícios físicos pesados ao ar livre e procure ambientes refrescantes.';
        }else if(tempNumero <= 45){
            texto= 'Calor perigoso. Risco alto de insolação e desidratação. Fique em locais frescos e beba líquidos constantemente.';
        }else{
            texto= 'Calor insuportável com risco à saúde. Não se exponha ao sol de forma alguma. Busque refúgio em local climatizado.';
        };

        mensagens.forEach(el => {
            el.textContent = texto;
        });
    }else{
        console.log("Nenhum dado na tela ainda.");
    };
};