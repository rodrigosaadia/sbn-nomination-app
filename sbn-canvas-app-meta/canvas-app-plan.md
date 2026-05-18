# Canvas App Plan

## Mode
CREATE

## App Requirements

L'Oréal LATAM "Seminar by Nomination" (SBN) — Power Apps Canvas rebuild of the
React MVP at `C:/Users/rodri/OneDrive - Nerpa/JS/SBN/sbn-nomination-app.jsx`.

Purpose: HR Business Partners and PDL leads nominate employees for executive
seminars (INSEAD, MIT Sloan, HEC, IMD, Bocconi, etc.) and run a 4-stage approval
workflow with per-country seat / budget allocation. Backend is 5 SharePoint
lists already connected to the app. The MVP has been validated by the Loreal
Learning team — visuals must "inspire strongly" from it (gold-on-black palette,
card-driven UI, workflow tracker, gauges, analytics grids). All visible labels
in **English** (Loreal Global).

Source-of-truth references (read these if a binding feels off):
- React MVP — `sbn-nomination-app.jsx`
- Project guide — `CLAUDE.md` (data model, palette, personas, business rules)

## Working Directory
`C:/Users/rodri/OneDrive - Nerpa/JS/SBN/sbn-canvas-app`

## Discovery Summary
- Controls available: 122 (full catalog already enumerated by parent agent).
  Notable: `ModernCard`, `ModernText`, `ModernButton`, `ModernTextInput`,
  `ModernDropdown`, `ModernCombobox`, `Gallery`, `GroupContainer`
  (AutoLayout/ManualLayout), `Avatar`, `Badge`, `Progress`, `PartialCircle`,
  `PieChart`, `BarChart`, `ModernTabList`, `ModernIcon`, `Toggle`, `Image`,
  `Rectangle`, `Circle`, `Icon`, `HtmlViewer` (fallback for custom SVG).
- Data sources (5, all connected, all Writable + Delegatable):
  `01_Employees`, `02_Courses`, `03_CountryAllocations`, `04_Nominations`,
  `05_NominationHistory`.
- Connectors: none beyond the SharePoint connection above.

## MANDATORY discovery tasks for each screen-builder agent

> The planning agent does not have MCP tool access in its execution
> environment. Each `canvas-screen-builder` agent **MUST** call the following
> MCP tools at the start of its session before writing any control properties:
>
> 1. `describe_control` for **every** control type it will emit in its screen
>    file. Property names differ between Classic and FluentV9 families — never
>    guess. The "Likely properties" hints in this document are conventions
>    from the TechnicalGuide / DesignGuide reference docs, not authoritative
>    `describe_control` output.
> 2. `get_data_source_schema` for **every** SharePoint list it binds to, so it
>    uses the exact internal column name (SharePoint sometimes substitutes
>    `Title`, `OData_*`, `_x0020_`, etc., for the friendly names listed in
>    `CLAUDE.md`).
> 3. After both calls, perform the **property-name audit** described in the
>    parent agent prompt: every property in the screen YAML must verbatim
>    appear in `describe_control` output, every column in a formula must
>    verbatim appear in `get_data_source_schema` output. Remove or fix any
>    mismatch.

The column names in the bindings below use the **friendly names** from
`CLAUDE.md`. The screen-builder agent must replace each one with the
corresponding internal name returned by `get_data_source_schema`. Where the
friendly name and the SharePoint internal name commonly diverge, this
document flags it explicitly with `// VERIFY` comments.

## Data Source Schemas

> Each screen-builder agent must call `get_data_source_schema` for each list
> it consumes and embed/confirm the exact internal column names. The columns
> listed below are the **friendly names from CLAUDE.md** and are the contract
> that the SharePoint admin populated against. Internal names may differ.

### 01_Employees — expected columns (friendly names)
| Friendly name        | Type          | Notes                                       |
|----------------------|---------------|---------------------------------------------|
| CarolID              | Text          | PK (Loreal internal employee id)            |
| FullName             | Text          |                                             |
| FirstName            | Text          |                                             |
| LastName             | Text          |                                             |
| Gender               | Choice (M/F)  |                                             |
| Age                  | Number        |                                             |
| JobTitle             | Text          |                                             |
| Country              | Choice        | Brazil / Mexico / Argentina / Colombia / Chile |
| Zone                 | Choice        | LATAM                                       |
| Division             | Choice        | Luxe / CPD / PPD / Active Cosmetics / Operations / Finance / HR / Digital |
| MonthsCompany        | Number        |                                             |
| MonthsDivision       | Number        |                                             |
| MonthsRole           | Number        |                                             |
| TalentClass          | Choice        | Future Leaders / Rising Players / Essential Players |
| Performance          | Choice        | Exceeds / Strong / Meets / Developing Expectations |
| SuccessionPipeline   | Yes/No        |                                             |
| PastSBNCount         | Number        |                                             |
| FlightRisk           | Choice        | High / Medium / Low                         |
| CompletedCourses     | Text          | Comma-separated course codes                |
| Email                | Text          |                                             |
| ManagerName          | Text          |                                             |
| BPCode               | Text          |                                             |
| KeyPlayer            | Yes/No        |                                             |
| OrgDivision          | Choice        | GPP / PLP / GPPCORP / CAP / PPP / CPP       |

Choice columns in Power Fx require `.Value` to extract text:
`ThisItem.TalentClass.Value`, `ThisItem.Country.Value`, etc.

### 02_Courses — expected columns
| Friendly name         | Type          | Notes                          |
|-----------------------|---------------|--------------------------------|
| CourseID              | Number        | PK                             |
| Name                  | Text          |                                |
| Code                  | Text          | SBN-SLA, SBN-DTM, etc.         |
| Investment            | Currency (USD)|                                |
| Seats                 | Number        | Total course seats             |
| Category              | Choice        | Leadership / Digital / Marketing / Finance / People / Operations / ESG |
| Format                | Choice        | In-Person / Hybrid / Online    |
| Duration              | Text          | "5 days"                       |
| Provider              | Text          | INSEAD, MIT Sloan, etc.        |
| Description           | Note (multi)  |                                |
| Objective             | Note (multi)  |                                |
| Skills                | Text          | Comma-separated                |
| MinMonthsCompany      | Number        |                                |
| MinMonthsDivision     | Number        |                                |
| MaxAge                | Number        |                                |
| RequiredCourseCode    | Text          | Single prerequisite code       |
| DivisionRangeMin      | Number        |                                |
| DivisionRangeMax      | Number        |                                |
| Status                | Choice        | Active / Inactive              |

### 03_CountryAllocations — expected columns
| Friendly name | Type            | Notes               |
|---------------|-----------------|---------------------|
| Country       | Choice          | PK (Brazil etc.)    |
| Seats         | Number          | Quota               |
| Budget        | Currency (USD)  |                     |
| Zone          | Choice          | LATAM               |

### 04_Nominations — expected columns
| Friendly name     | Type            | Notes                                              |
|-------------------|-----------------|----------------------------------------------------|
| NominationID      | Text            | PK ("NOM-XXXX")                                    |
| CarolID           | Lookup→Employees| Resolve via `LookUp(colEmployees, CarolID = ThisItem.CarolID)` |
| CourseID          | Lookup→Courses  | Same pattern                                       |
| Investment        | Currency        | Copied from course at create time                  |
| Eligible          | Yes/No          | Result of IsEligible()                             |
| OutOfTarget       | Yes/No          | TRUE if nominated despite ineligible               |
| OverrideReason    | Note            | Required when OutOfTarget=TRUE                     |
| Score             | Number          | 0-100, output of Score()                           |
| Status            | Choice          | nominated / country_hrd_validation / zone_validation / final / rejected |
| CreatedDate       | DateTime        |                                                    |
| Justification     | Note            | Nominator's reason                                 |
| NominatorRole     | Choice          | BP / Head                                          |
| NominatorEmail    | Text            |                                                    |
| Priority          | Number (1-10)   | P1 = highest                                       |
| RejectionReason   | Note            | Populated when Status = rejected                   |

