function primeiraVisualizacao() {
    const dadosHomicio = FilterService.filtrarPorCrime(2);
    const dadosAgrupados = FilterService.agruparPorUfMunicipio(dadosHomicio);
    const valores = dadosAgrupados.map(d => d.soma_vitimas);

    const [min, max] = d3.extent(dadosAgrupados, d => d.soma_vitimas);

    const escalaCor = d3.scaleQuantile()
        .domain(valores)
        .range(d3.schemeReds[7]);

    dadosAgrupados.forEach(d => {
        const cor = escalaCor(d.soma_vitimas);
        colorirMunicipio(d.municipio, d.uf,  cor);
    });
}