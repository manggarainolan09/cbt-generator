import { AppState } from '../types/cbt';

export function buildCBTHTML(state: AppState): string {
  const data = JSON.parse(JSON.stringify(state));
  data.cfg.sheetUrl = String(data.cfg.sheetUrl || '').trim();
  data.cfg.syncEnabled = !!data.cfg.sheetUrl;
  
  // Keep proctor credentials inside the file if set, or let proctor use admin pass
  const b64Data = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
  const title = String(state.cfg.title || 'Ujian CBT Online').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const iconTag = state.cfg.icon ? `<link rel="icon" href="${state.cfg.icon}">` : '';

  return `<!DOCTYPE html>
<html lang="id" class="h-full bg-slate-100">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
${iconTag}
<script src="https://cdn.tailwindcss.com"><\/script>
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"><\/script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"><\/script>
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js"><\/script>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
<style>
:root{--cbt-primary:${state.cfg.themePrimary || '#4f46e5'};--cbt-background:${state.cfg.themeBackground || '#f8fafc'}}
body{font-family:'Plus Jakarta Sans',sans-serif;user-select:none;-webkit-user-select:none;background-color:var(--cbt-background)}
.cbt-theme-gradient{background:linear-gradient(135deg, var(--cbt-primary) 0%, #1e1b4b 100%)!important}
.cbt-theme-header{background:var(--cbt-primary)!important}
.cbt-theme-button{background:var(--cbt-primary)!important}
input,textarea,[contenteditable]{user-select:text;-webkit-user-select:text}
.katex-display{margin:0.4em 0}
.q-content ul{list-style:disc;padding-left:1.5rem;margin:.25rem 0}
.q-content ol{list-style:decimal;padding-left:1.5rem;margin:.25rem 0}
.q-content p{margin:.25rem 0}
.q-content img{max-width:100%;height:auto;max-height:260px;border-radius:0.75rem}
#camBox{position:fixed;right:16px;bottom:16px;z-index:9999;width:150px;background:#0f172a;border-radius:14px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.4);border:2px solid #334155}
#camBox video{width:100%;height:auto;display:block;transform:scaleX(-1)}
#camBox .cam-badge{position:absolute;top:6px;left:6px;background:#dc2626;color:#fff;font-size:9px;font-weight:700;padding:2px 6px;border-radius:999px;letter-spacing:.5px}
#camBox .cam-name{position:absolute;bottom:0;left:0;right:0;background:rgba(15,23,42,.75);color:#e2e8f0;font-size:9px;padding:3px 6px;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
@media(max-width:640px){#camBox{width:110px;right:8px;bottom:8px}}
</style>
</head>
<body class="h-full text-slate-800 antialiased flex flex-col">
<div id="app" class="h-full flex flex-col"></div>
<script>
window.addEventListener('error', function(e){
  var a = document.getElementById('app');
  if(a && !a.innerHTML.trim()) a.innerHTML = '<div style="padding:24px;font-family:sans-serif;max-width:640px;margin:auto"><h3 style="color:#b91c1c">Terjadi kesalahan pada aplikasi CBT</h3><p>Hubungi pengawas. Detail: ' + String(e.message).replace(/</g,'&lt;') + '</p></div>';
});
var DATA = JSON.parse(decodeURIComponent(escape(atob("${b64Data}"))));
var C = DATA.cfg, Q = DATA.qs, S_LIST = DATA.students || [];
var STORAGE_KEY = "cbt_exam_" + C.title.replace(/[^a-z0-9]/gi,"_") + "_" + Q.length;
var SYNC_QUEUE_KEY = "cbt_sync_queue_" + STORAGE_KEY;
var DONE_KEY = "cbt_done_" + STORAGE_KEY;
var state = null, timer = null, hbTimer = null, HB_MS = 45000;
var VIOL_GRACE_UNTIL = 0;

function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function stripHTML(html){ if(!html) return ''; var d=document.createElement('div'); d.innerHTML=String(html); return d.textContent||d.innerText||''; }
function shuf(a){ a=a.slice(); for(var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=a[i]; a[i]=a[j]; a[j]=t; } return a; }
function rng(n){ var r=[]; for(var i=0;i<n;i++)r.push(i); return r; }
function save(){ try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }catch(e){} }
function load(){ try{ return JSON.parse(localStorage.getItem(STORAGE_KEY)); }catch(e){ return null; } }
function getDone(key, name, kelas){
  try{
    var storageKey = DONE_KEY + '_' + encodeURIComponent(String(key || ''));
    var saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if(saved) return saved;
  }catch(e){}
  return null;
}
function setDone(obj){ try{ localStorage.setItem(DONE_KEY + '_' + encodeURIComponent(String(obj.key || '')), JSON.stringify(obj)); }catch(e){} }
function clearDone(key){ try{ if(key) localStorage.removeItem(DONE_KEY + '_' + encodeURIComponent(String(key))); }catch(e){} }

var camStream = null, camVideo = null, camCanvas = null, camTimer = null, camReady = false;
function startCamera(){
  if(!C.camera || camStream || !state || state.done) return;
  var box = document.createElement('div');
  box.id = 'camBox';
  box.innerHTML = '<span class="cam-badge">● LIVE</span><video autoplay playsinline muted></video><div class="cam-name">' + esc(state.name || 'Peserta') + '</div>';
  document.body.appendChild(box);
  camVideo = box.querySelector('video');
  if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
    box.innerHTML = '<div style="padding:14px;text-align:center;color:#fca5a5;font-size:10px;font-weight:700">Kamera tidak didukung</div>';
    return;
  }
  navigator.mediaDevices.getUserMedia({video:{width:{ideal:320},height:{ideal:240}},audio:false})
    .then(function(s){
      camStream = s; camVideo.srcObject = s; camReady = true;
      setTimeout(capturePhoto, 1600);
      clearInterval(camTimer);
      camTimer = setInterval(capturePhoto, 180000);
    })
    .catch(function(){
      box.innerHTML = '<div style="padding:14px;text-align:center;color:#fca5a5;font-size:10px;font-weight:700">Kamera tidak aktif<br><span style="color:#94a3b8;font-weight:500">Izinkan akses kamera</span></div>';
      setTimeout(function(){ if(box.parentNode) box.parentNode.removeChild(box); }, 5000);
    });
}
function capturePhoto(){
  if(!camReady || !camVideo || !camVideo.videoWidth || !state) return;
  try{
    if(!camCanvas){ camCanvas = document.createElement('canvas'); camCanvas.width = 200; camCanvas.height = 150; }
    camCanvas.getContext('2d').drawImage(camVideo, 0, 0, 200, 150);
    state.photo = camCanvas.toDataURL('image/jpeg', 0.38);
    save();
  }catch(e){}
}
function stopCamera(){
  clearInterval(camTimer); camTimer = null;
  if(camStream){ try{ camStream.getTracks().forEach(function(t){ t.stop(); }); }catch(e){} }
  camStream = null; camReady = false;
  var box = document.getElementById('camBox');
  if(box && box.parentNode) box.parentNode.removeChild(box);
}

function swalAlert(opts){
  if(window.Swal) return Swal.fire(Object.assign({confirmButtonColor:C.themePrimary||'#4f46e5', confirmButtonText:'OK'}, opts));
  alert((opts.title||'') + (opts.text ? '\\n\\n'+opts.text : ''));
  return Promise.resolve({isConfirmed:true});
}
function swalConfirm(opts){
  if(window.Swal) return Swal.fire(Object.assign({showCancelButton:true, confirmButtonColor:C.themePrimary||'#4f46e5', cancelButtonColor:'#64748b', confirmButtonText:'Ya', cancelButtonText:'Batal'}, opts)).then(function(r){ return r.isConfirmed; });
  return Promise.resolve(confirm((opts.title||'') + (opts.text ? '\\n\\n'+opts.text : '')));
}

function formatDate(ts){
  if(!ts) return '-';
  var d = new Date(ts);
  var months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear() + ' · ' +
    (d.getHours()<10?'0':'') + d.getHours() + ':' + (d.getMinutes()<10?'0':'') + d.getMinutes();
}

function renderMath(){
  setTimeout(function(){
    if(window.renderMathInElement){
      renderMathInElement(document.body, {
        delimiters: [{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false},{left:'\\\\(',right:'\\\\)',display:false},{left:'\\\\[',right:'\\\\]',display:true}],
        throwOnError: false
      });
    }
  }, 80);
}

function tryFullscreen(){
  var el = document.documentElement;
  try{
    if(el.requestFullscreen) el.requestFullscreen().catch(function(){});
    else if(el.webkitRequestFullscreen) el.webkitRequestFullscreen();
  }catch(e){}
}
function exitFullscreen(){
  try{
    if(document.exitFullscreen) document.exitFullscreen().catch(function(){});
    else if(document.webkitExitFullscreen) document.webkitExitFullscreen();
  }catch(e){}
}
function isFullscreen(){
  return !!(document.fullscreenElement || document.webkitFullscreenElement);
}
function handleFsChange(){
  if(!state || state.done) return;
  if(!isFullscreen()){
    if(Date.now() < VIOL_GRACE_UNTIL){ setTimeout(function(){ tryFullscreen(); }, 150); return; }
    state.tabSwitches = (state.tabSwitches || 0) + 1;
    if(C.camera) capturePhoto();
    save();
    if(C.maxSw > 0 && state.tabSwitches >= C.maxSw){
      finishExam(true);
      swalAlert({icon:'error', title:'Batas Pelanggaran Tercapai', html:'Anda keluar dari mode layar penuh melebihi batas <b>' + C.maxSw + 'x</b>.<br>Ujian diakhiri otomatis.'});
    } else if(C.maxSw > 0){
      swalAlert({icon:'warning', title:'Peringatan Layar Penuh', html:'Dilarang keluar dari mode LAYAR PENUH.<br><br>Pelanggaran: <b>' + state.tabSwitches + '/' + C.maxSw + '</b>'});
    }
  }
}
document.addEventListener('fullscreenchange', handleFsChange);
document.addEventListener('webkitfullscreenchange', handleFsChange);

if(C.noCopy){
  ['copy','cut','contextmenu','selectstart'].forEach(function(ev){
    document.addEventListener(ev, function(e){
      if(e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') e.preventDefault();
    });
  });
}

function monKey(name, kelas, user, asal){
  return C.authMode === 'list' ? 'u:' + String(user).trim().toLowerCase()
    : 'f:' + String(name).trim().toLowerCase() + '|' + String(kelas).trim().toLowerCase() + '|' + String(asal || '').trim().toLowerCase();
}
function deviceId(){
  try{ var d = localStorage.getItem('cbt_device'); if(!d){ d = 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2,8); localStorage.setItem('cbt_device', d); } return d; }
  catch(e){ return 'nd' + Math.random().toString(36).slice(2,8); }
}
function makeSid(){ return 's' + Date.now().toString(36) + Math.random().toString(36).slice(2,8); }
function countAnswered(){ var n = 0; Q.forEach(function(q,i){ if(hasAnswer(i)) n++; }); return n; }

function logoHTML(h){
  if(C.logo) return '<img src="' + esc(C.logo) + '" alt="Logo" style="height:' + h + 'px;width:auto;max-width:' + (h*3) + 'px;object-fit:contain">';
  return '<svg viewBox="0 0 100 100" width="' + h + '" height="' + h + '" aria-label="Logo"><circle cx="50" cy="50" r="46" fill="#4f46e5"/><path d="M50 20 L76 68 L24 68 Z" fill="#fff"/></svg>';
}

function showLoginPage(msg){
  var isList = C.authMode === 'list';
  var fcls = 'class="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition" autocomplete="off"';
  function field(id, label, type, extra){ return '<div><label class="block text-xs font-bold text-slate-600 mb-1.5">' + label + '</label><input id="' + id + '" type="' + type + '" ' + fcls + (extra || '') + '></div>'; }
  
  var html = '<div class="cbt-theme-gradient min-h-screen relative overflow-hidden flex items-center justify-center p-4">' +
    '<div class="relative w-full max-w-4xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-5">' +
      '<div class="cbt-theme-gradient md:col-span-2 text-white p-6 md:p-8 flex flex-col justify-between">' +
        '<div>' +
          '<div class="flex items-center gap-3">' +
            '<div class="bg-white rounded-xl p-2 shadow-sm flex items-center justify-center">' + logoHTML(36) + '</div>' +
            '<div class="text-xs font-bold tracking-wider uppercase text-indigo-200">' + esc(C.ministry || '') + '</div>' +
          '</div>' +
          '<div class="mt-8">' +
            '<p class="text-xs font-bold uppercase tracking-widest text-indigo-300">Computer Based Test (CBT)</p>' +
            '<h1 class="mt-1 text-2xl font-black leading-tight">' + esc(C.title) + '</h1>' +
            '<p class="mt-2 text-sm text-indigo-100">' + esc([C.school, C.subject].filter(Boolean).join(' • ')) + '</p>' +
          '</div>' +
          '<div class="mt-6 flex flex-wrap gap-2 text-xs font-semibold">' +
            '<span class="bg-white/20 px-3 py-1 rounded-full">📝 ' + Q.length + ' Soal</span>' +
            '<span class="bg-white/20 px-3 py-1 rounded-full">⏱️ ' + (C.duration > 0 ? C.duration + ' Menit' : 'Bebas') + '</span>' +
            '<span class="bg-white/20 px-3 py-1 rounded-full">🎯 KKM ' + C.kkm + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="mt-8 text-xs text-indigo-200">Simpan kartu akses & patuhi tata tertib ujian.</div>' +
      '</div>' +
      '<div class="md:col-span-3 p-6 md:p-10 flex flex-col justify-center">' +
        '<h2 class="text-2xl font-extrabold text-slate-800">Masuk Ujian</h2>' +
        '<p class="text-xs text-slate-500 mt-1 mb-6">' + (isList ? 'Gunakan Username & Password resmi dari pengawas.' : 'Ketik identitas Anda dengan benar.') + '</p>' +
        '<div class="space-y-4">' +
          (isList ? field('inUser', 'Username Peserta', 'text') + field('inPass', 'Password', 'password')
                  : field('inName', 'Nama Lengkap Siswa', 'text') + field('inClass', 'Kelas / Ruang', 'text') + field('inSchool', 'Asal Sekolah', 'text')) +
          (C.token ? field('inToken', 'Token Ruang Ujian', 'text', ' style="text-transform:uppercase;letter-spacing:0.1em"') : '') +
          '<div id="loginErr" class="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 hidden"></div>' +
          '<button id="btnStart" onclick="attemptLogin()" class="cbt-theme-button w-full py-3.5 text-white font-bold rounded-xl text-sm shadow-lg transition">Mulai Ujian Sekarang &rarr;</button>' +
        '</div>' +
        '<p class="mt-6 text-xs text-slate-400 text-center">Ujian berjalan dalam mode Layar Penuh. Aktivitas siswa tercatat otomatis.</p>' +
      '</div>' +
    '</div></div>';
  document.getElementById('app').innerHTML = html;
  if(msg){ var le = document.getElementById('loginErr'); le.textContent = msg; le.classList.remove('hidden'); }
}

async function attemptLogin(){
  var errEl = document.getElementById('loginErr');
  function fail(m){ errEl.textContent = m; errEl.classList.remove('hidden'); }
  errEl.classList.add('hidden');

  var name = "", kelas = "", user = "", asal = "";
  if(C.authMode === 'list'){
    user = document.getElementById('inUser').value.trim(); var p = document.getElementById('inPass').value.trim();
    if(!user || !p) return fail("Username & Password wajib diisi.");
    var match = S_LIST.find(function(s){ return String(s.u).trim().toLowerCase() === user.toLowerCase() && String(s.p).trim() === p; });
    if(!match) return fail("Username atau Password salah!");
    name = match.n || match.u; kelas = match.k || "-";
  } else {
    name = document.getElementById('inName').value.trim();
    kelas = document.getElementById('inClass').value.trim() || "-";
    if(!name) return fail("Nama lengkap wajib diisi.");
    asal = document.getElementById('inSchool').value.trim();
  }
  if(C.token){
    var tk = document.getElementById('inToken').value.trim();
    if(tk.toUpperCase() !== String(C.token).trim().toUpperCase()) return fail("Token ujian tidak cocok!");
  }

  var key = monKey(name, kelas, user, asal), newSid = makeSid();
  var doneData = getDone(key, name, kelas);
  if(doneData){
    swalAlert({icon:'warning', title:'Ujian Sudah Selesai', text:'Anda tercatat telah menyelesaikan ujian ini. Nilai Anda: ' + (doneData.score || '-')});
    return;
  }

  var confirmed = await swalConfirm({
    icon: 'question',
    title: 'Mulai Pengerjaan Ujian?',
    html: 'Halo <b>' + esc(name) + '</b>,<br><br>Ujian <b>' + esc(C.title) + '</b> akan dimulai dalam mode <b>LAYAR PENUH</b>.<br>Dilarang keluar atau berpindah aplikasi selama ujian berlangsung.',
    confirmButtonText: 'Mulai Ujian'
  });
  if(!confirmed) return;

  var qOrder = rng(Q.length); if(C.shuffleQ) qOrder = shuf(qOrder);
  var optsOrder = {};
  Q.forEach(function(q, idx){
    var n = (q.t === 'pg' || q.t === 'pgk') ? (q.o ? q.o.length : 0) : (q.t === 'jd' ? (q.pairs ? q.pairs.length : 0) : 0);
    if(n) optsOrder[idx] = C.shuffleO ? shuf(rng(n)) : rng(n);
  });

  state = {
    name: name, kelas: kelas, asal: asal, key: key, sid: newSid,
    qOrder: qOrder, optsOrder: optsOrder, ans: {}, flag: {}, idx: 0,
    startTime: Date.now(),
    endTime: C.duration > 0 ? Date.now() + C.duration * 60000 : 0,
    tabSwitches: 0, done: false
  };
  save();
  tryFullscreen();
  runExam();
}

function runExam(){
  renderExamUI();
  if(C.camera){
    VIOL_GRACE_UNTIL = Date.now() + 5000;
    startCamera();
  }
  clearInterval(timer);
  if(state.endTime){ timer = setInterval(updateTimer, 1000); updateTimer(); }
}

function updateTimer(){
  var el = document.getElementById('timerBox'); if(!el || !state || state.done) return;
  var rem = Math.max(0, Math.floor((state.endTime - Date.now())/1000));
  var h = Math.floor(rem/3600), m = Math.floor((rem%3600)/60), s = rem%60;
  el.textContent = (h<10?'0'+h:h) + ':' + (m<10?'0'+m:m) + ':' + (s<10?'0'+s:s);
  if(rem < 300) el.className = "px-3 py-1 bg-red-600 text-white rounded-lg font-mono font-bold text-xs animate-pulse";
  if(rem <= 0){ clearInterval(timer); finishExam(true); }
}

function renderExamUI(){
  var qi = state.qOrder[state.idx], q = Q[qi], total = Q.length;
  var html = '<header class="cbt-theme-header text-white px-4 py-3 shadow-md flex items-center justify-between sticky top-0 z-30">' +
    '<div class="flex items-center gap-3"><span class="bg-white rounded-lg p-1 flex">' + logoHTML(28) + '</span><span class="font-bold text-sm truncate max-w-xs">' + esc(C.title) + '</span>' +
    '<span class="text-xs text-white/80 hidden sm:inline">&bull; ' + esc(state.name) + ' (' + esc(state.kelas) + ')</span></div>' +
    '<div class="flex items-center gap-3">' +
      (state.endTime ? '<div id="timerBox" class="px-3 py-1 bg-black/30 rounded-lg font-mono font-bold text-sm">--:--:--</div>' : '') +
      '<button onclick="confirmFinish()" class="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition">Selesai</button>' +
    '</div></header>' +
  '<main class="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">' +
    '<div class="lg:col-span-3 space-y-4"><div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 md:p-8 space-y-5">' +
      '<div class="flex items-center justify-between border-b pb-3"><span class="text-xs font-bold text-indigo-600 uppercase">Soal ' + (state.idx+1) + ' dari ' + total + '</span>' +
      (state.flag[qi] ? '<span class="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">Ragu-ragu</span>' : '') + '</div>' +
      '<div class="text-base font-medium leading-relaxed q-content text-slate-800">' + (q.q || '') + '</div>' +
      (q.img ? '<div class="pt-2"><img src="' + esc(q.img) + '" class="max-h-72 rounded-xl border border-slate-200"></div>' : '') +
      '<div class="pt-4 space-y-3">' + renderAnswerOptions(qi, q) + '</div>' +
      '<div class="pt-6 border-t flex items-center justify-between gap-2">' +
        '<button onclick="navMove(-1)" ' + (state.idx===0 ? 'disabled class="opacity-40 px-4 py-2 bg-slate-100 rounded-xl text-xs font-semibold"' : 'class="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold"') + '>&larr; Sebelumnya</button>' +
        '<button onclick="toggleFlag()" class="px-4 py-2 ' + (state.flag[qi] ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-800') + ' rounded-xl text-xs font-semibold">Tandai Ragu</button>' +
        (state.idx < total-1 ? '<button onclick="navMove(1)" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold">Berikutnya &rarr;</button>'
          : '<button onclick="confirmFinish()" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold">Selesai & Kumpulkan</button>') +
      '</div></div></div>' +
    '<div class="lg:col-span-1"><div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4 lg:sticky lg:top-20">' +
      '<h3 class="font-bold text-xs uppercase tracking-wider text-slate-500">Navigasi Soal</h3>' +
      '<div class="grid grid-cols-5 gap-2 max-h-72 overflow-y-auto p-1" id="navGridBox"></div>' +
      '<div class="pt-3 border-t text-xs text-slate-500 space-y-1.5">' +
        '<div class="flex items-center gap-2"><span class="w-3 h-3 bg-emerald-500 rounded"></span> Terjawab</div>' +
        '<div class="flex items-center gap-2"><span class="w-3 h-3 bg-amber-400 rounded"></span> Ragu-ragu</div>' +
        '<div class="flex items-center gap-2"><span class="w-3 h-3 bg-slate-200 rounded"></span> Belum dijawab</div>' +
      '</div></div></div></main>';
  document.getElementById('app').innerHTML = html;
  renderNavGrid(); renderMath();
  if(state.endTime) updateTimer();
}

function renderAnswerOptions(qi, q){
  var ans = state.ans[qi], perm = state.optsOrder[qi] || [], h = "";
  if(q.t === 'pg' || q.t === 'pgk'){
    for(var k=0; k<perm.length; k++){
      var oi = perm[k];
      var isSel = q.t === 'pg' ? (ans === oi) : (Array.isArray(ans) && ans.indexOf(oi) >= 0);
      h += '<div onclick="' + (q.t === 'pg' ? 'pickPG' : 'togglePGK') + '(' + oi + ')" class="flex items-start gap-3 p-3.5 border-2 rounded-xl cursor-pointer transition ' + (isSel ? 'border-indigo-600 bg-indigo-50/70 shadow-sm' : 'border-slate-200 hover:border-indigo-300 bg-white') + '">' +
        '<span class="w-7 h-7 flex-none flex items-center justify-center font-bold text-xs rounded-lg ' + (isSel ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600') + '">' + String.fromCharCode(65 + k) + '</span>' +
        '<div class="flex-1 text-sm q-content">' + (q.o[oi] || '') + '</div></div>';
    }
    if(q.t === 'pgk') h += '<p class="text-xs text-slate-500 italic">Pilih satu atau beberapa opsi jawaban yang benar.</p>';
  } else if(q.t === 'bs'){
    h += '<div class="overflow-x-auto"><table class="w-full text-xs border border-slate-200 rounded-xl overflow-hidden"><thead><tr class="bg-slate-50 border-b"><th class="p-3 text-left">Pernyataan</th><th class="p-3 w-20 text-center">Benar</th><th class="p-3 w-20 text-center">Salah</th></tr></thead><tbody>';
    for(var r=0; r<(q.st ? q.st.length : 0); r++){
      var v = ans ? ans[r] : undefined;
      h += '<tr class="border-b"><td class="p-3">' + esc(q.st[r].s) + '</td>' +
        '<td class="p-3 text-center"><button onclick="setBS(' + r + ',true)" class="px-3 py-1.5 rounded-lg font-bold border transition ' + (v===true ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white hover:bg-slate-100') + '">B</button></td>' +
        '<td class="p-3 text-center"><button onclick="setBS(' + r + ',false)" class="px-3 py-1.5 rounded-lg font-bold border transition ' + (v===false ? 'bg-rose-600 text-white border-rose-600' : 'bg-white hover:bg-slate-100') + '">S</button></td></tr>';
    }
    h += '</tbody></table></div>';
  } else if(q.t === 'jd'){
    for(var r2=0; r2<(q.pairs ? q.pairs.length : 0); r2++){
      h += '<div class="flex flex-col sm:flex-row sm:items-center gap-3 p-3.5 border rounded-xl bg-white"><div class="flex-1 text-sm font-semibold">' + esc(q.pairs[r2].l) + '</div>' +
        '<span class="text-slate-400 font-bold hidden sm:block">&rarr;</span>' +
        '<select onchange="setJD(' + r2 + ',this.value)" class="flex-1 text-xs border rounded-lg p-2.5 bg-slate-50"><option value="">-- Pilih Padanan --</option>';
      for(var k2=0; k2<perm.length; k2++){
        var val = perm[k2];
        h += '<option value="' + val + '" ' + (ans && ans[r2]===val ? 'selected' : '') + '>' + esc(q.pairs[val].r) + '</option>';
      }
      h += '</select></div>';
    }
  } else if(q.t === 'isi'){
    h += '<input type="text" oninput="typeText(this.value)" value="' + esc(ans || '') + '" class="w-full p-3.5 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Ketikkan jawaban singkat Anda di sini...">';
  } else {
    h += '<textarea oninput="typeText(this.value)" rows="5" class="w-full p-3.5 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Ketikkan uraian jawaban Anda secara lengkap...">' + esc(ans || '') + '</textarea>';
  }
  return h;
}

function renderNavGrid(){
  var box = document.getElementById('navGridBox'); if(!box) return;
  var g = "";
  for(var p=0; p<state.qOrder.length; p++){
    var qi = state.qOrder[p];
    var bg = state.flag[qi] ? "bg-amber-400 text-white" : (hasAnswer(qi) ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-700");
    var ring = (p === state.idx) ? "ring-2 ring-offset-2 ring-indigo-600 font-extrabold" : "";
    g += '<button onclick="jumpTo(' + p + ')" class="h-9 w-full rounded-lg text-xs font-bold transition ' + bg + ' ' + ring + '">' + (p+1) + '</button>';
  }
  box.innerHTML = g;
}

function hasAns(q, a){
  if(a === undefined || a === null) return false;
  if(q.t === 'pgk') return a.length > 0;
  if(q.t === 'bs' || q.t === 'jd') return Object.keys(a).length > 0;
  if(q.t === 'isi' || q.t === 'ur') return String(a).trim() !== "";
  return true;
}
function hasAnswer(qi){ return hasAns(Q[qi], state.ans[qi]); }

function scoreQ(q, a){
  if(!hasAns(q, a)) return 0;
  if(q.t === 'pg') return a === q.a ? 1 : 0;
  if(q.t === 'pgk'){
    if(!q.a.length) return 0; var cr=0, wr=0;
    a.forEach(function(x){ if(q.a.indexOf(x)>=0) cr++; else wr++; });
    return q.s === 'partial' ? Math.max(0,(cr-wr)/q.a.length) : ((cr===q.a.length && wr===0) ? 1 : 0);
  }
  if(q.t === 'bs'){
    var m=0, t=q.st.length; for(var r=0;r<t;r++){ if(a[r] === q.st[r].a) m++; }
    return q.s === 'partial' ? m/t : (m===t ? 1 : 0);
  }
  if(q.t === 'jd'){
    var m2=0, tp=q.pairs.length; for(var r2=0;r2<tp;r2++){ if(a[r2] === r2) m2++; }
    return q.s === 'partial' ? m2/tp : (m2===tp ? 1 : 0);
  }
  if(q.t === 'isi'){
    var keys = String(q.a).split('|').map(function(s){ return s.trim().toLowerCase(); });
    return keys.indexOf(String(a).trim().toLowerCase()) >= 0 ? 1 : 0;
  }
  return 0;
}

function cq(){ return state.qOrder[state.idx]; }
function pickPG(oi){ state.ans[cq()] = oi; save(); renderExamUI(); }
function togglePGK(oi){ var qi=cq(),a=(state.ans[qi]||[]).slice(),pos=a.indexOf(oi); if(pos>=0)a.splice(pos,1);else a.push(oi); state.ans[qi]=a; save(); renderExamUI(); }
function setBS(r,val){ var qi=cq(),a=state.ans[qi]||{}; a[r]=val; state.ans[qi]=a; save(); renderExamUI(); }
function setJD(r,val){ var qi=cq(),a=state.ans[qi]||{}; if(val==="")delete a[r];else a[r]=parseInt(val,10); state.ans[qi]=a; save(); renderNavGrid(); }
function typeText(val){ state.ans[cq()] = val; save(); renderNavGrid(); }
function toggleFlag(){ var qi=cq(); state.flag[qi] = !state.flag[qi]; save(); renderExamUI(); }
function navMove(d){ state.idx = Math.max(0, Math.min(Q.length-1, state.idx+d)); save(); renderExamUI(); }
function jumpTo(p){ state.idx = p; save(); renderExamUI(); }

async function confirmFinish(){
  var empty=0, flagged=0;
  Q.forEach(function(q,i){ if(!hasAnswer(i))empty++; if(state.flag[i])flagged++; });
  var html = 'Apakah Anda yakin ingin menyelesaikan ujian?';
  if(empty || flagged){
    html += '<div class="mt-3 text-left text-xs bg-slate-50 border rounded-lg p-3 space-y-1">';
    if(empty) html += '<div>📝 Soal belum dijawab: <b>' + empty + '</b></div>';
    if(flagged) html += '<div>🔖 Masih ragu-ragu: <b>' + flagged + '</b></div>';
    html += '</div>';
  }
  var ok = await swalConfirm({icon:'question', title:'Kumpulkan Jawaban?', html:html, confirmButtonText:'Ya, Selesaikan'});
  if(ok) finishExam(false);
}

function finishExam(auto){
  if(state.done) return;
  state.done = true;
  if(C.camera){ capturePhoto(); stopCamera(); }
  clearInterval(timer); clearInterval(hbTimer);
  state.finishTime = Date.now();
  state.scoreResult = calculateScore();
  save();
  setDone({ key:state.key, name: state.name, kelas: state.kelas, score: state.scoreResult.finalScore, finishTime: state.finishTime });
  exitFullscreen();
  showResultPage();
}

function calculateScore(){
  var totalW=0, earnedW=0, correct=0, partial=0, wrong=0, empty=0, manual=0;
  Q.forEach(function(q,i){
    var w = q.w || 1, given = hasAnswer(i), f = scoreQ(q, state.ans[i]);
    if(q.t === 'ur'){ manual++; return; }
    totalW += w; earnedW += f*w;
    if(!given) empty++; else if(f >= 1) correct++; else if(f > 0) partial++; else wrong++;
  });
  return { finalScore: totalW ? Math.round((earnedW/totalW)*10000)/100 : 0, correct:correct, partial:partial, wrong:wrong, empty:empty, manual:manual };
}

function showResultPage(){
  var res = state.scoreResult;
  var html = '<div class="min-h-screen flex items-center justify-center p-4 bg-slate-900">' +
    '<div class="max-w-md w-full bg-white text-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 text-center">' +
      '<div class="flex justify-center">' + logoHTML(52) + '</div><h2 class="text-2xl font-black">Ujian Selesai!</h2>' +
      '<p class="text-xs text-slate-500">Terima kasih <b>' + esc(state.name) + '</b> (' + esc(state.kelas) + '), seluruh jawaban Anda telah tersimpan dengan aman.</p>' +
      (C.show ?
        '<div class="p-6 bg-slate-50 border rounded-2xl space-y-2"><div class="text-5xl font-black text-indigo-600">' + res.finalScore + '</div>' +
        '<div class="text-xs font-bold uppercase tracking-wider text-slate-500">Skor Akhir Ujian</div>' +
        '<div class="pt-4 border-t grid grid-cols-3 gap-2 text-xs"><div><b>Benar:</b> ' + res.correct + '</div><div><b>Salah:</b> ' + res.wrong + '</div><div><b>Kosong:</b> ' + res.empty + '</div></div>' +
        '</div>' : '') +
      '<div class="space-y-2">' +
        '<button onclick="window.print()" class="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition">Cetak Bukti Ujian</button>' +
      '</div>' +
      '<p class="text-xs text-slate-400">Pengerjaan ulang tidak diperkenankan setelah ujian diselesaikan.</p>' +
    '</div></div>';
  document.getElementById('app').innerHTML = html;
}

window.onload = function(){
  var saved = load();
  if(saved && saved.done){ state = saved; showResultPage(); }
  else if(saved){ state = saved; runExam(); }
  else { showLoginPage(); }
};
<\/script>
</body>
</html>`;
}
