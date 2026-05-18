"""Inline calls to App.Formulas UDFs (which the tenant doesn't support)
and fix other repeated semantic patterns:

1. Score(emp)                       -> inline Switch expression
2. IsEligible(emp, course)          -> inline boolean
3. EligibilityReasons(emp, course)  -> inline Concat
4. GaugeColor(used, total)          -> inline If
5. StageLabel(status)               -> inline Switch
6. NextStage(status)                -> inline Switch
7. AddColumns "col", expr           -> AddColumns col, expr (identifier)
8. UpdateContext Blank() -> typed empty strings
"""
import re
from pathlib import Path

DIR = Path(r"C:/Users/rodri/OneDrive - Nerpa/JS/SBN/sbn-canvas-app")


def find_balanced(s: str, start: int) -> int:
    """Given s[start] == '(', return index of matching ')'."""
    depth = 0
    i = start
    in_str = False
    str_ch = None
    while i < len(s):
        c = s[i]
        if in_str:
            if c == str_ch:
                in_str = False
        else:
            if c in '"\'':
                in_str = True
                str_ch = c
            elif c == '(':
                depth += 1
            elif c == ')':
                depth -= 1
                if depth == 0:
                    return i
        i += 1
    return -1


def split_args(arg_text: str) -> list:
    """Split a comma-separated list of arguments at the TOP level (respects
    nested parens and quoted strings)."""
    args = []
    depth = 0
    in_str = False
    str_ch = None
    cur = []
    for c in arg_text:
        if in_str:
            cur.append(c)
            if c == str_ch:
                in_str = False
        else:
            if c in '"\'':
                in_str = True
                str_ch = c
                cur.append(c)
            elif c == '(':
                depth += 1
                cur.append(c)
            elif c == ')':
                depth -= 1
                cur.append(c)
            elif c == ',' and depth == 0:
                args.append("".join(cur).strip())
                cur = []
            else:
                cur.append(c)
    if cur:
        args.append("".join(cur).strip())
    return args


def replace_calls(text: str, func_name: str, n_args: int,
                  template_func) -> tuple[str, int]:
    """Replace all func_name(arg1[, arg2, ...]) calls with the result of
    template_func(arg_list). Uses balanced-paren scan to capture args."""
    result = []
    i = 0
    n = 0
    pattern = re.compile(rf"\b{re.escape(func_name)}\s*\(")
    while True:
        m = pattern.search(text, i)
        if not m:
            result.append(text[i:])
            break
        result.append(text[i:m.start()])
        # m.end() points just after '('
        end = find_balanced(text, m.end() - 1)
        if end < 0:
            result.append(text[m.start():])
            break
        arg_text = text[m.end():end]
        args = split_args(arg_text)
        if len(args) != n_args:
            # leave call as-is, might be a different overload
            result.append(text[m.start():end + 1])
        else:
            result.append(template_func(args))
            n += 1
        i = end + 1
    return "".join(result), n


# Templates: each takes a list of arg strings, returns the inline expression.

def tmpl_score(args):
    e = args[0]
    return (
        f"(Switch({e}.TalentClass, \"Future Leaders\", 30, "
        f"\"Rising Players\", 22, \"Essential Players\", 15, 0) "
        f"+ If({e}.SuccessionPipeline = \"Yes\", 20, 0) "
        f"+ Switch({e}.PastSBNCount, 0, 15, 1, 5, 0) "
        f"+ Switch({e}.FlightRisk, \"High\", 15, \"Medium\", 8, 0) "
        f"+ Switch({e}.Performance, \"Exceeds Expectations\", 20, "
        f"\"Strong Performer\", 14, \"Meets Expectations\", 8, 3))"
    )


def tmpl_is_eligible(args):
    e, c = args[0], args[1]
    return (
        f"(({c}.MinMonthsCompany <= 0 || {e}.MonthsCompany >= {c}.MinMonthsCompany) "
        f"&& ({c}.MinMonthsDivision <= 0 || {e}.MonthsDivision >= {c}.MinMonthsDivision) "
        f"&& ({c}.MaxAge <= 0 || {e}.Age <= {c}.MaxAge) "
        f"&& (IsBlank({c}.RequiredCourseCode) || {c}.RequiredCourseCode = \"\" "
        f"|| {c}.RequiredCourseCode in Split(Coalesce({e}.CompletedCourses, \"\"), \",\")) "
        f"&& (({c}.DivisionRangeMin <= 0 && {c}.DivisionRangeMax <= 0) "
        f"|| ({e}.MonthsDivision >= {c}.DivisionRangeMin "
        f"&& {e}.MonthsDivision <= {c}.DivisionRangeMax)))"
    )


