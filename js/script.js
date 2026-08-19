"use strict";

/* =========================================================
   SIGDH 3.0
   Sistema de Análise de Ofensores SAC e NIP
   ========================================================= */

let demandas = [];

let graficos = {
    ofensor: null,
    prioridade: null,
    status: null,
    operadora: null
};

let arquivoAtual = "";

/*
    COLUNAS ANALISADAS:

    A   = 0
    G   = 6
    I   = 8
    L   = 11
    P   = 15
    Q   = 16
    AD  = 29
    AE  = 30
    AM  = 38
    AV  = 47
    BB  = 53
*/

const COLUNAS_ANALISADAS = [
    0,
    6,
    8,
    11,
    15,
    16,
    29,
    30,
    38,
    47,
    53
];


/* =========================================================
   FUNÇÕES AUXILIARES
   ========================================================= */

function $(id) {
    return document.getElementById(id);
}


function normalizar(valor) {

    return String(valor ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();

}


function escaparHTML(valor) {

    return String(valor ?? "")
        .replace(/[&<>"']/g, function (caractere) {

            const mapa = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            };

            return mapa[caractere];

        });

}


function valorColuna(linha, indice) {

    if (
        indice === undefined ||
        indice === null ||
        indice < 0
    ) {

        return "";

    }

    return linha[indice] ?? "";

}


/* =========================================================
   DATA E HORA
   ========================================================= */

function atualizarRelogio() {

    const agora = new Date();

    const data = agora.toLocaleDateString("pt-BR");

    const hora = agora.toLocaleTimeString("pt-BR");

    if ($("dataAtual")) {

        $("dataAtual").textContent = data;

    }

    if ($("horaAtual")) {

        $("horaAtual").textContent = hora;

    }

}


setInterval(
    atualizarRelogio,
    1000
);

atualizarRelogio();


/* =========================================================
   LOCALIZAR CABEÇALHOS
   ========================================================= */

function localizarCabecalho(cabecalho, termos) {

    if (!cabecalho) {

        return -1;

    }

    for (
        let i = 0;
        i < cabecalho.length;
        i++
    ) {

        const texto =
            normalizar(
                cabecalho[i]
            );

        for (
            const termo of termos
        ) {

            if (
                texto.includes(
                    normalizar(termo)
                )
            ) {

                return i;

            }

        }

    }

    return -1;

}


/* =========================================================
   MONTAR TEXTO DAS 11 COLUNAS
   ========================================================= */

function obterTextoAnalise(linha) {

    const partes = [];

    COLUNAS_ANALISADAS.forEach(
        indice => {

            const valor =
                valorColuna(
                    linha,
                    indice
                );

            if (
                String(valor).trim() !== ""
            ) {

                partes.push(
                    String(valor)
                );

            }

        }
    );

    return partes.join(" | ");

}


/* =========================================================
   IDENTIFICAÇÃO DO OFENSOR
   ========================================================= */

function identificarOfensor(texto) {

    const t =
        normalizar(texto);


    /*
       OPME
    */

    const palavrasOPME = [

        "opme",
        "protese",
        "proteses",
        "ortese",
        "orteses",
        "implante",
        "implantes",
        "material implantavel"

    ];


    if (
        palavrasOPME.some(
            palavra =>
                t.includes(palavra)
        )
    ) {

        return "OPME";

    }


    /*
       MEDICAMENTO
    */

    const palavrasMedicamento = [

        "medicamento",
        "medicamentos",
        "medicacao",
        "medicacoes",
        "remedio",
        "remedios",
        "farmaco",
        "farmacos",
        "insulina",
        "antibiotico",
        "quimioterapia",
        "oncologico"

    ];


    if (
        palavrasMedicamento.some(
            palavra =>
                t.includes(palavra)
        )
    ) {

        return "Medicamento";

    }


    /*
       FARMÁCIA
    */

    const palavrasFarmacia = [

        "farmacia",
        "farmaceutico",
        "farmaceutica",
        "dispensacao",
        "dispensar",
        "balcao de farmacia"

    ];


    if (
        palavrasFarmacia.some(
            palavra =>
                t.includes(palavra)
        )
    ) {

        return "Farmácia";

    }


    /*
       LOGÍSTICA
    */

    const palavrasLogistica = [

        "entrega",
        "entrega atrasada",
        "atraso na entrega",
        "transporte",
        "transportadora",
        "chegada",
        "nao chegou",
        "nao receb",
        "extravio",
        "logistica",
        "prazo de entrega",
        "pedido atrasado",
        "demora na entrega"

    ];


    if (
        palavrasLogistica.some(
            palavra =>
                t.includes(palavra)
        )
    ) {

        return "Logística";

    }


    /*
       MATERIAL
    */

    const palavrasMaterial = [

        "material",
        "materiais",
        "insumo",
        "insumos",
        "equipamento",
        "equipamentos",
        "coletor",
        "curativo",
        "seringa",
        "seringas",
        "cateter",
        "cateteres"

    ];


    if (
        palavrasMaterial.some(
            palavra =>
                t.includes(palavra)
        )
    ) {

        return "Material";

    }


    /*
       REGULAÇÃO
    */

    const palavrasRegulacao = [

        "autorizacao",
        "autorizacao negada",
        "senha",
        "liberacao",
        "regulacao",
        "negativa",
        "negado",
        "negada",
        "guia",
        "procedimento autorizado",
        "procedimento negado"

    ];


    if (
        palavrasRegulacao.some(
            palavra =>
                t.includes(palavra)
        )
    ) {

        return "Regulação";

    }


    return "Não Identificado";

}


