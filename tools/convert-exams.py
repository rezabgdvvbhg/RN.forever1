#!/usr/bin/env python3
"""HTML واسطهٔ build/exam-html → PDF (WeasyPrint) و Word (pandoc + معادلهٔ واقعی) در files/exams. نیاز: weasyprint, pandoc, python-docx"""
import pathlib, subprocess, sys, json
import weasyprint, docx
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
ROOT = pathlib.Path(__file__).resolve().parent.parent
H, OUT = ROOT / 'build/exam-html', ROOT / 'files/exams'; OUT.mkdir(parents=True, exist_ok=True)
def rtl_fix(path):
    d = docx.Document(path)
    for p in d.element.body.iter(qn('w:p')):
        pPr = p.find(qn('w:pPr'))
        if pPr is None: pPr = OxmlElement('w:pPr'); p.insert(0, pPr)
        if pPr.find(qn('w:bidi')) is None: pPr.append(OxmlElement('w:bidi'))
        if pPr.find(qn('w:jc')) is None:
            jc = OxmlElement('w:jc'); jc.set(qn('w:val'), 'left'); pPr.append(jc)
    for r in d.element.body.iter(qn('w:r')):
        rPr = r.find(qn('w:rPr'))
        if rPr is None: rPr = OxmlElement('w:rPr'); r.insert(0, rPr)
        if r.find(qn('m:t')) is None:
            if rPr.find(qn('w:rtl')) is None: rPr.append(OxmlElement('w:rtl'))
            if rPr.find(qn('w:rFonts')) is None:
                f = OxmlElement('w:rFonts')
                for a in ('w:ascii', 'w:hAnsi', 'w:cs'): f.set(qn(a), 'Tahoma')
                rPr.insert(0, f)
    d.save(path)
n = 0
for f in sorted(H.glob('*.pdf.html')):
    stem = f.name[:-9]
    weasyprint.HTML(str(f)).write_pdf(str(OUT / (stem + '.pdf')))
    src = H / (stem + '.docx.html'); dst = OUT / (stem + '.docx')
    subprocess.run(['pandoc', '-f', 'html', '-t', 'docx', str(src), '-o', str(dst), '--metadata', 'lang=fa-IR', '--lua-filter', str(ROOT / 'tools/math.lua')], check=True)
    rtl_fix(dst); n += 1
man = json.loads((ROOT / 'data/exams.json').read_text(encoding='utf-8'))
for e in man:
    e['sizes'] = {k: (ROOT / v.lstrip('/')).stat().st_size for k, v in e['files'].items()}
(ROOT / 'data/exams.json').write_text(json.dumps(man, ensure_ascii=False, indent=1), encoding='utf-8')
print('فایل‌های PDF/Word ساخته شد برای', n, 'سند')