### 05_NominationHistory — expected columns
| Friendly name | Type            | Notes                                                |
|---------------|-----------------|------------------------------------------------------|
| Title         | Text            | SharePoint default required field; use as HistoryID  |
| HistoryID     | Text            | // VERIFY whether Title or a separate column         |
| NominationID  | Lookup→Nominations |                                                  |
| Action        | Choice          | created / status_advanced / priority_changed / rejected |
| UserEmail     | Text            |                                                      |
| UserName      | Text            |                                                      |
| Timestamp     | DateTime        |                                                      |
| Details       | Note            | Free-form human-readable                             |

## API Details
None — no Power Automate flows or non-SharePoint connectors are used in this
first pass. The "Export to Excel" button on `scrDashboard` is a stub:
`Notify("Power Automate export flow pending", NotificationType.Information)`.

## Screens
| Screen          | File                | Purpose                                                          | Key Controls |
|-----------------|---------------------|------------------------------------------------------------------|--------------|
| scrDashboard    | scrDashboard.pa.yaml| Landing — KPIs + workflow tracker + analytics grids              | ModernCard, ModernText, Gallery, Progress, PartialCircle, BarChart, PieChart |
| scrCatalog      | scrCatalog.pa.yaml  | Course catalog (cards grid, search + category filter)            | ModernTextInput, ModernCombobox, Gallery, ModernCard, Badge |
| scrCourseDetail | scrCourseDetail.pa.yaml | Course header + eligible / out-of-target employee galleries + inline nominate form | ModernCard, Gallery, Avatar, Badge, Toggle, ModernTextInput, ModernButton |
| scrEmployees    | scrEmployees.pa.yaml| Employee directory + filterable table + detail overlay           | ModernTextInput, ModernCombobox, Gallery, Avatar, Badge, ModernCard |
| scrNominations  | scrNominations.pa.yaml | Operational workflow screen — list / per-course view + advance/reject/priority | Gallery, ModernCard, Badge, ModernDropdown, ModernButton, ModernTabList |
| scrSeats        | scrSeats.pa.yaml    | Country + course seat / budget utilization gauges and bars       | ModernCard, PartialCircle, Progress, Badge, Gallery |
| scrPDLLatam     | scrPDLLatam.pa.yaml | Executive PDL view — analytics blocks + Key Players section      | ModernCard, PartialCircle, Gallery, Badge, BarChart |
| scrCriteria     | scrCriteria.pa.yaml | Static scoring model reference                                   | ModernCard, ModernText, Rectangle |

Plus one shared canvas component file (see Components section) and
`App.pa.yaml` (already written by this agent).

## Aesthetic Direction

L'Oréal heritage **gold-on-black luxury dashboard** — refined, dense,
executive. Gold (`#c4a265`) is the single accent, applied sparingly on
top of a deep neutral palette so it reads as premium, not decorative.
Cards are dark gray (`#1a1a1a`) on a black canvas (`#000000`), separated
by 1 px hairline borders (`#2d2d2d`) with subtle gold border on hover /
active. Numbers and titles use a serif (Constantia / Cambria) for
editorial gravitas; body uses Segoe UI for legibility.

- **Palette (exact RGBA, also exposed via `varTheme` and named formulas):**
  - Black background:        `RGBA(0,   0,   0,   1)`  `#000000`
  - Dark gray card surface:  `RGBA(26,  26,  26,  1)`  `#1a1a1a`
  - Medium gray border:      `RGBA(45,  45,  45,  1)`  `#2d2d2d`
  - Gray hairline:           `RGBA(74,  74,  74,  1)`  `#4a4a4a`
  - Light gray meta text:    `RGBA(138, 138, 138, 1)`  `#8a8a8a`
  - Silver caption text:     `RGBA(184, 184, 184, 1)`  `#b8b8b8`
  - Off-white body text:     `RGBA(245, 240, 235, 1)`  `#f5f0eb`
  - White headline text:     `RGBA(255, 255, 255, 1)`  `#ffffff`
  - **Gold accent:**         `RGBA(196, 162, 101, 1)`  `#c4a265`
  - Gold light (hover):      `RGBA(212, 184, 122, 1)`  `#d4b87a`
  - Gold dark (active border): `RGBA(168, 138, 78,  1)` `#a88a4e`
  - Gold soft (badge bg):    `RGBA(196, 162, 101, 0.13)`
  - Success (approved):      `RGBA(74,  155, 110, 1)`  `#4a9b6e`
  - Warning (out-of-target / 70-90% utilization): `RGBA(212, 168, 67, 1)` `#d4a843`
  - Danger (rejected / >90% utilization):         `RGBA(199, 80, 80, 1)`  `#c75050`
  - Info (auxiliary tags):   `RGBA(90,  143, 184, 1)`  `#5a8fb8`
  - Soft variants (badge fills) at 0.15 alpha for success/warning/danger/info.

- **Layout strategy:** This is a **fixed-size desktop dashboard** (1366×768
  target). The page chrome uses **ManualLayout** at the screen root for a
  precise 240 px gold-bordered sidebar + 1126 px content area. Inside each
  screen's content area, use **AutoLayout** containers (vertical for the
  page stack, horizontal for KPI rows / grids) so the content reflows if
  the user resizes the embed. Per TechnicalGuide rule, AutoLayout children
  with a fixed `Width`/`Height` must set `FillPortions: =0`.

- **Typography scale:**
  - Page title (e.g. "Dashboard"):            36 / FontWeight.Bold / Constantia / `varTheme.white`
  - Section title (e.g. "Seats by Country"):  20 / FontWeight.Semibold / Constantia / `varTheme.white`
  - KPI number (StatCard.Value):              28 / FontWeight.Bold / Constantia / `varTheme.white`
  - KPI label (StatCard.Label, uppercase):    11 / FontWeight.Semibold / Segoe UI / `varTheme.silver` / 1.5 px letter spacing (use uppercase text since LetterSpacing not always supported)
  - KPI delta (StatCard.Sub):                 11 / FontWeight.Normal / Segoe UI / `varTheme.gold`
  - Course code (uppercase gold):             12 / FontWeight.Bold / Segoe UI / `varTheme.gold`
  - Course name on card:                      16 / FontWeight.Semibold / Constantia / `varTheme.offWhite`
  - Card body / table cell:                   13 / FontWeight.Normal / Segoe UI / `varTheme.offWhite`
  - Meta / secondary:                         11 / FontWeight.Normal / Segoe UI / `varTheme.lightGray`
  - Badge text:                               10–11 / FontWeight.Semibold / Segoe UI / variant fg color
  - Sidebar nav label:                        13 / FontWeight.Semibold (active) / FontWeight.Normal (inactive) / Segoe UI

- **Border radius convention:** 8 px for cards (ModernCard default
  acceptable), 4 px for badges and inputs, 999 px (circle) for avatars and
  workflow tracker bullets, 0 px for the hairline rectangles between rows.

- **Drop shadows:** Avoid heavy shadow on dark theme. Only the active
  sidebar nav button uses a subtle `DropShadow.Semilight`. Cards stay flat
  with border-only separation.

## Named Variables and Shared State

All initialized in `App.OnStart` (see `App.pa.yaml`):

| Variable                  | Type        | Purpose                                                    |
|---------------------------|-------------|------------------------------------------------------------|
| `varTheme`                | Record      | All RGBA tokens + font family strings                      |
| `varCurrentUser`          | Record      | `{name, email, role}` — stub `dione@loreal.com` / BP       |
| `varCurrentPage`          | Text        | Active page key for sidebar highlight: dashboard / catalog / employees / nominations / seats / pdl / criteria |
| `varPrevYearTotals`       | Record      | `{nominations, investment, approved}` for YoY deltas       |
| `varSelectedCourse`       | Record      | Course chosen for detail view / nomination form            |
| `varSelectedEmp`          | Record      | Employee chosen for detail overlay                         |
| `varSelectedNom`          | Record      | Nomination targeted by the current action                  |
| `varShowEmpModal`         | Boolean     | Toggles the employee detail overlay on `scrEmployees`      |
| `varShowNominationForm`   | Boolean     | Toggles cmpNominationForm on `scrCourseDetail`             |
| `varNominationIsException`| Boolean     | When TRUE, the nomination form requires OverrideReason     |