/* =========================================================
   IDENTIFICAÇÃO DA PRIORIDADE
   ========================================================= */

function identificarPrioridade(texto) {

    const t =
        normalizar(texto);


    const palavrasAlta = [

        "urgente",
        "urgencia",
        "emergencia",
        "emergencial",
        "cirurgia",
        "internado",
        "internacao",
        "uti",
        "risco de vida",
        "risco",
        "imediato",
        "imediata",
        "grave",
        "gravidade"

    ];


    if (
        palavrasAlta.some(
            palavra =>
                t.includes(palavra)
        )
    ) {

        return "Alta";

    }


    const palavrasMedia = [

        "pendente",
        "atraso",
        "aguardando",
        "demora",
        "prazo",
        "reclamacao",
        "reclamação"

    ];


    if (
        palavrasMedia.some(
            palavra =>
                t.includes(palavra)
        )
    ) {

        return "Média";

    }


    return "Baixa";

}


/* =========================================================
   STATUS
   ========================================================= */

function identificarStatus(prioridade) {

    if (
        prioridade === "Alta"
    ) {

        return "Crítico";

    }

    return "Aberto";

}


/* =========================================================
   IMPORTAÇÃO DO EXCEL
   ========================================================= */

function importarExcel() {

    const input =
        $("arquivoExcel");

    if (!input) {

        return;

    }


    const arquivo =
        input.files[0];


    if (!arquivo) {

        alert(
            "Selecione uma planilha Excel."
        );

        return;

    }


    importarArquivo(
        arquivo
    );

}


/* =========================================================
   PROCESSAR ARQUIVO
   ========================================================= */

function importarArquivo(arquivo) {

    arquivoAtual =
        arquivo.name;


    atualizarProgresso(
        15
    );


    const reader =
        new FileReader();


    reader.onload =
        function (evento) {

            try {

                atualizarProgresso(
                    35
                );


                const dados =
                    new Uint8Array(
                        evento.target.result
                    );


                const workbook =
                    XLSX.read(
                        dados,
                        {
                            type: "array",
                            cellDates: true
                        }
                    );


                atualizarProgresso(
                    55
                );


                const primeiraPlanilha =
                    workbook.SheetNames[0];


                const sheet =
                    workbook.Sheets[
                        primeiraPlanilha
                    ];


                const linhas =
                    XLSX.utils.sheet_to_json(
                        sheet,
                        {
                            header: 1,
                            defval: ""
                        }
                    );


                atualizarProgresso(
                    75
                );


                processarPlanilha(
                    linhas
                );


                atualizarProgresso(
                    100
                );


                setTimeout(
                    function () {

                        atualizarProgresso(
                            0
                        );

                    },
                    1000
                );


            }

            catch (erro) {

                console.error(
                    erro
                );


                atualizarProgresso(
                    0
                );


                alert(
                    "Erro ao ler a planilha."
                );

            }

        };


    reader.readAsArrayBuffer(
        arquivo
    );

}


/* =========================================================
   PROGRESSO
   ========================================================= */

function atualizarProgresso(valor) {

    if (
        $("progressBar")
    ) {

        $("progressBar").style.width =
            valor + "%";

    }

}


/* =========================================================
   PROCESSAR PLANILHA
   ========================================================= */

