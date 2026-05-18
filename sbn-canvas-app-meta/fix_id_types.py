"""Fix ID type mismatches:
- Employees.CarolID (Title, String) joining Nominations.CarolID (field_1, Number)
  -> wrap String side with Value() to coerce to Number.
- Courses.CourseID (Title, String) joining Nominations.CourseID (field_3, Number)
  -> same.

Patterns to fix:
  emp.CarolID = X   -> Value(emp.CarolID) = X
  X = emp.CarolID   -> X = Value(emp.CarolID)
  varSelectedEmp.CarolID = X -> Value(varSelectedEmp.CarolID) = X
  crs.CourseID, varSelectedCourse.CourseID similar.

Only on join comparisons, not on assignments.
"""
import re
from pathlib import Path

DIR = Path(r"C:/Users/rodri/OneDrive - Nerpa/JS/SBN/sbn-canvas-app")

# Vars whose .CarolID is the SP Title (String, on Employees)
EMP_REFS = [
    "emp",                # AddColumns(colEmployees As emp, ...)
    "varSelectedEmp",
    "ThisItem",           # ambiguous, but in employee galleries ThisItem is emp
]
# Vars whose .CourseID is the SP Title (String, on Courses)
COURSE_REFS = [
    "crs",
    "varSelectedCourse",
    "course",
    "ThisItem",
]


def process_file(path: Path) -> int:
    text = path.read_text(encoding="utf-8")
    orig = text
    n = 0

    # For each reference, wrap .CarolID/.CourseID in Value()
    # Pattern: \b(ref)\.(CarolID|CourseID|NominationID)\b
    # But only convert ones that the SP stores as String (Title-mapped).
    #
    # Safer approach: do a manual edit per file looking at compile errors.
    # But for bulk: just wrap every emp.CarolID and crs.CourseID with Value()
    # whenever it appears on either side of a comparison.

    # Compile a regex that matches `varSelectedEmp.CarolID` etc but NOT already-wrapped ones.
    # Skip if already `Value(emp.CarolID)`.

    # Simpler: just always wrap. Power Fx Value(Number) returns Number unchanged,
    # so it's safe to wrap even pre-Number values. But Value() also coerces
    # text to number. So wrapping the Number side is no-op.
    #
    # Both sides: just wrap every reference. Safe and simple.

    for ref in EMP_REFS + COURSE_REFS:
        # Wrap .CarolID
        pattern = re.compile(rf"(?<!Value\(){re.escape(ref)}\.CarolID\b")
        new, k = pattern.subn(f"Value({ref}.CarolID)", text)
        text = new; n += k
        # Wrap .CourseID
        pattern = re.compile(rf"(?<!Value\(){re.escape(ref)}\.CourseID\b")
        new, k = pattern.subn(f"Value({ref}.CourseID)", text)
        text = new; n += k

    # Also wrap when bare `nom.CourseID`, `nom.CarolID` on Nominations — both
    # are already Number, so wrapping is no-op but harmless. Skip to keep
    # the file readable.

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
