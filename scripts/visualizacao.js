function colorirMapaPorCrime(idCrime, nivel = 'estadual') {
    if (!NomesCrimes[idCrime]) {
        console.error("colorirMapaPorCrime - ID de crime não encontrado:", idCrime);
        return;
    }

    flushEstados();
    if (typeof flushMunicipios === 'function') flushMunicipios();

    const dadosCrime = FilterService.filtrarPorCrime(idCrime, nivel);
    let dadosAgrupados = [];

    if (nivel === 'estadual') {
        dadosAgrupados = FilterService.agruparPorUf(dadosCrime);
    } else {
        dadosAgrupados = FilterService.agruparPorUfMunicipio(dadosCrime);
    }

    const registrosComCrimes = dadosAgrupados.filter(d => d.soma_vitimas > 0);
    const registrosSemCrimes = dadosAgrupados.filter(d => d.soma_vitimas === 0);
    const valores = registrosComCrimes.map(d => d.soma_vitimas);

    const escalaCor = d3.scaleQuantile()
        .domain(valores.length > 0 ? valores : [0])
        .range(['#fcbba1','#fc9272','#fb6a4a','#de2d26','#a50f15']);

    const corZero = "#fee5d9";

    if (nivel === 'estadual') {
        registrosSemCrimes.forEach(d => {
            colorirEstado(d.uf, corZero, 0);
        });

        registrosComCrimes.forEach(d => {
            const cor = escalaCor(d.soma_vitimas);
            colorirEstado(d.uf, cor, d.vitimas_absolutas);
        });
    } else {
        registrosSemCrimes.forEach(d => {
            colorirMunicipio(d.municipio, d.uf, corZero, 0);
        });

        registrosComCrimes.forEach(d => {
            const cor = escalaCor(d.soma_vitimas);
            colorirMunicipio(d.municipio, d.uf, cor, d.soma_vitimas);
        });
    }

    criarLegenda(escalaCor, corZero); 
    criarGraficoBarras(idCrime, nivel);
}

function vincularTooltipMapa(selecaoD3, titulo, vitimas) {
    let tooltipMapa = d3.select("body").select(".tooltip-mapa");
    if (tooltipMapa.empty()) {
        tooltipMapa = d3.select("body").append("div")
            .attr("class", "tooltip-mapa")
            .style("position", "absolute")
            .style("background-color", "white")
            .style("border", "1px solid #ccc")
            .style("border-radius", "5px")
            .style("padding", "8px")
            .style("font-family", "sans-serif")
            .style("font-size", "12px")
            .style("pointer-events", "none")
            .style("opacity", 0)
            .style("box-shadow", "0px 2px 4px rgba(0,0,0,0.2)")
            .style("z-index", "999");
    }

    if (vitimas === undefined || vitimas === null) {
        selecaoD3.on("mouseover", null).on("mousemove", null).on("mouseleave", null);
        return;
    }

    selecaoD3
        .on("mouseover", function(event) {
            tooltipMapa.html(`
                <strong>${titulo}</strong><br>
                Total vítimas: ${Math.round(vitimas)}
            `).style("opacity", 1);
            
        })
        .on("mousemove", function(event) {
            tooltipMapa.style("left", (event.pageX + 15) + "px")
                       .style("top", (event.pageY - 25) + "px");
        })
        .on("mouseleave", function(event) {
            tooltipMapa.style("opacity", 0);
            
        });
}

function criarLegenda(escalaCor, corZero) {
    const cores = escalaCor.range();
    const cortes = escalaCor.quantiles();
    const valores = escalaCor.domain();
    const min = d3.min(valores);
    const max = d3.max(valores);
    const formatNum = d3.format(".2f");

    const legendData = [
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
            .attr("height", 180)
    }

    let legendaGrupo = svg.select(".leganda-mapa");
    if (legendaGrupo.empty()) {
        legendaGrupo = svg.append("g")
            .attr("class", "leganda-mapa")
            .attr("transform", "translate(20, 20)");
    } else {
        legendaGrupo.selectAll("*").remove();
    }

    const tamanhoQuadrado = 20;
    const espacamento = 5;

    const legendItem = legendaGrupo.selectAll(".legend-item")
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
        
    legendaGrupo.append("text")
        .attr("x", 0)
        .attr("y", -10)
        .text("Número de Vítimas")
        .style("font-family", "sans-serif")
        .style("font-weight", "bold")
        .style("font-size", "14px");
}