function processarPlanilha(linhas) {

    if (
        !linhas ||
        linhas.length < 2
    ) {

        alert(
            "A planilha não possui registros."
        );

        return;

    }


    const cabecalho =
        linhas[0];


    /*
       Tentamos encontrar
       campos principais pelos nomes.
    */

    const indices = {

        registro:
            localizarCabecalho(
                cabecalho,
                [
                    "registro",
                    "n registro"
                ]
            ),

        protocolo:
            localizarCabecalho(
                cabecalho,
                [
                    "protocolo"
                ]
            ),

        beneficiario:
            localizarCabecalho(
                cabecalho,
                [
                    "beneficiario",
                    "beneficiário"
                ]
            ),

        operadora:
            localizarCabecalho(
                cabecalho,
                [
                    "operadora"
                ]
            ),

        prestador:
            localizarCabecalho(
                cabecalho,
                [
                    "prestador",
                    "nm pessoa prestador"
                ]
            )

    };


    const registros =
        linhas
            .slice(1)
            .filter(
                linha =>
                    linha.some(
                        valor =>
                            String(
                                valor ?? ""
                            ).trim() !== ""
                    )
            );


    demandas =
        registros.map(
            function (
                linha,
                indice
            ) {


                /*
                   As 11 colunas
                   são utilizadas
                   para identificar
                   o ofensor.
                */

                const textoAnalise =
                    obterTextoAnalise(
                        linha
                    );


                const ofensor =
                    identificarOfensor(
                        textoAnalise
                    );


                const prioridade =
                    identificarPrioridade(
                        textoAnalise
                    );


                const status =
                    identificarStatus(
                        prioridade
                    );


                return {

                    id:
                        indice + 1,

                    registro:
                        valorColuna(
                            linha,
                            indices.registro
                        ),

                    protocolo:
                        valorColuna(
                            linha,
                            indices.protocolo
                        ),

                    beneficiario:
                        valorColuna(
                            linha,
                            indices.beneficiario
                        ),

                    operadora:
                        valorColuna(
                            linha,
                            indices.operadora
                        ),

                    prestador:
                        valorColuna(
                            linha,
                            indices.prestador
                        ),

                    reclamacao:
                        textoAnalise,

                    ofensor:
                        ofensor,

                    prioridade:
                        prioridade,

                    status:
                        status,

                    dadosOriginais:
                        linha

                };

            }
        );


    atualizarTudo();


    salvarHistorico();


    if (
        $("btnExportar")
    ) {

        $("btnExportar").disabled =
            false;

    }


    if (
        $("statusImportacao")
    ) {

        $("statusImportacao").textContent =
            demandas.length.toLocaleString(
                "pt-BR"
            ) +
            " registros analisados com sucesso.";

    }

}


/* =========================================================
   ATUALIZAR TUDO
   ========================================================= */

function atualizarTudo() {

    atualizarTabela();

    atualizarCards();

    atualizarResumo();

    atualizarRanking();

    atualizarGraficos();

}


/* =========================================================
   FILTROS
   ========================================================= */

function obterDadosFiltrados() {

    const busca =
        normalizar(
            $("busca")
                ? $("busca").value
                : ""
        );


    const ofensor =
        $("filtroOfensor")
            ? $("filtroOfensor").value
            : "";


    const prioridade =
        $("filtroPrioridade")
            ? $("filtroPrioridade").value
            : "";


    const status =
        $("filtroStatus")
            ? $("filtroStatus").value
            : "";


    return demandas.filter(
        function (item) {

            const texto =
                normalizar(
                    [
                        item.registro,
                        item.protocolo,
                        item.beneficiario,
                        item.operadora,
                        item.prestador,
                        item.reclamacao,
                        item.ofensor
                    ].join(" ")
                );


            return (

                (
                    !busca ||
                    texto.includes(
                        busca
                    )
                )

                &&

                (
                    !ofensor ||
                    item.ofensor ===
                        ofensor
                )

                &&

                (
                    !prioridade ||
                    item.prioridade ===
                        prioridade
                )

                &&

                (
                    !status ||
                    item.status ===
                        status
                )

            );

        }
    );

}


/* =========================================================
   TABELA
   ========================================================= */

