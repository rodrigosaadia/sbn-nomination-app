# Seminar By Nomination (SBN) — Power Apps Edition

Ferramenta da **L'Oréal LATAM** para indicação de colaboradores aos seminários executivos mais prestigiados da organização (INSEAD, MIT Sloan, HEC Paris, IMD, Bocconi, etc.), com fluxo de aprovação em **4 estágios** e alocação por país/budget.

## Fase atual

- **MVP em React/Vite** (`sbn-nomination-app.jsx`) — validado pelo time de Learning da L'Oréal. **A Loreal adorou.**
- **Power Apps Canvas App** já construído no tenant do Rodrigo (`Default-10b27211-41c9-453c-8928-6f16ab7a7890`, app `fce4cc24-45bd-4fb6-ab54-8a091e05ed5f`). 9 arquivos `.pa.yaml` em `sbn-canvas-app/` — App.OnStart + 8 telas. Compila com 0 erros, 8 warnings cosméticos.
- **Estratégia de entrega**: Rodrigo finaliza tudo neste tenant primeiro (Loreal pode não liberar coauthoring lá). Depois exporta o app + recria as SP Lists no tenant Loreal seguindo §Migração para tenant Loreal abaixo.
- **Princípio diretor:** **não precisa ficar idêntico em pixels, mas deve se inspirar fortemente no MVP** — paleta gold, cards, workflow tracker, gauges, dashboard. *Para a Loreal tem que ficar bonito.*

## Stack do novo app

- **Power Apps Canvas App** (Power Platform)
- **SharePoint Lists** como backend (5 listas — ver §Modelo de dados)
- **Power Automate** para o workflow de aprovação (opcional, validar com Rodrigo). Stub do "Export to Excel" no Dashboard espera por um Flow que ainda não foi implementado.
- **MCP `canvas-authoring`** instalado via plugin `canvas-apps` — permite a Claude editar o app diretamente via Edit/Write. Para reconectar: usar a skill `canvas-apps:configure-canvas-mcp` com o URL do Studio.

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
├── SharePoint_Templates/        ← schemas + dados fake para SP Lists
│   ├── 01_Employees.xlsx
│   ├── 02_Courses.xlsx
│   ├── 03_CountryAllocations.xlsx
│   ├── 04_Nominations.xlsx
│   └── 05_NominationHistory.xlsx
├── sbn-canvas-app/              ← .pa.yaml do Canvas App (source of truth)
│   ├── App.pa.yaml              ← theme + OnStart + 5 ClearCollects com RenameColumns
│   └── scr{Dashboard,Catalog,CourseDetail,Employees,Nominations,Seats,PDLLatam,Criteria}.pa.yaml
└── sbn-canvas-app-meta/         ← plano, scripts python de fix, FIX-RECIPE.md
```

## Como trabalhar neste projeto

1. **Conectar ao Studio**: usar a skill `canvas-apps:configure-canvas-mcp` com o URL `https://make.powerapps.com/e/Default-10b27211-41c9-453c-8928-6f16ab7a7890/canvas/?action=edit&app-id=...fce4cc24-45bd-4fb6-ab54-8a091e05ed5f`.
2. **Edição via MCP**: usar Edit/Write nos arquivos `.pa.yaml` em `sbn-canvas-app/`. As mudanças propagam via coauthoring stream (mas ver §Save protocol).
3. **Validar**: `compile_canvas` (MCP tool). Estado atual: 0 erros, 8 warnings cosméticos (Text/Number mismatch em Avatar.Name).
4. **Adicionar fontes de dados**: skill `canvas-apps:add-data-source`.
5. **Sempre conferir o MVP** (`sbn-nomination-app.jsx`) antes de inventar lógica nova — as regras de negócio estão calibradas e a Loreal validou.

## Save protocol (CRÍTICO)

Coauthoring stream é frágil — perde sincronia se a sessão cai. Para não perder trabalho:

