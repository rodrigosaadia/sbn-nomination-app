# Seminar By Nomination (SBN) — Power Apps Edition

Ferramenta da **L'Oréal LATAM** para indicação de colaboradores aos seminários executivos mais prestigiados da organização (INSEAD, MIT Sloan, HEC Paris, IMD, Bocconi, etc.), com fluxo de aprovação em **4 estágios** e alocação por país/budget.

## Fase atual

- **MVP em React/Vite** (`sbn-nomination-app.jsx`) — validado pelo time de Learning da L'Oréal. **A Loreal adorou.**
- **Próximo passo:** rebuild em **Power Apps Canvas App** sobre **SharePoint Lists**, no tenant da Loreal.
- **Princípio diretor:** **não precisa ficar idêntico em pixels, mas deve se inspirar fortemente no MVP** — paleta gold, cards, workflow tracker, gauges, dashboard. *Para a Loreal tem que ficar bonito.*

## Stack do novo app

- **Power Apps Canvas App** (Power Platform)
- **SharePoint Lists** como backend (5 listas — ver §Modelo de dados)
- **Power Automate** para o workflow de aprovação (opcional, validar com Rodrigo)
- **MCP `canvas-authoring`** instalado via plugin `canvas-apps` — permite a Claude editar o app diretamente. Rodrigo provisiona o app e conecta as listas; depois disso usar a skill `canvas-apps:canvas-app` para criar/editar telas.

## MVP atual — como rodar e onde olhar

```powershell
cd "C:\Users\rodri\OneDrive - Nerpa\JS\SBN"
npm install
npm run dev
```

**Arquivo único:** `sbn-nomination-app.jsx` (~2.000 linhas). Fonte de verdade da intenção do produto:

| O quê | Onde |
|---|---|
| Dados de referência (zonas, países, cursos) | linhas 4-65 |
| Geração de 45 colaboradores fake | linhas 67-107 |
| Função `calcScore` (modelo de scoring) | linhas 110-125 |
| Função `checkEligibility` (regras de elegibilidade) | linhas 127-139 |
| Geração de nomeações mock + audit trail | linhas 147-234 |
| Paleta de cores (`colors`) | linhas 243-260 |
| Componentes UI (Badge, Card, StatCard, WorkflowTracker, SeatGauge) | linhas 263-361 |
| Export Excel (`exportToExcel`) | linhas 407-456 |
| Telas (Dashboard, Catalog, Employees, Nominations, Seats, PDL LATAM, Criteria) | linhas 459-1759 |
| Roteamento e menu | linhas 1818-1942 |

## Modelo de dados — SharePoint Lists

Os Excel templates em `SharePoint_Templates/` materializam estes schemas com dados fake. **Nomenclatura alinhada à Loreal** (eles usam `Carol ID`, não `EmployeeID`).

### 1. `Employees`
| Coluna SP | Tipo | Required | Notas |
|---|---|---|---|
| CarolID | Text (PK) | sim | ID interno Loreal (numérico, 5-7 dígitos) |
| FullName | Text | sim | |
| FirstName / LastName | Text | sim | A Loreal separa nome/sobrenome |
| Gender | Choice (M/F) | não | |
| Age | Number | sim | |
| JobTitle | Text | sim | |
| Country | Choice (Brazil/Mexico/Argentina/Colombia/Chile) | sim | |
| Zone | Choice (LATAM) | sim | |
| Division | Choice (Luxe/CPD/PPD/Active Cosmetics/Operations/Finance/HR/Digital) | sim | |
| MonthsCompany | Number | sim | Tenure total |
| MonthsDivision | Number | sim | |
| MonthsRole | Number | sim | |
| TalentClass | Choice (Future Leaders/Rising Players/Essential Players) | sim | |
| Performance | Choice (Exceeds/Strong/Meets/Developing Expectations) | sim | |
| SuccessionPipeline | Yes/No | sim | |
| PastSBNCount | Number | sim | Quantas vezes já fez SBN |
| FlightRisk | Choice (High/Medium/Low) | sim | |
| CompletedCourses | Text (multi) | não | Códigos separados por vírgula |
| Email | Text | sim | |
| ManagerName | Text | sim | Nome do gestor direto |
| BPCode | Text | não | BP responsável (BP-001 etc.) |
| KeyPlayer | Yes/No | sim | Talento estratégico |
| OrgDivision | Choice (GPP/PLP/GPPCORP/CAP/PPP/CPP) | sim | |

> **Volume produção:** ~3.000 colaboradores. Template traz 45 para teste.

### 2. `Courses` (Seminars)
| Coluna SP | Tipo | Notas |
|---|---|---|
| CourseID | Number (PK) | |
| Name | Text | "Strategic Leadership Accelerator" |
| Code | Text | "SBN-SLA" |
| Investment | Currency (USD) | |
| Seats | Number | Vagas totais no curso |
| Category | Choice (Leadership/Digital/Marketing/Finance/People/Operations/ESG) | |
| Format | Choice (In-Person/Hybrid/Online) | |
| Duration | Text | "5 days" |
| Provider | Text | INSEAD, MIT Sloan, etc. |
| Description / Objective | Note | |
| Skills | Text (multi) | |
| MinMonthsCompany | Number | Pré-req: tenure mínimo |
| MinMonthsDivision | Number | |
| MaxAge | Number | |
| RequiredCourseCode | Text | Pré-req: curso anterior |
| DivisionRangeMin / DivisionRangeMax | Number | Faixa específica de tenure |
| Status | Choice (Active/Inactive) | |

