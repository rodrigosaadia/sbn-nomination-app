"""Fix remaining compile errors in canvas app YAML files.

Tracks the most recent `Control: X` for each indentation level and applies
context-specific property renames inside its Properties block.
"""

import os
import re
from pathlib import Path

DIR = Path(r"C:/Users/rodri/OneDrive - Nerpa/JS/SBN/sbn-canvas-app")

# Map: control_name -> { old_prop: new_prop }
RENAMES_BY_CONTROL = {
    "ModernText": {"FontColor": "Color"},
    "Avatar": {"Text": "Name"},
    "Toggle": {"Default": "Checked", "OnChange": "OnSelect"},
}

# Properties to delete entirely when on a specific control
DELETES_BY_CONTROL = {
    # Rectangle does not support radius
    "Rectangle": {"RadiusTopLeft", "RadiusTopRight", "RadiusBottomLeft", "RadiusBottomRight"},
}


CONTROL_RE = re.compile(r"^(\s*)Control:\s*(\S+)\s*$")
PROP_RE = re.compile(r"^(\s*)([A-Za-z][A-Za-z0-9_]*):\s*(.*)$")
LIST_ITEM_RE = re.compile(r"^(\s*)-\s+\S+:\s*$")


def process_file(path: Path) -> int:
    """Returns number of changes made."""
    lines = path.read_text(encoding="utf-8").splitlines(keepends=True)
    out = []
    # Stack of (indent, control_name) — most recent control at each indent
    control_at_indent = {}
    changes = 0

    for line in lines:
        m = CONTROL_RE.match(line)
        if m:
            indent = len(m.group(1))
            ctrl = m.group(2)
            # The control's properties are nested deeper than the control: indent.
            # Anything indented > this becomes children of the control until a sibling
            # with indent <= this appears.
            control_at_indent[indent] = ctrl
            # invalidate deeper entries — they were children of a previous control
            for k in list(control_at_indent):
                if k > indent:
                    del control_at_indent[k]
            out.append(line)
            continue

        # Detect new list item (a sibling control or property block) — invalidate
        m2 = LIST_ITEM_RE.match(line)
        if m2:
            indent = len(m2.group(1))
            # any control whose indent is >= this list item indent is no longer in scope
            # (we're now in a sibling node)
            # Wait — child controls have list-item indent > parent's Control: indent.
            # Be conservative: invalidate entries deeper than this list item's indent.
            for k in list(control_at_indent):
                if k > indent:
                    del control_at_indent[k]
            out.append(line)
            continue

        # Property line — find the enclosing control
        pm = PROP_RE.match(line)
        if pm and control_at_indent:
            prop_indent = len(pm.group(1))
            prop_name = pm.group(2)
            prop_value = pm.group(3)

            # Find the deepest control whose indent is shallower than prop_indent
            enclosing_indent = max(
                (k for k in control_at_indent if k < prop_indent), default=None
            )
            if enclosing_indent is not None:
                ctrl = control_at_indent[enclosing_indent]

                # Apply renames
                renames = RENAMES_BY_CONTROL.get(ctrl, {})
                if prop_name in renames:
                    new_name = renames[prop_name]
                    new_line = f"{pm.group(1)}{new_name}: {prop_value}\n"
                    out.append(new_line)
                    changes += 1
                    continue

                # Apply deletes
                deletes = DELETES_BY_CONTROL.get(ctrl, set())
                if prop_name in deletes:
                    # Skip this line entirely
                    changes += 1
                    continue

        out.append(line)

    new_content = "".join(out)
    if changes > 0:
        path.write_text(new_content, encoding="utf-8")
    return changes


def main():
    total = 0
    for yaml_path in sorted(DIR.glob("scr*.pa.yaml")):
        n = process_file(yaml_path)
        print(f"{yaml_path.name}: {n} changes")
        total += n
    print(f"\nTOTAL: {total} changes")


if __name__ == "__main__":
    main()
