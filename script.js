async function buscarClima(){
    const cidade = document.getElementById('cidadeInput').value;
    const elementoResultado = document.getElementById('resultado');

    if(!cidade){
        alert("Por favor, digite o nome de uma cidade!");
        return;
    };

    const apiKey = "ff4463bc420ab3b4715d557d1e4cfd3c";
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${cidade}&appid=${apiKey}&units=metric&lang=pt_br`;

    try{
        const response = await fetch(url);
        const data = await response.json();

        if(response.ok){
            const temperatura=Math.floor(data.main.temp); // Arredonda a temperatura
            const descricao=data.weather[0].description;
            const icone=data.weather[0].icon;
            const umidade=data.main.humidity;
            const nomeCidade=data.name; // Nome oficial retornado pela API

            
            elementoResultado.innerHTML=
                `<h3>${nomeCidade}</h3>
                <p><strong>${temperatura}°C</strong> - ${descricao}</p>
                <img src="https://openweathermap.org/img/wn/${icone}@2x.png" alt="Icone do clima">
                <p>Umidade: ${umidade}%</p>`;
        }else{
            elementoResultado.innerHTML = `<p style="color:red">Cidade não encontrada ou erro na chave.</p>`;
        };

    }catch(error){
        console.error("Erro:", error);
        elementoResultado.innerHTML = "Erro ao conectar com a API.";
    };
};