function criarGraficoBarras(idCrime, nivel = 'estadual') {
    if (!NomesCrimes[idCrime]) {
        console.error("criarGraficoBarras - ID de crime não encontrado:", idCrime);
        return;
    }

    const dadosCrime = FilterService.filtrarPorCrime(idCrime, nivel);
    const dadosAgrupados = FilterService.agruparPorMes(dadosCrime);
    
    dadosAgrupados.sort((a, b) => {
        if (a.ano !== b.ano) return parseInt(a.ano) - parseInt(b.ano);
        return parseInt(a.mes) - parseInt(b.mes);
    });

    const formataData = d => `${String(d.mes).padStart(2, '0')}/${d.ano}`;

    const margem = { top: 40, right: 10, bottom: 40, left: 40 };
    const largura = 800 - margem.left - margem.right;
    const altura = 120 - margem.top - margem.bottom; 

    const container = d3.select("#grafico-barras");
    container.selectAll("*").remove(); 

    const svg = container.append("svg")
        .attr("width", largura + margem.left + margem.right)
        .attr("height", altura + margem.top + margem.bottom)
        .append("g")
        .attr("transform", `translate(${margem.left},${margem.top})`);

    const min = d3.min(dadosAgrupados, d => d.soma_vitimas);
    const max = d3.max(dadosAgrupados, d => d.soma_vitimas);

    const x = d3.scaleBand()
        .domain(dadosAgrupados.map(formataData))
        .range([0, largura])
        .padding(0.2); 

    const y = d3.scaleLinear()
        .domain([min * 0.5, max]) 
        .range([altura, 0]); 

    svg.append("text")
        .attr("x", largura / 2) 
        .attr("y", -15) 
        .attr("text-anchor", "middle") 
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("font-family", "sans-serif")
        .style("fill", "#333") 
        .text("Somatório de vítimas ao longo do ano");

    svg.append("g")
        .attr("transform", `translate(0,${altura})`)
        .call(d3.axisBottom(x).tickSizeOuter(0))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end")
        .style("font-size", "10px"); 

    svg.append("g")
        .call(
            d3.axisLeft(y)
            .tickValues([min, max]) 
            .tickFormat(d => Math.round(d)) 
        )
        .select(".domain").attr("stroke", "#ccc"); 

    let tooltip = d3.select("body").select(".tooltip-barras");
    if (tooltip.empty()) {
        tooltip = d3.select("body").append("div")
            .attr("class", "tooltip-barras")
            .style("position", "absolute")
            .style("background-color", "white")
            .style("border", "1px solid #ccc")
            .style("border-radius", "5px")
            .style("padding", "8px")
            .style("font-family", "sans-serif")
            .style("font-size", "12px")
            .style("pointer-events", "none")
            .style("opacity", 0)
            .style("box-shadow", "0px 2px 4px rgba(0,0,0,0.2)");
    }

    svg.selectAll(".barra")
        .data(dadosAgrupados)
        .enter()
        .append("rect")
        .attr("class", "barra")
        .attr("x", d => x(formataData(d)))
        .attr("y", d => y(d.soma_vitimas))
        .attr("width", x.bandwidth())
        .attr("height", d => altura - y(d.soma_vitimas))
        .attr("fill", "#de2d26")
        
        .on("mouseover", function(event, d) {
            const nomeMes = nomesMeses[parseInt(d.mes) - 1];
            tooltip.html(`
                <strong>
                    ${nomeMes}
                </strong>
                <br>
                Total vítimas: ${Math.round(d.soma_vitimas)}`
            )
                .style("opacity", 1);
                    
            d3.select(this).attr("fill", "#a50f15"); 
        })
        .on("mousemove", function(event) {
            tooltip.style("left", (event.pageX + 15) + "px")
                   .style("top", (event.pageY - 25) + "px");
        })
        .on("mouseleave", function(event, d) {
            tooltip.style("opacity", 0);
            d3.select(this).attr("fill", "#de2d26");
        });
}

function mapaViewPadrao() {
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
    document.getElementById('legenda').innerText= ''; 
    document.getElementById('grafico-barras').innerText= ''; 
}