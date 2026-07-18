const municipiosColoridos = new Set();
const estadosColoridos = new Set();
const dicionarioSvg = new Map();

async function renderizaMapaBrasil(idContainerMapaBrasil) {
    try {
        const response = await fetch('./source/mapaSvg/Mapa_do_Brasil_por_Municipios.svg');
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        const svg = await response.text();
        const container = document.getElementById(idContainerMapaBrasil);
        container.innerHTML = svg;

        const paths = container.querySelectorAll('path[id]');
        paths.forEach(path => {
            const idOriginal = path.id;
            const chaveLimpa = simplificarTexto(idOriginal);
            dicionarioSvg.set(chaveLimpa, idOriginal);
        });

    } catch (error) {
        console.error('Erro ao carregar o SVG:', error);
    }
}

function colorirEstado(siglaEstado, corHexadecimal) {
    const sigla = siglaEstado.toUpperCase();
    const seletor = `path[id*="_${sigla}-"]`;
    const municipios = document.querySelectorAll(seletor);

    if (municipios.length === 0) {
        console.warn(`Nenhum município encontrado para a sigla: ${sigla}`);
        return;
    }

    municipios.forEach(municipio => {
        municipio.style.fill = corHexadecimal;
    });

    estadosColoridos.add(sigla);
}

function limparEstados(siglaEstado) {
    const sigla = siglaEstado.toUpperCase();
    const seletor = `path[id*="_${sigla}-"]`;
    const municipios = document.querySelectorAll(seletor);

    if (municipios.length === 0) {
        console.warn(`Nenhum município encontrado para a sigla: ${sigla}`);
        return;
    }

    municipios.forEach(municipio => {
        municipio.style.fill = 'none';
    });

    estadosColoridos.delete(sigla);
}

function flushEstados() {
    estadosColoridos.forEach(sigla => {
        const seletor = `path[id*="_${sigla}-"]`;
        const municipios = document.querySelectorAll(seletor);
        municipios.forEach(municipio => {
            municipio.style.fill = 'none';
        });
    });
    estadosColoridos.clear();
}

function colorirMunicipio(cidade, estado, corHexadecimal) {
    const idSvg = obterIdRealDoSvg(cidade, estado);
    
    if (!idSvg) {
        console.error(`Município não encontrado no dicionário após limpar texto: ${cidade} - ${estado}`);
        return;
    }

    const elemento = document.getElementById(idSvg);
    if (elemento) {
        elemento.style.fill = corHexadecimal;
        municipiosColoridos.add(idSvg);
    }
}

function limparMunicipios(cidade, estado) {
    const idSvg = obterIdRealDoSvg(cidade, estado);
    
    if (!idSvg) return;

    const elemento = document.getElementById(idSvg);
    if (elemento) {
        elemento.style.fill = '#a8a8a8';
        municipiosColoridos.delete(idSvg);
    }
}

function flushMunicipios() {
    municipiosColoridos.forEach(idSvg => {
        const elemento = document.getElementById(idSvg);
        if (elemento) {
            elemento.style.fill = '#a8a8a8';
        }
    });
    municipiosColoridos.clear();
}

function simplificarTexto(texto) {
    return texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]/g, "")
        .toLowerCase();
}

function obterIdRealDoSvg(cidade, estado) {
    const chaveBusca = simplificarTexto(cidade + estado);
    return dicionarioSvg.get(chaveBusca);
}


function mapaViewPadrao()
{
    const corPadrao = '#5ead4f';
    flushEstados();
    flushMunicipios();

    colorirEstado('AC',corPadrao);
    colorirEstado('AL',corPadrao);
    colorirEstado('AP',corPadrao);
    colorirEstado('AM',corPadrao);
    colorirEstado('BA',corPadrao);
    colorirEstado('CE',corPadrao);
    colorirEstado('DF',corPadrao);
    colorirMunicipio('Brasília','DF',corPadrao)
    colorirEstado('ES',corPadrao);
    colorirEstado('GO',corPadrao);
    colorirEstado('MA',corPadrao);
    colorirEstado('MS',corPadrao);
    colorirEstado('MT',corPadrao);
    colorirEstado('MG',corPadrao);
    colorirEstado('PA',corPadrao);
    colorirEstado('PB',corPadrao);
    colorirEstado('PR',corPadrao);
    colorirEstado('PE',corPadrao);
    colorirEstado('PI',corPadrao);
    colorirEstado('RJ',corPadrao);
    colorirEstado('RN',corPadrao);
    colorirEstado('RS',corPadrao);
    colorirEstado('RO',corPadrao);
    colorirEstado('RR',corPadrao);
    colorirEstado('SC',corPadrao);
    colorirEstado('SP',corPadrao);
    colorirEstado('SE',corPadrao);
    colorirEstado('TO',corPadrao);

    
}

// Auto execuçãco
// Apenas para carregar o mapa do brasil
(async () => {
    await renderizaMapaBrasil('display');
    document.getElementById('map-style').innerHTML = ''; //Removendo style global do background do svg

    // Cor default
    mapaViewPadrao();
})();