const selectCrime = document.getElementById('select-crime');
const selectNivel = document.getElementById('select-nivel');

function aplicarFiltros() {
    flushEstados();
    
    const filtros = getFilters();
    
    if (filtros.idCrime === 0) {
        mapaViewPadrao();
        return;
    }

    colorirMapaPorCrime(filtros.idCrime, filtros.nivel);
}

selectCrime.addEventListener('change', aplicarFiltros);
selectNivel.addEventListener('change', aplicarFiltros);

function getFilters() {
    return {
        idCrime: parseInt(selectCrime.value, 10) || 0,
        nivel: selectNivel.value
    };
}