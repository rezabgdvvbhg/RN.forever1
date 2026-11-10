#!/usr/bin/env python3
"""ساخت فایل Word هر فصل (راست‌چین، با فرمول‌های واقعی Word) از data/notes/*.html — نیاز: pandoc و python-docx"""
import re, subprocess, pathlib, sys, tempfile, json
import docx
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
ROOT = pathlib.Path(__file__).resolve().parent.parent
CH = json.loads(subprocess.run(['node', '-e', "console.log(JSON.stringify(require('./js/chapters.js')))"], cwd=ROOT, capture_output=True, text=True).stdout)
FA = str.maketrans('0123456789', '۰۱۲۳۴۵۶۷۸۹')
out = ROOT / 'files' / 'notes'; out.mkdir(parents=True, exist_ok=True)

def rtl_fix(path):
    d = docx.Document(path)
    for p in d.element.body.iter(qn('w:p')):
        pPr = p.find(qn('w:pPr'))
        if pPr is None:
            pPr = OxmlElement('w:pPr'); p.insert(0, pPr)
        if pPr.find(qn('w:bidi')) is None:
            pPr.append(OxmlElement('w:bidi'))
        if pPr.find(qn('w:jc')) is None:
            jc = OxmlElement('w:jc'); jc.set(qn('w:val'), 'left'); pPr.append(jc)  # در حالت bidi «left» یعنی سمت راست
    for r in d.element.body.iter(qn('w:r')):
        rPr = r.find(qn('w:rPr'))
        if rPr is None:
            rPr = OxmlElement('w:rPr'); r.insert(0, rPr)
        if r.find(qn('m:t')) is None and rPr.find(qn('w:rtl')) is None:
            rPr.append(OxmlElement('w:rtl'))
        fonts = OxmlElement('w:rFonts')
        for a in ('w:ascii', 'w:hAnsi', 'w:cs'):
            fonts.set(qn(a), 'Tahoma')
        if rPr.find(qn('w:rFonts')) is None and r.find(qn('m:t')) is None:
            rPr.insert(0, fonts)
    d.save(path)

for c in CH:
    html = (ROOT / 'data/notes' / (c['slug'] + '.html')).read_text(encoding='utf-8')
    html = '<h1>فصل %s: %s</h1>\n' % (str(c['id']).translate(FA), c['t']) + html
    with tempfile.NamedTemporaryFile('w', suffix='.html', delete=False, encoding='utf-8') as f:
        f.write('<html lang="fa" dir="rtl"><body>' + html + '</body></html>'); src = f.name
    dst = out / (c['slug'] + '.docx')
    subprocess.run(['pandoc', '-f', 'html', '-t', 'docx', src, '-o', str(dst), '--metadata', 'lang=fa-IR', '--lua-filter', str(ROOT / 'tools' / 'math.lua')], check=True)
    rtl_fix(dst)
    print(dst.name, dst.stat().st_size)

# فهرست منابع پنل معلمان (فایل‌های دیگر را خودتان به data/resources.json اضافه کنید)
res_path = ROOT / 'data' / 'resources.json'
old = json.loads(res_path.read_text(encoding='utf-8')) if res_path.exists() else []
old = [r for r in old if not str(r.get('href', '')).startswith('/files/notes/')]
new = [{'chapter': c['slug'], 'title': 'جزوهٔ فصل %s: %s' % (str(c['id']).translate(FA), c['t']), 'type': 'Word (‎.docx)',
        'size': (out / (c['slug'] + '.docx')).stat().st_size, 'href': '/files/notes/%s.docx' % c['slug']} for c in CH]
res_path.write_text(json.dumps(new + old, ensure_ascii=False, indent=1), encoding='utf-8')
print('resources.json:', len(new + old))
