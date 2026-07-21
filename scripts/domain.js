const ANO_PADRAO = 2025;

const _cachePromises = new Map();
const _cacheResolvidos = new Map();

function carregarDadosAno(ano) {
    ano = String(ano);

    if (_cachePromises.has(ano))
        return _cachePromises.get(ano);

    const promessa = (async () => {
        try {
            const dadosMunicipal = await d3.csv(`../source/dadosCrimesAnual/dadosTratados/dados_crimes_${ano}.csv`);
            const dadosEstadual = await d3.csv(`../source/dadosCrimesAnual/dadosTratados/dados_crimes_estados_${ano}.csv`);

            const dados = { municipal: dadosMunicipal, estadual: dadosEstadual };
            _cacheResolvidos.set(ano, dados);

            console.log(`Dados de ${ano} carregados com sucesso:`, dadosMunicipal.length, "registros municipais,", dadosEstadual.length, "registros estaduais.");

            return dados;
        } catch (erro) {
            console.error(`Erro ao carregar os CSVs do ano ${ano}:`, erro);
            _cachePromises.delete(ano); 
            throw erro;
        }
    })();

    _cachePromises.set(ano, promessa);
    return promessa;
}

function getDadosCriminalidade(ano) {
    const dados = _cacheResolvidos.get(String(ano));

    if (dados)
        return dados.municipal;

    throw new Error(`Os dados municipais de ${ano} ainda não foram carregados.`);
}

function getDadosCriminalidadeEstado(ano) {
    const dados = _cacheResolvidos.get(String(ano));

    if (dados)
        return dados.estadual;

    throw new Error(`Os dados estaduais de ${ano} ainda não foram carregados.`);
}

window.carregarDadosAno = carregarDadosAno;
window.getDadosCriminalidade = getDadosCriminalidade;
window.getDadosCriminalidadeEstado = getDadosCriminalidadeEstado;

carregarDadosAno(ANO_PADRAO);

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