let _dadosCriminalidade = null;

(async () => {
    try {
        _dadosCriminalidade = await d3.csv("../source/dadosCrimesAnual/dadosTratados/dados_crimes_2025.csv");
        console.log("Dados carregados com sucesso:", _dadosCriminalidade.length, "registros.");
        // console.log("Prévia:", JSON.stringify(_dadosCriminalidade.slice(0, 5), null, 1));

    } catch (erro) {
        console.error("Erro ao carregar o arquivo CSV:", erro);
    }
})();

function getDadosCriminalidade() {
    if (_dadosCriminalidade !== null)
        return _dadosCriminalidade;

    throw new Error("Os dados de criminalidade ainda não foram carregados.");
}

window.getDadosCriminalidade = getDadosCriminalidade;

const MapeamentoCrimes = Object.freeze({
    'Feminicídio': 1,
    'Homicídio doloso': 2,
    'Lesão corporal seguida de morte': 3,
    'Morte no trânsito ou em decorrência dele (exceto homicídio doloso)': 4,
    'Mortes no trânsito': 5,
    'Roubo seguido de morte (latrocínio)': 6,
    'Suicídio': 7,
    'Tentativa de feminicídio': 8,
    'Tentativa de homicídio': 9
});

const NomesCrimes = Object.freeze(
    Object.fromEntries(
        Object.entries(MapeamentoCrimes).map(([chave, valor]) => [valor, chave])
    )
);

const nomesMeses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];