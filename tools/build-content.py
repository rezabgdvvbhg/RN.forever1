#!/usr/bin/env python3
"""
تبدیل جزوهٔ Word (متن با نشانه‌گذاری Markdown و فرمول‌های LaTeX) به:
  data/notes/<slug>.html   — جزوهٔ هر فصل
  data/questions.json      — بانک نمونه‌سؤال (از بخش‌های تمرین و خودآزمایی جزوه)

نیاز: python3 و بستهٔ python-docx.  اجرا:
  python3 tools/build-content.py مسیر/فایل.docx
این ابزار فقط برای تولید محتوا لازم است؛ اجرای سایت به پایتون نیاز ندارد.
"""
import sys, re, json, html, pathlib
import docx

ROOT = pathlib.Path(__file__).resolve().parent.parent
SLUGS = ['sets', 'real-numbers', 'geometry-reasoning', 'power-root',
         'algebraic-expressions', 'linear-equations', 'rational-expressions', 'volume-area']


def load_lines(path):
    out = []
    for p in docx.Document(path).paragraphs:
        # در فایل Word هر backslash دوبرابر نوشته شده است (\\( → \( )
        t = p.text.replace('\\\\', '\\').rstrip()
        # جداکنندهٔ سطر ماتریس (\\) در فایل Word به یک backslash تبدیل شده است: x\y ← x\\y
        t = re.sub(r'\\(?=[0-9y])', r'\\\\', t)
        out.append(t)
    return out


def split_chapters(lines):
    chs, cur = [], None
    for ln in lines:
        if re.match(r'^# ', ln):
            cur = {'title': ln[2:].strip(), 'lines': []}
            chs.append(cur)
        elif cur is not None:
            cur['lines'].append(ln)
    return chs


MATH_IN = re.compile(r'\\\((.+?)\\\)')


def inline(s):
    maths = []

    def keep(m):
        maths.append(m.group(1))
        return '\u0001%d\u0001' % (len(maths) - 1)
    s = MATH_IN.sub(keep, s)
    s = html.escape(s, quote=False)
    s = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', s)
    s = re.sub(r'`([^`]+)`', r'<code>\1</code>', s)
    s = re.sub(r'\u0001(\d+)\u0001',
               lambda m: '<span class="m">\\(' + html.escape(maths[int(m.group(1))], quote=False) + '\\)</span>', s)
    return s


def render(lines, h2_start=0):
    """lines → (html, h2 list)"""
    out, i, n, h2 = [], 0, len(lines), []
    para = []

    def flush():
        nonlocal para
        if para:
            parts = []
            for k, (t, br) in enumerate(para):
                parts.append(inline(t))
                if k < len(para) - 1:
                    parts.append('<br>' if br else ' ')
            out.append('<p>' + ''.join(parts) + '</p>')
            para = []

    while i < n:
        raw = lines[i]
        t = raw.strip()
        if not t:
            flush(); i += 1; continue
        if t == '---':
            flush(); out.append('<hr>'); i += 1; continue
        m = re.match(r'^(#{2,4})\s+(.*)$', t)
        if m:
            flush()
            lvl = len(m.group(1))
            if lvl == 2:
                idx = h2_start + len(h2)
                h2.append(re.sub(r'\\\(|\\\)', '', m.group(2)))
                out.append('<h2 id="s%d">%s</h2>' % (idx, inline(m.group(2))))
            else:
                out.append('<h%d>%s</h%d>' % (lvl, inline(m.group(2)), lvl))
            i += 1; continue
        if t.startswith('\\['):
            flush()
            body = t[2:]
            buf = []
            if body.endswith('\\]'):
                buf.append(body[:-2])
            else:
                if body.strip():
                    buf.append(body)
                i += 1
                while i < n and not lines[i].strip().endswith('\\]'):
                    buf.append(lines[i].strip()); i += 1
                if i < n:
                    last = lines[i].strip()[:-2]
                    if last.strip():
                        buf.append(last)
            out.append('<div class="m display">\\[' + html.escape(' '.join(b for b in buf if b).strip(), quote=False) + '\\]</div>')
            i += 1; continue
        if t.startswith('|'):
            flush()
            rows = []
            while i < n and lines[i].strip().startswith('|'):
                rows.append([c.strip().replace('\\|', '|') for c in re.split(r'(?<!\\)\|', lines[i].strip().strip('|'))]); i += 1
            rows = [r for r in rows if not all(re.fullmatch(r':?-{2,}:?', c) for c in r)]
            if rows:
                th = ''.join('<th>%s</th>' % inline(c) for c in rows[0])
                tb = ''.join('<tr>%s</tr>' % ''.join('<td>%s</td>' % inline(c) for c in r) for r in rows[1:])
                out.append('<div class="tw"><table><thead><tr>%s</tr></thead><tbody>%s</tbody></table></div>' % (th, tb))
            continue
        if re.match(r'^[-*] ', t):
            flush()
            items = []
            while i < n and re.match(r'^\s*[-*] ', lines[i]):
                items.append(re.sub(r'^\s*[-*] ', '', lines[i]).strip()); i += 1
            out.append('<ul>' + ''.join('<li>%s</li>' % inline(x) for x in items) + '</ul>')
            continue
        m = re.match(r'^(\d+)[\.\)]\s+(.*)$', t)
        if m:
            flush()
            start = int(m.group(1)); items = []
            while i < n and re.match(r'^\d+[\.\)]\s', lines[i].strip()):
                items.append(re.sub(r'^\d+[\.\)]\s+', '', lines[i].strip())); i += 1
            out.append('<ol start="%d">' % start + ''.join('<li>%s</li>' % inline(x) for x in items) + '</ol>')
            continue
        para.append((t, raw.endswith('  ')))
        i += 1
    flush()
    return '\n'.join(out), h2