### 3. `CountryAllocations`
| Coluna | Tipo | Notas |
|---|---|---|
| Country | Choice (PK) | |
| Seats | Number | Quota de vagas |
| Budget | Currency (USD) | |
| Zone | Choice | LATAM |

Valores atuais: Brasil 30/$255K, México 25/$212.5K, Argentina 20/$170K, Colômbia 15/$127.5K, Chile 10/$85K. **Total LATAM:** 100 vagas / $850K.

### 4. `Nominations`
| Coluna | Tipo | Notas |
|---|---|---|
| NominationID | Text (PK) | NOM-XXXX |
| CarolID | Lookup→Employees | |
| CourseID | Lookup→Courses | |
| Investment | Currency | Copiado do curso |
| Eligible | Yes/No | Resultado do `checkEligibility` |
| OutOfTarget | Yes/No | TRUE se nomeado apesar de inelegível |
| OverrideReason | Note | Obrigatório se OutOfTarget=TRUE |
| Score | Number | 0-100 |
| Status | Choice | nominated / country_hrd_validation / zone_validation / final / rejected |
| CreatedDate | DateTime | |
| Justification | Note | Justificativa do nomeador |
| NominatorRole | Choice (BP/Head) | |
| NominatorEmail | Text | |
| Priority | Number (1-10) | Ranking interno (P1=mais alta) |
| RejectionReason | Note | Se Status=rejected |

### 5. `NominationHistory`
| Coluna | Tipo | Notas |
|---|---|---|
| HistoryID | Text (PK) | |
| NominationID | Lookup→Nominations | |
| Action | Choice | created / status_advanced / priority_changed / rejected |
| UserEmail / UserName | Text | |
| Timestamp | DateTime | |
| Details | Note | Texto livre humano-legível |

## Regras de negócio essenciais

### Elegibilidade (`checkEligibility`, jsx:127-139)
Um colaborador é **elegível** para um curso se satisfaz **todos** os pré-requisitos:
- `MonthsCompany ≥ MinMonthsCompany`
- `MonthsDivision ≥ MinMonthsDivision`
- `Age ≤ MaxAge`
- `RequiredCourseCode` está em `CompletedCourses` (se definido)
- `MonthsDivision` dentro de `[DivisionRangeMin, DivisionRangeMax]` (se definido)

Se inelegível, ainda pode ser nomeado mas vira **Out-of-Target**, exigindo `OverrideReason`.

### Scoring (`calcScore`, jsx:110-125)
Soma de 5 dimensões, máximo ~100 pts:

| Dimensão | Valores |
|---|---|
| TalentClass | Future Leaders 30 / Rising 22 / Essential 15 |
| SuccessionPipeline | Sim 20 / Não 0 |
| PastSBNCount | 0× → 15 / 1× → 5 / 2+× → 0 |
| FlightRisk | High 15 / Medium 8 / Low 0 |
| Performance | Exceeds 20 / Strong 14 / Meets 8 / Developing 3 |

### Workflow de aprovação (4 estágios)

```
nominated → country_hrd_validation → zone_validation → final
                                                       └→ rejected (qualquer estágio)
```

| Estágio | Aprovador | Label PT-BR |
|---|---|---|
| `nominated` | PDL Country | Aguardando Validação - PDL Country |
| `country_hrd_validation` | Country HRD | Aguardando Validação - Country HRD |
| `zone_validation` | Zone HRDs + PDL | Aguardando Aprovação - Zone HRDs + PDL |
| `final` | — | Aprovado - Vaga Confirmada |

Toda transição (status_advanced, priority_changed, rejected) gera linha em `NominationHistory`.

### Restrições de capacidade
- **Vagas por país:** hard limit (`CountryAllocations.Seats`). App deve avisar quando próximo ao limite.
- **Budget por país:** soft limit (mostra utilização, não bloqueia).
- **Vagas por curso:** `Courses.Seats` total. Distribuição entre países é fluida.

## Personas

| Persona | O que faz |
|---|---|
| **BP** (Business Partner) | Nomeia colaboradores. *Usuário CURRENT_USER do MVP — `dione@loreal.com`* |
| **Head / PDL Country** | Valida estágio 1 (nominated → country_hrd_validation) |
| **Country HRD** | Valida estágio 2 (country_hrd_validation → zone_validation) |
| **Zone HRDs + PDL LATAM** | Valida estágio 3 (zone_validation → final). Final approval. |
| **PDL LATAM Admin** | Visão consolidada zonal, dashboard Key Players, export final |

## Telas a portar (do MVP)

