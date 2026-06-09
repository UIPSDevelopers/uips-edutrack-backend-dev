from pathlib import Path

ROOT = Path(".").resolve()
JS_FILES = list(ROOT.glob("src/**/*.js"))


def strip_comments(code: str) -> str:
    out = []
    i = 0
    n = len(code)
    stack = [{"type": "normal"}]

    while i < n:
        ch = code[i]
        nxt = code[i + 1] if i + 1 < n else ""
        ctx = stack[-1]

        if ctx["type"] == "normal":
            if ch == "/" and nxt == "/":
                stack.append({"type": "line_comment"})
                i += 2
                continue
            if ch == "/" and nxt == "*":
                stack.append({"type": "block_comment"})
                i += 2
                continue
            if ch == "'":
                out.append(ch)
                stack.append({"type": "single", "escaped": False})
                i += 1
                continue
            if ch == '"':
                out.append(ch)
                stack.append({"type": "double", "escaped": False})
                i += 1
                continue
            if ch == "`":
                out.append(ch)
                stack.append({"type": "template", "escaped": False})
                i += 1
                continue
            out.append(ch)
            i += 1
            continue

        if ctx["type"] == "line_comment":
            if ch == "\n":
                out.append(ch)
                stack.pop()
            i += 1
            continue

        if ctx["type"] == "block_comment":
            if ch == "*" and nxt == "/":
                stack.pop()
                i += 2
                continue
            if ch == "\n":
                out.append(ch)
            i += 1
            continue

        if ctx["type"] == "single":
            out.append(ch)
            if ch == "'" and not ctx["escaped"]:
                stack.pop()
                i += 1
                continue
            if ch == "\\" and not ctx["escaped"]:
                ctx["escaped"] = True
            else:
                ctx["escaped"] = False
            i += 1
            continue

        if ctx["type"] == "double":
            out.append(ch)
            if ch == '"' and not ctx["escaped"]:
                stack.pop()
                i += 1
                continue
            if ch == "\\" and not ctx["escaped"]:
                ctx["escaped"] = True
            else:
                ctx["escaped"] = False
            i += 1
            continue

        if ctx["type"] == "template":
            out.append(ch)
            if ch == "`" and not ctx["escaped"]:
                stack.pop()
                i += 1
                continue
            if ch == "$" and nxt == "{" and not ctx["escaped"]:
                out.append(nxt)
                stack.append({"type": "template_expr", "brace_depth": 1, "escaped": False})
                i += 2
                continue
            if ch == "\\" and not ctx["escaped"]:
                ctx["escaped"] = True
            else:
                ctx["escaped"] = False
            i += 1
            continue

        if ctx["type"] == "template_expr":
            if ch == "/" and nxt == "/":
                stack.append({"type": "line_comment"})
                i += 2
                continue
            if ch == "/" and nxt == "*":
                stack.append({"type": "block_comment"})
                i += 2
                continue
            if ch == "'":
                out.append(ch)
                stack.append({"type": "single", "escaped": False, "return_to": "template_expr"})
                i += 1
                continue
            if ch == '"':
                out.append(ch)
                stack.append({"type": "double", "escaped": False, "return_to": "template_expr"})
                i += 1
                continue
            if ch == "`":
                out.append(ch)
                stack.append({"type": "template", "escaped": False})
                i += 1
                continue
            if ch == "{":
                out.append(ch)
                ctx["brace_depth"] += 1
                i += 1
                continue
            if ch == "}":
                out.append(ch)
                if ctx["brace_depth"] == 1:
                    stack.pop()
                else:
                    ctx["brace_depth"] -= 1
                i += 1
                continue
            out.append(ch)
            i += 1
            continue

        i += 1

    return "".join(out)


def process_file(path: Path) -> None:
    text = path.read_text(encoding="utf-8")
    stripped = strip_comments(text)
    if stripped != text:
        path.write_text(stripped, encoding="utf-8")


if __name__ == "__main__":
    for path in JS_FILES:
        process_file(path)
    print(f"Processed {len(JS_FILES)} JavaScript files.")
