const FilterService = {
    filtrarPorCrime: function(crime) {
        let crimeEnum;
        const registros = getDadosCriminalidade();

        if (typeof crime === 'number' || !isNaN(crime)) {
            crimeEnum = String(crime);
        } else {
            crimeEnum = String(MapeamentoCrimes[crime]);
        }

        return registros
            .filter(registro => registro.crime_enum === crimeEnum)
            .map(registro => (
                {
                    ...registro,
                    crime_nome: NomesCrimes[registro.crime_enum]
                }
            )
        );
    },

    agruparPorUfMunicipio: function(registros) {
        const grupos = registros.reduce((acc, registro) => {
            const chave = `${registro.uf}|${registro.municipio}`;

            if (!acc[chave]) {
                acc[chave] = {
                    uf: registro.uf,
                    municipio: registro.municipio,
                    crime_nome: registro.crime_nome,
                    soma_vitimas: 0
                };
            }

            acc[chave].soma_vitimas += parseFloat(registro.vitimas_escala) || 0;

            return acc;
        }, {});

        return Object.values(grupos);
    },

    agruparPorMes: function(registros) {
        const grupos = registros.reduce((acc, registro) => {
            const chave = `${registro.ano}|${registro.mes}`;

            if (!acc[chave]) {
                acc[chave] = {
                    ano: registro.ano,
                    mes: registro.mes,
                    crime_nome: registro.crime_nome,
                    soma_vitimas: 0
                };
            }

            acc[chave].soma_vitimas += parseFloat(registro.vitimas_escala) || 0;

            return acc;
        }, {});

        return Object.values(grupos);
    },
}