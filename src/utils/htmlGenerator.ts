import { AppState } from '../types/cbt';

export function buildCBTHTML(state: AppState): string {
  const data = JSON.parse(JSON.stringify(state));
  data.cfg.sheetUrl = String(data.cfg.sheetUrl || '').trim();
  data.cfg.syncEnabled = !!data.cfg.sheetUrl;
  
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

function loadLib(src){
  return new Promise(function(res, rej){
    if(document.querySelector('script[src="'+src+'"]')) return res();
    var s = document.createElement('script');
    s.src = src;
    s.onload = res;
    s.onerror = function(){ rej(new Error('Gagal memuat pustaka: ' + src)); };
    document.head.appendChild(s);
  });
}

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
function swalToast(msg, icon){
  if(window.Swal) return Swal.fire({toast:true, position:'top-end', icon: icon||'success', title: msg, showConfirmButton:false, timer:2500, timerProgressBar:true});
  return Promise.resolve();
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

function srvOn(){ return !!(C.syncEnabled && C.sheetUrl); }
function q2(o){ return Object.keys(o).map(function(k){ return k + '=' + encodeURIComponent(o[k]); }).join('&'); }
function srv(params, timeout){ return jsonp(q2(params), timeout); }
function jsonp(query, timeout){
  return new Promise(function(res, rej){
    var cb = '__cbt' + Date.now() + Math.floor(Math.random()*100000), sc = document.createElement('script'), done = false;
    function end(){ done = true; window[cb] = function(){}; if(sc.parentNode) sc.parentNode.removeChild(sc); }
    window[cb] = function(d){ if(!done){ end(); res(d); } };
    sc.onerror = function(){ if(!done){ end(); rej(new Error('blocked')); } };
    setTimeout(function(){ if(!done){ end(); rej(new Error('timeout')); } }, timeout || 15000);
    sc.src = C.sheetUrl + (C.sheetUrl.indexOf('?')>=0 ? '&' : '?') + query + '&callback=' + cb;
    document.head.appendChild(sc);
  });
}
function postForm(payload){
  return new Promise(function(res){
    var name = 'cbtf' + Date.now(), ifr = document.createElement('iframe');
    ifr.name = name; ifr.style.display = 'none';
    var f = document.createElement('form'); f.method = 'POST'; f.action = C.sheetUrl; f.target = name; f.style.display = 'none';
    var t = document.createElement('textarea'); t.name = 'd'; t.value = JSON.stringify(payload);
    f.appendChild(t); document.body.appendChild(ifr); document.body.appendChild(f); f.submit();
    setTimeout(function(){
      try{ document.body.removeChild(f); }catch(e){}
      setTimeout(function(){ try{ document.body.removeChild(ifr); }catch(e){} }, 20000);
      res(true);
    }, 500);
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
          '<div class="pt-4 border-t border-slate-100 flex items-center justify-between mt-3">' +
            '<span class="text-[11px] text-slate-400 font-medium">Bukan peserta ujian?</span>' +
            '<button type="button" onclick="showAdminLogin()" class="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 text-indigo-700 hover:text-indigo-800 text-xs font-bold transition flex items-center gap-1.5 border border-slate-200 hover:border-indigo-200">' +
              '<span>👮 Masuk Panel Pengawas</span>' +
            '</button>' +
          '</div>' +
        '</div>' +
        '<p class="mt-6 text-xs text-slate-400 text-center">Ujian berjalan dalam mode Layar Penuh. Aktivitas siswa tercatat otomatis.</p>' +
      '</div>' +
    '</div></div>';
  document.getElementById('app').innerHTML = html;
  if(msg){ var le = document.getElementById('loginErr'); le.textContent = msg; le.classList.remove('hidden'); }
}

/* ==============================================================
   PROCTOR PANEL & FULL COMPREHENSIVE ANALYTICS ENGINE
   ============================================================== */
var ADM = null, admTimer = null;
var ADM_ROWS_ALL = [], ADM_NOW = Date.now();
var ADM_FILTER = { monQ:'', monStatus:'', stuQ:'', anaQ:'', anaKelas:'', anaAsal:'', anaStatus:'' };
var ADM_VIEW = null;
var ADM_AUTO = true, ADM_SEC = 10;

function admMsg(m){ 
  var b = document.getElementById('admBody'); 
  if(b) b.innerHTML = '<div class="p-8 text-center text-slate-500 text-sm font-semibold">' + esc(m) + '</div>'; 
}
function fmtT(ms){ return ms ? new Date(ms).toLocaleTimeString('id-ID') : '-'; }

function showAdminLogin(){
  var inp = 'class="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"';
  document.getElementById('app').innerHTML = '<div class="min-h-screen flex items-center justify-center p-4 bg-slate-900">' +
    '<div class="max-w-sm w-full bg-white rounded-3xl shadow-2xl p-6 sm:p-8 space-y-4">' +
      '<div class="flex justify-center">' + logoHTML(48) + '</div>' +
      '<div class="text-center">' +
        '<h2 class="text-xl font-extrabold text-slate-900">Login Pengawas Ujian</h2>' +
        '<p class="text-xs text-slate-500 mt-1">Masuk untuk memantau progress siswa & analisis lengkap</p>' +
      '</div>' +
      '<div><label class="block text-xs font-bold text-slate-700 mb-1">Username Pengawas</label><input id="aUser" type="text" value="' + esc(C.adminUser || 'pengawas') + '" ' + inp + '></div>' +
      '<div><label class="block text-xs font-bold text-slate-700 mb-1">Password Pengawas</label><input id="aPass" type="password" ' + inp + '></div>' +
      '<div id="aErr" class="text-xs font-semibold text-rose-600 hidden"></div>' +
      '<button id="aBtn" onclick="adminLogin()" class="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition">Masuk ke Panel Pengawas</button>' +
      '<button onclick="showLoginPage()" class="w-full text-xs text-slate-500 hover:text-slate-800 underline text-center block mt-2">&larr; Kembali ke login siswa</button>' +
    '</div></div>';
  document.querySelectorAll('#app input').forEach(function(i){ i.addEventListener('keydown', function(e){ if(e.key === 'Enter') adminLogin(); }); });
}

function adminLogin(){
  var u = document.getElementById('aUser').value.trim();
  var p = document.getElementById('aPass').value;
  var er = document.getElementById('aErr');
  var expectedUser = C.adminUser || 'pengawas';
  var expectedPass = C.adminPass || 'pengawas2026';

  if(!u || !p){
    er.textContent = 'Username & password wajib diisi.';
    er.classList.remove('hidden');
    return;
  }

  // If sync server is configured, check against GAS server auth, otherwise check local config
  if(srvOn()){
    var bt = document.getElementById('aBtn');
    bt.disabled = true; bt.textContent = 'Memeriksa ke server...';
    srv({ action:'auth', u:u, p:p }, 12000).then(function(r){
      bt.disabled = false; bt.textContent = 'Masuk ke Panel Pengawas';
      if(r.status === 'forbidden'){
        er.textContent = 'Username atau password pengawas salah!';
        er.classList.remove('hidden');
        return;
      }
      ADM = { u:u, p:p, tab:'mon', rows:[], res:[] };
      showAdmin('mon');
    }, function(){
      // Fallback local check
      if(u === expectedUser && p === expectedPass){
        ADM = { u:u, p:p, tab:'mon', rows:[], res:[] };
        showAdmin('mon');
      } else {
        bt.disabled = false; bt.textContent = 'Masuk ke Panel Pengawas';
        er.textContent = 'Username atau password pengawas salah!';
        er.classList.remove('hidden');
      }
    });
  } else {
    if(u === expectedUser && p === expectedPass){
      ADM = { u:u, p:p, tab:'mon', rows:[], res:[] };
      showAdmin('mon');
    } else {
      er.textContent = 'Username atau password pengawas salah!';
      er.classList.remove('hidden');
    }
  }
}

function adminLogout(){ 
  clearInterval(admTimer); 
  ADM = null; 
  showLoginPage(); 
}

function showAdmin(tab){
  if(!ADM) ADM = { u: C.adminUser || 'pengawas', p: C.adminPass || 'pengawas2026', tab: tab, rows:[], res:[] };
  ADM.tab = tab; 
  clearInterval(admTimer);
  var tabs = [['mon','📡 Monitoring Live'],['stu','👥 Roster Peserta'],['ana','📊 Analisis Rekap Lengkap']];
  document.getElementById('app').innerHTML = '<header class="bg-slate-900 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-30 shadow-md">' +
    '<div class="flex items-center gap-2"><span class="font-bold text-sm">👮 Panel Pengawas CBT</span><span class="text-xs text-slate-400 hidden sm:inline">&bull; ' + esc(C.title) + '</span></div>' +
    '<div class="flex items-center gap-2 flex-wrap">' +
      tabs.map(function(t){ return '<button onclick="showAdmin(&apos;' + t[0] + '&apos;)" class="px-3 py-1.5 rounded-lg text-xs font-bold transition ' + (tab === t[0] ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-800 text-slate-300 hover:text-white') + '">' + t[1] + '</button>'; }).join('') +
      '<button onclick="adminLogout()" class="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition ml-2">Keluar</button>' +
    '</div></header>' +
    '<main class="p-4 sm:p-6 max-w-7xl w-full mx-auto"><div id="admBody"></div></main>';
  
  admMsg('Memuat data dari server...');
  if(tab === 'mon'){ loadMon(); setAdmAuto(); }
  else if(tab === 'stu'){ loadParticipants(); }
  else loadAna();
}

function loadMon(){
  if(srvOn()){
    srv({ action:'monitor', u:ADM.u, p:ADM.p }, 15000).then(function(d){
      if(d.status !== 'ok') return admMsg('Gagal memuat monitoring: ' + (d.message || d.status));
      var map = {};
      d.rows.forEach(function(r){ map[r[0]] = { key:r[0], name:r[1], kelas:r[2], st:r[3], login:r[4], act:r[5], ans:r[6], tot:r[7], tabs:r[8], score:r[9] }; });
      if(C.authMode === 'list') S_LIST.forEach(function(s){
        var k = 'u:' + String(s.u).trim().toLowerCase();
        if(!map[k]) map[k] = { key:k, name:s.n || s.u, kelas:s.k || '-', st:'Belum login', login:0, act:0, ans:0, tot:Q.length, tabs:0, score:'' };
      });
      var order = { 'Mengerjakan':0, 'Belum login':1, 'Reset':2, 'Selesai':3 };
      ADM_ROWS_ALL = Object.keys(map).map(function(k){ return map[k]; }).sort(function(a,b){
        return (order[a.st] - order[b.st]) || String(a.kelas).localeCompare(String(b.kelas)) || String(a.name).localeCompare(String(b.name));
      });
      ADM_NOW = d.now;
      renderMon(d.now);
    }, function(){
      fallbackLocalMon();
    });
  } else {
    fallbackLocalMon();
  }
}

function fallbackLocalMon(){
  var map = {};
  if(C.authMode === 'list') S_LIST.forEach(function(s){
    var k = 'u:' + String(s.u).trim().toLowerCase();
    var done = getDone(k, s.n, s.k);
    map[k] = { 
      key: k, name: s.n || s.u, kelas: s.k || '-', 
      st: done ? 'Selesai' : 'Belum login', 
      login: 0, act: 0, ans: done ? Q.length : 0, tot: Q.length, tabs: 0, 
      score: done ? done.score : '' 
    };
  });
  ADM_ROWS_ALL = Object.keys(map).map(function(k){ return map[k]; });
  ADM_NOW = Date.now();
  renderMon(ADM_NOW);
}

function renderMon(now){
  now = now || ADM_NOW || Date.now(); ADM_NOW = now;
  var all = ADM_ROWS_ALL || [];
  var q = (ADM_FILTER.monQ || '').toLowerCase();
  var stf = ADM_FILTER.monStatus || '';
  var rows = all.filter(function(r){
    if(stf && r.st !== stf) return false;
    if(!q) return true;
    return (String(r.name)+' '+String(r.kelas)+' '+String(r.key)).toLowerCase().indexOf(q) >= 0;
  });
  ADM.rows = rows;
  var cnt = { 'Belum login':0, 'Mengerjakan':0, 'Selesai':0, 'Reset':0 }, tabs = 0, doneScores = [];
  all.forEach(function(r){
    cnt[r.st] = (cnt[r.st]||0)+1; tabs += Number(r.tabs)||0;
    if(r.st==='Selesai' && r.score !== '' && r.score != null) doneScores.push(Number(r.score)||0);
  });
  var avg = doneScores.length ? (doneScores.reduce(function(a,b){return a+b;},0)/doneScores.length).toFixed(1) : '-';
  var body = '';
  rows.forEach(function(r, i){
    var idle = r.st === 'Mengerjakan' && r.act && (now - r.act) > 120000;
    var badge = r.st === 'Selesai' ? 'bg-emerald-100 text-emerald-800' : r.st === 'Mengerjakan' ? (idle ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800') : r.st === 'Reset' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600';
    var pct = r.tot ? Math.round(r.ans / r.tot * 100) : 0;
    var keySafe = esc(r.key);
    body += '<tr class="border-b hover:bg-slate-50/80 transition-colors">' +
      '<td class="p-3 text-center text-slate-400 font-mono">' + (i+1) + '</td>' +
      '<td class="p-3 font-bold text-slate-900 whitespace-nowrap">' + esc(r.name) + '</td>' +
      '<td class="p-3 text-slate-600 whitespace-nowrap">' + esc(r.kelas) + '</td>' +
      '<td class="p-3"><span class="px-2.5 py-1 rounded-full text-[11px] font-bold ' + badge + '">' + esc(r.st) + (idle ? ' • idle' : '') + '</span></td>' +
      '<td class="p-3 min-w-[130px]"><div class="w-28 h-2 bg-slate-100 rounded-full overflow-hidden"><div class="h-full bg-indigo-600 rounded-full" style="width:' + pct + '%"></div></div><span class="text-[11px] text-slate-500 font-mono mt-0.5 block">' + r.ans + ' / ' + r.tot + ' (' + pct + '%)</span></td>' +
      '<td class="p-3 text-center font-bold ' + (r.tabs > 0 ? 'text-rose-600' : 'text-slate-400') + '">' + (r.tabs || 0) + 'x</td>' +
      '<td class="p-3 text-[11px] font-mono whitespace-nowrap text-slate-500">' + fmtT(r.login) + '</td>' +
      '<td class="p-3 text-[11px] whitespace-nowrap text-slate-500">' + (r.act ? Math.max(0, Math.round((now - r.act)/1000)) + ' dtk lalu' : '-') + '</td>' +
      '<td class="p-3 font-black text-center font-mono text-indigo-700">' + (r.st === 'Selesai' ? r.score : '-') + '</td>' +
      '<td class="p-3 whitespace-nowrap text-right space-x-1">' +
        '<button onclick="admDetail(&apos;' + keySafe + '&apos;)" class="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold">Detail</button>' +
        (r.st === 'Mengerjakan' ? '<button onclick="admResetKey(&apos;' + keySafe + '&apos;,&apos;login&apos;)" class="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold">Reset Login</button>' : '') +
        (r.st === 'Mengerjakan' || r.st === 'Selesai' ? '<button onclick="admResetKey(&apos;' + keySafe + '&apos;,&apos;score&apos;)" class="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold">Reset Nilai</button>' : '') +
      '</td></tr>';
  });
  function card(l, v, c, sub){ return '<div class="bg-white border rounded-2xl p-4 shadow-2xs"><div class="text-[10px] uppercase font-bold text-slate-400">' + l + '</div><div class="text-2xl font-black ' + c + ' mt-1">' + v + '</div>' + (sub ? '<div class="text-[10px] text-slate-400 mt-0.5">' + sub + '</div>' : '') + '</div>'; }
  document.getElementById('admBody').innerHTML =
    '<div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-4">' +
      card('Total Peserta', all.length, 'text-slate-800') +
      card('Belum Login', cnt['Belum login']||0, 'text-slate-500') +
      card('Mengerjakan', cnt['Mengerjakan']||0, 'text-blue-600') +
      card('Selesai', cnt['Selesai']||0, 'text-emerald-600') +
      card('Pelanggaran Tab', tabs + 'x', tabs ? 'text-rose-600' : 'text-slate-600', 'total keluar fullscreen') +
      card('Rata-rata Nilai', avg, 'text-indigo-600', 'peserta selesai') +
    '</div>' +
    '<div class="flex flex-wrap items-center gap-2 mb-3 bg-white border rounded-2xl p-3 shadow-2xs">' +
      '<input value="' + esc(ADM_FILTER.monQ) + '" onchange="ADM_FILTER.monQ=this.value;renderMon()" placeholder="Cari nama atau kelas..." class="px-3 py-1.5 border rounded-xl text-xs w-48 bg-slate-50">' +
      '<select onchange="ADM_FILTER.monStatus=this.value;renderMon()" class="px-2.5 py-1.5 border rounded-xl text-xs bg-slate-50 font-medium"><option value="">Semua Status</option>' +
        ['Belum login','Mengerjakan','Selesai','Reset'].map(function(s){ return '<option value="' + s + '"' + (ADM_FILTER.monStatus===s?' selected':'') + '>' + s + '</option>'; }).join('') +
      '</select>' +
      '<label class="flex items-center gap-1.5 text-xs font-semibold text-slate-600 cursor-pointer pl-2"><input type="checkbox" ' + (ADM_AUTO?'checked':'') + ' onchange="ADM_AUTO=this.checked;setAdmAuto()" class="rounded text-indigo-600"> Auto-Refresh</label>' +
      '<select onchange="ADM_SEC=parseInt(this.value,10)||10;setAdmAuto()" class="px-2 py-1.5 border rounded-xl text-xs font-mono bg-slate-50">' + [5,10,20,30,60].map(function(s){ return '<option value="' + s + '"' + (ADM_SEC===s?' selected':'') + '>' + s + ' dtk</option>'; }).join('') + '</select>' +
      '<button onclick="loadMon()" class="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 rounded-xl text-xs font-bold transition">Muat Ulang</button>' +
      '<button onclick="admMonCSV()" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs">Unduh CSV</button>' +
      '<span class="text-[11px] text-slate-400 ml-auto font-mono">Diperbarui ' + new Date().toLocaleTimeString('id-ID') + (ADM_AUTO ? ' &bull; auto ' + ADM_SEC + 's' : '') + '</span>' +
    '</div>' +
    '<div class="bg-white border rounded-2xl overflow-hidden shadow-2xs"><table class="w-full text-xs text-left"><thead class="bg-slate-100 uppercase font-bold text-slate-700 border-b"><tr>' +
      '<th class="p-3 w-10 text-center">No</th><th class="p-3">Nama Siswa</th><th class="p-3">Kelas</th><th class="p-3">Status</th><th class="p-3">Progress</th><th class="p-3 text-center">Pindah Tab</th><th class="p-3">Waktu Login</th><th class="p-3">Aktif</th><th class="p-3 text-center">Nilai</th><th class="p-3 text-right">Aksi</th></tr></thead><tbody>' +
      (body || '<tr><td colspan="10" class="p-8 text-center text-slate-400">Tidak ada data sesuai pencarian.</td></tr>') + '</tbody></table></div>' +
    '<p class="text-[11px] text-slate-400 mt-2">Gunakan <b>Reset Login</b> jika laptop siswa terputus atau ingin berganti komputer ujian.</p>';
}

function setAdmAuto(){
  clearInterval(admTimer);
  if(ADM_AUTO){
    admTimer = setInterval(function(){
      if(ADM && ADM.tab==='mon'){
        var ae = document.activeElement;
        if(ae && ae.tagName === 'INPUT') return;
        loadMon();
      }
    }, Math.max(5, ADM_SEC) * 1000);
  }
}

function admDetail(key){
  var r = (ADM_ROWS_ALL||[]).filter(function(x){ return x.key===key; })[0];
  if(!r) return;
  var done = function(photo){
    var html = '<div class="text-left text-xs space-y-3"><div class="grid grid-cols-2 gap-2">' +
      '<div class="p-2.5 bg-slate-50 rounded-xl"><b>Nama:</b><br>' + esc(r.name) + '</div>' +
      '<div class="p-2.5 bg-slate-50 rounded-xl"><b>Kelas:</b><br>' + esc(r.kelas) + '</div>' +
      '<div class="p-2.5 bg-slate-50 rounded-xl"><b>Status:</b><br>' + esc(r.st) + '</div>' +
      '<div class="p-2.5 bg-slate-50 rounded-xl"><b>Progress:</b><br>' + r.ans + ' / ' + r.tot + '</div>' +
      '<div class="p-2.5 bg-slate-50 rounded-xl"><b>Pindah Tab:</b><br>' + (r.tabs||0) + ' kali</div>' +
      '<div class="p-2.5 bg-slate-50 rounded-xl"><b>Nilai Akhir:</b><br>' + (r.st==='Selesai' ? r.score : '-') + '</div>' +
      '</div>';
    if(photo && photo.indexOf('data:image') === 0){
      html += '<div class="pt-2 text-center"><b>Foto Pengawas (Webcam):</b><br><img src="' + photo + '" class="mt-2 rounded-xl border max-h-56 mx-auto"></div>';
    } else if(C.camera){
      html += '<div class="pt-2 text-slate-400 text-center">Belum ada foto yang masuk.</div>';
    }
    html += '</div>';
    Swal.fire({title:'Detail Peserta Ujian', html:html, width:540, confirmButtonColor:'#4f46e5', confirmButtonText:'Tutup'});
  };
  if(C.camera && srvOn()){
    srv({action:'photo', u:ADM.u, p:ADM.p, key:key}, 25000).then(function(d){
      done(d.status==='ok' ? String(d.photo||'') : '');
    }, function(){ done(''); });
  } else done('');
}

function admShowPhoto(key){
  admDetail(key);
}

function admResetKey(key, mode){
  var r = (ADM_ROWS_ALL||[]).filter(function(x){ return x.key===key; })[0];
  if(r) admResetConfirm(r, mode);
}
async function admResetConfirm(r, mode){
  var ok = await swalConfirm({
    icon:'warning',
    title: mode === 'login' ? 'Reset Login Siswa?' : 'Reset Nilai Siswa?',
    html: mode === 'login'
      ? 'Reset LOGIN untuk <b>' + esc(r.name) + '</b>?<br><br>Siswa akan dapat login kembali dari perangkatnya.'
      : 'Reset NILAI untuk <b>' + esc(r.name) + '</b>?<br><br>Hasil ujian dihapus dan siswa harus mengulang dari nomor 1.',
    confirmButtonText: 'Ya, Reset'
  });
  if(!ok) return;
  if(srvOn()){
    try{
      var d = await srv({ action:'reset', u:ADM.u, p:ADM.p, key:r.key, mode:mode }, 15000);
      if(d.status === 'ok') await swalAlert({icon:'success', title:'Berhasil', text: d.message || 'Reset berhasil.'});
      else await swalAlert({icon:'error', title:'Gagal', text: d.message || d.status});
      loadMon();
    }catch(e){
      await swalAlert({icon:'error', title:'Koneksi Gagal', text:'Tidak dapat terhubung ke server Apps Script.'});
    }
  } else {
    clearDone(r.key);
    await swalAlert({icon:'success', title:'Berhasil', text:'Sesi lokal berhasil direset.'});
    loadMon();
  }
}

function admMonCSV(){
  var lines = [['Nama','Kelas','Status','Terjawab','Total Soal','Pindah Tab','Waktu Login','Terakhir Aktif','Nilai','Key']];
  (ADM_ROWS_ALL||[]).forEach(function(r){
    lines.push([r.name, r.kelas, r.st, r.ans, r.tot, r.tabs, fmtT(r.login), r.act ? fmtT(r.act) : '-', r.score, r.key]);
  });
  var csv = '\ufeff' + lines.map(function(l){ return l.map(function(v){ return '"' + String(v==null?'':v).replace(/"/g,'""') + '"'; }).join(','); }).join(String.fromCharCode(13, 10));
  var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], {type:'text/csv'}));
  a.download = 'Monitoring_' + (C.title||'CBT').replace(/[^a-z0-9]/gi,'_') + '.csv'; a.click();
  swalToast('CSV monitoring berhasil diunduh');
}

function loadParticipants(){
  admMsg('Memuat daftar akun peserta...');
  var html = '<div class="bg-white rounded-2xl border p-5 space-y-4 shadow-2xs">' +
    '<div class="flex flex-wrap justify-between items-center gap-2">' +
      '<div><h3 class="font-bold text-sm text-slate-900">Daftar Akun Peserta (' + S_LIST.length + ' Siswa)</h3><p class="text-xs text-slate-500">Kredensial username dan password resmi peserta</p></div>' +
      '<button onclick="window.print()" class="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs">Cetak Lembar Akun</button>' +
    '</div>' +
    '<div class="overflow-x-auto"><table class="w-full text-xs text-left"><thead class="bg-slate-100 uppercase font-bold text-slate-700 border-b"><tr><th class="p-3 w-12 text-center">No</th><th class="p-3">Username</th><th class="p-3">Password</th><th class="p-3">Nama Lengkap</th><th class="p-3">Kelas</th></tr></thead><tbody>';
  S_LIST.forEach(function(s, idx){
    html += '<tr class="border-b hover:bg-slate-50"><td class="p-3 text-center text-slate-400 font-mono">' + (idx+1) + '</td><td class="p-3 font-mono font-bold text-indigo-700">' + esc(s.u) + '</td><td class="p-3 font-mono text-slate-600">' + esc(s.p) + '</td><td class="p-3 font-bold text-slate-900">' + esc(s.n || '-') + '</td><td class="p-3 text-slate-600">' + esc(s.k || '-') + '</td></tr>';
  });
  html += '</tbody></table></div></div>';
  document.getElementById('admBody').innerHTML = html;
}

/* ==============================================================
   COMPREHENSIVE PSYCHOMETRIC & STATISTICAL ANALYSIS ENGINE
   ============================================================== */
function loadAna(){
  admMsg('Memuat rekap analisis dari server...');
  if(srvOn()){
    srv({ action:'results', u:ADM.u, p:ADM.p }, 40000).then(function(d){
      if(d.status !== 'ok') return admMsg('Gagal memuat rekap: ' + (d.message || d.status));
      var seen = {};
      d.rows.forEach(function(r){ seen[r.key || ('n:' + String(r.name).toLowerCase() + '|' + String(r.kelas).toLowerCase())] = r; });
      ADM.res = Object.keys(seen).map(function(k){ return seen[k]; });
      renderAna();
    }, function(){
      fallbackLocalAna();
    });
  } else {
    fallbackLocalAna();
  }
}

function fallbackLocalAna(){
  // Gather from local roster & completed test sessions
  var results = [];
  S_LIST.forEach(function(s, idx){
    var k = 'u:' + String(s.u).trim().toLowerCase();
    var d = getDone(k, s.n, s.k);
    if(d && d.score !== undefined && d.score !== null && d.score !== ''){
      results.push({
        key: k, name: s.n || s.u, kelas: s.k || '-', score: Number(d.score),
        correct: Math.round((Number(d.score)/100)*Q.length),
        wrong: Q.length - Math.round((Number(d.score)/100)*Q.length),
        empty: 0, partial: 0, manual: 0, tabs: 0, finish: formatDate(d.finishTime), auto: false, answers: '{}'
      });
    }
  });
  ADM.res = results;
  renderAna();
}

function percentile(sorted, p){
  var n = sorted.length; if(!n) return 0;
  var idx = (n - 1) * p, lo = Math.floor(idx), hi = Math.ceil(idx);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}
function computeStats(vals){
  var n = vals.length;
  if(!n) return {n:0,mean:0,median:0,mode:0,min:0,max:0,range:0,variance:0,std:0,q1:0,q3:0,iqr:0};
  var s = vals.slice().sort(function(a,b){ return a-b; });
  var sum = vals.reduce(function(a,b){ return a+b; }, 0), mean = sum/n;
  var variance = vals.reduce(function(a,b){ return a + (b-mean)*(b-mean); }, 0)/n;
  var std = Math.sqrt(variance);
  var median = n%2 ? s[(n-1)/2] : (s[n/2-1]+s[n/2])/2;
  var q1 = percentile(s,0.25), q3 = percentile(s,0.75);
  var freq = {}, maxF = 0, mode = 0;
  vals.forEach(function(v){ freq[v]=(freq[v]||0)+1; });
  Object.keys(freq).forEach(function(k){ if(freq[k]>maxF){ maxF=freq[k]; mode=parseFloat(k); } });
  return { n:n, mean:mean, median:median, mode:mode, min:s[0], max:s[n-1], range:s[n-1]-s[0],
           variance:variance, std:std, q1:q1, q3:q3, iqr:q3-q1 };
}
function gradeOf(sc){
  if(sc >= 90) return 'A';
  if(sc >= 80) return 'B';
  if(sc >= 70) return 'C';
  if(sc >= 60) return 'D';
  return 'E';
}
function anaFilterLabel(){
  var parts = [];
  if(ADM_FILTER.anaKelas) parts.push('Kelas: ' + ADM_FILTER.anaKelas);
  if(ADM_FILTER.anaAsal) parts.push('Asal: ' + ADM_FILTER.anaAsal);
  if(ADM_FILTER.anaStatus) parts.push('Status: ' + (ADM_FILTER.anaStatus === 'lulus' ? 'Lulus' : 'Belum Lulus'));
  if(ADM_FILTER.anaQ) parts.push('Cari: ' + ADM_FILTER.anaQ);
  return parts.length ? parts.join(' &bull; ') : 'Semua Peserta';
}

function renderAna(){
  var allRows = ADM.res || [];
  if(!allRows.length){
    document.getElementById('admBody').innerHTML = '<div class="bg-white rounded-2xl border p-8 text-center space-y-3">' +
      '<span class="text-4xl">📊</span><h3 class="font-bold text-base text-slate-800">Belum Ada Hasil Ujian Masuk</h3>' +
      '<p class="text-xs text-slate-500 max-w-md mx-auto">Setelah siswa menyelesaikan ujian dan mengirim nilai ke spreadsheet atau menyelesaikan sesi, rekap analisis lengkap (daya beda, tingkat kesukaran, histogram, per kelas, & ekspor) akan otomatis terisi di sini.</p>' +
      '</div>';
    return;
  }

  var uniqueKelas = Array.from(new Set(allRows.map(function(r){ return r.kelas; }).filter(Boolean))).sort();
  var uniqueAsal  = Array.from(new Set(allRows.map(function(r){ return r.asal; }).filter(Boolean))).sort();

  var rows = allRows.filter(function(r){
    if(ADM_FILTER.anaKelas && r.kelas !== ADM_FILTER.anaKelas) return false;
    if(ADM_FILTER.anaAsal  && r.asal  !== ADM_FILTER.anaAsal)  return false;
    if(ADM_FILTER.anaStatus === 'lulus' && Number(r.score) <  C.kkm) return false;
    if(ADM_FILTER.anaStatus === 'belum' && Number(r.score) >= C.kkm) return false;
    if(ADM_FILTER.anaQ){
      var qq = ADM_FILTER.anaQ.toLowerCase();
      if((String(r.name)+' '+String(r.kelas)+' '+String(r.asal||'')).toLowerCase().indexOf(qq) < 0) return false;
    }
    return true;
  });

  var scores = rows.map(function(r){ return Number(r.score)||0; });
  var st = computeStats(scores);
  st.pass = scores.filter(function(x){ return x >= C.kkm; }).length;
  st.fail = st.n - st.pass;
  st.passPct = st.n ? st.pass/st.n*100 : 0;

  var grades = {A:0,B:0,C:0,D:0,E:0};
  scores.forEach(function(x){ grades[gradeOf(x)]++; });

  var bins = [0,0,0,0,0,0,0,0,0,0];
  scores.forEach(function(x){ bins[Math.min(9, Math.max(0, Math.floor(x/10)))]++; });
  var mb = Math.max.apply(null, bins) || 1;

  var kg = {};
  allRows.forEach(function(r){ (kg[r.kelas] = kg[r.kelas]||[]).push(Number(r.score)||0); });
  var perKelas = Object.keys(kg).sort().map(function(k){
    var s = computeStats(kg[k]); s.kelas = k;
    s.pass = kg[k].filter(function(x){ return x >= C.kkm; }).length;
    s.passPct = s.n ? s.pass/s.n*100 : 0;
    return s;
  });

  var parsed = rows.map(function(r){ var a={}; try{ a=JSON.parse(r.answers||'{}'); }catch(e){} return {r:r, a:a, s:Number(r.score)||0}; });
  var ord = parsed.slice().sort(function(x,y){ return y.s-x.s; });
  var g = Math.max(1, Math.round(rows.length*0.27));
  var up = ord.slice(0,g), lo = ord.slice(-g);
  function avg(arr,f){ return arr.length ? arr.reduce(function(a,x){ return a+f(x); },0)/arr.length : 0; }
  var items = [];
  Q.forEach(function(q, i){
    if(q.t === 'ur') return;
    var p = avg(parsed, function(x){ return scoreQ(q, x.a[i]); });
    var D = rows.length >= 6 ? avg(up, function(x){ return scoreQ(q, x.a[i]); }) - avg(lo, function(x){ return scoreQ(q, x.a[i]); }) : null;
    var lvl = p>=0.7 ? ['Mudah','text-emerald-700 bg-emerald-50'] : p>=0.3 ? ['Sedang','text-amber-700 bg-amber-50'] : ['Sukar','text-rose-700 bg-rose-50'];
    var dist = '';
    if(q.t === 'pg' || q.t === 'pgk'){
      (q.o || []).forEach(function(o,k){
        var c = parsed.filter(function(x){ var a=x.a[i]; return q.t==='pg' ? a===k : (Array.isArray(a) && a.indexOf(k)>=0); }).length;
        var key = q.t==='pg' ? q.a===k : (Array.isArray(q.a) && q.a.indexOf(k)>=0);
        dist += '<span class="inline-block mr-2.5 ' + (key?'font-bold text-emerald-700':'text-slate-600') + '">' + String.fromCharCode(65+k) + ': ' + c + '</span>';
      });
    }
    var blank = parsed.filter(function(x){ return !hasAns(q, x.a[i]); }).length;
    dist += '<span class="text-slate-400">Kosong: ' + blank + '</span>';
    items.push({ idx:i, p:p, D:D, lvl:lvl, dist:dist, blank:blank, text:stripHTML(q.q).replace(/\\s+/g,' ').slice(0,90) });
  });

  ADM_VIEW = { rows:rows, stats:st, grades:grades, perKelas:perKelas, items:items, filterLabel:anaFilterLabel(), timestamp:new Date() };

  var optKelas = '<option value="">Semua Kelas</option>' + uniqueKelas.map(function(k){ return '<option value="'+esc(k)+'"'+(ADM_FILTER.anaKelas===k?' selected':'')+'>'+esc(k)+'</option>'; }).join('');
  var optAsal  = '<option value="">Semua Asal</option>'  + uniqueAsal.map(function(k){ return '<option value="'+esc(k)+'"'+(ADM_FILTER.anaAsal===k?' selected':'')+'>'+esc(k)+'</option>'; }).join('');
  var optStatus = '<option value="">Semua Status</option><option value="lulus"'+(ADM_FILTER.anaStatus==='lulus'?' selected':'')+'>Lulus KKM</option><option value="belum"'+(ADM_FILTER.anaStatus==='belum'?' selected':'')+'>Belum Lulus</option>';

  function card(l, v, c, sub){ return '<div class="bg-white border rounded-2xl p-4 shadow-2xs"><div class="text-[10px] uppercase font-bold text-slate-400">'+l+'</div><div class="text-2xl font-black '+(c||'text-slate-800')+' mt-1">'+v+'</div>'+(sub?'<div class="text-[10px] text-slate-400 mt-0.5">'+sub+'</div>':'')+'</div>'; }

  var hist = bins.map(function(b,i){ return '<div class="flex-1 flex flex-col items-center justify-end h-full"><span class="text-[10px] text-slate-500 font-mono">'+b+'</span><div class="w-full bg-indigo-600 rounded-t" style="height:'+Math.round(b/mb*100)+'%;min-height:'+(b?3:0)+'px"></div><span class="text-[10px] text-slate-400 mt-1 font-mono">'+(i*10)+'</span></div>'; }).join('');

  var gradeRows = ['A','B','C','D','E'].map(function(gr){
    var range = gr==='A'?'≥90':gr==='B'?'80-89':gr==='C'?'70-79':gr==='D'?'60-69':'<60';
    var color = gr==='A'?'emerald':gr==='B'?'sky':gr==='C'?'indigo':gr==='D'?'amber':'rose';
    return '<div class="text-center p-3 bg-'+color+'-50 border border-'+color+'-200 rounded-2xl"><div class="text-xl font-black text-'+color+'-700">'+gr+'</div><div class="text-base font-black mt-0.5">'+grades[gr]+'</div><div class="text-[10px] text-slate-400">'+range+'</div></div>';
  }).join('');

  var perKelasRows = perKelas.map(function(k){
    return '<tr class="border-b hover:bg-slate-50"><td class="p-3 font-bold text-slate-900">'+esc(k.kelas)+'</td><td class="p-3 text-center">'+k.n+'</td><td class="p-3 text-center font-bold text-indigo-700">'+k.mean.toFixed(2)+'</td><td class="p-3 text-center">'+k.median.toFixed(1)+'</td><td class="p-3 text-center">'+k.min+'</td><td class="p-3 text-center">'+k.max+'</td><td class="p-3 text-center">'+k.std.toFixed(2)+'</td><td class="p-3 text-center text-emerald-700 font-bold">'+k.pass+'</td><td class="p-3 text-center"><span class="px-2 py-0.5 rounded-full text-[11px] font-bold '+(k.passPct>=50?'bg-emerald-100 text-emerald-800':'bg-rose-100 text-rose-800')+'">'+k.passPct.toFixed(1)+'%</span></td></tr>';
  }).join('');

  var itemRows = items.map(function(it){
    return '<tr class="border-b hover:bg-slate-50"><td class="p-3 text-center font-bold font-mono text-indigo-600">'+(it.idx+1)+'</td><td class="p-3 font-medium text-slate-800">'+esc(it.text)+'</td><td class="p-3 text-center font-bold font-mono">'+Math.round(it.p*100)+'%</td><td class="p-3 text-center"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold '+it.lvl[1]+'">'+it.lvl[0]+'</span></td><td class="p-3 text-center font-mono '+(it.D!==null && it.D<0.2?'text-rose-600 font-bold':'font-semibold')+'">'+(it.D===null?'-':it.D.toFixed(2))+'</td><td class="p-3 text-[11px]">'+it.dist+'</td></tr>';
  }).join('');

  var sRows = ord.map(function(x,i){
    var r = x.r, ok = x.s >= C.kkm;
    return '<tr class="border-b hover:bg-slate-50"><td class="p-3 text-center text-slate-400 font-mono">'+(i+1)+'</td><td class="p-3 font-bold text-slate-900">'+esc(r.name)+'</td><td class="p-3 text-slate-600">'+esc(r.kelas)+'</td><td class="p-3 text-slate-600">'+esc(r.asal||'-')+'</td><td class="p-3 font-black text-indigo-700 font-mono">'+x.s+'</td><td class="p-3 text-center text-emerald-600 font-semibold">'+r.correct+'</td><td class="p-3 text-center text-rose-600 font-semibold">'+r.wrong+'</td><td class="p-3 text-center text-slate-400 font-semibold">'+r.empty+'</td><td class="p-3 text-center '+(Number(r.tabs)>0?'text-rose-600 font-bold':'text-slate-400')+'">'+r.tabs+'</td><td class="p-3 text-center">'+(r.hasp ? '<button onclick="admShowPhoto(&apos;'+esc(r.key)+'&apos;)" class="text-indigo-600 underline font-semibold">Lihat</button>' : '-')+'</td><td class="p-3"><span class="px-2.5 py-1 rounded-full text-[10px] font-bold '+(ok?'bg-emerald-100 text-emerald-800':'bg-rose-100 text-rose-800')+'">'+(ok?'LULUS':'BELUM LULUS')+'</span></td></tr>';
  }).join('');

  document.getElementById('admBody').innerHTML =
    '<div class="bg-white border rounded-2xl p-4 mb-4 shadow-2xs"><div class="text-xs font-bold mb-2 text-slate-700">Filter Data Analisis</div><div class="grid grid-cols-2 md:grid-cols-4 gap-2.5">' +
      '<select onchange="ADM_FILTER.anaKelas=this.value;renderAna()" class="px-3 py-1.5 border rounded-xl text-xs bg-slate-50 font-medium">'+optKelas+'</select>' +
      '<select onchange="ADM_FILTER.anaAsal=this.value;renderAna()" class="px-3 py-1.5 border rounded-xl text-xs bg-slate-50 font-medium">'+optAsal+'</select>' +
      '<select onchange="ADM_FILTER.anaStatus=this.value;renderAna()" class="px-3 py-1.5 border rounded-xl text-xs bg-slate-50 font-medium">'+optStatus+'</select>' +
      '<input value="'+esc(ADM_FILTER.anaQ||'')+'" onchange="ADM_FILTER.anaQ=this.value;renderAna()" placeholder="Cari nama atau kelas..." class="px-3 py-1.5 border rounded-xl text-xs bg-slate-50">' +
    '</div><div class="mt-3 flex flex-wrap items-center gap-2 justify-between border-t pt-3"><span class="text-xs text-slate-500 font-medium">Menampilkan: <b>'+st.n+'</b> Peserta &bull; '+esc(ADM_VIEW.filterLabel)+'</span>' +
      '<div class="flex flex-wrap gap-2">' +
        '<button onclick="loadAna()" class="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 rounded-xl text-xs font-bold transition">Muat Ulang</button>' +
        '<button onclick="admExportExcel()" class="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs">📊 Excel 5 Sheets (.xlsx)</button>' +
        '<button onclick="admExportPDF()" class="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-xs">📄 Laporan PDF Resmi</button>' +
        '<button onclick="admExportCSV()" class="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition">CSV</button>' +
      '</div></div></div>' +
    '<div class="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3 mb-4">' +
      card('Total Peserta', st.n) +
      card('Rata-rata', st.mean.toFixed(2), 'text-indigo-600') +
      card('Median', st.median.toFixed(1)) +
      card('Modus', st.mode.toFixed(1)) +
      card('Standar Deviasi', st.std.toFixed(2)) +
      card('Min / Max', st.min+' / '+st.max) +
      card('Lulus KKM', st.pass, 'text-emerald-600', st.passPct.toFixed(1)+'%') +
      card('Belum Lulus', st.fail, 'text-rose-600', (100-st.passPct).toFixed(1)+'%') +
    '</div>' +
    '<div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">' +
      '<div class="bg-white border rounded-2xl p-5 shadow-2xs"><div class="text-xs font-bold mb-3 text-slate-800">Histogram Sebaran Nilai (Rentang per 10 Poin)</div><div class="flex gap-2 h-36 items-end pb-2">'+hist+'</div></div>' +
      '<div class="bg-white border rounded-2xl p-5 shadow-2xs"><div class="text-xs font-bold mb-3 text-slate-800">Distribusi Kategori Grade (A-E)</div><div class="grid grid-cols-5 gap-2">'+gradeRows+'</div>' +
        '<div class="mt-3 grid grid-cols-4 gap-2 text-[11px] border-t pt-3"><div class="p-2 bg-slate-50 rounded-xl">Q1: <b>'+st.q1.toFixed(1)+'</b></div><div class="p-2 bg-slate-50 rounded-xl">Q3: <b>'+st.q3.toFixed(1)+'</b></div><div class="p-2 bg-slate-50 rounded-xl">IQR: <b>'+st.iqr.toFixed(1)+'</b></div><div class="p-2 bg-slate-50 rounded-xl">Variansi: <b>'+st.variance.toFixed(2)+'</b></div></div></div>' +
    '</div>' +
    '<div class="bg-white border rounded-2xl overflow-hidden shadow-2xs mb-4"><div class="p-4 text-xs font-bold border-b bg-slate-50 text-slate-800">Ringkasan Nilai Komparasi per Kelas</div><table class="w-full text-xs text-left"><thead class="bg-slate-100 uppercase font-bold text-slate-700"><tr><th class="p-3">Kelas</th><th class="p-3 text-center">N</th><th class="p-3 text-center">Rata-rata</th><th class="p-3 text-center">Median</th><th class="p-3 text-center">Min</th><th class="p-3 text-center">Max</th><th class="p-3 text-center">Std Dev</th><th class="p-3 text-center">Lulus</th><th class="p-3 text-center">% Kelulusan</th></tr></thead><tbody>'+perKelasRows+'</tbody></table></div>' +
    '<div class="bg-white border rounded-2xl overflow-hidden shadow-2xs mb-4"><div class="p-4 text-xs font-bold border-b bg-slate-50 text-slate-800 flex justify-between items-center"><span>Analisis Psikometrik Butir Soal (Item Analysis)</span><span class="text-[11px] text-slate-500 font-normal">Daya Beda & Tingkat Kesukaran</span></div><table class="w-full text-xs text-left"><thead class="bg-slate-100 uppercase font-bold text-slate-700"><tr><th class="p-3 w-12 text-center">No</th><th class="p-3">Kutipan Soal</th><th class="p-3 text-center">Proporsi Benar (P)</th><th class="p-3 text-center">Tingkat Kesukaran</th><th class="p-3 text-center">Daya Beda (D)</th><th class="p-3">Sebaran Jawaban Opsi Siswa</th></tr></thead><tbody>'+itemRows+'</tbody></table>' +
      '<p class="p-3 text-[11px] text-slate-500 bg-slate-50 border-t">Keterangan: Tingkat Kesukaran: &ge;70% mudah, 30–70% sedang, &lt;30% sukar. Daya Beda = selisih proporsi benar kelompok atas 27% vs kelompok bawah 27%.</p></div>' +
    '<div class="bg-white border rounded-2xl overflow-hidden shadow-2xs mb-4"><div class="p-4 text-xs font-bold border-b bg-slate-50 text-slate-800">Daftar Peringkat Nilai Seluruh Peserta</div><table class="w-full text-xs text-left"><thead class="bg-slate-100 uppercase font-bold text-slate-700"><tr><th class="p-3 w-12 text-center">#</th><th class="p-3">Nama Siswa</th><th class="p-3">Kelas</th><th class="p-3">Asal Sekolah</th><th class="p-3">Nilai</th><th class="p-3 text-center">Benar</th><th class="p-3 text-center">Salah</th><th class="p-3 text-center">Kosong</th><th class="p-3 text-center">Pindah Tab</th><th class="p-3 text-center">Foto</th><th class="p-3">Status</th></tr></thead><tbody>'+sRows+'</tbody></table></div>' +
    renderAnswerGrid(ord);
  renderMath();
}

function renderAnswerGrid(ord){
  if(!ord.length || !Q.length) return '';
  var qHead = Q.map(function(q, i){
    var cls = q.t === 'ur' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700';
    return '<th class="p-1.5 text-center text-[10px] ' + cls + '" title="' + esc(stripHTML(q.q).slice(0,60)) + '">Q' + (i+1) + '</th>';
  }).join('');

  var bodyRows = ord.map(function(x, i){
    var r = x.r;
    var cells = Q.map(function(q, qi){
      var ans = x.a[qi];
      var given = hasAns(q, ans);
      var sc = scoreQ(q, ans);
      var base = 'p-1.5 text-center text-[10px] font-bold';
      if(q.t === 'ur'){
        return '<td class="' + base + ' ' + (given ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-300') + '" title="Uraian">' + (given ? '●' : '·') + '</td>';
      }
      if(!given) return '<td class="' + base + ' bg-slate-100 text-slate-400">–</td>';
      if(sc >= 1) return '<td class="' + base + ' bg-emerald-500 text-white">✓</td>';
      if(sc > 0) return '<td class="' + base + ' bg-amber-400 text-white">◐</td>';
      return '<td class="' + base + ' bg-rose-500 text-white">✗</td>';
    }).join('');
    return '<tr class="border-b hover:bg-slate-50">' +
      '<td class="p-2 text-center text-slate-400 font-mono text-[10px]">' + (i+1) + '</td>' +
      '<td class="p-2 font-bold text-slate-900 text-xs whitespace-nowrap">' + esc(r.name) + '</td>' +
      '<td class="p-2 text-slate-600 text-xs whitespace-nowrap">' + esc(r.kelas || '-') + '</td>' +
      '<td class="p-2 text-slate-600 text-xs whitespace-nowrap">' + esc(r.asal || '-') + '</td>' +
      '<td class="p-2 font-black text-center text-xs text-indigo-700 font-mono">' + (Number(r.score)||0) + '</td>' +
      cells + '</tr>';
  }).join('');

  return '<div class="bg-white border rounded-2xl overflow-hidden shadow-2xs">' +
    '<div class="p-4 text-xs font-bold border-b bg-slate-50 flex flex-wrap items-center justify-between gap-2">' +
      '<span class="text-slate-800">Matriks Diagnostik Jawaban Siswa per Butir Soal</span>' +
      '<div class="flex flex-wrap gap-2 text-[10px] font-semibold">' +
        '<span class="px-2 py-0.5 bg-emerald-500 text-white rounded-md">✓ Benar</span>' +
        '<span class="px-2 py-0.5 bg-amber-400 text-white rounded-md">◐ Parsial</span>' +
        '<span class="px-2 py-0.5 bg-rose-500 text-white rounded-md">✗ Salah</span>' +
        '<span class="px-2 py-0.5 bg-slate-200 text-slate-600 rounded-md">– Kosong</span>' +
        '<span class="px-2 py-0.5 bg-blue-500 text-white rounded-md">● Uraian</span>' +
      '</div>' +
    '</div>' +
    '<div class="overflow-x-auto">' +
      '<table class="w-full text-xs"><thead class="bg-slate-100 uppercase font-bold text-slate-700 border-b"><tr>' +
        '<th class="p-2 text-[10px] text-center">#</th>' +
        '<th class="p-2 text-left text-[10px]">Nama Siswa</th>' +
        '<th class="p-2 text-left text-[10px]">Kelas</th>' +
        '<th class="p-2 text-left text-[10px]">Asal Sekolah</th>' +
        '<th class="p-2 text-center text-[10px]">Skor</th>' +
        qHead +
      '</tr></thead><tbody>' + bodyRows + '</tbody></table>' +
    '</div>' +
    '<p class="p-3 text-[11px] text-slate-400 bg-slate-50 border-t">Arahkan kursor pada header Q1, Q2, dst. untuk melihat kutipan soal terkait.</p>' +
  '</div>';
}

function admExportCSV(){
  if(!ADM_VIEW){ swalAlert({icon:'warning', title:'Belum Ada Data', text:'Muat analisis terlebih dahulu.'}); return; }
  var v = ADM_VIEW, lines = [['Laporan Hasil Ujian: ' + C.title], ['Filter: ' + v.filterLabel], []];
  lines.push(['STATISTIK RINGKAS']);
  [['Jumlah Peserta', v.stats.n],['Rata-rata', v.stats.mean.toFixed(2)],['Median', v.stats.median.toFixed(2)],['Modus', v.stats.mode.toFixed(2)],
   ['Nilai Min', v.stats.min],['Nilai Max', v.stats.max],['Standar Deviasi', v.stats.std.toFixed(2)],['Variansi', v.stats.variance.toFixed(2)],
   ['Q1', v.stats.q1.toFixed(2)],['Q3', v.stats.q3.toFixed(2)],['Lulus', v.stats.pass],['% Lulus', v.stats.passPct.toFixed(1)+'%']
  ].forEach(function(row){ lines.push(row); });
  lines.push([], ['DAFTAR NILAI PESERTA']);
  lines.push(['No','Nama Siswa','Kelas','Asal Sekolah','Nilai Akhir','Benar','Salah','Kosong','Pindah Tab','Status Kelulusan']);
  v.rows.slice().sort(function(a,b){ return b.score-a.score; }).forEach(function(r,i){
    lines.push([i+1, r.name, r.kelas, r.asal||'', r.score, r.correct, r.wrong, r.empty, r.tabs, Number(r.score)>=C.kkm?'LULUS':'BELUM LULUS']);
  });
  var csv = '\ufeff' + lines.map(function(l){ return l.map(function(x){ return '"' + String(x==null?'':x).replace(/"/g,'""') + '"'; }).join(','); }).join(String.fromCharCode(13, 10));
  var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], {type:'text/csv'}));
  a.download = 'Laporan_CBT_' + (C.title||'Ujian').replace(/[^a-z0-9]/gi,'_') + '_' + new Date().toISOString().slice(0,10) + '.csv'; a.click();
  swalToast('File CSV berhasil diunduh');
}

function admExportExcel(){
  if(!ADM_VIEW){ swalAlert({icon:'warning', title:'Belum Ada Data', text:'Muat analisis terlebih dahulu.'}); return; }
  swalAlert({title:'Menyiapkan Excel...', html:'Memuat pustaka SheetJS...', didOpen:function(){ Swal.showLoading(); }, allowOutsideClick:false, showConfirmButton:false});
  loadLib('https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js').then(function(){
    try{
      var v = ADM_VIEW;
      var wb = XLSX.utils.book_new();
      var s1 = [
        ['LAPORAN LENGKAP HASIL UJIAN CBT'],['Judul Ujian', C.title],['Sekolah', C.school || '-'],['Mata Pelajaran', C.subject || '-'],
        ['KKM', C.kkm],['Filter', v.filterLabel],['Waktu Cetak', v.timestamp.toLocaleString('id-ID')],[],
        ['STATISTIK PSIKOMETRIK & DESKRIPTIF'],['Jumlah Peserta', v.stats.n],['Nilai Rata-rata', Number(v.stats.mean.toFixed(2))],['Median', Number(v.stats.median.toFixed(2))],
        ['Modus', Number(v.stats.mode.toFixed(2))],['Nilai Minimum', v.stats.min],['Nilai Maksimum', v.stats.max],['Rentang (Range)', v.stats.range],
        ['Variansi', Number(v.stats.variance.toFixed(2))],['Standar Deviasi', Number(v.stats.std.toFixed(2))],['Kuartil 1 (Q1)', Number(v.stats.q1.toFixed(2))],
        ['Kuartil 3 (Q3)', Number(v.stats.q3.toFixed(2))],['Jangkauan Interkuartil (IQR)', Number(v.stats.iqr.toFixed(2))],['Jumlah Lulus KKM', v.stats.pass],['Jumlah Belum Lulus', v.stats.fail],
        ['Persentase Kelulusan', Number(v.stats.passPct.toFixed(2)) + '%'],[],['DISTRIBUSI KATEGORI GRADE'],['Grade','Rentang Nilai','Jumlah Siswa'],
        ['A','≥ 90', v.grades.A],['B','80 - 89', v.grades.B],['C','70 - 79', v.grades.C],['D','60 - 69', v.grades.D],['E','< 60', v.grades.E]
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(s1), 'Ringkasan Statistik');
      var s2 = [['No','Nama Siswa','Kelas','Asal Sekolah','Nilai Akhir','Benar','Salah','Kosong','Pindah Tab','Status Kelulusan']];
      v.rows.slice().sort(function(a,b){ return b.score-a.score; }).forEach(function(r,i){
        s2.push([i+1, r.name, r.kelas, r.asal||'', r.score, r.correct, r.wrong, r.empty, r.tabs, Number(r.score)>=C.kkm?'LULUS':'BELUM LULUS']);
      });
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(s2), 'Nilai Peserta');
      var s3 = [['No','Kutipan Soal','Tingkat Kesukaran (P)','Kategori','Daya Beda (D)','Kosong']];
      v.items.forEach(function(it){ s3.push([it.idx+1, it.text, Number(it.p.toFixed(4)), it.lvl[0], it.D===null?'-':Number(it.D.toFixed(3)), it.blank]); });
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(s3), 'Analisis Butir Soal');
      var s4 = [['Kelas','Jumlah Siswa','Rata-rata','Median','Min','Max','Standar Deviasi','Lulus KKM','% Kelulusan']];
      v.perKelas.forEach(function(k){ s4.push([k.kelas, k.n, Number(k.mean.toFixed(2)), Number(k.median.toFixed(2)), k.min, k.max, Number(k.std.toFixed(2)), k.pass, Number(k.passPct.toFixed(2)) + '%']); });
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(s4), 'Per Kelas');
      var s5 = [['#','Nama Siswa','Kelas','Asal Sekolah','Nilai Akhir'].concat(Q.map(function(_, i){ return 'Q' + (i+1); }))];
      v.rows.slice().sort(function(a,b){ return b.score-a.score; }).forEach(function(r, i){
        var ans = {}; try{ ans = JSON.parse(r.answers || '{}'); }catch(e){}
        var row = [i+1, r.name, r.kelas, r.asal||'-', Number(r.score)||0];
        Q.forEach(function(q, qi){
          var a = ans[qi], given = hasAns(q, a), sc = scoreQ(q, a);
          if(q.t === 'ur'){ row.push(given ? '●' : ''); return; }
          if(!given){ row.push(''); return; }
          if(sc >= 1){ row.push('✓'); return; }
          if(sc > 0){ row.push('◐'); return; }
          row.push('✗');
        });
        s5.push(row);
      });
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(s5), 'Matriks Jawaban Butir');
      XLSX.writeFile(wb, 'Laporan_Lengkap_CBT_' + (C.title||'Ujian').replace(/[^a-z0-9]/gi,'_') + '_' + new Date().toISOString().slice(0,10) + '.xlsx');
      Swal.close(); swalToast('Laporan Excel 5 Sheets berhasil diunduh!');
    }catch(e){ Swal.close(); admExportCSV(); }
  }).catch(function(){ Swal.close(); admExportCSV(); });
}

function admExportPDF(){
  if(!ADM_VIEW){ swalAlert({icon:'warning', title:'Belum Ada Data', text:'Muat analisis terlebih dahulu.'}); return; }
  swalAlert({title:'Menyiapkan PDF...', html:'Memuat pustaka jsPDF...', didOpen:function(){ Swal.showLoading(); }, allowOutsideClick:false, showConfirmButton:false});
  loadLib('https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js')
    .then(function(){ if(!window.jspdf || !window.jspdf.jsPDF) throw new Error('jsPDF tidak tersedia'); return loadLib('https://cdn.jsdelivr.net/npm/jspdf-autotable@3.8.2/dist/jspdf.plugin.autotable.min.js'); })
    .then(function(){ return new Promise(function(r){ setTimeout(r, 150); }); })
    .then(function(){
      try{
        var v = ADM_VIEW; var jsPDF = window.jspdf.jsPDF;
        if(typeof jsPDF.API.autoTable !== 'function') throw new Error('Plugin autoTable tidak menempel.');
        var doc = new jsPDF('p', 'mm', 'a4');
        var pw = doc.internal.pageSize.getWidth(); var ph = doc.internal.pageSize.getHeight();
        function tb(opts){ doc.autoTable(opts); return doc.lastAutoTable ? doc.lastAutoTable.finalY : (opts.startY || 20) + 20; }
        function addHeader(title, subtitle){
          doc.setFont('helvetica', 'bold'); doc.setFontSize(14); doc.text(title, pw/2, 14, {align:'center'});
          doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
          doc.text(C.title, pw/2, 20, {align:'center'});
          doc.text('Sekolah: ' + (C.school||'-') + '  |  Mapel: ' + (C.subject||'-') + '  |  KKM: ' + C.kkm, pw/2, 25, {align:'center'});
          doc.text('Filter: ' + v.filterLabel + '  |  Waktu Cetak: ' + v.timestamp.toLocaleString('id-ID'), pw/2, 30, {align:'center'});
        }
        addHeader('LAPORAN HASIL ASESMEN CBT');
        doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.text('Statistik Deskriptif Ujian', 14, 40);
        tb({ startY: 42, head: [['Statistik Parameter','Nilai','Statistik Parameter','Nilai']], body: [
          ['Jumlah Peserta', v.stats.n, 'Nilai Rata-rata', v.stats.mean.toFixed(2)],
          ['Median', v.stats.median.toFixed(2), 'Modus', v.stats.mode.toFixed(2)],
          ['Nilai Minimum', v.stats.min, 'Nilai Maksimum', v.stats.max],
          ['Standar Deviasi', v.stats.std.toFixed(2), 'Variansi', v.stats.variance.toFixed(2)],
          ['Kuartil 1 (Q1)', v.stats.q1.toFixed(2), 'Kuartil 3 (Q3)', v.stats.q3.toFixed(2)],
          ['Jumlah Lulus KKM', v.stats.pass + ' (' + v.stats.passPct.toFixed(1) + '%)', 'Belum Lulus', v.stats.fail + ' (' + (100-v.stats.passPct).toFixed(1) + '%)']
        ], theme:'grid', styles:{fontSize:8, cellPadding:2}, headStyles:{fillColor:[79,70,229], fontSize:8}});
        var y = doc.lastAutoTable.finalY + 6;
        doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.text('Ringkasan Kinerja per Kelas', 14, y);
        tb({ startY: y + 2, head: [['Kelas','Jumlah','Rata-rata','Median','Min','Max','Std Dev','Lulus KKM','% Kelulusan']],
          body: v.perKelas.map(function(k){ return [k.kelas, k.n, k.mean.toFixed(2), k.median.toFixed(2), k.min, k.max, k.std.toFixed(2), k.pass, k.passPct.toFixed(1)+'%']; }),
          theme:'striped', styles:{fontSize:8}, headStyles:{fillColor:[16,185,129], fontSize:8}});
        doc.addPage(); addHeader('DAFTAR PERINGKAT NILAI PESERTA');
        tb({ startY: 40, head: [['#','Nama Siswa','Kelas','Asal Sekolah','Nilai','Benar','Salah','Kosong','Pindah Tab','Status']],
          body: v.rows.slice().sort(function(a,b){ return b.score-a.score; }).map(function(r,i){
            return [i+1, r.name, r.kelas, r.asal||'-', r.score, r.correct, r.wrong, r.empty, r.tabs, Number(r.score)>=C.kkm?'LULUS':'BELUM'];
          }), theme:'striped', styles:{fontSize:7, cellPadding:1.5}, headStyles:{fillColor:[79,70,229], fontSize:7}, columnStyles: { 1: { cellWidth: 45 } }});
        var totalPages = doc.internal.getNumberOfPages();
        for(var pg = 1; pg <= totalPages; pg++){
          doc.setPage(pg); doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
          doc.text('Halaman ' + pg + ' / ' + totalPages, pw - 14, ph - 6, {align: 'right'});
        }
        doc.save('Laporan_CBT_' + (C.title||'Ujian').replace(/[^a-z0-9]/gi,'_') + '_' + new Date().toISOString().slice(0,10) + '.pdf');
        Swal.close(); swalToast('Laporan PDF resmi berhasil diunduh!');
      }catch(e){ Swal.close(); admExportCSV(); }
    })
    .catch(function(err){ Swal.close(); admExportCSV(); });
}

/* ==============================================================
   STUDENT RUNNER & LOGIC
   ============================================================== */
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

  if(srvOn()){
    var payload = {
      id: state.startTime + '-' + state.name,
      key: state.key || '',
      answered: countAnswered(),
      totalQ: Q.length,
      syncToken: C.syncToken || '',
      examTitle: C.title,
      school: C.school,
      subject: C.subject,
      name: state.name,
      kelas: state.kelas,
      asal: state.asal || '',
      startTime: new Date(state.startTime).toLocaleString('id-ID'),
      finishTime: new Date(state.finishTime).toLocaleString('id-ID'),
      duration: C.duration || 0,
      score: state.scoreResult.finalScore || 0,
      correct: state.scoreResult.correct || 0,
      wrong: state.scoreResult.wrong || 0,
      empty: state.scoreResult.empty || 0,
      partial: state.scoreResult.partial || 0,
      manual: state.scoreResult.manual || 0,
      tabSwitches: state.tabSwitches || 0,
      kkm: C.kkm || 0,
      passed: (state.scoreResult.finalScore >= C.kkm) ? 'LULUS' : 'TIDAK LULUS',
      autoSubmitted: !!auto,
      answers: JSON.stringify(state.ans || {}),
      photo: state.photo || ''
    };
    postForm(payload);
  }
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
        '<button onclick="returnToHome()" class="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs transition">Kembali ke Halaman Login</button>' +
      '</div>' +
      '<p class="text-xs text-slate-400">Pengerjaan ulang tidak diperkenankan setelah ujian diselesaikan.</p>' +
    '</div></div>';
  document.getElementById('app').innerHTML = html;
}

function returnToHome(){
  stopCamera();
  try{ localStorage.removeItem(STORAGE_KEY); }catch(e){}
  state = null;
  showLoginPage('Anda telah menyelesaikan ujian ini.');
}

function initCBTApp(){
  try{
    var saved = load();
    if(saved && saved.done){
      if(!saved.scoreResult) saved.scoreResult = { finalScore: 0, correct: 0, wrong: 0, empty: 0 };
      state = saved;
      showResultPage();
    } else if(saved && saved.qOrder && saved.qOrder.length){
      state = saved;
      runExam();
    } else {
      showLoginPage();
    }
  }catch(e){
    console.error(e);
    showLoginPage();
  }
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', initCBTApp);
} else {
  initCBTApp();
}
window.addEventListener('load', function(){
  var a = document.getElementById('app');
  if(a && !a.innerHTML.trim()){
    initCBTApp();
  }
});
<\/script>
</body>
</html>`;
}
