let _dadosCriminalidade = null;

(async () => {
    try {
        _dadosCriminalidade = await d3.csv("../source/dadosCrimesAnual/dadosTratados/dados_crimes_2025.csv");
        console.log("Dados carregados com sucesso:", _dadosCriminalidade.length, "registros.");

    } catch (erro) {
        console.error("Erro ao carregar o arquivo CSV:", erro);
    }
})();

function getDadosCriminalidade() {
    if (_dadosCriminalidade !== null)
        return _dadosCriminalidade;

    throw new Error("Os dados de criminalidade ainda não foram carregados.");
}

// Deixa acessível globalmente
window.getDadosCriminalidade = getDadosCriminalidade;