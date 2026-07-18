const municipiosColoridos = new Set();
const estadosColoridos = new Set();

async function renderizaMapaBrasil(idContainerMapaBrasil) {
    try {
        const response = await fetch('./source/mapaSvg/Mapa_do_Brasil_por_Municipios.svg');
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        const svg = await response.text();
        document.getElementById(idContainerMapaBrasil).innerHTML = svg;
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
    const idSvg = formatarIdMunicipio(cidade, estado);
    const elemento = document.getElementById(idSvg);

    if (elemento) {
        elemento.style.fill = corHexadecimal;
        municipiosColoridos.add(idSvg);
    } else {
        console.error(`ID não encontrado no SVG: ${idSvg}`);
    }
}

function limparMunicipios(cidade, estado) {
    const idSvg = formatarIdMunicipio(cidade, estado);
    const elemento = document.getElementById(idSvg);

    if (elemento) {
        elemento.style.fill = '#a8a8a8';
        municipiosColoridos.delete(idSvg);
    } else {
        console.error(`ID não encontrado no SVG: ${idSvg}`);
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

function formatarIdMunicipio(cidade, estado) {
    const preposicoes = ["de", "da", "do", "das", "dos"];
    const cidadeFormatada = cidade
        .trim()
        .toLowerCase()
        .split(' ')
        .map(palavra => {
            if (preposicoes.includes(palavra)) return palavra;
            return palavra.charAt(0).toUpperCase() + palavra.slice(1);
        })
        .join('_');

    return `${cidadeFormatada}_${estado.trim()}`;
}