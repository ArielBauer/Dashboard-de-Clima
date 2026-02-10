const apiKey = "ff4463bc420ab3b4715d557d1e4cfd3c";
const inputCidade=document.getElementById('cidadeInput');
const listaSugestoes=document.getElementById('listaSugestoes');
let timerSugestao; // Variável para controlar o tempo de digitação

// Detecta quando o usuário digita
inputCidade.addEventListener('input', function(){
    const termo=this.value.trim();
    clearTimeout(timerSugestao); // Limpa o timer anterior se o usuário continuar digitando
    
    // Se tiver menos de 3 letras, esconde a lista e para
    if(termo.length < 3){
        listaSugestoes.style.display = 'none';
        return;
    };

    // Cria um novo timer: só chama a API se o usuário parar de digitar por 500ms
    timerSugestao=setTimeout(() => {
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

    if(cidades.length === 0){
        listaSugestoes.style.display='none';
        return;
    };

    cidades.forEach(cidade => {
        const li=document.createElement('li');
        li.classList.add('list-group-item', 'list-group-item-action', 'cursor-pointer');
        
        // Monta o texto: Nome, Estado, País
        let texto = `${cidade.name}`;
        if (cidade.state) texto += `, ${cidade.state}`;
        texto += `, ${cidade.country}`;
        li.textContent=texto;

        // Ao clicar na sugestão
        li.addEventListener('click', () => {
            inputCidade.value=texto; // Preenche o input visualmente
            listaSugestoes.style.display='none'; // Esconde a lista
            
            // Chama a busca de clima passando Latitude e Longitude (muito mais preciso)
            buscarClima(cidade.lat, cidade.lon); 
        });
        listaSugestoes.appendChild(li);
    });
    listaSugestoes.style.display = 'block'; // Mostra a lista
};

// Fecha a lista se clicar fora dela
document.addEventListener('click', (e) => {
    if (!inputCidade.contains(e.target) && !listaSugestoes.contains(e.target)) {
        listaSugestoes.style.display = 'none';
    };
});

async function buscarClima(lat=null, lon=null){
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
            const nomeCidade = data.name;

            elementoResultado.innerHTML = 
            `<h3>${nomeCidade}</h3>
            <p>
                <strong><span id="dado-temp">${temperatura}</span>°C</strong> - 
                <span>${descricao}</span>
            </p>
            <img src="https://openweathermap.org/img/wn/${icone}@2x.png" alt="Icone do clima">
            <p>Umidade: ${umidade}%</p>`;

            minhaOutraFuncao();
            /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        }else{
            elementoResultado.innerHTML = `<p class="text-danger">Cidade não encontrada.</p>`;
        };
    }catch(error){
        console.error("Erro:", error);
        elementoResultado.innerHTML = "Erro ao conectar com a API.";
    };
};
buscarClima(-29.9440222, -50.9930938); // Deixa uma cidade por padrão