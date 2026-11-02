import { AppState, Question, Student } from '../types/cbt';

function esc(s: any): string {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function sanitizePrintHTML(html: string): string {
  const root = document.createElement('div');
  root.innerHTML = String(html || '');
  const allowed: Record<string, number> = {
    P: 1, BR: 1, B: 1, STRONG: 1, I: 1, EM: 1, U: 1, S: 1, SUB: 1, SUP: 1,
    UL: 1, OL: 1, LI: 1, BLOCKQUOTE: 1, PRE: 1, CODE: 1, TABLE: 1, THEAD: 1,
    TBODY: 1, TR: 1, TH: 1, TD: 1, A: 1, IMG: 1, DIV: 1, SPAN: 1
  };
  Array.from(root.querySelectorAll('*')).forEach((node) => {
    if (!node.parentNode) return;
    if (!allowed[node.tagName]) {
      if (/^(SCRIPT|STYLE|IFRAME|OBJECT|EMBED)$/.test(node.tagName)) node.remove();
      else (node as any).replaceWith(...Array.from(node.childNodes));
      return;
    }
  });
  return root.innerHTML;
}

function printableImage(src?: string, className?: string): string {
  if (!src || !/^(https?:\/\/|data:image\/)/i.test(String(src).trim())) return '';
  return `<img class="${className || ''}" src="${esc(src)}" alt="">`;
}

export function printLoginCards(state: AppState, studentsList?: Student[]): void {
  const students = studentsList || state.students;
  if (!students.length) {
    alert('Belum ada akun peserta untuk dicetak!');
    return;
  }

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Pop-up terblokir oleh browser. Harap izinkan pop-up untuk mencetak kartu.');
    return;
  }

  const pages: string[] = [];
  for (let i = 0; i < students.length; i += 4) {
    const cards = students.slice(i, i + 4).map((student, cardIndex) => {
      const number = String(i + cardIndex + 1).padStart(3, '0');
      const token = state.cfg.token
        ? `<div class="credential token-credential"><label>TOKEN RUANG</label><strong>${esc(state.cfg.token)}</strong></div>`
        : '';
      return `
        <article class="login-card">
          <div class="login-card-inner">
            <header class="login-card-brand">
              ${printableImage(state.cfg.logo, 'card-logo')}
              <div>
                <div class="brand-ministry">${esc(state.cfg.ministry || 'Kementerian Pendidikan')}</div>
                <div class="brand-school">${esc(state.cfg.school || 'Sekolah')}</div>
              </div>
              <div class="card-number">NO. ${number}</div>
            </header>
            <hr class="card-divider">
            <div class="card-title">
              <div class="eyebrow">UJIAN BERBASIS KOMPUTER (CBT)</div>
              <h2>KARTU AKSES PESERTA</h2>
            </div>
            <div class="student-block">
              <span class="student-label">Nama Peserta</span>
              <div class="student-name">${esc(student.n || 'Peserta')}</div>
              <p class="student-class">Kelas / Ruang: <b>${esc(student.k || '-')}</b></p>
            </div>
            <div class="card-credentials">
              <div class="credential">
                <label>USERNAME</label>
                <strong>${esc(student.u)}</strong>
              </div>
              <div class="credential">
                <label>PASSWORD</label>
                <strong>${esc(student.p)}</strong>
              </div>
            </div>
            ${token}
            <div class="exam-name">
              <span>Mata Pelajaran: <b>${esc(state.cfg.subject || state.cfg.title)}</b></span>
              <span class="card-footer-note">Simpan Kartu Ini</span>
            </div>
          </div>
        </article>
      `;
    }).join('');

    pages.push(`<section class="login-page">${cards}</section>`);
  }

  const styles = `
    @page { size: A4 portrait; margin: 10mm; }
    * { box-sizing: border-box; }
    body { font-family: 'Plus Jakarta Sans', Arial, sans-serif; color: #0f172a; margin: 0; background: #fff; }
    .login-pages { display: block; }
    .login-page { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 8mm; height: 275mm; break-after: page; }
    .login-page:last-child { break-after: auto; }
    .login-card { position: relative; border: 1.5px solid #1e293b; border-radius: 4mm; padding: 6mm 7mm; background: #ffffff; display: flex; flex-direction: column; }
    .login-card:before { content: ""; position: absolute; inset: 0 0 auto; height: 4mm; background: #4f46e5; border-radius: 3mm 3mm 0 0; }
    .login-card-inner { position: relative; height: 100%; display: flex; flex-direction: column; }
    .login-card-brand { display: grid; grid-template-columns: 16mm 1fr auto; align-items: center; gap: 3mm; padding-top: 2mm; }
    .card-logo { width: 14mm; height: 14mm; object-fit: contain; }
    .brand-ministry { text-transform: uppercase; font-size: 6.5pt; font-weight: 700; color: #64748b; }
    .brand-school { font-size: 10pt; font-weight: 800; color: #0f172a; }
    .card-number { font-size: 8pt; font-weight: 800; color: #4f46e5; border: 1px solid #c7d2fe; padding: 1mm 2mm; border-radius: 1.5mm; }
    .card-divider { border: 0; border-top: 1px dashed #cbd5e1; margin: 2.5mm 0; }
    .card-title { text-align: center; margin: 0 0 2mm; }
    .card-title .eyebrow { font-size: 6.5pt; font-weight: 800; letter-spacing: 0.5px; color: #4f46e5; text-transform: uppercase; }
    .card-title h2 { font-size: 11pt; margin: 0.5mm 0 0; font-weight: 800; color: #0f172a; }
    .student-block { border: 1px solid #e2e8f0; border-radius: 2mm; background: #f8fafc; padding: 2.5mm; text-align: center; }
    .student-label { display: block; font-size: 6.5pt; font-weight: 700; text-transform: uppercase; color: #64748b; }
    .student-name { font-size: 12pt; font-weight: 800; color: #0f172a; margin: 0.5mm 0; }
    .student-class { font-size: 8pt; color: #475569; margin: 0; }
    .card-credentials { display: grid; grid-template-columns: 1fr 1fr; gap: 2.5mm; margin-top: 2.5mm; }
    .credential { border: 1px solid #cbd5e1; border-radius: 2mm; background: #fff; padding: 2mm; text-align: center; }
    .credential label { display: block; font-size: 6pt; font-weight: 800; color: #64748b; text-transform: uppercase; }
    .credential strong { display: block; font-family: 'JetBrains Mono', monospace; font-size: 11pt; color: #0f172a; margin-top: 0.5mm; }
    .token-credential { margin-top: 2.5mm; background: #fef3c7; border-color: #fde68a; }
    .token-credential label { color: #92400e; }
    .token-credential strong { color: #b45309; }
    .exam-name { margin-top: auto; padding-top: 2.5mm; border-top: 1px solid #e2e8f0; font-size: 7pt; color: #64748b; display: flex; justify-content: space-between; align-items: center; }
    .card-footer-note { font-weight: 700; color: #4f46e5; }
  `;

  printWindow.document.open();
  printWindow.document.write(`
    <!doctype html>
    <html lang="id">
      <head>
        <meta charset="utf-8">
        <title>Kartu Login - ${esc(state.cfg.title)}</title>
        <style>${styles}</style>
      </head>
      <body>
        <main class="login-pages">${pages.join('')}</main>
      </body>
    </html>
  `);
  printWindow.document.close();

  const images = Array.from(printWindow.document.images);
  Promise.all(images.map((img) => (img.complete ? Promise.resolve() : new Promise((res) => { img.onload = res; img.onerror = res; }))))
    .then(() => {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 300);
    });
}

