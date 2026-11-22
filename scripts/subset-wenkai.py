"""Regenerate static WOFF2 assets after a production build using fonttools and brotli."""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont

root = Path(__file__).resolve().parents[1]
source = next((root / "node_modules/lxgw-wenkai-subset/woff2").glob("*regular.subset.*.gb2312.woff2"))
out = root / "public/fonts/wenkai"
css_out = root / "app/fonts/wenkai/faces.css"
pages = root / ".next/server/app"


class VisibleText(HTMLParser):
    def __init__(self):
        super().__init__()
        self.skip = False
        self.codes = set()

    def handle_starttag(self, tag, attrs):
        if tag in {"script", "style"}:
            self.skip = True

    def handle_endtag(self, tag):
        if tag in {"script", "style"}:
            self.skip = False

    def handle_data(self, data):
        if not self.skip:
            self.codes.update(map(ord, data))


def page_chars(path):
    parser = VisibleText()
    parser.feed(path.read_text())
    return parser.codes


def ranges(chars):
    spans = []
    for code in sorted(chars):
        if spans and code == spans[-1][1] + 1:
            spans[-1][1] = code
        else:
            spans.append([code, code])
    return ", ".join(f"U+{a:X}" if a == b else f"U+{a:X}-{b:X}" for a, b in spans)


remaining = set(TTFont(source).getBestCmap())
out.mkdir(parents=True, exist_ok=True)
css_out.parent.mkdir(parents=True, exist_ok=True)
rules = [
    """@font-face {
  font-family: "Site Wenkai Fallback";
  src: local("PingFang SC"), local("Hiragino Sans GB"), local("Microsoft YaHei"), local("Arial");
  ascent-override: 92.8%;
  descent-override: 25.6%;
  line-gap-override: 0%;
  size-adjust: 100%;
}"""
]


def emit(name, codes):
    chars = remaining.intersection(codes)
    if not chars:
        return
    remaining.difference_update(chars)
    font = TTFont(source)
    cutter = subset.Subsetter()
    cutter.populate(unicodes=chars)
    cutter.subset(font)
    font.save(out / f"{name}.woff2")
    rules.append(f"""@font-face {{
  font-family: "Site Wenkai";
  src: url("/fonts/wenkai/{name}.woff2") format("woff2");
  font-display: swap;
  unicode-range: {ranges(chars)};
}}""")


emit("interface", page_chars(pages / "index.html") | set(range(32, 127)))
articles = sorted((pages / "blog").glob("*.html"))
if not articles:
    raise RuntimeError("Build the articles before regenerating fonts")
frequency = Counter(code for page in articles for code in page_chars(page))
ordered = [code for code, _ in sorted(frequency.items(), key=lambda item: (-item[1], item[0])) if code in remaining]
ordered += sorted(remaining.difference(ordered))
for start in range(0, len(ordered), 256):
    emit(f"text-{start // 256:02d}", ordered[start:start + 256])
css_out.write_text("\n\n".join(rules) + "\n")
(out / "OFL.txt").write_bytes((source.parent.parent / "OFL.txt").read_bytes())
