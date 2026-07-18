function renderizaMapaBrasil()
{
    const svgFile = '../source/mapaSvg/Mapa_do_Brasil_por_Municípios.svg';
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgFile, "image/svg+xml");
}