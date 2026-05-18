"""Convert PartialCircle to Circle by removing StartAngle/EndAngle props.

This loses the arc visualization but keeps the visual badge / ring as a
filled circle. The center text (count) still appears via the sibling
ModernText control.
"""
import re
from pathlib import Path

DIR = Path(r"C:/Users/rodri/OneDrive - Nerpa/JS/SBN/sbn-canvas-app")


def process_file(path: Path) -> int:
    text = path.read_text(encoding="utf-8")
    if "PartialCircle" not in text:
        return 0
    original = text

    # Replace control type
    text = text.replace("Control: PartialCircle", "Control: Circle")

    # Remove StartAngle / EndAngle property lines (and any multi-line `|-` blocks
    # that follow EndAngle). We do this with a state machine: when we see
    # `StartAngle:` or `EndAngle:` at an indent N, we delete that line plus all
    # subsequent lines indented > N until indentation returns to <= N.
    lines = text.splitlines(keepends=True)
    out = []
    skip_until_indent_le = None
    for line in lines:
        if skip_until_indent_le is not None:
            stripped = line.lstrip(" ")
            if stripped == "" or stripped == "\n":
                # blank line — skip
                continue
            indent = len(line) - len(stripped)
            if indent > skip_until_indent_le:
                # part of the skipped block
                continue
            # back to a sibling — stop skipping
            skip_until_indent_le = None

        m = re.match(r"^(\s+)(StartAngle|EndAngle):\s*(.*)$", line)
        if m:
            indent = len(m.group(1))
            value = m.group(3).rstrip()
            if value == "|-" or value == "|" or value == ">" or value == ">-":
                # multi-line block follows — skip until indent drops back
                skip_until_indent_le = indent
                continue
            # single line — just drop
            continue
        out.append(line)

    new_text = "".join(out)
    if new_text != original:
        path.write_text(new_text, encoding="utf-8")
        # count replacements
        return original.count("PartialCircle")
    return 0


def main():
    total = 0
    for yaml_path in sorted(DIR.glob("scr*.pa.yaml")):
        n = process_file(yaml_path)
        if n:
            print(f"{yaml_path.name}: converted {n} PartialCircle to Circle")
            total += n
    print(f"TOTAL: {total} conversions")


if __name__ == "__main__":
    main()
