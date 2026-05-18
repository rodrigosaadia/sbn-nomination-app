# Compile Error Fix Recipe

The first compile pass surfaced 363 errors across 9 files. All errors fall
into the systematic patterns below. Apply this recipe to every file you own.

After fixing, **do NOT call compile_canvas** — the orchestrator handles it.

---

## Rule 1 — Remove unsupported `Variant:` lines

These controls do NOT accept a `Variant:` keyword. Delete the entire
`Variant:` line if you find one on any of these:

- `Control: Button` (FluentV9, no variant)
- `Control: Text` (FluentV9, no variant) — was wrongly set to `TextCanvas`
- `Control: Label` (Classic, no variant) — was wrongly set to `ModernText`
- `Control: Rectangle` (Classic, no variant)

**Note:** `Gallery` REQUIRES a `Variant:` — add `Variant: Vertical`
right after `Control: Gallery` (or `Variant: Horizontal` if the original
intent was a horizontal scroll list — for grid-style 2-column galleries
use `Vertical`).

`GroupContainer` and `ModernCard`: ModernCard has NO variant; GroupContainer
needs one (`AutoLayout` / `ManualLayout` / `GridLayout`) — leave those alone.

---

## Rule 2 — `Control: Label` (Classic) property mappings

`Label` is the Classic label. Allowed properties (verbatim from describe_control):
`Align, AutoHeight, BorderColor, BorderStyle, BorderThickness, Color,
ContentLanguage, DisabledBorderColor, DisabledColor, DisabledFill,
DisplayMode, Fill, FocusedBorderColor, FocusedBorderThickness, Font,
FontWeight, Height, HoverBorderColor, HoverColor, HoverFill, Italic,
LineHeight, Live, OnSelect, Overflow, PaddingBottom, PaddingLeft,
PaddingRight, PaddingTop, PressedBorderColor, PressedColor, PressedFill,
Role, Size, Strikethrough, TabIndex, Text, Tooltip, Underline,
VerticalAlign, Visible, Width, Wrap, X, Y`.

Fix:
- DELETE `Variant: ModernText` line.
- Replace `FontColor:` → `Color:` (Label uses `Color` for text color).
- `Size:` is OK (Label has `Size`).
- `FontWeight:` is OK.
- `Wrap:` is OK.
- All 4 paddings are OK.

---

## Rule 3 — `Control: Button` (FluentV9) property mappings

`Button` is FluentV9. Allowed properties (verbatim):
`AcceptsFocus, AccessibleLabel, Align, Appearance, BasePaletteColor,
BorderColor, BorderRadius, BorderRadiusBottomLeft, BorderRadiusBottomRight,
BorderRadiusTopLeft, BorderRadiusTopRight, BorderStyle, BorderThickness,
ContentLanguage, DisplayMode, Font, FontColor, FontItalic, FontSize,
FontStrikethrough, FontUnderline, FontWeight, Height, Icon, IconRotation,
IconStyle, Layout, OnSelect, PaddingBottom, PaddingLeft, PaddingRight,
PaddingTop, Text, VerticalAlign, Visible, Width, X, Y`.

Fix:
- DELETE `Variant: ButtonCanvas` line (if present).
- DELETE any of these properties — they are **illegal on Button**:
  `Fill:`, `Color:`, `HoverFill:`, `PressedFill:`, `HoverBorderColor:`,
  `PressedBorderColor:`, `HoverColor:`, `Size:`.
- Replace `Color:` → `FontColor:` (Button uses `FontColor` for text color).
- Replace `Size:` → `FontSize:` (Button uses `FontSize`).
- For background tint, use `Appearance: ='ButtonCanvas.Appearance'.Subtle` (or `Primary`/`Secondary`/`Outline`/`Transparent`) and optionally `BasePaletteColor:` for the tint color.
- Sidebar nav buttons that previously had `Fill: =If(varCurrentPage=..., goldSoft, transparent)`: replace the whole button's fill mechanic with `Appearance: ='ButtonCanvas.Appearance'.Transparent` and rely on the underlying Rectangle (which IS allowed Fill) drawn behind/under the button to provide the gold-soft background when active. If a Rectangle isn't already underneath, ADD a Rectangle with the same X/Y/Width/Height and `Fill: =If(varCurrentPage="<key>", varTheme.goldSoft, RGBA(0,0,0,0))` and place it BEFORE the button in the YAML so it renders behind.

---

## Rule 4 — `Control: Text` (FluentV9) property mappings

