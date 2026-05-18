"""More targeted fixes:
1. Course-scoped .Name -> .CourseName more broadly
2. Toggle Self.Value -> Self.Checked
3. ComboBox Self.Selected.Result -> Self.Selected.Value
4. ComboBox.ItemDisplayText Value1 -> Value
5. Patch('04_Nominations', ..., { NominationID: x, Status: y, ... }) -> use SP internal names
6. Toggle.Checked: locSortDesc (which has Blank type) -> coerce
"""
import re
from pathlib import Path

DIR = Path(r"C:/Users/rodri/OneDrive - Nerpa/JS/SBN/sbn-canvas-app")


# Map: friendly name -> SP internal name for 04_Nominations writes
NOM_WRITE_MAP = {
    "NominationID": "Title",
    "CarolID": "field_1",
    "EmployeeName": "field_2",
    "CourseID": "field_3",
    "CourseCode": "field_4",
    "CourseName": "field_5",
    "Investment": "field_6",
    "Eligible": "field_7",
    "OutOfTarget": "field_8",
    "OverrideReason": "field_9",
    "Score": "field_10",
    "Status": "field_11",
    "CreatedDate": "field_12",
    "Justification": "field_13",
    "NominatorRole": "field_14",
    "NominatorEmail": "field_15",
    "Priority": "field_16",
    "RejectionReason": "field_17",
}

# Map for 05_NominationHistory writes
HIST_WRITE_MAP = {
    "HistoryID": "Title",
    "NominationID": "field_1",
    "Action": "field_2",
    "UserEmail": "field_3",
    "UserName": "field_4",
    "Timestamp": "field_5",
    "Details": "field_6",
}


def find_balanced(s: str, start: int) -> int:
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


def remap_patch_calls(text: str, source_name: str, name_map: dict) -> tuple[str, int]:
    """Find Patch('source_name', ..., { ... }) calls and remap friendly column
    names inside the record literal to internal names."""
    pattern = re.compile(rf"\bPatch\(\s*'{re.escape(source_name)}'")
    out = []
    i = 0
    n = 0
    while True:
        m = pattern.search(text, i)
        if not m:
            out.append(text[i:])
            break
        out.append(text[i:m.start()])
        # Find the matching closing paren for Patch
        paren = text.find("(", m.start())
        end = find_balanced(text, paren)
        if end < 0:
            out.append(text[m.start():])
            break
        # Within this Patch call, find the record literal arguments and remap
        call_text = text[m.start():end + 1]
        new_call = call_text
        for friendly, internal in name_map.items():
            # Replace `friendly:` with `internal:` inside record literals.
            # Use word boundaries to avoid substring matches.
            new_call = re.sub(
                rf"(?<![A-Za-z0-9_]){friendly}\s*:",
                f"{internal}:",
                new_call,
            )
        if new_call != call_text:
            n += 1
        out.append(new_call)
        i = end + 1
    return "".join(out), n


def process_file(path: Path) -> int:
    text = path.read_text(encoding="utf-8")
    orig = text
    n = 0

    # 1) Bare ThisItem.Name and varSelectedCourse.Name fixed in pass4.
    # Now also fix any LookUp(colCourses,...).Name and similar.
    # Heuristic: any `.Name` immediately following `colCourses` or
    # `varSelectedCourse` or `course)` or `course.` context.
    # Do this only on files that touch courses.
    if any(s in path.name for s in ("Catalog", "CourseDetail", "Dashboard",
                                     "Employees", "Nominations", "PDLLatam",
                                     "Seats")):
        # LookUp(colCourses, ...).Name
        new, k = re.subn(
            r"(LookUp\s*\(\s*colCourses[^)]*\))\s*\.\s*Name\b",
            r"\1.CourseName",
            text,
        )
        text = new; n += k

    # 2) Toggle Self.Value -> Self.Checked
    # Targeted: only inside Toggle controls. Use regex with context.
    # Simpler: any `Self.Value` (Toggle Self.Value is always wrong here since
    # we have no TextInput.Self.Value usage anymore — TextInputs use Self.Text).
    new, k = re.subn(r"\bSelf\.Value\b", "Self.Checked", text)
    text = new; n += k

    # 3) Self.Selected.Result -> Self.Selected.Value (done in pass4)
    # 4) ComboBox ItemDisplayText 'Value1' -> 'Value'
    new, k = re.subn(r"\bThisItem\.Value1\b", "ThisItem.Value", text)
    text = new; n += k

    # 5) Patch on 04_Nominations: remap friendly column names to internal
    new_text, k = remap_patch_calls(text, "04_Nominations", NOM_WRITE_MAP)
    text = new_text; n += k

    # 6) Patch on 05_NominationHistory
    new_text, k = remap_patch_calls(text, "05_NominationHistory", HIST_WRITE_MAP)
    text = new_text; n += k

    # 7) Distinct result is a single-col table where the col is named "Value".
    # Pattern: AddColumns(RenameColumns(Distinct(X, Y), "Result", "lblText"), ...)
    # The original col is "Value" not "Result". Replace.
    new, k = re.subn(r'RenameColumns\(\s*Distinct\(([^)]+)\),\s*"Result"',
                      r'RenameColumns(Distinct(\1), "Value"', text)
    text = new; n += k
    # Also bare ref: Distinct(...).Result -> Distinct(...).Value (less likely)

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
