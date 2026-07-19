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

        const svgElement = d3.select(container).select('svg');
        
        const zoomGroup = svgElement.append('g').attr('id', 'zoom-layer');
        
        const svgNode = svgElement.node();
        const zoomNode = zoomGroup.node();
        
        Array.from(svgNode.childNodes).forEach(child => {
            if (child !== zoomNode) {
                zoomNode.appendChild(child);
            }
        });

        const zoom = d3.zoom()
            .scaleExtent([1, 10])
            .on('zoom', (event) => {
                zoomGroup.attr('transform', event.transform);
            });

        svgElement.call(zoom);
        
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
function colorirEstado(siglaEstado, corHexadecimal, vitimas) {
    const sigla = siglaEstado.toUpperCase();
    const seletor = `path[id*="_${sigla}-"], path[id$="_${sigla}"]`;
    
    const municipios = d3.selectAll(seletor);

    if (municipios.empty()) {
        console.warn(`Nenhum município encontrado para a sigla: ${sigla}`);
        return;
    }

    municipios.style("fill", corHexadecimal);
    estadosColoridos.add(sigla);

    const tituloTooltip = sigla;
    vincularTooltipMapa(municipios, tituloTooltip, vitimas);
}

function limparEstados(siglaEstado) {
    const sigla = siglaEstado.toUpperCase();
    const seletor = `path[id*="_${sigla}-"], path[id$="_${sigla}"]`;
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
        const seletor = `path[id*="_${sigla}-"], path[id$="_${sigla}"]`;
        const municipios = document.querySelectorAll(seletor);
        municipios.forEach(municipio => {
            municipio.style.fill = 'none';
        });
    });
    estadosColoridos.clear();
}

function colorirMunicipio(cidade, estado, corHexadecimal, vitimas) {
    const idSvg = obterIdRealDoSvg(cidade, estado);
    
    if (!idSvg) {
        console.error(`Município não encontrado no dicionário após limpar texto: ${cidade} - ${estado}`);
        return;
    }

    const elemento = d3.select(`[id="${idSvg}"]`);

    if (!elemento.empty()) {
        elemento.style("fill", corHexadecimal);
        municipiosColoridos.add(idSvg);

        const tituloTooltip = `${cidade} - ${estado}`;
        vincularTooltipMapa(elemento, tituloTooltip, vitimas);
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

// Auto execuçãco
// Apenas para carregar o mapa do brasil
(async () => {
    await renderizaMapaBrasil('display');
    document.getElementById('map-style').innerHTML = ''; //Removendo style global do background do svg
    mapaViewPadrao();
})();