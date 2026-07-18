
const selectCrime = document.getElementById('select-crime');

selectCrime.addEventListener('change', (evento) => {
    flushEstados();
    const valorSelecionado = evento.target.value;
    
    if (valorSelecionado !== "") {
        const idDoCrime = parseInt(valorSelecionado, 10);
        if(idDoCrime == 0)
        {
            mapaViewPadrao();
            return;
        }

        colorirMapaPorCrime(idDoCrime);
    }
});

function getFilters()
{
    
}