| Tela MVP | Propósito | Power Apps |
|---|---|---|
| Dashboard | KPIs, workflow tracker, analytics por país/curso/classificação | Screen principal — Gallery + Cards + Charts |
| Courses Catalog | Grid de cards de cursos com filtros | Screen com Gallery de cards |
| Course Detail / Nomination | Detalhe do curso + lista de elegíveis + form inline | Screen com lateral form |
| Employee Directory | Tabela filtrável de colaboradores | Screen com DataTable + filters |
| Employee Detail Modal | Perfil + matriz de elegibilidade + nomeações ativas | Modal/popup screen |
| Nominations Management | Lista de nomeações com filtros + ações (advance/reject/priority) | Screen — coração operacional do app |
| Seats Overview | Gauges de utilização por país e por curso | Screen com SVG gauges (custom HTML control ou imagens) |
| PDL LATAM | Analytics + dashboard Key Players | Screen executive |
| Criteria | Documenta o modelo de scoring | Screen estática informativa |

## Linguagem visual L'Oréal

| Token | Valor | Uso |
|---|---|---|
| Gold | `#c4a265` | Primária — destaques, CTAs, badges importantes |
| Gold Light | `#d4b87a` | Hover, accents |
| Gold Dark | `#a88a4e` | Borders ativas |
| Black | `#000000` | Background principal |
| Dark Gray | `#1a1a1a` | Cards background |
| Med Gray | `#2d2d2d` | Inputs, borders sutis |
| Off-white | `#f5f0eb` | Texto principal claro |
| Success | `#4a9b6e` | Final / aprovado |
| Warning | `#d4a843` | Out-of-Target / atenção |
| Danger | `#c75050` | Rejeitado / over capacity |
| Info | `#5a8fb8` | Auxiliar |

**Tipografia MVP:** body sans-serif padrão; números KPI e títulos usam `Playfair Display` (serif). No Power Apps, usar fontes equivalentes (Constantia/Cambria para serif; Segoe UI para sans).

**Componentes a recriar no Canvas App:**
- **Badge** (status pills com fundo translúcido da cor — usar `RGBA(196,162,101,0.13)` para gold)
- **Card** (background dark gray, border 1px `#333`, hover gold accent + lift)
- **StatCard** (KPI grande + label uppercase + delta vs ano anterior)
- **WorkflowTracker** (4 bolinhas conectadas — done verde, current gold, future cinza)
- **SeatGauge** (anel SVG ou Donut chart com cor variando por % utilização: <70% gold, 70-90% warning, >90% danger)

## Export Excel — formato Loreal oficial

Função `exportToExcel` (jsx:407-456) gera arquivo no formato que a Loreal espera. Schema do `template.xlsx` (já existe na raiz):

| Coluna | Origem |
|---|---|
| Ranking of priority | `Nominations.Priority` |
| Carol ID | `Employees.CarolID` |
| Name | First name |
| Surname | Last name |
| Job Title | `Employees.JobTitle` |
| SBN Program | `Courses.Name` |
| Information / Warning | Avisos (ex.: "FYI: Employee has never attended a SBN before") |
| Reasoning | `Nominations.Justification` |
| Experience (in months) | `Employees.MonthsCompany` |
| Name of Manager | `Employees.ManagerName` |
| Is a Key Player? | `Employees.KeyPlayer` (Yes/No) |

Output do app **deve preencher esse template** ao final do ciclo. Manter compatibilidade.

## Estrutura de pastas

```
SBN/
├── CLAUDE.md                    ← este arquivo
├── sbn-nomination-app.jsx       ← MVP React (fonte de verdade da intenção)
├── index.html, src/, vite.config.js, package.json   ← infra MVP
├── template.xlsx                ← template oficial Loreal (output ranking)
└── SharePoint_Templates/        ← schemas + dados fake para SP Lists
    ├── 01_Employees.xlsx
    ├── 02_Courses.xlsx
    ├── 03_CountryAllocations.xlsx
    ├── 04_Nominations.xlsx
    └── 05_NominationHistory.xlsx
```

## Como trabalhar neste projeto

1. **Antes de provisionar o Power App:** Rodrigo cria o Canvas App vazio + conecta as 5 SharePoint Lists (populadas a partir dos templates desta pasta).
2. **Depois disso:** Rodrigo configura o MCP `canvas-authoring`. A skill `canvas-apps:configure-canvas-mcp` ajuda no setup.
3. **Para criar/editar telas:** invocar `canvas-apps:canvas-app` com requisitos específicos. A skill abre sessão de coauthoring com o app.
4. **Para adicionar fontes de dados:** `canvas-apps:add-data-source`.
5. **Sempre conferir o MVP** antes de inventar lógica nova — as regras de negócio estão calibradas e a Loreal validou.

## Notas de tradução PT-BR

O MVP mistura PT-BR e inglês. No Power Apps, padronizar PT-BR para labels visíveis (botões, status, mensagens), mantendo inglês para nomes de colunas/listas SharePoint (compatibilidade técnica). Status técnicos no banco em inglês (`nominated`, `country_hrd_validation`, etc.), labels exibidos em português.