- **A cada 10-15 minutos**: Rodrigo dá Ctrl+S no Studio.
- **Antes de batches grandes de edits**: Claude pausa e pede "pode dar Ctrl+S antes de continuar?".
- **Se aparecer alerta de desconectado**: Studio em branco = sessão caiu. Faça `connect` no MCP, `sync_canvas` para uma pasta temp p/ confirmar server state, depois F5 no Studio.
- **Se Studio mostrar "nada alterado" no Save**: a aba do Studio tá com cache stale. Fechar a aba inteira e reabrir pela URL.
- **Se mudanças não propagam**: alguns arquivos podem ter lock teimoso. Rodrigo entra na tela problemática no Studio, clica em qualquer label, faz uma micro-edição (espaço extra) e salva — destrava o lock server-side.

## Particularidades do tenant Power Apps (aprendidas duro)

### Estrutura SharePoint
- **Title é o PK efetivo**: a primeira coluna do template Excel virou `Title` (String) na SP list. Não tem nome `CarolID`/`CourseID`/etc. literal — eles estão em `Title`.
- **Demais colunas viram `field_1`, `field_2`, ... `field_N`** (na ordem de criação) com display name = nome amigável. Power Fx aceita display name **somente** na fonte raw (`'01_Employees'.FullName` funciona); em **coleções clonadas** o display name some.
- **Choice columns são `String`** (não `Choice` record), Yes/No columns também. Logo `Status.Value` falha — use só `Status` (e compare com string `"final"` etc). Idem `KeyPlayer = "Yes"` em vez de `KeyPlayer = true`.
- **App.OnStart usa RenameColumns** para mapear `Title → CarolID/CourseID/NominationID/HistoryID/Country` e `Courses.field_1 → CourseName` (disambiguar do system `Name`). As outras colunas mantêm display names funcionando direto.
- **Patch on '04_Nominations' precisa usar internal names** (`field_1`, `field_11`, etc.) e `Title` (não `NominationID`) pra LookUp da linha, porque a fonte raw não tem os aliases renomeados.
- **Join key types**: `Employees.Title` (String, foi populado com CarolID) vs `Nominations.field_1` (Number, CarolID) — comparações precisam de `Value(emp.CarolID) = nom.CarolID`. O mesmo pra `Course.CourseID` (Title String) vs `Nominations.CourseID` (field_3 Number).

### Power Fx neste tenant
- **UDFs com tipo Record não suportadas**: `Score(emp: Record): Number = ...` falha com "Unknown type Record". Solução adotada: inlinear todas as fórmulas (Score, IsEligible, EligibilityReasons, GaugeColor, StageLabel, NextStage) nos screens. Sem `App.Formulas`.
- **Named formulas referenciando outras** também falham — `GaugeColor` referenciando `ThemeGold` não resolve. Tudo inline.
- **RenameColumns/AddColumns syntax**: usar **identificadores bare** (não strings) para os column names: `RenameColumns(src, Title, CarolID)` ✓, `RenameColumns(src, "Title", "CarolID")` ✗.
- **`count` e `label` parecem reservados** em AddColumns column names. Usar `nCount`, `lblText`, etc.
- **PartialCircle dá HTTP 500 no `describe_control` e erro de compile com "Variant required"** — não conseguimos usar. Substituído por `Circle` (disco sólido ou anel com Fill=transparent + Border=color).
- **Progress só tem variante linear** neste tenant (sem circular).
- **ModernCard limitado**: sem `Fill`, sem `BorderColor`, sem `BorderThickness`, sem `RadiusTopLeft/...` — usar GroupContainer ManualLayout pra cards customizados.
- **Componentes canvas (ComponentDefinitions) não funcionaram** — toda lógica de sidebar/badge/etc. foi **inlineada por tela** (cada tela tem sua própria cópia do sidebar com prefixo `dsh/cat/cdt/emp/nom/set/pdl/crt` para evitar colisão de nomes).