`Text` is the FluentV9 modern label. Allowed properties (verbatim):
`Align, AutoHeight, BorderColor, BorderRadius, BorderRadiusBottomLeft,
BorderRadiusBottomRight, BorderRadiusTopLeft, BorderRadiusTopRight,
BorderStyle, BorderThickness, ContentLanguage, DisplayMode, Fill, Font,
FontColor, FontItalic, FontStrikethrough, FontUnderline, Height,
PaddingBottom, PaddingLeft, PaddingRight, PaddingTop, Size, Text,
VerticalAlign, Visible, Weight, Width, Wrap, X, Y`.

Fix:
- DELETE `Variant: TextCanvas` line.
- Replace `FontWeight:` → `Weight:` (Text uses `Weight`, enum: `Bold`,
  `Medium`, `Regular`, `Semibold`). When you change the name also update the
  enum value: `FontWeight.Bold` → `'TextCanvas.Weight'.Bold`,
  `FontWeight.Semibold` → `'TextCanvas.Weight'.Semibold`,
  `FontWeight.Normal` → `'TextCanvas.Weight'.Regular`,
  `FontWeight.Lighter` → `'TextCanvas.Weight'.Regular`.
- `FontColor:`, `Size:`, `Wrap:`, all 4 paddings are OK on Text.
- Note `Align:` uses enum `TextCanvas.Align` with values
  `Center, End, Justify, Start` — replace `Align.Left` → `'TextCanvas.Align'.Start`, `Align.Right` → `'TextCanvas.Align'.End`. `Align.Center`/`Align.Justify` are valid.

---

## Rule 5 — `Control: Rectangle` (Classic) — NO radius support

Rectangle does NOT support any of:
`RadiusTopLeft, RadiusTopRight, RadiusBottomLeft, RadiusBottomRight, BorderRadius`.

Fix:
- DELETE every `RadiusTopLeft/TopRight/BottomLeft/BottomRight:` line on a Rectangle.
- Accept sharp corners for rectangles. If a rounded background is essential,
  swap the Rectangle for a `GroupContainer` (ManualLayout, no children) which
  DOES have `RadiusTopLeft/...`.

Allowed Rectangle properties (verbatim):
`AccessibleLabel, BorderColor, BorderStyle, BorderThickness, ContentLanguage,
DisabledFill, DisplayMode, Fill, FocusedBorderColor, FocusedBorderThickness,
Height, HoverFill, OnSelect, PressedFill, TabIndex, Tooltip, Visible, Width,
X, Y`.

---

## Rule 6 — `Control: Gallery` requires `Variant`

Add `Variant: Vertical` (or `Horizontal` when iterating a row that scrolls
horizontally) immediately after the `Control: Gallery` line for every gallery.

Allowed Gallery properties (verbatim):
`AccessibleLabel, BorderColor, BorderStyle, BorderThickness, ContentLanguage,
Default, DelayItemLoading, DisplayMode, Fill, FocusedBorderColor,
FocusedBorderThickness, Height, Items, LoadingSpinner, LoadingSpinnerColor,
NavigationStep, Selectable, ShowNavigation, ShowScrollbar, TabIndex,
TemplatePadding, TemplateSize, Transition, Visible, Width, X, Y`.

Note: there is NO `Layout:` (use Vertical variant for grids — control the
columns via `WrapCount` — wait, `WrapCount` is also not in the property list,
so abandon the 2-column wrap idea and just stack vertically). There is NO
`OnSelect:` on Gallery — the per-row click goes on a child control in the
template. Replace any `OnSelect:` on the gallery with an `OnSelect:` on the
template's wrapper control (e.g., the ModernCard inside).

If you used `WrapCount: =2` or `Layout: =Layout.Vertical` on a gallery,
DELETE those lines.

---

## Rule 7 — `Control: ModernCard` (React) — restricted properties

ModernCard allowed properties (verbatim):
`AccessibleLabel, BorderRadius, ContentLanguage, Description, DisplayMode,
DropShadow, HeaderImage, HeaderImageAccessibleLabel, Height, Image,
ImageAccessibleLabel, ImagePlacement, ImagePosition, LayoutDirection,
OnSelect, Subtitle, Title, Visible, Width, X, Y`.

Critically NOT supported on ModernCard: `Fill`, `BorderColor`,
`BorderThickness`, `RadiusTopLeft/...`, `Children` (it has built-in Title /
Subtitle / Description text slots).

Fix:
- If you used ModernCard purely as a styled container with custom children
  (the common case), **replace `Control: ModernCard` with `Control: GroupContainer` + `Variant: ManualLayout`** (and keep `Fill`, `BorderColor`, `BorderThickness`, `RadiusTopLeft/...`, and the `Children:` block as-is — GroupContainer supports all of these).
- If you genuinely used ModernCard's `Title/Subtitle/Description/Image` text
  slots (rare here), keep `ModernCard` but remove `Fill`, `BorderColor`,
  `BorderThickness`, `Radius*` properties.