function atualizarTabela() {

    const tabela =
        $("tabelaDemandas");


    if (!tabela) {

        return;

    }


    const dados =
        obterDadosFiltrados();


    tabela.innerHTML =
        "";


    if (
        $("contadorTabela")
    ) {

        $("contadorTabela").textContent =
            dados.length.toLocaleString(
                "pt-BR"
            ) +
            " de " +
            demandas.length.toLocaleString(
                "pt-BR"
            ) +
            " registros";

    }


    if (
        dados.length === 0
    ) {

        tabela.innerHTML = `

            <tr>

                <td
                    colspan="10"
                    class="empty"
                >

                    Nenhuma demanda encontrada.

                </td>

            </tr>

        `;

        return;

    }


    dados.forEach(
        function (item) {

            const classePrioridade =
                normalizar(
                    item.prioridade
                );


            tabela.insertAdjacentHTML(
                "beforeend",
                `

                <tr>

                    <td>
                        ${item.id}
                    </td>

                    <td>
                        ${escaparHTML(
                            item.registro
                        )}
                    </td>

                    <td>
                        ${escaparHTML(
                            item.protocolo
                        )}
                    </td>

                    <td>
                        ${escaparHTML(
                            item.beneficiario
                        )}
                    </td>

                    <td>
                        ${escaparHTML(
                            item.operadora
                        )}
                    </td>

                    <td>
                        ${escaparHTML(
                            item.prestador
                        )}
                    </td>

                    <td>
                        ${escaparHTML(
                            item.reclamacao
                        )}
                    </td>

                    <td>
                        <strong>
                            ${item.ofensor}
                        </strong>
                    </td>

                    <td
                        class="prioridade-${classePrioridade}"
                    >
                        ${item.prioridade}
                    </td>

                    <td
                        class="${
                            item.status === "Crítico"
                                ? "status-critico"
                                : ""
                        }"
                    >
                        ${item.status}
                    </td>

                </tr>

                `

            );

        }
    );

}


/* =========================================================
   CARDS
   ========================================================= */

function quantidadeOfensor(nome) {

    return demandas.filter(
        item =>
            item.ofensor === nome
    ).length;

}


function atualizarCards() {

    if (
        $("totalDemandas")
    ) {

        $("totalDemandas").textContent =
            demandas.length;

    }


    if (
        $("totalMaterial")
    ) {

        $("totalMaterial").textContent =
            quantidadeOfensor(
                "Material"
            );

    }


    if (
        $("totalMedicamento")
    ) {

        $("totalMedicamento").textContent =
            quantidadeOfensor(
                "Medicamento"
            );

    }


    if (
        $("totalFarmacia")
    ) {

        $("totalFarmacia").textContent =
            quantidadeOfensor(
                "Farmácia"
            );

    }


    if (
        $("totalLogistica")
    ) {

        $("totalLogistica").textContent =
            quantidadeOfensor(
                "Logística"
            );

    }


    if (
        $("totalOpme")
    ) {

        $("totalOpme").textContent =
            quantidadeOfensor(
                "OPME"
            );

    }


    if (
        $("totalRegulacao")
    ) {

        $("totalRegulacao").textContent =
            quantidadeOfensor(
                "Regulação"
            );

    }


    if (
        $("totalCriticas")
    ) {

        $("totalCriticas").textContent =
            demandas.filter(
                item =>
                    item.status ===
                    "Crítico"
            ).length;

    }

}


/* =========================================================
   RESUMO
   ========================================================= */

function atualizarResumo() {

    const elemento =
        $("resumoSistema");


    if (!elemento) {

        return;

    }


    if (
        demandas.length === 0
    ) {

        elemento.textContent =
            "Nenhuma planilha importada.";

        return;

    }


    const ranking = {};


    demandas.forEach(
        function (item) {

            ranking[item.ofensor] =
                (
                    ranking[item.ofensor] ||
                    0
                ) + 1;

        }
    );


    const principal =
        Object.entries(
            ranking
        )
        .sort(
            (a, b) =>
                b[1] - a[1]
        )[0];


    const criticas =
        demandas.filter(
            item =>
                item.status ===
                "Crítico"
        ).length;


    elemento.innerHTML = `

        <p>

            Total de demandas:

            <strong>
                ${demandas.length.toLocaleString(
                    "pt-BR"
                )}
            </strong>

        </p>

        <p>

            Principal ofensor:

            <strong>
                ${
                    principal
                        ? principal[0]
                        : "Não identificado"
                }
            </strong>

        </p>

        <p>

            Demandas críticas:

            <strong>
                ${criticas}
            </strong>

        </p>

    `;


    if (
        $("alertaSistema")
    ) {

        if (
            criticas > 0
        ) {

            $("alertaSistema").innerHTML = `

                ⚠️ Existem

                <strong>
                    ${criticas}
                </strong>

                demandas críticas
                que exigem atenção.

            `;

        }

        else {

            $("alertaSistema").innerHTML = `

                ✅ Nenhuma demanda crítica
                identificada.

            `;

        }

    }

}