### Controles — gotchas visuais
- **Label, ModernText e Text renderizam Size N diferente entre si** (mesmo Size=22 vira tamanhos visualmente distintos). Padronizamos tudo em `Label` (Classic) na sidebar para consistência.
- **Label sem Fill explícito** = fundo opaco default (renderiza como bloco preto em cima do darkGray). **Sempre setar `Fill: =RGBA(0,0,0,0)` em Labels de overlay**.
- **Sidebar GroupContainer precisa Width=240** com children X=0..239. Se outra coisa mudar para 192/menos, os children são clipados.
- **Button (FluentV9)**: NÃO tem `Fill`/`Color`/`HoverFill`/`Size`. Usar `BasePaletteColor` + `Appearance` (Primary/Secondary/Transparent) + `FontColor` + `FontSize`.
- **Rectangle não tem radius** — usar GroupContainer com RadiusTopLeft/... se precisar cantos arredondados.
- **ComboBox precisa `ItemDisplayText: =ThisItem.Value`** explícito senão dá `'Value1' isn't recognized`.
- **Text inputs**: ModernTextInput usa `Placeholder` (não `HintText`), `Type` (não `Mode`), e o valor é `Self.Text` (não `Self.Value`).
- **Toggle**: estado é `Self.Checked` (não `Self.Value`).

Quando aparecer um erro novo, consultar `sbn-canvas-app-meta/FIX-RECIPE.md` para o catálogo completo de fixes aprendidos.

## Migração para o tenant Loreal

Quando hora de levar pra Loreal:

1. **Exportar o app**: no Studio (tenant do Rodrigo) → File → Export package → `.zip`.
2. **Recriar as 5 SP Lists no tenant Loreal**:
   - **ORDEM DAS COLUNAS É CRÍTICA**. As fórmulas do app dependem de `Title=CarolID`, `field_1=FullName`, `field_2=FirstName`, ..., `field_23=OrgDivision` em Employees (e equivalente nas outras listas). Se a Loreal criar as colunas em ordem diferente, o `RenameColumns` no App.OnStart quebra silenciosamente.
   - Usar os `SharePoint_Templates/*.xlsx` como fonte e criar cada coluna na MESMA ordem do template (Title primeiro = a coluna de ID, depois as outras na ordem das colunas do Excel).
   - Conferir após criar: `get_data_source_schema` no MCP mostra `field_N (Display: "Y")` — confirmar que cada `field_N` tem o display name esperado.
3. **Importar o app** no tenant Loreal: Apps → Import canvas app → upload `.zip`.
4. **Reconectar as 5 data sources** no app importado (Data → reconnect).
5. **Habilitar coauthoring** (Settings → Updates → Coauthoring → On) — necessário para continuar editando via MCP. Se Loreal não liberar, o app já está completo via export; updates futuros precisariam ser feitos manualmente no Studio.
6. **Reconectar MCP** com novo `environment_id` e `app_id` da Loreal — skill `canvas-apps:configure-canvas-mcp` faz o setup.
7. **Power Automate flow para Export Excel** (não implementado neste sprint): criar no tenant Loreal com trigger Power Apps (V2), input JSON, popular `template.xlsx`, retornar link/blob.

**Limitações conhecidas a comunicar pra Loreal**:
- Anel de progresso (SeatGauge) é fixo gold com cor mudando por threshold (gold/warning/danger). Não mostra arco parcial como o MVP React porque `PartialCircle` quebra neste tenant Power Apps. % de utilização ainda é visível via barra linear embaixo.
- 8 warnings cosméticos no App Checker — comparações Text/Number em labels que mostram nome/iniciais de funcionário. Não bloqueiam, mas aparecem em vermelho/laranja.

## Notas de tradução PT-BR
Este projeto é para a Loreal Global e por isso tudo precisa estar em inglês.
O MVP mistura PT-BR e inglês. No Power Apps, padronizar inglês para labels visíveis (botões, status, mensagens), mantendo inglês para nomes de colunas/listas SharePoint (compatibilidade técnica). Status técnicos no banco em inglês (`nominated`, `country_hrd_validation`, etc.), labels exibidos em inglês.