def tmpl_eligibility_reasons(args):
    e, c = args[0], args[1]
    return (
        f"Concat(Filter(Table("
        f"{{reason: If({c}.MinMonthsCompany > 0 && {e}.MonthsCompany < {c}.MinMonthsCompany, "
        f"\"Min \" & {c}.MinMonthsCompany & \" months at company\", \"\")}}, "
        f"{{reason: If({c}.MinMonthsDivision > 0 && {e}.MonthsDivision < {c}.MinMonthsDivision, "
        f"\"Min \" & {c}.MinMonthsDivision & \" months in division\", \"\")}}, "
        f"{{reason: If({c}.MaxAge > 0 && {e}.Age > {c}.MaxAge, "
        f"\"Max age \" & {c}.MaxAge, \"\")}}, "
        f"{{reason: If(!IsBlank({c}.RequiredCourseCode) && {c}.RequiredCourseCode <> \"\" "
        f"&& !({c}.RequiredCourseCode in Split(Coalesce({e}.CompletedCourses, \"\"), \",\")), "
        f"\"Prereq: \" & {c}.RequiredCourseCode, \"\")}}"
        f"), reason <> \"\"), reason, \"; \")"
    )


def tmpl_gauge_color(args):
    u, t = args[0], args[1]
    return (
        f"If({t} = 0, varTheme.gold, "
        f"If(({u} / {t}) >= 0.9, varTheme.danger, "
        f"If(({u} / {t}) >= 0.7, varTheme.warning, varTheme.gold)))"
    )


def tmpl_stage_label(args):
    s = args[0]
    return (
        f"Switch({s}, \"nominated\", \"Awaiting Validation - PDL Country\", "
        f"\"country_hrd_validation\", \"Awaiting Validation - Country HRD\", "
        f"\"zone_validation\", \"Awaiting Approval - Zone HRDs + PDL\", "
        f"\"final\", \"Approved - Seat Confirmed\", "
        f"\"rejected\", \"Rejected\", {s})"
    )


def tmpl_next_stage(args):
    s = args[0]
    return (
        f"Switch({s}, \"nominated\", \"country_hrd_validation\", "
        f"\"country_hrd_validation\", \"zone_validation\", "
        f"\"zone_validation\", \"final\", {s})"
    )


# Theme color named formulas (App.Formulas) replacements
THEME_NAMED = {
    "ThemeGold": "varTheme.gold",
    "ThemeWarning": "varTheme.warning",
    "ThemeDanger": "varTheme.danger",
    "ThemeSuccess": "varTheme.success",
    "ThemeBlack": "varTheme.black",
    "ThemeDarkGray": "varTheme.darkGray",
    "ThemeMedGray": "varTheme.medGray",
    "ThemeGray": "varTheme.gray",
    "ThemeLightGray": "varTheme.lightGray",
    "ThemeSilver": "varTheme.silver",
    "ThemeOffWhite": "varTheme.offWhite",
    "ThemeWhite": "varTheme.white",
    "ThemeGoldLight": "varTheme.goldLight",
    "ThemeGoldDark": "varTheme.goldDark",
    "ThemeGoldSoft": "varTheme.goldSoft",
    "ThemeInfo": "varTheme.info",
}


def process_file(path: Path) -> int:
    text = path.read_text(encoding="utf-8")
    original = text
    total = 0

    # Inline UDF calls
    text, n = replace_calls(text, "Score", 1, tmpl_score); total += n
    text, n = replace_calls(text, "IsEligible", 2, tmpl_is_eligible); total += n
    text, n = replace_calls(text, "EligibilityReasons", 2, tmpl_eligibility_reasons); total += n
    text, n = replace_calls(text, "GaugeColor", 2, tmpl_gauge_color); total += n
    text, n = replace_calls(text, "StageLabel", 1, tmpl_stage_label); total += n
    text, n = replace_calls(text, "NextStage", 1, tmpl_next_stage); total += n

    # Theme named formulas
    for name, replacement in THEME_NAMED.items():
        # Use word boundary so we don't match substrings
        pattern = re.compile(rf"\b{name}\b")
        text, n = pattern.subn(replacement, text)
        total += n

    if text != original:
        path.write_text(text, encoding="utf-8")
    return total


def main():
    grand = 0
    for yaml_path in sorted(DIR.glob("*.pa.yaml")):
        n = process_file(yaml_path)
        if n:
            print(f"{yaml_path.name}: {n} inlines")
            grand += n
    print(f"TOTAL: {grand} inlines")


if __name__ == "__main__":
    main()
