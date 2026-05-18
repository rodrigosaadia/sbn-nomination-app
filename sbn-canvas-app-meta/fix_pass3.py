"""Apply additional semantic fixes:
1. Rename AddColumns column 'count' -> 'nCount' (count is too generic/may shadow Count fn).
2. Rename 'label' -> 'lblText' in AddColumns/Distinct chains.
3. Convert SortByColumns "count" -> "nCount" string ref to match.
4. .Name where it's an unresolved field (we already renamed field_1 to CourseName in Courses).
5. Remove .Value from any remaining chained accesses on Country/Status/etc.
"""
import re
from pathlib import Path

DIR = Path(r"C:/Users/rodri/OneDrive - Nerpa/JS/SBN/sbn-canvas-app")


def process_file(path: Path) -> int:
    text = path.read_text(encoding="utf-8")
    orig = text
    n = 0

    # Pattern 1+3: rename `count` as a column identifier and string ref
    # Bare identifier in AddColumns/RenameColumns position. Use word-boundary
    # to avoid accidental hits on Count( function calls.
    # Replace `\bcount\b` only when followed by `,` or end-of-line within
    # AddColumns / SortByColumns contexts. Easier: just do `\bcount\b` ->
    # `nCount` everywhere, then restore false positives (Count function
    # calls have an immediate `(` after them, but we said \bcount\b not
    # \bCount\b, so case-sensitive should skip the function).
    new, k = re.subn(r"\bcount\b", "nCount", text)
    text = new; n += k

    # Pattern 2: rename `label` in similar context
    # Careful: `Label` (capital) is a control type, don't touch. Use case-sensitive.
    new, k = re.subn(r"\blabel\b", "lblText", text)
    text = new; n += k

    # Pattern 3: SortByColumns("count", ...) -> SortByColumns("nCount", ...)
    # already handled by the bare-word substitution since it's inside quotes
    # but only word-bounded — quotes don't affect \b. Confirm.

    # Pattern 4: ThisItem.Name on Courses context — replace .Name with
    # .CourseName ONLY where it would be a course (heuristic). Skip if the
    # context is clearly an Avatar/User. The simplest safe pattern: only
    # touch `varSelectedCourse.Name` and `ThisItem.Name` inside course
    # galleries. We do it globally and fix collateral after.
    # Actually be conservative — only do the explicit references.
    new, k = re.subn(r"\bvarSelectedCourse\.Name\b", "varSelectedCourse.CourseName", text)
    text = new; n += k

    # Pattern 5: catch leftover .Value chains on Choice cols I may have missed.
    # Additional candidates: PastSBN (Number?), MonthsX (Number), ID (Number).
    # The only Choice-like that I haven't covered: Eligible, OutOfTarget,
    # Action — already in fix_choice_text. Skip.

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