export function printQuestionsPaper(state: AppState): void {
  if (!state.qs.length) {
    alert('Belum ada soal untuk dicetak!');
    return;
  }

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Pop-up terblokir oleh browser.');
    return;
  }

  const TYPE_NAMES: Record<string, string> = {
    pg: 'Pilihan Ganda',
    pgk: 'Pilihan Ganda Kompleks',
    bs: 'Benar / Salah',
    jd: 'Menjodohkan',
    isi: 'Isian Singkat',
    ur: 'Uraian'
  };

  const questionsHTML = state.qs.map((q: Question, idx: number) => {
    let body = `<div class="q-text">${sanitizePrintHTML(q.q)}</div>`;
    if (q.img) {
      body += `<div class="q-img-wrap"><img src="${esc(q.img)}" class="q-img" alt="Stimulus ${idx + 1}"></div>`;
    }

    if (q.t === 'pg' || q.t === 'pgk') {
      body += `<ol class="q-options">${(q.o || []).map((opt) => `<li><span class="box"></span> <span>${sanitizePrintHTML(opt)}</span></li>`).join('')}</ol>`;
    } else if (q.t === 'bs') {
      body += `<table class="bs-table"><thead><tr><th>Pernyataan</th><th class="col-w">Benar</th><th class="col-w">Salah</th></tr></thead><tbody>${(q.st || []).map((s) => `<tr><td>${sanitizePrintHTML(s.s)}</td><td class="center-text">( &nbsp; )</td><td class="center-text">( &nbsp; )</td></tr>`).join('')}</tbody></table>`;
    } else if (q.t === 'jd') {
      const pairs = (q.pairs || []).slice();
      const shuffledRights = pairs.slice().sort(() => Math.random() - 0.5);
      body += `
        <div class="jd-grid">
          <div><b>Pernyataan:</b><ol>${pairs.map((p) => `<li>${sanitizePrintHTML(p.l)} &nbsp; [ &nbsp; ]</li>`).join('')}</ol></div>
          <div><b>Pilihan Jawaban:</b><ul>${shuffledRights.map((p, i) => `<li>${String.fromCharCode(65 + i)}. ${sanitizePrintHTML(p.r)}</li>`).join('')}</ul></div>
        </div>
      `;
    } else if (q.t === 'isi') {
      body += `<div class="blank-box">Jawaban: __________________________________________________</div>`;
    } else if (q.t === 'ur') {
      body += `<div class="essay-box"><div class="line"></div><div class="line"></div><div class="line"></div><div class="line"></div></div>`;
    }

    return `
      <article class="question-item">
        <div class="q-header">
          <span class="q-num">Nomor ${idx + 1}</span>
          <span class="q-type">${TYPE_NAMES[q.t] || 'Soal'} (${q.w || 1} Poin)</span>
        </div>
        ${body}
      </article>
    `;
  }).join('');

  const styles = `
    @page { size: A4 portrait; margin: 12mm; }
    * { box-sizing: border-box; }
    body { font-family: 'Plus Jakarta Sans', Arial, sans-serif; color: #0f172a; margin: 0; font-size: 10pt; line-height: 1.5; }
    .paper-header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 4mm; margin-bottom: 5mm; }
    .school-logo { max-height: 18mm; max-width: 45mm; object-fit: contain; margin-bottom: 2mm; }
    .paper-header h1 { font-size: 14pt; margin: 0 0 1mm; font-weight: 800; }
    .paper-header p { margin: 1mm 0; font-size: 9pt; color: #475569; }
    .paper-meta { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4mm; border: 1px solid #cbd5e1; padding: 3mm; border-radius: 2mm; margin-bottom: 6mm; font-size: 9pt; background: #f8fafc; }
    .question-item { break-inside: avoid; margin-bottom: 6mm; border-bottom: 1px solid #e2e8f0; padding-bottom: 4mm; }
    .q-header { display: flex; justify-content: space-between; font-weight: 700; margin-bottom: 2mm; font-size: 9pt; color: #4f46e5; }
    .q-text { font-size: 10pt; margin-bottom: 2mm; }
    .q-img { max-height: 55mm; max-width: 100%; object-fit: contain; border-radius: 2mm; border: 1px solid #cbd5e1; margin: 2mm 0; }
    .q-options { list-style: none; padding-left: 5mm; margin: 2mm 0; }
    .q-options li { display: flex; align-items: flex-start; gap: 3mm; margin: 1.5mm 0; }
    .box { width: 4mm; height: 4mm; border: 1.5px solid #0f172a; display: inline-block; margin-top: 1mm; flex-shrink: 0; }
    .bs-table { width: 100%; border-collapse: collapse; font-size: 9pt; margin: 3mm 0; }
    .bs-table th, .bs-table td { border: 1px solid #cbd5e1; padding: 2mm; }
    .bs-table th { background: #f1f5f9; text-align: left; }
    .col-w { width: 16mm; text-align: center; }
    .center-text { text-align: center; }
    .jd-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6mm; margin-top: 2mm; font-size: 9pt; }
    .blank-box { margin-top: 3mm; font-family: monospace; color: #334155; }
    .essay-box .line { border-bottom: 1px dotted #94a3b8; height: 6mm; }
  `;

  printWindow.document.open();
  printWindow.document.write(`
    <!doctype html>
    <html lang="id">
      <head>
        <meta charset="utf-8">
        <title>Naskah Soal - ${esc(state.cfg.title)}</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
        <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"><\/script>
        <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js"><\/script>
        <style>${styles}</style>
      </head>
      <body>
        <header class="paper-header">
          ${printableImage(state.cfg.logo, 'school-logo')}
          <h1>${esc(state.cfg.title || 'Lembar Soal Ujian')}</h1>
          <p>${esc(state.cfg.school || state.cfg.ministry || '')} &bull; ${esc(state.cfg.subject || '')}</p>
        </header>
        <div class="paper-meta">
          <div>Nama: _______________________</div>
          <div>Kelas: _______________________</div>
          <div>Waktu: ${state.cfg.duration ? `${state.cfg.duration} Menit` : 'Bebas'}</div>
        </div>
        <main>${questionsHTML}</main>
        <script>
          window.onload = function() {
            if (window.renderMathInElement) {
              window.renderMathInElement(document.body, {
                delimiters: [
                  {left: '$$', right: '$$', display: true},
                  {left: '$', right: '$', display: false}
                ],
                throwOnError: false
              });
            }
            setTimeout(function() { window.print(); }, 400);
          }
        <\/script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
