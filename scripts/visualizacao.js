function colorirMapaPorCrime(idCrime, nivel = 'estadual', atualizarGrafico = true) {
    if (!NomesCrimes[idCrime]) {
        console.error("colorirMapaPorCrime - ID de crime não encontrado:", idCrime);
        return;
    }

    flushEstados();
    flushMunicipios();

    let dadosCrime = FilterService.filtrarPorCrime(idCrime, nivel);
    
    if (window.mesesSelecionadosBrush && window.mesesSelecionadosBrush.length > 0) {
        dadosCrime = dadosCrime.filter(d => {
            return window.mesesSelecionadosBrush.some(selecionado => 
                selecionado.mes === d.mes && selecionado.ano === d.ano
            );
        });
    }

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
        registrosSemCrimes.forEach(d => colorirEstado(d.uf, corZero, 0));
        registrosComCrimes.forEach(d => colorirEstado(d.uf, escalaCor(d.soma_vitimas), d.vitimas_absolutas));
    } else {
        registrosSemCrimes.forEach(d => colorirMunicipio(d.municipio, d.uf, corZero, 0));
        registrosComCrimes.forEach(d => colorirMunicipio(d.municipio, d.uf, escalaCor(d.soma_vitimas), d.soma_vitimas));
    }

    criarLegenda(escalaCor, corZero); 
    
    if (atualizarGrafico) {
        criarGraficoBarras(idCrime, nivel);
    }
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
            .style("box-shadow", "0px 2px 4px rgba(0,0,0,0.2)");
    }

    if (vitimas === undefined || vitimas === null) {
        selecaoD3.on("mouseover", null).on("mousemove", null).on("mouseleave", null);
        return;
    }

    selecaoD3.on("mouseover", function(event) {
            tooltipMapa.html(`
                <strong>${titulo}</strong><br>
                Total vítimas: ${Math.round(vitimas)}
            `).style("opacity", 1);
            
        })
        .on("mousemove", function(event) {
            tooltipMapa.style("left", (event.pageX + 15) + "px").style("top", (event.pageY - 25) + "px");
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
    const formatarCasasDecimais = d3.format(".2f");

    const legendData = [
        { cor: corZero, label: "0 vítimas" }
    ];

    cores.forEach((cor, i) => {
        let label = "";
        if (i === 0) {
            label = `1 - ${formatarCasasDecimais(cortes[i])}`;
        } else if (i === cores.length - 1) {
            label = `Mais de ${formatarCasasDecimais(cortes[i - 1])}`;
        } else {
            label = `${formatarCasasDecimais(cortes[i - 1])} - ${formatarCasasDecimais(cortes[i])}`;
        }
        legendData.push({ cor, label });
    });

    let svg = d3.select("#legenda").select("svg");
    if (svg.empty()) {
        svg = d3.select("#legenda").append("svg")
            .attr("width", 200)
            .attr("height", 190)
    }

    let legendaGrupo = svg.select(".leganda-mapa");
    if (legendaGrupo.empty()) {
        legendaGrupo = svg.append("g")
            .attr("class", "leganda-mapa")
            .attr("transform", "translate(20, 20)");
    } 
    else {
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
        .text("Número de Vítimas*")
        .style("font-family", "sans-serif")
        .style("font-weight", "bold")
        .style("font-size", "14px");

        legendaGrupo.append("text")
        .attr("x", -20)
        .attr("y", 165)
        .text("* na escala de evento p/ 100 mil hab.")
        .style("font-family", "sans-serif")
        .style("font-size", "12px");
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
    const largura = 710 - margem.left - margem.right;
    const altura = 120 - margem.top - margem.bottom; 

    const container = d3.select("#grafico-barras");
    container.selectAll("*").remove(); 

    const svg = container.append("svg")
        .attr("width", largura + margem.left + margem.right)
        .attr("height", altura + margem.top + margem.bottom)
        .append("g")
        .attr("transform", `translate(${margem.left},${margem.top})`);

    const min = d3.min(dadosAgrupados, d => d.vitimas_absolutas);
    const max = d3.max(dadosAgrupados, d => d.vitimas_absolutas);

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
        .text("Quantidade de vítimas por mês");

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

    console.log(dadosAgrupados)

    svg.selectAll(".barra")
        .data(dadosAgrupados)
        .enter()
        .append("rect")
        .attr("class", "barra")
        .attr("x", d => x(formataData(d)))
        .attr("y", d => y(d.vitimas_absolutas))
        .attr("width", x.bandwidth())
        .attr("height", d => altura - y(d.vitimas_absolutas))
        .attr("fill", "#de2d26")
        
    const brush = d3.brushX()
        .extent([[0, 0], [largura, altura]])
        .on("brush end", function(event) {
            const selection = event.selection;
            
            if (!selection) {
                svg.selectAll(".barra").attr("opacity", 1);
                if (event.type === "end") window.onBrushEnd(null);
                return;
            }

            const [x0, x1] = selection;
            const mesesSelecionados = [];

            svg.selectAll(".barra").each(function(d) {
                const posicaoX = x(formataData(d));
                const centroBarra = posicaoX + (x.bandwidth() / 2);
                const estaDentroDaSelecao = centroBarra >= x0 && centroBarra <= x1;

                d3.select(this).attr("opacity", estaDentroDaSelecao ? 1 : 0.2);

                if (estaDentroDaSelecao) {
                    mesesSelecionados.push({ mes: d.mes, ano: d.ano });
                }
            });

            if (event.type === "end") {
                window.onBrushEnd(mesesSelecionados);
            }
        });

    const brushGroup = svg.append("g")
        .attr("class", "brush")
        .call(brush);
        
    brushGroup.on("mousemove", function(event) {
            const [mouseX] = d3.pointer(event);
            
            const hoveredData = dadosAgrupados.find(d => {
                const startX = x(formataData(d));
                const endX = startX + x.bandwidth();
                return mouseX >= startX && mouseX <= endX;
            });

            if (hoveredData) {
                const nomeMes = nomesMeses[parseInt(hoveredData.mes) - 1];
                tooltip.html(`
                    <strong>${nomeMes}</strong><br>
                    Total vítimas: ${Math.round(hoveredData.vitimas_absolutas)}
                `)
                .style("opacity", 1)
                .style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY - 25) + "px");

                svg.selectAll(".barra")
                    .attr("fill", d => d === hoveredData ? "#a50f15" : "#de2d26");
            } else {
                tooltip.style("opacity", 0);
                svg.selectAll(".barra").attr("fill", "#de2d26");
            }
        })
        .on("mouseleave", function() {
            tooltip.style("opacity", 0);
            svg.selectAll(".barra").attr("fill", "#de2d26");
        });

    window.limparBrush = function() {
        brushGroup.call(brush.move, null);
    };
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