Collections (all `ClearCollect`ed in OnStart):

| Collection             | Source                  | Notes                                       |
|------------------------|-------------------------|---------------------------------------------|
| `colEmployees`         | `'01_Employees'`        | All employees                               |
| `colCourses`           | `'02_Courses'`          | All courses                                 |
| `colCountryAllocations`| `'03_CountryAllocations'`| Seats / budget per country (from SP)       |
| `colNominations`       | `'04_Nominations'`      | All nominations                             |
| `colHistory`           | `'05_NominationHistory'`| Audit trail                                 |
| `colCountrySeats`      | inline literals         | Reference card (matches `'03_'` semantics; used as fallback if the SP list is empty) |
| `colWorkflowStages`    | inline literals         | Workflow stage metadata for cmpWorkflowTracker |
| `colPrevYearByCountry` | inline literals         | YoY per-country baseline                    |

Named formulas (in `App.Formulas`, full body in `App.pa.yaml`):

| Formula                            | Returns       | Purpose                                  |
|------------------------------------|---------------|------------------------------------------|
| `Score(emp)`                       | Number 0-100  | Composite scoring (5 dimensions)         |
| `IsEligible(emp, course)`          | Boolean       | Single boolean — passes all prereqs?     |
| `EligibilityReasons(emp, course)`  | Text          | "; "-joined list of unmet rules          |
| `StageLabel(status)`               | Text          | Workflow status → human English label    |
| `NextStage(status)`                | Text          | Next status key in the workflow          |
| `ThemeGold` ... `ThemeDanger`      | Color         | RGBA color tokens                         |
| `GaugeColor(used, total)`          | Color         | Gold < 70%, warning 70-90%, danger ≥ 90% |

> **UDF fallback:** If the tenant has User-Defined Functions disabled, each
> screen-builder must replicate the expressions inline. The most common
> pattern is to add computed columns to galleries via `AddColumns(...)`:
> ```
> Items: =AddColumns(
>          colEmployees,
>          score, /* Score formula body */ ,
>          isElig, /* IsEligible body with varSelectedCourse */
>        )
> ```
> Color helpers (`GaugeColor`) can always be inlined.

## Control Definitions

> Reminder: each screen-builder agent **must call `describe_control`** for
> every control type it emits. The notes below are conventions from the
> Canvas YAML reference docs (`TechnicalGuide.md`, `DesignGuide.md`) — they
> are the starting point, not authoritative property catalogs.

### ModernCard
Use as the **default card primitive** — it has built-in `OnSelect` (which
`GroupContainer` lacks), Title/Subtitle/Description hierarchy, and a Fluent
shadow / radius. Common properties to confirm via `describe_control`:
`Fill`, `BorderColor`, `BorderThickness`, `RadiusTopLeft/TopRight/BottomLeft/BottomRight`,
`OnSelect`, `Width`, `Height`, `X`, `Y`, `DropShadow`. Card **children**
are typically `ModernText`, `Image`, `Badge`, `Button` arranged in a
nested `GroupContainer`.

### Gallery
For lists and grids. Key properties: `Items`, `TemplateSize` (or
`TemplateHeight`/`TemplateWidth` depending on layout), `Layout`
(Vertical / Horizontal / "VerticalDistribution" etc.), `WrapCount` (cards
grid), `OnSelect`, `Selected`, `ShowScrollbar`. Inside the template use
`ThisItem.<column>`. For two-column card grids: `Layout: =Layout.Vertical`
+ `WrapCount: =2`.

### ModernText
Modern replacement for `Label`. Properties: `Text`, `Size`, `FontWeight`,
`Font` (or `FontFamily`), `FontColor` (or `Color`), `Align`, `VerticalAlign`,
`AutoHeight`, `Width`, `Height`, `X`, `Y`, `Visible`. Always set
`AutoHeight: =true` on multi-line body text per TechnicalGuide.

### ModernButton (or Button)
For primary CTAs and inline actions. Properties to confirm: `Text`,
`OnSelect`, `BasePaletteColor` (drives accent), `DisplayMode`, `Appearance`
(`'ButtonCanvas.Appearance'.Transparent` for ghost buttons), `Icon`,
`IconPosition`, `Width`, `Height`, `Size` (note: many Button variants do
**not** support `Size` for the label — verify per family).

### ModernTextInput
For search boxes and multi-line text (Justification, OverrideReason).
Properties: `Default`, `Value`, `HintText`, `Mode` (SingleLine /
MultiLine), `OnChange`, `Fill`, `BorderColor`, `FontColor`, `Width`,
`Height`. Quote `HintText` if it contains `: ` (TechnicalGuide).

### ModernDropdown
For the Priority 1-10 selector on `scrNominations`. Properties:
`Items` (e.g. `=[1,2,3,4,5,6,7,8,9,10]`), `Selected` / `SelectedItems`,
`OnChange`, `Width`, `Height`. Confirm whether `Default` accepts a
record literal — if so, quote it: `Default: '={Value: 1}'`.

### ModernCombobox
For filter selectors (TalentClass, Country, Target). Properties: `Items`,
`SelectMultiple` (often false for these), `DefaultSelectedItems`,
`SearchFields`, `OnChange`, `Width`. Choice-column filters typically use:
`Items: =Distinct(colEmployees, TalentClass.Value)`.

### Avatar
Modern avatar with initials fallback. Properties to confirm: `Text`
(label / name), `Initials` (or auto-computed), `Image` / `ImageSource`,
`Size`, `Appearance`, `BadgeStatus`. Use 32 px for table rows, 48 px for
detail headers, 64 px for overlay modal header.

### Badge
Use for status pills, talent class, FlightRisk. Properties to confirm:
`Text`, `Appearance` (`Filled` / `Tint` / `Outline` / `Ghost`),
`Color` / `BasePaletteColor` (semantic: Success / Warning / Danger /
Brand), `Shape`, `Size`. Conditional color:
`BasePaletteColor: =If(ThisItem.Status = "final", varTheme.success, ...)`.
**Fallback** if Badge doesn't accept arbitrary RGBA: build a custom badge
with a `Rectangle` (Fill=goldSoft, Border=gold, Radius=4) + nested
`ModernText` (Size=11, FontWeight=Semibold, FontColor=variant fg).
`cmpBadge` (see Components) wraps this.

### Progress
For horizontal usage bars on `scrSeats` and the course bars. Properties:
`Value` (0-1 or 0-100, verify), `Max`, `Color` / `Fill`, `Shape`, `Width`,
`Height`. Color reacts to `GaugeColor(used, total)`.

### PartialCircle
**Preferred SeatGauge implementation** — draws an arc that can be tinted.
Properties to confirm: `StartAngle`, `EndAngle`, `Width`, `Height`,
`Fill` / `Color`, `BorderThickness`. Layer two PartialCircles: a full
360° track at low opacity (silver/medGray) and a foreground arc
0..(used/total)*360 in `GaugeColor(used,total)`. Place a centered
`ModernText` "Used / Total" inside a `GroupContainer ManualLayout`.

### BarChart and PieChart
Used on dashboard analytics (PieChart for talent class split, BarChart
for By Country / Top Courses). Properties typically include `Items`,
`XLabel` / `Category` field, `YValue` / `Series`, `Color`, `Title`,
`Width`, `Height`. If the chart APIs feel restrictive for the gold
theme, fall back to a custom `Gallery` of horizontal bars (Rectangle +
ModernText) — the MVP uses exactly this pattern.

