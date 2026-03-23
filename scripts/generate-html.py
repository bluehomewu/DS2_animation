#!/usr/bin/env python3
"""
Auto-generate HTML wrapper pages for each HW*/<name>.jsx file,
and a per-HW index.html that lists all animations in that directory.

Run this script from the repository root:
    python3 scripts/generate-html.py
"""

import glob
import os

# ---------------------------------------------------------------------------
# Template for each <name>.html  (one per JSX component)
# ---------------------------------------------------------------------------
COMPONENT_TEMPLATE = """\
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script>
    window.exports = {{}};
    window.require = function(mod) {{
      if (mod === "react") return React;
      if (mod === "react-dom" || mod === "react-dom/client") return ReactDOM;
      throw new Error("Module not found: " + mod);
    }};
  </script>
</head>
<body style="margin: 0">
  <div id="root"></div>
  <script type="text/babel" data-plugins="transform-modules-commonjs" src="{name}.jsx"></script>
  <script type="text/babel">
    const {component} = window.exports.default;
    const root = ReactDOM.createRoot(document.getElementById("root"));
    root.render(<{component} />);
  </script>
</body>
</html>
"""

# ---------------------------------------------------------------------------
# Template for each HW*/index.html  (lists all animations in that directory)
# ---------------------------------------------------------------------------
INDEX_TEMPLATE = """\
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{hw} Animations</title>
  <style>
    *, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}

    body {{
      font-family: "Segoe UI", system-ui, sans-serif;
      background: #0f172a;
      color: #e2e8f0;
      min-height: 100vh;
      padding: 2rem 1rem;
    }}

    header {{
      text-align: center;
      margin-bottom: 3rem;
    }}

    header h1 {{
      font-size: 2rem;
      font-weight: 700;
      color: #f8fafc;
    }}

    header p {{
      margin-top: 0.5rem;
      color: #94a3b8;
      font-size: 1rem;
    }}

    .card {{
      max-width: 600px;
      margin: 0 auto;
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 12px;
      overflow: hidden;
    }}

    .card-header {{
      padding: 0.9rem 1.4rem;
      background: #273549;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }}

    .badge {{
      background: #3b82f6;
      color: #fff;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.2rem 0.6rem;
      border-radius: 99px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }}

    .card-header h2 {{
      font-size: 1.1rem;
      font-weight: 600;
      color: #e2e8f0;
    }}

    ul {{ list-style: none; padding: 0.5rem 0; }}

    ul li a {{
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.65rem 1.4rem;
      color: #93c5fd;
      text-decoration: none;
      font-size: 0.95rem;
      transition: background 0.15s, color 0.15s;
    }}

    ul li a:hover {{
      background: #1a2744;
      color: #dbeafe;
    }}

    ul li a::before {{
      content: "▶";
      font-size: 0.65rem;
      opacity: 0.6;
    }}

    footer {{
      text-align: center;
      margin-top: 3rem;
      color: #475569;
      font-size: 0.8rem;
    }}
  </style>
</head>
<body>
  <header>
    <h1>{hw} Animations</h1>
    <p>選擇要瀏覽的動畫</p>
  </header>

  <div class="card">
    <div class="card-header">
      <span class="badge">{hw}</span>
      <h2>Animation List</h2>
    </div>
    <ul>
{links}
    </ul>
  </div>

  <footer>
    <p><a href="../" style="color:#475569;">← 返回首頁</a></p>
  </footer>
</body>
</html>
"""


def kebab_to_title(name: str) -> str:
    return " ".join(word.capitalize() for word in name.split("-"))


def kebab_to_pascal(name: str) -> str:
    return "".join(word.capitalize() for word in name.split("-"))


def generate_component_html(jsx_path: str) -> None:
    hw_dir = os.path.dirname(jsx_path)
    base = os.path.basename(jsx_path)
    name = base[:-4]  # strip .jsx
    title = kebab_to_title(name)
    component = kebab_to_pascal(name)
    content = COMPONENT_TEMPLATE.format(title=title, name=name, component=component)
    html_path = os.path.join(hw_dir, name + ".html")
    with open(html_path, "w", encoding="utf-8") as fh:
        fh.write(content)
    print(f"  generated {html_path}")


def generate_index_html(hw_dir: str, jsx_names: list[str]) -> None:
    hw = os.path.basename(hw_dir)
    links = "\n".join(
        f'      <li><a href="{name}.html">{kebab_to_title(name)}</a></li>'
        for name in sorted(jsx_names)
    )
    content = INDEX_TEMPLATE.format(hw=hw, links=links)
    html_path = os.path.join(hw_dir, "index.html")
    with open(html_path, "w", encoding="utf-8") as fh:
        fh.write(content)
    print(f"  generated {html_path}")


def main() -> None:
    # Collect JSX files grouped by HW directory
    hw_dirs: dict[str, list[str]] = {}
    for jsx_path in sorted(glob.glob("HW*/*.jsx")):
        hw_dir = os.path.dirname(jsx_path)
        name = os.path.basename(jsx_path)[:-4]
        hw_dirs.setdefault(hw_dir, []).append(name)

    if not hw_dirs:
        print("No HW*/*.jsx files found.")
        return

    for hw_dir, names in sorted(hw_dirs.items()):
        print(f"Processing {hw_dir}/")
        for name in names:
            generate_component_html(os.path.join(hw_dir, name + ".jsx"))
        generate_index_html(hw_dir, names)


if __name__ == "__main__":
    main()
