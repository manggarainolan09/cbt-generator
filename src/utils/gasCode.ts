import { ExamConfig } from '../types/cbt';

export function buildGasCode(c: ExamConfig): string {
  function q(v: any): string {
    return String(v == null ? '' : v)
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"');
  }

  return `// ==============================================================
// GOOGLE APPS SCRIPT - CBT SYNC ENDPOINT & MONITORING BACKEND
// Digunakan untuk menampung hasil ujian, monitoring pengawas, dan draft online
// ==============================================================

var SYNC_TOKEN = "${q(c.syncToken)}";
var ADMIN_USER = "${q(c.adminUser || 'pengawas')}";
var ADMIN_PASS = "${q(c.adminPass || 'pengawas2026')}";
var SHEET_NAME = "Hasil Ujian";
var MON_SHEET = "Monitoring";
var DRAFT_SHEET_NAME = "Draft CBT";
var SPREADSHEET_ID = ""; // Kosongkan jika script terpasang langsung di spreadsheet

var HEADERS = [
  "Waktu Masuk", "Judul Ujian", "Sekolah", "Mapel", "Nama Siswa", "Kelas",
  "Waktu Mulai", "Waktu Selesai", "Durasi (menit)", "Nilai", "Benar", "Salah", "Kosong",
  "Parsial", "Manual", "Pelanggaran Tab", "KKM", "Status", "Auto Submit", 
  "Detail Jawaban (JSON)", "ID", "Key", "Catatan", "Asal Sekolah", "Foto"
];

var MON_HEADERS = [
  "Key", "Nama", "Kelas", "Status", "Waktu Login", "Terakhir Aktif", 
  "Terjawab", "Total Soal", "Pelanggaran Tab", "Nilai", "Device", "Sesi"
];

var DRAFT_HEADERS = ["Draft ID", "Nama Draft", "Updated At", "Part", "Total Parts", "JSON Chunk"];
var COL_ID = 21, COL_KEY = 22, COL_NOTE = 23;

function setupDatabase() {
  var ss = getSS_();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  styleSheet_(sheet, HEADERS, [150, 200, 150, 120, 180, 90, 150, 150, 90, 70, 60, 60, 60, 60, 60, 90, 60, 100, 90, 300, 160, 200, 160, 160, 300]);

  var mon = ss.getSheetByName(MON_SHEET) || ss.insertSheet(MON_SHEET);
  styleSheet_(mon, MON_HEADERS, [220, 180, 90, 110, 140, 140, 80, 80, 90, 70, 140, 140]);

  var draft = ss.getSheetByName(DRAFT_SHEET_NAME) || ss.insertSheet(DRAFT_SHEET_NAME);
  styleSheet_(draft, DRAFT_HEADERS, [180, 220, 150, 70, 80, 400]);

  ss.setActiveSheet(sheet);
}

function styleSheet_(sheet, headers, widths) {
  var n = headers.length;
  if (sheet.getMaxColumns() < n) sheet.insertColumnsAfter(sheet.getMaxColumns(), n - sheet.getMaxColumns());
  if (sheet.getMaxRows() < 2) sheet.insertRowsAfter(sheet.getMaxRows(), 1);
  sheet.getRange(1, 1, 1, n).setValues([headers]).setFontWeight("bold").setBackground("#4f46e5").setFontColor("#ffffff");
  sheet.setFrozenRows(1);
  for (var i = 0; i < widths.length; i++) sheet.setColumnWidth(i + 1, widths[i]);
  if (!sheet.getFilter()) sheet.getRange(1, 1, sheet.getMaxRows(), n).createFilter();
}

function getSS_() {
  var ss = SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error("Script tidak terhubung ke spreadsheet.");
  return ss;
}

function getSheet_() {
  var ss = getSS_(), sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) { setupDatabase(); sh = ss.getSheetByName(SHEET_NAME); }
  return sh;
}

function getMon_() {
  var ss = getSS_(), sh = ss.getSheetByName(MON_SHEET);
  if (!sh) { setupDatabase(); sh = ss.getSheetByName(MON_SHEET); }
  return sh;
}

function findRow_(sh, key) {
  if (sh.getLastRow() < 2) return 0;
  var f = sh.getRange(2, 1, sh.getLastRow() - 1, 1).createTextFinder(String(key)).matchEntireCell(true).matchCase(true).findNext();
  return f ? f.getRow() : 0;
}

function adminOk_(u, p) { 
  return !!ADMIN_PASS && String(u) === ADMIN_USER && String(p) === ADMIN_PASS; 
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    var raw = (e.parameter && e.parameter.d) ? e.parameter.d : (e.postData ? e.postData.contents : '{}');
    var data = JSON.parse(raw);
    
    if (SYNC_TOKEN && data.syncToken !== SYNC_TOKEN && data.token !== SYNC_TOKEN) {
      return json_({ status: "forbidden" });
    }

    var sheet = getSheet_();
    if (data.id && sheet.getLastRow() > 1) {
      var ids = sheet.getRange(2, COL_ID, sheet.getLastRow() - 1, 1).getValues();
      for (var i = 0; i < ids.length; i++) {
        if (String(ids[i][0]) === String(data.id)) return json_({ status: "ok", message: "duplicate" });
      }
    }

    var photoCode = data.photo || "";
    sheet.appendRow([
      Utilities.formatDate(new Date(), "Asia/Jakarta", "dd/MM/yyyy HH:mm:ss"),
      data.examTitle || "", data.school || "", data.subject || "",
      data.name || "", data.kelas || "", data.startTime || "", data.finishTime || "",
      data.duration || 0, data.score || 0, data.correct || 0, data.wrong || 0, data.empty || 0,
      data.partial || 0, data.manual || 0, data.tabSwitches || 0, data.kkm || 0, data.passed || "",
      data.autoSubmitted ? "Ya" : "Tidak", data.answers || "", data.id || "", data.key || "", "", data.asal || "", photoCode
    ]);

    markDone_(data);
    return json_({ status: "ok", message: "saved" });
  } catch (err) {
    return json_({ status: "error", message: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

function markDone_(d) {
  if (!d.key) return;
  var sh = getMon_(), r = findRow_(sh, d.key), now = new Date();
  if (r) {
    sh.getRange(r, 4).setValue("Selesai");
    sh.getRange(r, 6, 1, 5).setValues([[now, Number(d.answered) || 0, Number(d.totalQ) || 0, Number(d.tabSwitches) || 0, Number(d.score) || 0]]);
  } else {
    sh.appendRow([d.key, d.name || "", d.kelas || "", "Selesai", now, now, Number(d.answered) || 0, Number(d.totalQ) || 0, Number(d.tabSwitches) || 0, Number(d.score) || 0, "", ""]);
  }
}

function doGet(e) {
  var p = (e && e.parameter) || {};
  try {
    var a = p.action || (p.check ? "check" : (p.ping ? "ping" : "ping")), res;
    if (a === "ping") res = { status: "ok", message: "CBT Sync Endpoint Active", time: new Date() };
    else if (a === "check") res = check_(p);
    else if (a === "login" || a === "hb" || a === "status") {
      if (SYNC_TOKEN && p.token !== SYNC_TOKEN) res = { status: "forbidden" };
      else if (a === "status") res = status_(p);
      else res = (a === "login" ? login_(p) : hb_(p));
    } else if (["auth", "monitor", "results", "reset"].indexOf(a) >= 0) {
      if (!adminOk_(p.u, p.p)) res = { status: "forbidden" };
      else if (a === "auth") res = { status: "ok", auth: true };
      else if (a === "monitor") res = monitor_();
      else if (a === "results") res = results_();
      else res = reset_(p);
    } else {
      res = { status: "error", message: "Aksi tidak dikenal" };
    }
    return out_(res, e);
  } catch (err) {
    return out_({ status: "error", message: String(err) }, e);
  }
}

function check_(p) {
  var sh = getSS_().getSheetByName(SHEET_NAME), found = false;
  if (sh && sh.getLastRow() > 1) {
    found = !!sh.getRange(2, COL_ID, sh.getLastRow() - 1, 1).createTextFinder(String(p.check)).matchEntireCell(true).findNext();
  }
  return { status: "ok", found: found };
}

function login_(p) {
  var sh = getMon_(), r = findRow_(sh, p.key), now = new Date();
  var row = [p.key, p.name || "", p.kelas || "", "Mengerjakan", now, now, 0, Number(p.total) || 0, 0, "", p.device || "", p.sid || ""];
  if (r) {
    var v = sh.getRange(r, 1, 1, 12).getValues()[0];
    if (v[3] === "Selesai") return { status: "ok", allow: false, reason: "done" };
    if (v[3] === "Mengerjakan" && v[10] && v[11] && String(v[10]) !== String(p.device)) {
      return { status: "ok", allow: false, reason: "locked" };
    }
    sh.getRange(r, 1, 1, 12).setValues([row]);
  } else {
    sh.appendRow(row);
  }
  return { status: "ok", allow: true };
}

function hb_(p) {
  var sh = getMon_(), r = findRow_(sh, p.key), now = new Date();
  if (!r) {
    sh.appendRow([p.key, p.name || "", p.kelas || "", "Mengerjakan", now, now, Number(p.answered) || 0, Number(p.total) || 0, Number(p.tabs) || 0, "", p.device || "", p.sid || ""]);
    return { status: "ok", kick: false };
  }
  var v = sh.getRange(r, 1, 1, 12).getValues()[0];
  if (v[3] === "Reset") return { status: "ok", kick: true, reason: "reset" };
  if (v[3] === "Selesai") return { status: "ok", kick: false };
  sh.getRange(r, 6, 1, 4).setValues([[now, Number(p.answered) || 0, Number(p.total) || v[7], Number(p.tabs) || 0]]);
  return { status: "ok", kick: false };
}

function status_(p) {
  var sh = getMon_(), r = findRow_(sh, p.key);
  if (!r) return { status: "ok", st: "none" };
  var v = sh.getRange(r, 1, 1, 12).getValues()[0];
  return { status: "ok", st: String(v[3]), name: String(v[1] || ""), score: v[9] === "" || v[9] == null ? null : Number(v[9]) };
}

function monitor_() {
  var sh = getMon_(), rows = [];
  if (sh.getLastRow() > 1) {
    sh.getRange(2, 1, sh.getLastRow() - 1, 10).getValues().forEach(function(v) {
      rows.push([v[0], v[1], v[2], v[3], v[4] instanceof Date ? v[4].getTime() : 0, v[5] instanceof Date ? v[5].getTime() : 0, v[6], v[7], v[8], v[9]]);
    });
  }
  return { status: "ok", now: new Date().getTime(), rows: rows };
}

function results_() {
  var sh = getSheet_(), out = [];
  if (sh.getLastRow() > 1) {
    sh.getRange(2, 1, sh.getLastRow() - 1, 25).getValues().forEach(function(v) {
      if (v[COL_NOTE - 1]) return;
      out.push({
        key: String(v[COL_KEY - 1] || ""), name: v[4], kelas: v[5], score: v[9], correct: v[10], wrong: v[11],
        empty: v[12], partial: v[13], manual: v[14], tabs: v[15], finish: v[7], auto: v[18], answers: v[19], asal: v[23] || "", hasp: !!v[24]
      });
    });
  }
  return { status: "ok", rows: out };
}

function reset_(p) {
  var sh = getMon_(), r = findRow_(sh, p.key);
  if (!r) return { status: "ok", message: "peserta belum tercatat" };
  var v = sh.getRange(r, 1, 1, 12).getValues()[0];
  if (p.mode === "login") {
    sh.getRange(r, 11, 1, 2).setValues([["", ""]]);
    return { status: "ok", message: "login direset" };
  }
  sh.getRange(r, 4, 1, 9).setValues([["Reset", v[4], new Date(), 0, v[7], 0, "", "", ""]]);
  return { status: "ok", message: "nilai direset" };
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function out_(obj, e) {
  var cb = e && e.parameter && e.parameter.callback;
  if (cb && /^[A-Za-z0-9_$.]+$/.test(cb)) {
    return ContentService.createTextOutput(cb + "(" + JSON.stringify(obj) + ");").setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return json_(obj);
}
`;
}