### ModernTabList
For the view switcher on `scrNominations` ("Por Curso" / "Lista") and
status filter bar. Properties: `Items` (table of `{Value, Name, Icon}`),
`Default`, `Selected`, `OnChange`. **Critical:** `Default` is a record
literal — quote it per TechnicalGuide:
`Default: '={Value: "list"}'`.

### GroupContainer
Layout primitive. Two variants:
- `Variant: ManualLayout` — children use absolute `X`, `Y`, `Width`,
  `Height`.
- `Variant: AutoLayout` — properties include `LayoutDirection`
  (Horizontal/Vertical), `LayoutAlignItems`, `LayoutJustifyContent`,
  `LayoutGap`, `LayoutOverflowY`, `PaddingTop/Bottom/Left/Right`.
  Children use `AlignInContainer`, `FillPortions`, `LayoutMinWidth/Height`.

> `GroupContainer` has **no `OnSelect`**. Use `ModernCard` for clickable
> areas, or overlay a transparent `Button` (`Appearance:
> ='ButtonCanvas.Appearance'.Transparent`) at the same X/Y/Width/Height.

### Rectangle / Circle / Icon / ModernIcon
- Rectangle: hairlines, badge backgrounds, progress fills.
  Properties: `Fill`, `BorderColor`, `BorderThickness`,
  `RadiusTopLeft/...`, `Width`, `Height`, `X`, `Y`.
- Circle: workflow tracker bullets (alternative: small fixed-size
  Rectangle with Radius set to half the side).
- ModernIcon: Fluent icon by name (`Icon: ='Icon.ChevronRight'` style —
  verify exact enum). Use for sidebar items, button icons, badge icons.
  Properties: `Icon`, `Color`, `Size`, `Width`, `Height`.

### Toggle
For "Show non-eligible" on `scrCourseDetail`. Properties: `Default`,
`Value`, `OnChange`, `Width`, `Height`, `Label` (or `Text`).

### Image
For course provider logos or LOREAL wordmark in sidebar header.
Properties: `Image` / `ImageSource`, `ImagePosition`, `Width`, `Height`.

### HtmlViewer (fallback only)
If `PartialCircle` proves insufficient for the SeatGauge, fall back to:
`HtmlText: =Concatenate("<svg ...>", ...)` rendering an SVG ring.
Use **only** as a last resort because it does not respect theme tokens.

## Per-Screen Specifications

> Every screen must include the standard layout chrome:
> 1. Screen `Fill: =varTheme.black`.
> 2. Root `GroupContainer ManualLayout` filling the screen.
> 3. **Left sidebar** (240×screen-height) — implemented via the
>    `cmpSidebar` component (or inlined per-screen if components prove
>    infeasible; see Components section). On render, the sidebar:
>    - shows a top wordmark "L'ORÉAL" (Constantia, white, FontWeight Bold)
>      with a smaller gold subtitle "SEMINAR BY NOMINATION" (uppercase
>      silver, 9pt, FontWeight Semibold);
>    - lists 7 nav items (Dashboard, Courses, Employees, Nominations,
>      Seats, PDL LATAM, Criteria) — each a transparent `Button` with
>      `OnSelect: =Set(varCurrentPage,"<key>"); Navigate(<screen>)` and
>      a Fill that becomes `varTheme.goldSoft` when
>      `varCurrentPage = "<key>"`, plus a gold left border (Rectangle
>      width=3, height=row, fill=varTheme.gold, visible when active);
>    - footer with `varCurrentUser.name`, `varCurrentUser.role`,
>      `varCurrentUser.email` in silver/lightGray.
> 4. **Content area** at X=240, Width=Parent.Width-240, fully scrollable
>    via inner AutoLayout vertical container with
>    `LayoutOverflowY: =LayoutOverflow.Scroll` and 32 px padding.
> 5. Set `OnVisible: =Set(varCurrentPage, "<this screen key>")` so the
>    sidebar lights up correctly on direct navigation.

---

### scrDashboard

- **File:** `scrDashboard.pa.yaml`
- **Purpose:** Landing page. KPIs + workflow tracker + analytics grids.
  This is the screen the BP sees on open.
- **Layout:** ManualLayout root → sidebar (left) + content
  AutoLayout-Vertical (right). Inside content, 6 stacked sections.
- **OnVisible:** `=Set(varCurrentPage, "dashboard")`
- **Sections (top → bottom):**
  1. **Header row** — ModernText title "Dashboard" (32 pt serif white) +
     subtitle "Strategic overview of nominations, seats and investment
     across LATAM zones" (13 pt Segoe silver) + on the right an
     "Export to Excel" `ModernButton`
     (`OnSelect: =Notify("Power Automate export flow pending", NotificationType.Information)`).
  2. **KPI row** — AutoLayout Horizontal, LayoutGap 16. 3 StatCards:
     - Total Nominations: `Value = CountRows(colNominations)` ;
       `Sub = "vs " & varPrevYearTotals.nominations & " (" &
       Text(Round((CountRows(colNominations) - varPrevYearTotals.nominations)
       / varPrevYearTotals.nominations * 100, 0)) & "%)"`
     - Total Investment: `Value = Text(Sum(colNominations, Investment), "[$-en-US]$#,##0")` ;
       similar Sub formula vs varPrevYearTotals.investment.
     - Approved (Final): `Value = CountIf(colNominations, Status.Value = "final")` ;
       Sub vs varPrevYearTotals.approved.
  3. **Workflow Tracker card** — ModernCard, padding 24, hosts
     `cmpWorkflowTracker` (or inlined: 3 circles + connecting Rectangles +
     stage labels below). Title text "Approval Workflow".
  4. **Grid 2 cols** — AutoLayout Horizontal, gap 16, both children
     `FillPortions: =1`:
     - **Seats by Country** — ModernCard containing a Gallery
       (`Items: =colCountrySeats`) of 5 SeatGauges
       (`cmpSeatGauge` with Used = `CountIf(colNominations,
        LookUp(colEmployees, CarolID = ThisItem2.CarolID).Country.Value =
        ThisItem.country, Status.Value <> "rejected")`, Total =
        `ThisItem.seats`, Label = `ThisItem.country`).
     - **Budget by Country** — ModernCard with a Gallery of horizontal
       progress bars (Rectangle background medGray + Rectangle overlay
       width = `FillPortions(budget_used/budget_total) * available_width`,
       Fill = `GaugeColor(used,total)`) + text "$X used of $Y".
  5. **Grid 3 cols** — AutoLayout Horizontal, gap 16:
     - **By Country** — ModernCard + Gallery (Items =
       `AddColumns(colCountrySeats, count,
        CountIf(colNominations, LookUp(colEmployees, CarolID=ThisItem.CarolID).Country.Value=ThisItem.country))`)
       with horizontal bar per country.
     - **Top 5 Courses** — Gallery over `FirstN(SortByColumns(
        AddColumns(colCourses, count,
         CountIf(colNominations, CourseID=ThisItem.CourseID)),
        "count", SortOrder.Descending), 5)`.
     - **By Classification** — Gallery over Distinct/AddColumns on
       TalentClass.Value. Use cmpBadge for the class color tag.
  6. **Grid 2 cols** — By Professional Field (Division) and By Org
     Division. Same Gallery + horizontal bar pattern.
- **Data Binding:** `colEmployees`, `colCourses`, `colNominations`,
  `colCountrySeats`, `varPrevYearTotals`.
- **Navigation:** Sidebar buttons trigger `Navigate(<screen>)`.
  "Export to Excel" stays on screen (Notify only).
- **State:** none beyond `varCurrentPage`.

---

### scrCatalog