def parse_exercises(sec_lines, slug, source):
    """بخش تمرین → فهرست {question, answer}"""
    items, cur, expect = [], None, 1
    for ln in sec_lines:
        t = ln.strip()
        m = re.match(r'^(\d+)[\.\)]\s+(.*)$', t)
        if m and int(m.group(1)) == expect:
            cur = {'q': [m.group(2)], 'a': [], 'in_a': False}
            items.append(cur); expect += 1; continue
        if cur is None:
            continue
        if re.match(r'^\*\*پاسخ\s*:?\s*\*\*\s*:?', t) or t.startswith('**پاسخ'):
            cur['in_a'] = True
            rest = re.sub(r'^\*\*پاسخ\s*:?\s*\*\*\s*:?\s*', '', t)
            if rest:
                cur['a'].append(rest)
            continue
        if t == '---':
            continue
        (cur['a'] if cur['in_a'] else cur['q']).append(ln)
    res = []
    for k, it in enumerate(items, 1):
        q, _ = render(it['q']); a, _ = render(it['a']) if it['a'] else ('', [])
        res.append({'id': '%s-q%d' % (slug, k), 'chapter': slug, 'source': source,
                    'type': 'تشریحی', 'difficulty': None, 'question': q, 'answer': a or None})
    return res


def main(path):
    lines = load_lines(path)
    chs = split_chapters(lines)
    assert len(chs) == 8, 'انتظار می‌رفت هشت فصل پیدا شود، پیدا شد: %d' % len(chs)
    (ROOT / 'data/notes').mkdir(parents=True, exist_ok=True)
    questions, summary = [], []
    for slug, ch in zip(SLUGS, chs):
        L = ch['lines']
        # فهرست داخلی فایل Word حذف می‌شود (سایت فهرست خودکار دارد)
        body, ex_secs, cur = [], [], None
        sec_title, sec = None, []
        blocks = []  # (title, lines)
        pre = []
        for ln in L:
            m = re.match(r'^##\s+(.*)$', ln.strip())
            if m:
                if sec_title is not None:
                    blocks.append((sec_title, sec))
                else:
                    pre = sec
                sec_title, sec = m.group(1), []
            else:
                sec.append(ln)
        if sec_title is not None:
            blocks.append((sec_title, sec))
        else:
            pre = sec
        keep = [('## ' + t, s) for t, s in blocks if t.strip() != 'فهرست']
        flat = list(pre)
        for h, s in keep:
            flat.append(h); flat.extend(s)
            if re.search(r'تمرین|خودآزمایی', h):
                questions += parse_exercises(s, slug, 'جزوه — ' + h[3:].strip())
        htm, h2 = render(flat)
        (ROOT / 'data/notes' / (slug + '.html')).write_text(htm, encoding='utf-8')
        summary.append((slug, len(htm), len(h2)))
    (ROOT / 'data/questions.json').write_text(json.dumps(questions, ensure_ascii=False, indent=1), encoding='utf-8')
    for s in summary:
        print('%-24s %7d bytes  %2d sections' % s)
    print('questions:', len(questions))


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else 'ریاضی_1تا3.docx')