/* =========================================================
   RANKING
   ========================================================= */

function atualizarRanking() {

    const lista =
        $("rankingOfensores");


    if (!lista) {

        return;

    }


    const ranking = {};


    demandas.forEach(
        function (item) {

            ranking[item.ofensor] =
                (
                    ranking[item.ofensor] ||
                    0
                ) + 1;

        }
    );


    const ordenado =
        Object.entries(
            ranking
        )
        .sort(
            (a, b) =>
                b[1] - a[1]
        );


    lista.innerHTML =
        "";


    if (
        ordenado.length === 0
    ) {

        lista.innerHTML =
            "<li>Aguardando importação...</li>";

        return;

    }


    ordenado.forEach(
        function (item, indice) {

            lista.insertAdjacentHTML(
                "beforeend",

                `

                <li>

                    <strong>
                        ${indice + 1}º
                        —
                        ${item[0]}
                    </strong>

                    :

                    ${item[1]}

                </li>

                `

            );

        }
    );

}


/* =========================================================
   GRÁFICOS
   ========================================================= */

function destruirGrafico(nome) {

    if (
        graficos[nome]
    ) {

        graficos[nome].destroy();

        graficos[nome] =
            null;

    }

}


function criarGrafico(
    id,
    nome,
    tipo,
    labels,
    valores
) {

    const canvas =
        $(id);


    if (!canvas) {

        return;

    }


    destruirGrafico(
        nome
    );


    graficos[nome] =
        new Chart(
            canvas,
            {

                type: tipo,

                data: {

                    labels:
                        labels,

                    datasets: [

                        {

                            label:
                                "Quantidade",

                            data:
                                valores

                        }

                    ]

                },

                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false

                }

            }
        );

}


function atualizarGraficos() {


    /*
       OFENSORES
    */

    const ofensores = [

        "Material",
        "Medicamento",
        "Farmácia",
        "Logística",
        "OPME",
        "Regulação",
        "Não Identificado"

    ];


    criarGrafico(

        "graficoOfensor",

        "ofensor",

        "bar",

        ofensores,

        ofensores.map(
            quantidadeOfensor
        )

    );


    /*
       PRIORIDADE
    */

    const prioridades = [

        "Alta",
        "Média",
        "Baixa"

    ];


    criarGrafico(

        "graficoPrioridade",

        "prioridade",

        "doughnut",

        prioridades,

        prioridades.map(
            function (nome) {

                return demandas.filter(
                    item =>
                        item.prioridade ===
                        nome
                ).length;

            }
        )

    );


    /*
       STATUS
    */

    const status = [

        "Aberto",
        "Crítico"

    ];


    criarGrafico(

        "graficoStatus",

        "status",

        "doughnut",

        status,

        status.map(
            function (nome) {

                return demandas.filter(
                    item =>
                        item.status ===
                        nome
                ).length;

            }
        )

    );


    /*
       OPERADORAS
    */

    const operadoras = {};


    demandas.forEach(
        function (item) {

            const nome =
                String(
                    item.operadora ||
                    "Não informado"
                );


            operadoras[nome] =
                (
                    operadoras[nome] ||
                    0
                ) + 1;

        }
    );


    const topOperadoras =
        Object.entries(
            operadoras
        )
        .sort(
            (a, b) =>
                b[1] - a[1]
        )
        .slice(
            0,
            10
        );


    criarGrafico(

        "graficoOperadora",

        "operadora",

        "bar",

        topOperadoras.map(
            item => item[0]
        ),

        topOperadoras.map(
            item => item[1]
        )

    );

}


/* =========================================================
   HISTÓRICO
   ========================================================= */

function salvarHistorico() {

    const chave =
        "sigdh_historico_v3";


    const historico =
        JSON.parse(
            localStorage.getItem(
                chave
            ) || "[]"
        );


    historico.unshift({

        data:
            new Date()
                .toLocaleString(
                    "pt-BR"
                ),

        arquivo:
            arquivoAtual,

        quantidade:
            demandas.length

    });


    localStorage.setItem(

        chave,

        JSON.stringify(
            historico.slice(
                0,
                20
            )
        )

    );


    mostrarHistorico();

}


