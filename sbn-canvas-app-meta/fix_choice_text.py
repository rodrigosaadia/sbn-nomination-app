"""Remove `.Value` from Choice columns that are actually String in SP.
Also rename Course.Name → Course.CourseName since field_1 was renamed.
"""
import re
from pathlib import Path

DIR = Path(r"C:/Users/rodri/OneDrive - Nerpa/JS/SBN/sbn-canvas-app")

# Choice/Yes-No column names that SP exposes as String in this list.
# Pattern: .ColumnName.Value → .ColumnName
CHOICE_COLS = [
    "Status",
    "Country",
    "Performance",
    "FlightRisk",
    "TalentClass",
    "Format",
    "Category",
    "NominatorRole",
    "Division",
    "Gender",
    "Zone",
    "OrgDivision",
    "SuccessionPipeline",
    "KeyPlayer",
    "Eligible",
    "OutOfTarget",
    "Action",
    "RequiredCourseCode",
    "CompletedCourses",
]

def process_file(path: Path) -> int:
    text = path.read_text(encoding="utf-8")
    original = text
    changes = 0

    for col in CHOICE_COLS:
        # Replace .Col.Value with .Col (word boundary on left, end after Value)
        pattern = re.compile(rf"\.{col}\.Value\b")
        new_text, n = pattern.subn(f".{col}", text)
        text = new_text
        changes += n

    # Course.Name → Course.CourseName (because field_1 was renamed CourseName)
    # Be precise: match .Name when on a course context. Practically: replace
    # `colCourses.Name` and `LookUp(colCourses, ...).Name` and `ThisItem.Name`
    # within course-gallery scope. Hard to context-check, so do a narrow
    # heuristic: only replace `.Name` if preceded by `colCourses` within the
    # same expression, or if the reference clearly looks like a course.
    #
    # Simplest: in each file, replace `colCourses.Name` and any `.Name)` or
    # `.Name &` where the field is unambiguously a course's name. We'll do
    # ".Name" → ".CourseName" globally — this is risky for non-course .Name
    # uses, but our app rarely accesses Avatar.Name or similar within scoped
    # records. Inspect grep for safety after.
    n2 = text.count("Course.Name") + text.count("colCourses.Name")
    text = text.replace("Course.Name", "Course.CourseName")
    text = text.replace("colCourses.Name", "colCourses.CourseName")
    changes += n2

    if text != original:
        path.write_text(text, encoding="utf-8")
    return changes


def main():
    total = 0
    for yaml_path in sorted(DIR.glob("*.pa.yaml")):
        n = process_file(yaml_path)
        if n:
            print(f"{yaml_path.name}: {n} edits")
            total += n
    print(f"TOTAL: {total} edits")


if __name__ == "__main__":
    main()