- **File:** `scrCatalog.pa.yaml`
- **Purpose:** Browse the course catalog.
- **Layout:** Sidebar + content AutoLayout-Vertical.
- **OnVisible:** `=Set(varCurrentPage, "catalog")`
- **Local state:** `UpdateContext({locSearch: "", locCategory: Blank()})`
- **Sections:**
  1. Page header — title "Courses Catalog" + subtitle "Executive seminars
     at the world's top business schools".
  2. **Filter row** — AutoLayout Horizontal:
     - `ModernTextInput` search box, HintText "Search courses, providers
       or skills…", `OnChange: =UpdateContext({locSearch: Self.Value})`.
     - `ModernCombobox` Category — Items derived from
       `Distinct(colCourses, Category.Value)`,
       `OnChange: =UpdateContext({locCategory: Self.Selected.Value})`.
  3. **Course grid** — Gallery, `Layout: =Layout.Vertical`,
     `WrapCount: =2`, `TemplateSize: ~280`, Items =
     `Filter(colCourses,
        (locSearch = "" || locSearch in Name || locSearch in Provider || locSearch in Skills)
        && (IsBlank(locCategory) || Category.Value = locCategory)
        && Status.Value = "Active")`.
     Each card (ModernCard, Fill=`varTheme.darkGray`,
     Border=`varTheme.medGray`, Radius=8, OnSelect → set selected +
     navigate):
     - Top row: Code (uppercase gold 12 pt) + Category badge.
     - Title (Name, 18 pt serif offWhite, AutoHeight).
     - Description (13 pt silver, AutoHeight, max 3 lines).
     - Skills chip row (Gallery of `Split(ThisItem.Skills, ",")` →
       cmpBadge variant=dark).
     - Meta row: Provider · Duration · "X seats" ·
       "N nominated" (CountIf colNominations CourseID=ThisItem.CourseID).
     - Investment (right-aligned, 16 pt serif gold).
     - `OnSelect: =Set(varSelectedCourse, ThisItem); Navigate(scrCourseDetail, ScreenTransition.Fade)`.
- **Data Binding:** `colCourses`, `colNominations`.

---

### scrCourseDetail

- **File:** `scrCourseDetail.pa.yaml`
- **Purpose:** Course detail + eligible / out-of-target employee galleries
  + inline nomination form.
- **Layout:** Sidebar + content AutoLayout-Vertical.
- **OnVisible:**
  `=Set(varCurrentPage, "catalog"); UpdateContext({locSearch: "", locShowOOT: false})`
- **Local state:** `locSearch` (Text), `locShowOOT` (Boolean),
  `locFormEmp` (Record — employee being nominated), `locFormException`
  (Boolean), `locJustification` (Text), `locOverrideReason` (Text).
- **Sections:**
  1. Back button row — ModernButton "← Back to Catalog"
     (`OnSelect: =Navigate(scrCatalog, ScreenTransition.Fade)`).
  2. **Course header ModernCard** — two-column inner GroupContainer
     AutoLayout Horizontal:
     - Left: Code + Name + Description + Objective (all
       `varSelectedCourse.*`).
     - Right (fixed 280 px column): Investment (28 pt serif gold) +
       3 meta lines (Provider, Duration, Format).
     - Meta strip: "Seats X / Y" + "Eligible: N" (CountIf colEmployees
       IsEligible(ThisRecord, varSelectedCourse)) +
       Status badge.
  3. **Filter row** — ModernTextInput search +
     Toggle "Show non-eligible" → `locShowOOT`.
  4. **Eligible section** — Section title + Gallery
     (Items = `Filter(colEmployees,
        IsEligible(ThisRecord, varSelectedCourse)
        && (locSearch = "" || locSearch in FullName || locSearch in JobTitle))`).
     Each row: Avatar (Initials=`Left(FullName,1) & Left(LastName,1)`) +
     name/title/country + TalentClass cmpBadge + "Nominate"
     ModernButton (`OnSelect: =Set(varSelectedEmp, ThisItem);
     UpdateContext({locFormEmp: ThisItem, locFormException: false,
     locJustification: "", locOverrideReason: ""});
     Set(varShowNominationForm, true)`).
  5. **Out of Target section** (Visible = `locShowOOT`) — same gallery
     pattern but `Filter(... && !IsEligible(ThisRecord, varSelectedCourse))`
     and the row shows `EligibilityReasons(ThisItem, varSelectedCourse)`
     in danger color + "Out of Target" cmpBadge variant=warning +
     "Nominate (Exception)" ModernButton
     (`OnSelect: =... UpdateContext({locFormException: true}); Set(varShowNominationForm, true)`).
  6. **cmpNominationForm overlay** — Visible = `varShowNominationForm`.
     Black backdrop (Rectangle Fill=RGBA(0,0,0,0.6) full-screen + OnSelect
     close) + centered ModernCard 480×auto:
     - Title "Nominate: " & locFormEmp.FullName
     - Sub: course Name + (locFormException ? " · OUT OF TARGET" : "")
     - ModernTextInput multi-line Justification (`Default: locJustification`,
       OnChange: `UpdateContext({locJustification: Self.Value})`)
     - ModernTextInput multi-line Override Reason (Visible =
       locFormException; same pattern)
     - Cancel ModernButton (`OnSelect: =Set(varShowNominationForm, false)`)
     - Confirm ModernButton (DisplayMode = `If(Len(locJustification) > 0
        && (!locFormException || Len(locOverrideReason) > 0), DisplayMode.Edit,
        DisplayMode.Disabled)`) — see "Workflow logic" below for OnSelect body.

- **Data Binding:** `colEmployees`, `colCourses`, `colNominations`,
  `varSelectedCourse`.

---

### scrEmployees

- **File:** `scrEmployees.pa.yaml`
- **Purpose:** Filterable employee directory + detail overlay.
- **Layout:** Sidebar + content AutoLayout-Vertical.
- **OnVisible:** `=Set(varCurrentPage, "employees"); UpdateContext({locSearch:"", locTalent: Blank(), locCountry: Blank(), locTarget:"All", locSortDesc: false})`
- **Local state:** `locSearch`, `locTalent`, `locCountry`, `locTarget`
  ("All"/"Yes"/"No"), `locSortDesc`.