function mostrarHistorico() {

    const tabela =
        $("historicoImportacoes");


    if (!tabela) {

        return;

    }


    const historico =
        JSON.parse(

            localStorage.getItem(
                "sigdh_historico_v3"
            ) || "[]"

        );


    tabela.innerHTML =
        "";


    historico.forEach(
        function (item) {

            tabela.insertAdjacentHTML(

                "beforeend",

                `

                <tr>

                    <td>
                        ${escaparHTML(
                            item.data
                        )}
                    </td>

                    <td>
                        ${escaparHTML(
                            item.arquivo
                        )}
                    </td>

                    <td>
                        ${item.quantidade}
                    </td>

                </tr>

                `

            );

        }
    );

}


mostrarHistorico();


/* =========================================================
   EXPORTAÇÃO
   ========================================================= */

function exportarTratada() {

    if (
        demandas.length === 0
    ) {

        alert(
            "Importe uma planilha primeiro."
        );

        return;

    }


    const resultado =
        demandas.map(
            function (item) {

                return {

                    ID:
                        item.id,

                    REGISTRO:
                        item.registro,

                    PROTOCOLO:
                        item.protocolo,

                    BENEFICIÁRIO:
                        item.beneficiario,

                    OPERADORA:
                        item.operadora,

                    PRESTADOR:
                        item.prestador,

                    RECLAMAÇÃO:
                        item.reclamacao,

                    OFENSOR:
                        item.ofensor,

                    PRIORIDADE:
                        item.prioridade,

                    STATUS:
                        item.status

                };

            }
        );


    const worksheet =
        XLSX.utils.json_to_sheet(
            resultado
        );


    const workbook =
        XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(

        workbook,

        worksheet,

        "Resultado"

    );


    XLSX.writeFile(

        workbook,

        "resultado_SIGDH.xlsx"

    );

}


/* =========================================================
   EVENTOS
   ========================================================= */

if (
    $("btnImportar")
) {

    $("btnImportar")
        .addEventListener(
            "click",
            importarExcel
        );

}


if (
    $("btnExportar")
) {

    $("btnExportar")
        .addEventListener(
            "click",
            exportarTratada
        );

}


if (
    $("arquivoExcel")
) {

    $("arquivoExcel")
        .addEventListener(

            "change",

            function (evento) {

                const arquivo =
                    evento.target.files[0];


                if (arquivo) {

                    importarArquivo(
                        arquivo
                    );

                }

            }

        );

}


/* =========================================================
   DRAG AND DROP
   ========================================================= */

const dropzone =
    $("dropzone");


if (dropzone) {


    dropzone.addEventListener(

        "click",

        function () {

            if (
                $("arquivoExcel")
            ) {

                $("arquivoExcel")
                    .click();

            }

        }

    );


    dropzone.addEventListener(

        "dragover",

        function (evento) {

            evento.preventDefault();

            dropzone.style.background =
                "#dbeafe";

        }

    );


    dropzone.addEventListener(

        "dragleave",

        function () {

            dropzone.style.background =
                "";

        }

    );


    dropzone.addEventListener(

        "drop",

        function (evento) {

            evento.preventDefault();


            dropzone.style.background =
                "";


            const arquivo =
                evento.dataTransfer
                    .files[0];


            if (
                arquivo
            ) {

                importarArquivo(
                    arquivo
                );

            }

        }

    );

}


/* =========================================================
   PESQUISA E FILTROS
   ========================================================= */

if (
    $("busca")
) {

    $("busca")
        .addEventListener(
            "input",
            atualizarTabela
        );

}


if (
    $("btnBuscar")
) {

    $("btnBuscar")
        .addEventListener(
            "click",
            atualizarTabela
        );

}


[
    "filtroOfensor",
    "filtroPrioridade",
    "filtroStatus"

].forEach(
    function (id) {

        if (
            $(id)
        ) {

            $(id)
                .addEventListener(
                    "change",
                    atualizarTabela
                );

        }

    }
);


/* =========================================================
   MODO ESCURO
   ========================================================= */

if (
    $("darkMode")
) {

    $("darkMode")
        .addEventListener(

            "click",

            function () {

                document.body
                    .classList
                    .toggle(
                        "dark-mode"
                    );

            }

        );

}


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

if (
    $("btnExportar")
) {

    $("btnExportar").disabled =
        true;

}


if (
    $("statusImportacao")
) {

    $("statusImportacao").textContent =
        "Nenhuma planilha analisada.";

}
