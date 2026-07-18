function primeiraVisualizacao() {
    const dadosHomicio = FilterService.filtrarPorCrime(2);
    const dadosAgrupados = FilterService.agruparPorUfMunicipio(dadosHomicio);

    const munComCrimes = dadosAgrupados.filter(d => d.soma_vitimas > 0);
    const munSemCrimes = dadosAgrupados.filter(d => d.soma_vitimas === 0);

    const valores = munComCrimes.map(d => d.soma_vitimas);

    const escalaCor = d3.scaleQuantile()
        .domain(valores)
        .range(['#fcbba1','#fc9272','#fb6a4a','#de2d26','#a50f15']);

    const corZero = "#fee5d9";

    munSemCrimes.forEach(d => {
        colorirMunicipio(d.municipio, d.uf, corZero);
    });

    munComCrimes.forEach(d => {
        const cor = escalaCor(d.soma_vitimas);
        colorirMunicipio(d.municipio, d.uf, cor);
    });

    criarLegenda(escalaCor, corZero);
}

function criarLegenda(escalaCor, corZero) {
    const cores = escalaCor.range();
    const cortes = escalaCor.quantiles();
    const valores = escalaCor.domain();
    const min = d3.min(valores);
    const max = d3.max(valores);
    const formatNum = d3.format(".2f");

    const legendData = [n 
        { cor: corZero, label: "0 vítimas" }
    ];

    cores.forEach((cor, i) => {
        let label = "";
        if (i === 0) {
            label = `1 - ${formatNum(cortes[i])}`;
        } else if (i === cores.length - 1) {
            label = `Mais de ${formatNum(cortes[i - 1])}`;
        } else {
            label = `${formatNum(cortes[i - 1])} - ${formatNum(cortes[i])}`;
        }
        legendData.push({ cor, label });
    });
    let svg = d3.select("#legenda").select("svg");
    
    if (svg.empty()) {
        svg = d3.select("#legenda").append("svg")
            .attr("width", 200)
            .attr("height", 250)
    }

    let legendGroup = svg.select(".map-legend");
    if (legendGroup.empty()) {
        legendGroup = svg.append("g")
            .attr("class", "map-legend")
            .attr("transform", "translate(20, 20)");
    } else {
        legendGroup.selectAll("*").remove();
    }

    const tamanhoQuadrado = 20;
    const espacamento = 5;

    const legendItem = legendGroup.selectAll(".legend-item")
        .data(legendData)
        .enter().append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(0, ${i * (tamanhoQuadrado + espacamento)})`);

    legendItem.append("rect")
        .attr("width", tamanhoQuadrado)
        .attr("height", tamanhoQuadrado)
        .style("fill", d => d.cor)
        .style("stroke", "#ccc")
        .style("stroke-width", "1px");

    legendItem.append("text")
        .attr("x", tamanhoQuadrado + 10)
        .attr("y", tamanhoQuadrado / 2)
        .attr("dy", "0.35em")
        .text(d => d.label)
        .style("font-family", "sans-serif")
        .style("font-size", "12px")
        .style("fill", "#333");
        
    legendGroup.append("text")
        .attr("x", 0)
        .attr("y", -10)
        .text("Número de Vítimas")
        .style("font-family", "sans-serif")
        .style("font-weight", "bold")
        .style("font-size", "14px");
}