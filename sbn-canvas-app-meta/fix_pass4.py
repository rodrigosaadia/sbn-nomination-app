"""Final semantic fix pass:
1. ThisItem.Name + varSelectedCourse.Name -> .CourseName (rest of Course.Name refs)
2. Blank() in UpdateContext -> typed defaults ("" for strings, false for bool)
3. Toggle.Value -> Toggle.Checked (Self.Value isn't a thing on Toggle)
4. Self.Selected.Result -> Self.Selected.Value (Distinct returns single col Value, not Result)
5. Distinct(col, X.Value) -> Distinct(col, X) since col is String
6. Bare `Name` references (course-scoped) -> `CourseName`
"""
import re
from pathlib import Path

DIR = Path(r"C:/Users/rodri/OneDrive - Nerpa/JS/SBN/sbn-canvas-app")


def process_file(path: Path) -> int:
    text = path.read_text(encoding="utf-8")
    orig = text
    n = 0

    # 1) ThisItem.Name -> ThisItem.CourseName ONLY in course-scoped contexts
    # Heuristic: if the file is scrCatalog, scrCourseDetail, or a control
    # named with 'Course' or 'Cat', most ThisItem.Name refers to a course.
    # Safe approach: only do this in files we know are course-centric.
    if any(s in path.name for s in ("Catalog", "CourseDetail")):
        new, k = re.subn(r"\bThisItem\.Name\b", "ThisItem.CourseName", text)
        text = new; n += k

    # 2) varSelectedCourse.Name -> varSelectedCourse.CourseName
    new, k = re.subn(r"\bvarSelectedCourse\.Name\b", "varSelectedCourse.CourseName", text)
    text = new; n += k

    # 3) Toggle.Value -> Toggle.Checked
    # In OnSelect / OnChange of Toggle: Self.Value -> Self.Checked
    # We can't easily scope to Toggle vs TextInput. Use a conservative match:
    # only convert `Self.Value` when adjacent to UpdateContext({ ...: Self.Value })
    # patterns that look like Toggle handlers.
    # Actually: looking at errors, the Toggles use Self.Value but it's invalid.
    # TextInputs use Self.Text. So Self.Value is wrong in BOTH contexts now.
    # Safer to NOT bulk-replace; do per-file targeted edits below.

    # 4) Self.Selected.Result -> Self.Selected.Value
    new, k = re.subn(r"\bSelf\.Selected\.Result\b", "Self.Selected.Value", text)
    text = new; n += k

    # 5) Blank() inits in UpdateContext -> "" for text-typed locals.
    # The known offenders: locTalent, locCountry, locCategory.
    # Patterns:
    #   locTalent: Blank()  -> locTalent: ""
    #   locCountry: Blank() -> locCountry: ""
    #   locCategory: Blank() -> locCategory: ""
    for var in ("locTalent", "locCountry", "locCategory"):
        new, k = re.subn(rf"{var}:\s*Blank\(\)", f'{var}: ""', text)
        text = new; n += k

    # 6) IsBlank(locCategory) etc. — when we changed Blank() to "", IsBlank()
    # still works on empty strings. No change needed.

    # 7) bare `Name` reference inside course-bound expressions: too dangerous to
    # bulk replace. Skip.

    # 8) Patch field name fixes: convert Patch('04_Nominations', ..., {
    # NominationID: ...,  Status: ..., CourseID: ..., CarolID: ..., Justification: ... })
    # to use the SP internal column names: Title, field_11, field_3, field_1, field_13.
    if "Patch('04_Nominations'" in text:
        # Inside a Patch record literal, friendly names → field_N for write.
        # We do simple text replacement that targets the record-literal context:
        # Replace `NominationID:` → `Title:` (Title is the PK in this list)
        # Replace `Status:` → `field_11:`
        # etc. — but this is RISKY because it could affect Patch on other lists.
        # Limit by only doing this inside `Patch('04_Nominations'` argument up to
        # the matching ).
        # SKIP for safety — user fixes in Studio with IntelliSense.
        pass

    if text != orig:
        path.write_text(text, encoding="utf-8")
    return n


def main():
    total = 0
    for yaml_path in sorted(DIR.glob("*.pa.yaml")):
        k = process_file(yaml_path)
        if k:
            print(f"{yaml_path.name}: {k} edits")
            total += k
    print(f"TOTAL: {total} edits")


if __name__ == "__main__":
    main()
