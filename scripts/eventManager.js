window.mesesSelecionadosBrush = null;

const selectCrime = document.getElementById('select-crime');
const selectNivel = document.getElementById('select-nivel');

function aplicarFiltros() {
    flushEstados();
    if (typeof flushMunicipios === 'function') flushMunicipios();
    
    const filtros = getFilters();
    
    if (filtros.idCrime === 0) {
        mapaViewPadrao();
        d3.select("#grafico-barras").selectAll("*").remove();
        return;
    }

    window.mesesSelecionadosBrush = null;
    
    colorirMapaPorCrime(filtros.idCrime, filtros.nivel, true);
}

selectCrime.addEventListener('change', aplicarFiltros);
selectNivel.addEventListener('change', aplicarFiltros);

function getFilters() {
    return {
        idCrime: parseInt(selectCrime.value, 10) || 0,
        nivel: selectNivel.value
    };
}

window.onBrushEnd = function(meses) {
    window.mesesSelecionadosBrush = meses;
    const filtros = getFilters();
    
    colorirMapaPorCrime(filtros.idCrime, filtros.nivel, false);
};

document.addEventListener('click', function(event) {
    if (window.mesesSelecionadosBrush !== null) {
        
        const clicouNoGrafico = event.target.closest('#grafico-barras');
        const clicouNosControles = event.target.closest('#controles');
        
        if (!clicouNoGrafico && !clicouNosControles) {
            if (typeof window.limparBrushProgramaticamente === 'function') {
                window.limparBrushProgramaticamente();
            }
        }
    }
});