- **Sections:**
  1. Header — "Employees" title + subtitle "Talent pool considered for
     nomination cycles".
  2. **Filter bar** — AutoLayout Horizontal: Search + 3 Comboboxes
     (TalentClass, Country, Target) + Sort toggle.
  3. **Table-style Gallery** — Items =
     `SortByColumns(
        Filter(colEmployees,
          (locSearch = "" || locSearch in FullName || locSearch in JobTitle)
          && (IsBlank(locTalent) || TalentClass.Value = locTalent)
          && (IsBlank(locCountry) || Country.Value = locCountry)
          && (locTarget = "All"
              || (locTarget = "Yes" && KeyPlayer)
              || (locTarget = "No" && !KeyPlayer))),
        "FullName", If(locSortDesc, SortOrder.Descending, SortOrder.Ascending))`.
     Template row (TemplateHeight ~ 64): Avatar (size 32) | Employee
     stack (FullName 14 pt offWhite + JobTitle 11 pt silver + "·
     " & Country.Value 11 pt lightGray) | TalentClass cmpBadge |
     Performance cmpBadge | FlightRisk cmpBadge | KeyPlayer cmpBadge
     (visible only if true) | PastSBN ModernText.
     `OnSelect: =Set(varSelectedEmp, ThisItem); Set(varShowEmpModal, true)`.
  4. **Employee Detail overlay** — Visible = `varShowEmpModal`. Full
     black backdrop + centered ModernCard ~ 760×620:
     - Header: Avatar (size 64) + Name (24 pt serif white) + JobTitle +
       Country/Division meta + badge row.
     - Stat strip (5 ModernTexts): MonthsCompany / MonthsDivision /
       MonthsRole / PastSBN / Age.
     - Section "Active Nominations" — Gallery filtered by
       `Filter(colNominations, CarolID = varSelectedEmp.CarolID)` —
       course name + Status badge with `StageLabel(Status.Value)`.
     - Section "Eligibility by Course" — Gallery over colCourses with
       eligibility badge (`If(IsEligible(varSelectedEmp, ThisItem),
       "Eligible", "Out of Target")` → cmpBadge variant=success/warning)
       and a "Nominate" ModernButton when no active nomination exists.
     - Close ModernButton (`OnSelect: =Set(varShowEmpModal, false)`).

- **Data Binding:** `colEmployees`, `colCourses`, `colNominations`.

---

### scrNominations

- **File:** `scrNominations.pa.yaml`
- **Purpose:** Operational hub — review nominations, advance / reject /
  reprioritize.
- **Layout:** Sidebar + content AutoLayout-Vertical.
- **OnVisible:** `=Set(varCurrentPage, "nominations"); UpdateContext({locStatusFilter:"all", locRoleFilter:"all", locView:"list", locSortPriority: true, locRejectingId:""})`
- **Local state:** `locStatusFilter` ("all"/"nominated"/"country_hrd_validation"/"zone_validation"/"final"/"rejected"),
  `locRoleFilter` ("all"/"BP"/"Head"), `locView` ("list"/"by_course"),
  `locSortPriority` (Boolean), `locRejectingId` (Text — id of nomination
  currently showing its reject textarea), `locRejectReason` (Text).
- **Sections:**
  1. Page header — Title "Nominations" + counts row (X total · Y final · Z rejected).
  2. **cmpWorkflowTracker card** with stage descriptions.
  3. **Filter bar** — AutoLayout Horizontal:
     - 6 status buttons (All + 5 statuses). Each button:
       `Text: ="Nominated (" & CountIf(colNominations, Status.Value="nominated") & ")"`,
       `OnSelect: =UpdateContext({locStatusFilter:"nominated"})`,
       `BasePaletteColor: =If(locStatusFilter="nominated", varTheme.gold, varTheme.medGray)`.
     - 3 NominatorRole buttons (All / BP / Head).
     - Toggle "Sort by Priority" → `locSortPriority`.
     - ModernTabList view toggle (Items = `Table({Value:"list",Name:"Lista"},{Value:"by_course",Name:"Por Curso"})`,
       `Default: '={Value: "list"}'`,
       `OnChange: =UpdateContext({locView: Self.Selected.Value})`).
  4. **List view** (`Visible = locView = "list"`) — Gallery over
     `SortByColumns(
        Filter(colNominations,
          (locStatusFilter="all" || Status.Value=locStatusFilter)
          && (locRoleFilter="all" || NominatorRole.Value=locRoleFilter)),
        "Priority", If(locSortPriority, SortOrder.Ascending, SortOrder.Descending))`.
     Each row (TemplateHeight ~ 140): two-row layout:
     - Left: Avatar + Employee (LookUp(colEmployees, CarolID=ThisItem.CarolID).FullName) + Course (LookUp(colCourses, CourseID=ThisItem.CourseID).Name) + Justification (truncated) + status cmpBadge with `StageLabel(ThisItem.Status.Value)` + NominatorRole cmpBadge + Priority cmpBadge ("P" & Priority).
     - Right: Investment (serif gold) + Priority ModernDropdown (Items =[1..10]) (`OnChange: =Patch('04_Nominations', ThisItem, {Priority: Self.Selected.Value}); ClearCollect(colNominations,'04_Nominations')`) + Advance ModernButton (Visible = `ThisItem.Status.Value <> "final" && ThisItem.Status.Value <> "rejected"`, see Workflow logic) + Reject ModernButton (toggles `locRejectingId`).
     - Inline reject reason ModernTextInput multi-line (Visible = `locRejectingId = ThisItem.NominationID`) + Cancel/Confirm buttons.
  5. **By-course view** (`Visible = locView = "by_course"`) — Gallery
     of courses (Items = `Filter(colCourses, CountIf(colNominations,
     CourseID = ThisItem.CourseID) > 0)`), expandable. Each course card
     contains a nested Gallery filtered to that course's nominations.

- **Data Binding:** `colNominations`, `colEmployees`, `colCourses`,
  `colHistory`.

---

### scrSeats

- **File:** `scrSeats.pa.yaml`
- **Purpose:** Seats / budget utilization overview.
- **Layout:** Sidebar + content AutoLayout-Vertical.
- **OnVisible:** `=Set(varCurrentPage, "seats")`
- **Sections:**
  1. Header — "Seats & Budget" title + subtitle.
  2. **KPI row** — AutoLayout Horizontal, 4 StatCards:
     - Seats Used: `CountIf(colNominations, Status.Value <> "rejected")`
     - Seats Available: `Sum(colCountrySeats, seats) - CountIf(colNominations, Status.Value <> "rejected")` + sub "% utilization".
     - Budget Used: `Sum(Filter(colNominations, Status.Value <> "rejected"), Investment)` formatted as USD.
     - Budget Available: `Sum(colCountrySeats, budget) - Sum(...)` + sub %.
  3. **By Country card** — ModernCard hosting Gallery over
     `colCountrySeats`. Each item: cmpSeatGauge + cmpBudgetBar
     (horizontal Progress with GaugeColor).
  4. **By Course card** — ModernCard hosting Gallery over
     `AddColumns(colCourses, used, CountIf(colNominations, CourseID = ThisItem.CourseID && Status.Value <> "rejected"))`.
     Each row: Code (gold), Name, horizontal Progress bar
     (Width proportional, Fill = `GaugeColor(used, ThisItem.Seats)`),
     "used / total" text, cmpBadge ("Full" if used >= total, "X left"
     if total-used <= 3, else "OK").
- **Data Binding:** `colNominations`, `colCountrySeats`, `colCourses`.

---

### scrPDLLatam

- **File:** `scrPDLLatam.pa.yaml`
- **Purpose:** PDL LATAM executive view — analytics + Key Players section.
- **Layout:** Sidebar + content AutoLayout-Vertical (this screen is the
  longest — ensure `LayoutOverflowY: =LayoutOverflow.Scroll`).
- **OnVisible:** `=Set(varCurrentPage, "pdl")`
- **Sections:**
  1. Header — "PDL LATAM" title + subtitle "Zone analytics and Key Players coverage".
  2. **Analytics blocks** — re-use the same grid components as scrDashboard
     (By Country / Top Courses / By Classification / By Division /
     By Org Division). To avoid duplication, the screen-builder may
     extract these into a `cmpAnalyticsGrid` component if practical;
     otherwise replicate the markup.
  3. Horizontal Rectangle hairline divider (Height=1, Fill=varTheme.medGray).
  4. **Key Players section header** — title "Key Players" + subtitle
     "Strategic talent priority coverage across LATAM".
  5. **KP KPI row** — 4 StatCards:
     - KP Count: `CountIf(colEmployees, KeyPlayer)`
     - KP Coverage: `CountIf(colEmployees, KeyPlayer && CountIf(colNominations, CarolID = parent.CarolID) > 0) / CountIf(colEmployees, KeyPlayer)` → formatted "%". *(use a With() to alias the parent CarolID since nested filter scope can be tricky.)*
     - KP Nominations: `CountIf(colNominations, LookUp(colEmployees, CarolID = parent.CarolID).KeyPlayer)`.
     - KP Investment: Sum same filter.
  6. **KP Coverage by Country card** — Gallery over colCountrySeats with
     cmpSeatGauge (Used = KP nominated in country, Total = KP in country).
  7. **Grid 4 cols** — KP by Country / TalentClass / FlightRisk /
     OrgDivision (same horizontal bar gallery pattern).
  8. **Table "Key Players — Nomination Status"** — Gallery over
     `Filter(colEmployees, KeyPlayer)`. Each row: Avatar + Name/Title +
     TalentClass cmpBadge + Country + FlightRisk cmpBadge + nomination
     count (Fill=green if >0, "No nomination" badge variant=danger
     if 0).
- **Data Binding:** `colEmployees`, `colNominations`, `colCountrySeats`.

---

### scrCriteria

- **File:** `scrCriteria.pa.yaml`
- **Purpose:** Static reference of the scoring model (no data writes).
- **Layout:** Sidebar + content AutoLayout-Vertical with 5 cards + summary.
- **OnVisible:** `=Set(varCurrentPage, "criteria")`
- **Sections:**
  1. Header — "Scoring Criteria" title + subtitle "How nomination priority
     is calculated".
  2. **5 dimension cards** — each ModernCard contains a header (Dimension
     name + Max pts cmpBadge gold) and a Gallery of items with name,
     horizontal bar (Width = `(points / 30) * 280`, Fill = varTheme.gold),
     and points text. Source data: inline `Table()` literals — e.g.
     ```
     Items: =Table(
        {label: "Future Leaders",    pts: 30},
        {label: "Rising Players",    pts: 22},
        {label: "Essential Players", pts: 15}
     )
     ```
     - TalentClass (max 30) — Future Leaders 30 / Rising 22 / Essential 15
     - SuccessionPipeline (max 20) — Yes 20 / No 0
     - SBN History (max 15) — 0× → 15 / 1× → 5 / 2+× → 0
     - FlightRisk (max 15) — High 15 / Medium 8 / Low 0
     - Performance (max 20) — Exceeds 20 / Strong 14 / Meets 8 / Developing 3
  3. **Total Score summary card** — ModernCard "Total Score 0-100" with 3
     priority bands (Rectangle + ModernText):
     - High Priority 75–100 (success)
     - Medium Priority 50–74 (warning)
     - Low Priority < 50 (lightGray)
- **Data Binding:** none (static).

---

## Components

The plan uses 7 Canvas Components defined in a single shared file
`Components.pa.yaml` (Canvas Apps supports `ComponentDefinitions:` as a top-
level key alongside `Screens:` in the YAML format). If the parent skill
prefers one file per component, split accordingly — names below remain stable.

> **If canvas components prove infeasible in this YAML format** (e.g., the
> tenant doesn't allow `ComponentDefinitions` in unpacked sources), each
> screen-builder must inline the equivalent markup using the patterns
> described below and add a comment at the top of its screen file:
> `// component cmpX inlined — ComponentDefinitions unsupported`.

### cmpBadge
- **Props:** `Text` (Text, Input), `Variant` (Text, Input — one of
  `default`, `gold`, `success`, `warning`, `danger`, `info`, `dark`),
  `Size` (Text, Input — `sm` or `xs`).
- **Structure:** ManualLayout root `Width = Self.Width` / `Height = Self.Height`
  → Rectangle (Fill = soft variant of color, BorderColor = full variant,
  BorderThickness = `If(Variant="gold", 1, 0)`, Radius 4) + ModernText
  centered (FontWeight Semibold, FontColor variant base, Size
  `If(Size="xs", 9, 11)`, padding L/R 8, AutoHeight false). Width auto-
  sizes via parent container — set `LayoutMinWidth/MaxWidth`.
- **Variant→color table:**
  - default → `(medGray, lightGray)`
  - gold    → `(goldSoft, gold)`
  - success → `(successSoft, success)`
  - warning → `(warningSoft, warning)`
  - danger  → `(dangerSoft, danger)`
  - info    → `(infoSoft, info)`
  - dark    → `(black, silver)`

### cmpCard
- **Props:** `OnClickAction` (Behavior, Input), `Hoverable` (Boolean, Input).
- **Recommendation:** prefer ModernCard directly when an OnSelect is needed
  (`OnSelect: =cmpCard.OnClickAction()`). cmpCard exists for legacy parity
  with the React component but downstream agents are encouraged to use
  ModernCard inline.

### cmpStatCard
- **Props:** `Label` (Text), `Value` (Text), `Sub` (Text),
  `IconName` (Text — optional, references a ModernIcon enum value).
- **Structure:** ModernCard 220×120, Fill `varTheme.darkGray`, Border
  `varTheme.medGray`, Radius 8. Children vertical AutoLayout, gap 6,
  padding 16:
  - Row 1: ModernIcon (Size 18, Color `varTheme.gold`, Visible = `!IsBlank(IconName)`) + ModernText `Label` (11 pt Semibold silver uppercase).
  - Row 2: ModernText `Value` (28 pt Constantia Bold white).
  - Row 3: ModernText `Sub` (11 pt gold) — Visible = `!IsBlank(Sub)`.

### cmpWorkflowTracker
- **Props:** `CurrentStage` (Number — 0-based index of current stage, Input).
- **Structure:** AutoLayout Horizontal, LayoutAlignItems Center, gap 0.
  3 stage cells + 2 connector rectangles between them. Each stage cell:
  GroupContainer Vertical containing:
  - Circle (Width=44, Height=44, Fill = stage color, BorderColor = same).
    Stage color = `If(stageIndex < CurrentStage, varTheme.success,
                      If(stageIndex = CurrentStage, varTheme.gold, varTheme.medGray))`.
  - ModernIcon inside the circle (Checkmark if done, ClipboardList/etc.
    if current, lock/dot if pending).
  - ModernText below: stage label (12 pt Semibold offWhite if active else lightGray).
  Connector Rectangle: Width auto-fill, Height=2, Fill = `If(stageIndex < CurrentStage, varTheme.success, varTheme.medGray)`.

### cmpSeatGauge
- **Props:** `Used` (Number), `Total` (Number), `LabelText` (Text).
- **Preferred structure (PartialCircle):** GroupContainer ManualLayout 90×120.
  - Background PartialCircle: StartAngle=0, EndAngle=360, Fill=`varTheme.medGray`, BorderThickness=8.
  - Foreground PartialCircle: StartAngle=0, EndAngle=`If(Total=0, 0, (Used/Total)*360)`, Fill=`GaugeColor(Used, Total)`, BorderThickness=8.
  - Centered ModernText (ManualLayout, centered): "Used" (24 pt Constantia white) on top of "/ Total" (11 pt silver).
  - ModernText below the arc: `LabelText` (11 pt Semibold offWhite).
- **Fallback (HtmlViewer):** if PartialCircle cannot be tinted, set
  `HtmlText` to an SVG ring (see MVP `SeatGauge` JSX).

### cmpNominationForm
- **Props:** `CourseRecord` (Record), `EmployeeRecord` (Record),
  `IsException` (Boolean), `OnConfirm` (Behavior — receives no args; the
  parent screen handles the Patch), `OnCancel` (Behavior).
- **Structure:** Backdrop + ModernCard 480×auto. Children vertical
  AutoLayout, gap 12, padding 24:
  - ModernText title `"Nominate: " & EmployeeRecord.FullName` (18 pt serif white).
  - ModernText sub `CourseRecord.Name & If(IsException, " · OUT OF TARGET", "")` (12 pt warning if exception else silver).
  - ModernTextInput Justification (multiline, HintText "Why is this person being nominated?", `OnChange: =Set(varNominationJustification, Self.Value)`).
  - ModernTextInput OverrideReason (multiline, Visible = `IsException`, HintText "Reason for the exception").
  - AutoLayout Horizontal (gap 8, right-align): Cancel ModernButton
    (`OnSelect: =cmpNominationForm.OnCancel()`) + Confirm ModernButton
    (DisplayMode disabled until both required inputs are non-empty;
    `OnSelect: =cmpNominationForm.OnConfirm()`).

### cmpSidebar
- **Props:** none (reads `varCurrentPage`, `varCurrentUser`, `varTheme`).
- **Structure:** ManualLayout 240×Parent.Height. Background Rectangle
  Fill=`varTheme.darkGray`, BorderColor=`varTheme.medGray`,
  BorderThickness=1 (right side only — emulate by adjacent thin Rectangle).
  Children:
  - Top wordmark area (ManualLayout 240×100): "L'ORÉAL" 24 pt Constantia
    Bold white + "SEMINAR BY NOMINATION" 9 pt Semibold gold uppercase.
  - 7 nav buttons (Dashboard, Courses, Employees, Nominations, Seats,
    PDL LATAM, Criteria). Each is a transparent Button + Rectangle left-
    border (Width=3, Fill=`varTheme.gold`, Visible = `varCurrentPage="<key>"`)
    + ModernIcon + ModernText label. Active state: Fill=`varTheme.goldSoft`,
    label FontWeight=Semibold, FontColor=`varTheme.white`. Inactive:
    Fill=transparent, label FontColor=`varTheme.silver`.
    `OnSelect: =Set(varCurrentPage, "<key>"); Navigate(<screen>, ScreenTransition.Fade)`.
  - Footer (ManualLayout, bottom 96 px): horizontal Rectangle divider +
    ModernText `varCurrentUser.name` (offWhite 13 pt Semibold) +
    ModernText `varCurrentUser.role` (lightGray 11 pt) +
    ModernText `varCurrentUser.email` (lightGray 10 pt).

## Workflow logic (Patch pattern — referenced by scrCourseDetail and scrNominations)

> **Create a nomination (used by both nominate buttons in scrCourseDetail
> and Eligibility-by-Course in scrEmployees detail overlay):**
> ```
> OnSelect: |-
>   =With(
>     { newId: "NOM-" & Text(Now(), "yymmddhhmmss") },
>     Patch(
>       '04_Nominations',
>       Defaults('04_Nominations'),
>       {
>         NominationID:   newId,
>         CarolID:        locFormEmp.CarolID,
>         CourseID:       varSelectedCourse.CourseID,
>         Investment:     varSelectedCourse.Investment,
>         Eligible:       IsEligible(locFormEmp, varSelectedCourse),
>         OutOfTarget:    locFormException,
>         OverrideReason: locOverrideReason,
>         Score:          Score(locFormEmp),
>         Status:         { Value: "nominated" },
>         CreatedDate:    Now(),
>         Justification:  locJustification,
>         NominatorRole:  { Value: varCurrentUser.role },
>         NominatorEmail: varCurrentUser.email,
>         Priority:       Blank()
>       }
>     );
>     Patch(
>       '05_NominationHistory',
>       Defaults('05_NominationHistory'),
>       {
>         Title:        newId & "-create",
>         NominationID: newId,
>         Action:       { Value: "created" },
>         UserEmail:    varCurrentUser.email,
>         UserName:     varCurrentUser.name,
>         Timestamp:    Now(),
>         Details:      "Nominated for " & varSelectedCourse.Name
>                       & If(locFormException, " (Exception - Out of Target): " & locOverrideReason, "")
>       }
>     )
>   );
>   ClearCollect(colNominations, '04_Nominations');
>   ClearCollect(colHistory, '05_NominationHistory');
>   Set(varShowNominationForm, false);
>   Notify("Nomination created.", NotificationType.Success)
> ```

> **Advance status (button on each row in scrNominations list view):**
> ```
> OnSelect: |-
>   =Patch('04_Nominations', ThisItem, { Status: { Value: NextStage(ThisItem.Status.Value) } });
>   Patch('05_NominationHistory', Defaults('05_NominationHistory'),
>     {
>       Title:        ThisItem.NominationID & "-adv-" & Text(Now(),"yymmddhhmmss"),
>       NominationID: ThisItem.NominationID,
>       Action:       { Value: "status_advanced" },
>       UserEmail:    varCurrentUser.email,
>       UserName:     varCurrentUser.name,
>       Timestamp:    Now(),
>       Details:      "Status: " & ThisItem.Status.Value & " → " & NextStage(ThisItem.Status.Value)
>     }
>   );
>   ClearCollect(colNominations, '04_Nominations');
>   ClearCollect(colHistory, '05_NominationHistory')
> ```

> **Reject (after inline reason captured into locRejectReason):**
> ```
> OnSelect: |-
>   =Patch('04_Nominations', ThisItem,
>     { Status: { Value: "rejected" }, RejectionReason: locRejectReason });
>   Patch('05_NominationHistory', Defaults('05_NominationHistory'),
>     {
>       Title:        ThisItem.NominationID & "-rej-" & Text(Now(),"yymmddhhmmss"),
>       NominationID: ThisItem.NominationID,
>       Action:       { Value: "rejected" },
>       UserEmail:    varCurrentUser.email,
>       UserName:     varCurrentUser.name,
>       Timestamp:    Now(),
>       Details:      "Rejected: " & locRejectReason
>     }
>   );
>   ClearCollect(colNominations, '04_Nominations');
>   ClearCollect(colHistory, '05_NominationHistory');
>   UpdateContext({locRejectingId: "", locRejectReason: ""})
> ```

> **Priority change (ModernDropdown OnChange):**
> ```
> OnChange: |-
>   =Patch('04_Nominations', ThisItem, { Priority: Self.Selected.Value });
>   Patch('05_NominationHistory', Defaults('05_NominationHistory'),
>     {
>       Title:        ThisItem.NominationID & "-pri-" & Text(Now(),"yymmddhhmmss"),
>       NominationID: ThisItem.NominationID,
>       Action:       { Value: "priority_changed" },
>       UserEmail:    varCurrentUser.email,
>       UserName:     varCurrentUser.name,
>       Timestamp:    Now(),
>       Details:      "Priority: " & Self.Selected.Value
>     }
>   );
>   ClearCollect(colNominations, '04_Nominations')
> ```

## TechnicalGuide Key Conventions

The following YAML rules **must** be respected in every screen file —
violating any of these is the most common source of compile errors:

1. **Formula prefix.** Every Power Fx formula starts with `=`. The `=` lives
   on the value side of the key — including on the **first content line**
   of a block scalar.
2. **Multi-line formulas use the `|-` block scalar.** Example:
   ```yaml
   OnSelect: |-
     =Set(x, 1);
     Set(y, 2)
   ```
   Single-line formulas can be inline (no `|-`).
3. **Strings containing `: ` must be quoted.** YAML will otherwise parse
   them as nested mappings. Example:
   `HintText: ="Search: courses, providers…"`.
4. **Power Fx record literals must be quoted at the YAML level** — the
   inner `Value:` would otherwise be parsed as a YAML mapping key.
   Use either:
   - `Default: "={Value: ""list""}"` (double-quoted YAML string with `""`
     escapes for inner double quotes), **or**
   - `Default: '={Value: "list"}'` (single-quoted YAML string — preferred,
     no escaping needed).
   This bites most often on `ModernTabList.Default`, `ModernDropdown.Default`,
   and any `Selected: =` referencing a record literal.
5. **Enum values that contain spaces, special characters, or that start
   with a number must be wrapped in `'`.** Examples:
   - `Appearance: ='ButtonCanvas.Appearance'.Transparent`
   - `Items: =Filter(colCourses, 'Course Status'.Active)`
   - SharePoint Choice columns whose internal name has spaces also need
     this treatment, e.g. `'Talent Class'`.
6. **Choice columns require `.Value` to extract text.** Example:
   `Filter(colEmployees, TalentClass.Value = "Future Leaders")`.
7. **AutoLayout children with a fixed `Width`/`Height` MUST set
   `FillPortions: =0`** — otherwise the container silently overrides the
   fixed size.
8. **`GroupContainer` has no `OnSelect`.** Use `ModernCard` for clickable
   cards; for non-card clickable regions, overlay a transparent `Button`
   (Appearance Transparent) sized to the area.
9. **Set `AutoHeight: =true` on multi-line text** so it expands instead of
   clipping or showing a scrollbar.
10. **Dynamic gallery heights inside scrollable AutoLayout containers:**
    `Height: =CountRows(Self.AllItems) * Self.TemplateHeight`.
11. **Date/time format specifiers are lowercase:** `Text(Now(), "dd/mm/yyyy hh:mm")`.
12. **Variables are screen-scoped** for context variables (`UpdateContext`)
    and **app-scoped** for `Set(...)`. Initialize app-scoped vars in
    `App.OnStart` (already done in `App.pa.yaml`); use `OnVisible` for
    per-screen context variables.
13. **Always call `Refresh` or `ClearCollect` after Patch** to keep the
    local collection and any galleries bound to it in sync — patterns
    in the Workflow logic section above.
14. **Notify usage:** `Notify("text", NotificationType.Success | Information | Warning | Error)`.
15. **Navigation:** `Navigate(scrTarget, ScreenTransition.Fade)` — keep
    transitions consistent (Fade) across the app for a calm executive feel.