---

## Rule 8 — `Control: ModernTextInput` property mappings

Allowed properties (verbatim):
`AccessibleLabel, Align, Appearance, BasePaletteColor, BorderColor,
BorderStyle, BorderThickness, Color, ContentLanguage, Default, DisplayMode,
Fill, Font, FontWeight, Height, Italic, MaxLength, OnChange, PaddingBottom,
PaddingLeft, PaddingRight, PaddingTop, Placeholder, RadiusBottomLeft,
RadiusBottomRight, RadiusTopLeft, RadiusTopRight, Required, Size,
Strikethrough, TriggerOutput, Type, Underline, ValidationState, Visible,
Width, X, Y`. Output: `Text` (read-only).

Fix:
- `HintText:` → `Placeholder:`
- `Mode:` → `Type:` (enum: `Multiline`, `SingleLine`, `Password`, `Search`).
  `TextMode.SingleLine` → `TextInputType.SingleLine`, `TextMode.MultiLine` → `TextInputType.Multiline`.
- `FontColor:` → `Color:`
- For the current input value, read `Self.Text` (NOT `Self.Value`).
- `Value:` does not exist — replace `=Self.Value` with `=Self.Text`.

---

## Rule 9 — Duplicate control names across screens

Because each screen inlines its own sidebar with identical control names
(`btnNavDashboard`, `btnNavCourses`, `recNavDashboardBorder`, etc.), the app
fails compilation with "An entity with name 'X' already exists" errors.

Fix: prefix EVERY sidebar control name in your file with the 3-letter screen
slug (lowercase). Slugs:
- `scrDashboard.pa.yaml` → prefix `dsh`
- `scrCatalog.pa.yaml` → prefix `cat`
- `scrCourseDetail.pa.yaml` → prefix `cdt`
- `scrEmployees.pa.yaml` → prefix `emp`
- `scrNominations.pa.yaml` → prefix `nom`
- `scrSeats.pa.yaml` → prefix `set`
- `scrPDLLatam.pa.yaml` → prefix `pdl`
- `scrCriteria.pa.yaml` → prefix `crt`

Example: in `scrDashboard.pa.yaml`:
- `btnNavDashboard` → `dshBtnNavDashboard`
- `btnNavCourses` → `dshBtnNavCourses`
- `recNavDashboardBorder` → `dshRecNavDashboardBorder`
- etc.

Also rename ALL other control names in the sidebar (wordmark labels, footer
labels, footer rectangles) with the same prefix to avoid additional
collisions. Apply globally with replace_all if all sidebar control names are
unique within the file (they should be).

---

## Rule 10 — YAML syntax errors (per-file specifics)

### `scrCourseDetail.pa.yaml` line 1
The file starts with `//` (C-style comment). YAML requires `#`. Replace `//`
with `#`.

### `scrPDLLatam.pa.yaml` line 4
Same issue — `//` comment. Replace with `#`.

### `scrCatalog.pa.yaml` line 627, `scrEmployees.pa.yaml` line 607, `scrNominations.pa.yaml` line 854
These are single-line formulas containing record literals like
`UpdateContext({ locSearch: Self.Value })` or similar with `: ` inside.

Fix: convert the property to a `|-` block scalar:
```yaml
OnChange: |-
  =UpdateContext({
    locSearch: Self.Text
  })
```
(Note also `Self.Text` per Rule 8.)

### `Components.pa.yaml`
This file has been deleted by the orchestrator (sidebars are inlined per
plan). Don't touch — it should not exist anymore.

---

## Pre-flight checklist before saving

After applying fixes, sanity-check the file:

- [ ] No `Variant: ModernText` anywhere
- [ ] No `Variant: ButtonCanvas` anywhere  
- [ ] No `Variant: TextCanvas` anywhere
- [ ] Every `Control: Gallery` has `Variant: Vertical` (or Horizontal)
- [ ] No `RadiusTopLeft/...` on `Control: Rectangle`
- [ ] No `Fill:` / `HoverFill:` / `PressedFill:` / `HoverBorderColor:` / `PressedBorderColor:` / `Color:` / `Size:` on `Control: Button`
- [ ] No `FontColor:` on `Control: Label`
- [ ] No `FontWeight:` on `Control: Text` (use `Weight:`)
- [ ] No `HintText:` on `Control: ModernTextInput` (use `Placeholder:`)
- [ ] No `Self.Value` references on ModernTextInput (use `Self.Text`)
- [ ] No `//` line comments — only `#`
- [ ] All sidebar control names in your file start with the screen prefix
- [ ] No record-literal `{ ... : ... }` left in a single-line plain scalar
      (use `|-` block or quote)
