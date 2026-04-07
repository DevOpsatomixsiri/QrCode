// ══════════════════════════════════
//  DATABASE
// ══════════════════════════════════
const KEY = 'attendx-pro-v3';
function loadDB() {
  try { return JSON.parse(localStorage.getItem(KEY)) || defDB(); }
  catch(e) { return defDB(); }
}
function defDB() { return { pass: 'teacher123', students: [], sessions: [] }; }
function save() { localStorage.setItem(KEY, JSON.stringify(DB)); }
let DB = loadDB();

// ══════════════════════════════════
//  NAVIGATION
// ══════════════════════════════════
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('on'));
  document.getElementById(id).classList.add('on');
}

function goTab(id, btn) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('on'));
  document.querySelectorAll('.tnav-btn').forEach(b => b.classList.remove('on'));
  document.getElementById(id).classList.add('on');
  if (btn) btn.classList.add('on');
  if (id === 'tab-dash')     renderDash();
  if (id === 'tab-students') renderStudents();
  if (id === 'tab-sessions') renderSessions();
  if (id === 'tab-scan')     initScanTab();
  if (id === 'tab-records')  initRecords();
}

function goTabByName(id) {
  const btn = [...document.querySelectorAll('.tnav-btn')].find(b => b.getAttribute('onclick').includes(id));
  goTab(id, btn);
}

// ══════════════════════════════════
//  TOAST
// ══════════════════════════════════
function toast(msg, type) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast show' + (type ? ' ' + type : '');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.className = 'toast', 3200);
}

// ══════════════════════════════════
//  AUTH
// ══════════════════════════════════
function openTeacherModal() {
  document.getElementById('teacher-modal').classList.add('on');
  document.getElementById('t-pass').value = '';
  document.getElementById('pass-err').style.display = 'none';
  setTimeout(() => document.getElementById('t-pass').focus(), 120);
}
function closeModal() { document.getElementById('teacher-modal').classList.remove('on'); }

function teacherLogin() {
  const p = document.getElementById('t-pass').value;
  if (p === DB.pass) {
    closeModal();
    showPage('pg-teacher');
    renderDash();
  } else {
    document.getElementById('pass-err').style.display = 'block';
    document.getElementById('t-pass').value = '';
    document.getElementById('t-pass').focus();
  }
}

function logout() {
  stopScan();
  showPage('pg-login');
}

// ══════════════════════════════════
//  DASHBOARD
// ══════════════════════════════════
function renderDash() {
  document.getElementById('dash-date').textContent = new Date().toLocaleDateString('en-IN', {
    weekday:'long', year:'numeric', month:'long', day:'numeric'
  });
  const totalScans = DB.sessions.reduce((a, s) => a + s.records.length, 0);
  document.getElementById('st-students').textContent = DB.students.length;
  document.getElementById('st-sessions').textContent = DB.sessions.length;
  document.getElementById('st-scans').textContent = totalScans;

  const ct = document.getElementById('dash-recent');
  const recent = [...DB.sessions].reverse().slice(0, 5);
  if (!recent.length) {
    ct.innerHTML = '<div class="empty"><span class="ei">📅</span><div class="et">Abhi koi session nahi — Sessions tab mein jao</div></div>';
    return;
  }
  ct.innerHTML = recent.map(s => `
    <div class="sess-item">
      <div><div class="si-t">${esc(s.subject)}</div><div class="si-m">📅 ${s.date} &nbsp;·&nbsp; ${s.records.length} students marked</div></div>
      <span class="chip ${s.records.length > 0 ? 'cg' : 'ca'}">${s.records.length} scans</span>
    </div>`).join('');
}

// ══════════════════════════════════
//  STUDENTS
// ══════════════════════════════════
function addStudent() {
  const name  = g('s-name').value.trim();
  const roll  = g('s-roll').value.trim().toUpperCase();
  const dept  = g('s-dept').value.trim();
  const email = g('s-email').value.trim();
  const msg   = g('stu-msg');

  if (!name || !roll) { msg.innerHTML = '<div class="alert a-er">❌ Name aur Roll Number dono required hain</div>'; return; }
  if (DB.students.find(s => s.roll === roll)) { msg.innerHTML = '<div class="alert a-er">⚠️ Yeh roll number pehle se registered hai</div>'; return; }

  DB.students.push({ roll, name, dept, email });
  save();
  msg.innerHTML = `<div class="alert a-ok">✅ ${esc(name)} (${esc(roll)}) successfully registered!</div>`;
  ['s-name','s-roll','s-dept','s-email'].forEach(id => g(id).value = '');
  toast('✅ ' + name + ' added!', 'ok');
  renderStudents();
  renderDash();
}

function renderStudents() {
  const q = (g('stu-srch')?.value || '').toLowerCase();
  const list = DB.students.filter(s =>
    s.roll.toLowerCase().includes(q) ||
    s.name.toLowerCase().includes(q) ||
    (s.dept||'').toLowerCase().includes(q)
  );
  g('stu-c-title').textContent = `All Students (${DB.students.length})`;
  const tb = g('stu-tbody');
  if (!list.length) {
    tb.innerHTML = `<tr><td colspan="6"><div class="empty"><span class="ei">👥</span><div class="et">${DB.students.length ? 'Koi match nahi mila' : 'Abhi koi student registered nahi'}</div></div></td></tr>`;
    return;
  }
  tb.innerHTML = list.map((s, i) => `
    <tr>
      <td class="td-n">${i+1}</td>
      <td class="td-m">${esc(s.roll)}</td>
      <td style="font-weight:600">${esc(s.name)}</td>
      <td style="color:var(--muted);font-size:0.82rem">${esc(s.dept||'—')}</td>
      <td><button class="btn btn-c btn-sm" onclick="showQRModal('${s.roll}')">📱 QR</button></td>
      <td><button class="btn btn-r btn-sm" onclick="removeStu('${s.roll}')">✕</button></td>
    </tr>`).join('');
}

function removeStu(roll) {
  if (!confirm(`Remove ${roll}? Unke attendance records bhi delete honge.`)) return;
  DB.students = DB.students.filter(s => s.roll !== roll);
  save(); renderStudents(); renderDash();
  toast('Student removed', 'er');
}

// ══════════════════════════════════
//  SESSIONS
// ══════════════════════════════════
function createSession() {
  const sub  = g('sess-sub').value.trim();
  const date = g('sess-date').value || today();
  const msg  = g('sess-msg');
  if (!sub) { msg.innerHTML = '<div class="alert a-er">❌ Subject name required hai</div>'; return; }

  const id = 'S' + Date.now().toString(36).toUpperCase();
  DB.sessions.push({ id, subject: sub, date, createdAt: new Date().toISOString(), records: [] });
  save();

  msg.innerHTML = `<div class="alert a-ok">✅ Session created! ID: <strong>${id}</strong><br/>Ab Scan tab mein jao → yeh session select karo → scan start karo</div>`;
  g('sess-sub').value = '';
  toast('Session created: ' + sub, 'ok');
  renderSessions(); renderDash();
}

function renderSessions() {
  g('sess-cnt').textContent = DB.sessions.length + ' sessions';
  const ct = g('sess-list');
  if (!DB.sessions.length) {
    ct.innerHTML = '<div class="empty"><span class="ei">📅</span><div class="et">Koi session nahi — upar se banao</div></div>';
    return;
  }
  ct.innerHTML = [...DB.sessions].reverse().map(s => `
    <div class="sess-item">
      <div>
        <div class="si-t">${esc(s.subject)}</div>
        <div class="si-m">ID: ${s.id} &nbsp;·&nbsp; 📅 ${s.date} &nbsp;·&nbsp; ${s.records.length} scans</div>
      </div>
      <div style="display:flex;gap:7px;flex-wrap:wrap">
        <button class="btn btn-c btn-sm" onclick="openScanFor('${s.id}')">📷 Scan</button>
        <button class="btn btn-ghost btn-sm" onclick="openRecFor('${s.id}')">📋 Records</button>
        <button class="btn btn-r btn-sm" onclick="delSess('${s.id}')">✕</button>
      </div>
    </div>`).join('');
}

function delSess(id) {
  if (!confirm('Delete this session and all records?')) return;
  DB.sessions = DB.sessions.filter(s => s.id !== id);
  save(); renderSessions(); renderDash();
  toast('Session deleted', 'er');
}

function openScanFor(id) {
  goTabByName('tab-scan');
  setTimeout(() => { g('scan-sel').value = id; onSessSelect(); }, 120);
}
function openRecFor(id) {
  goTabByName('tab-records');
  setTimeout(() => { g('rec-filter').value = id; renderRecords(); }, 120);
}

// ══════════════════════════════════
//  SCAN TAB
// ══════════════════════════════════
let stream = null, loop = null;

function initScanTab() {
  const sel = g('scan-sel'), cur = sel.value;
  sel.innerHTML = '<option value="">— Pehle session select karo —</option>' +
    [...DB.sessions].reverse().map(s =>
      `<option value="${s.id}">${esc(s.subject)} (${s.date})</option>`
    ).join('');
  if (cur) sel.value = cur;
  onSessSelect();
}

function onSessSelect() {
  const id = g('scan-sel').value;
  g('scan-area').style.display    = id ? 'block' : 'none';
  g('scan-empty').style.display   = id ? 'none'  : 'block';
  g('scan-progress').style.display = id ? 'block' : 'none';
  if (id) renderProgress(id);
}

function renderProgress(sessId) {
  const sess = DB.sessions.find(s => s.id === sessId);
  if (!sess) return;
  const marked  = new Set(sess.records.map(r => r.roll));
  const present = marked.size, total = DB.students.length;

  g('progress-content').innerHTML = `
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px">
      <span class="chip cg">✅ Present: ${present}</span>
      <span class="chip cr">❌ Absent: ${total - present}</span>
      <span class="chip cc">Total Students: ${total}</span>
    </div>
    ${total === 0
      ? '<div class="alert a-wa">⚠️ Koi student registered nahi — pehle Students tab mein add karo</div>'
      : `<div class="table-wrap">
          <table><thead><tr><th>Roll No</th><th>Name</th><th>Status</th><th>Time</th></tr></thead>
          <tbody>${DB.students.map(s => {
            const r = sess.records.find(x => x.roll === s.roll);
            return `<tr>
              <td class="td-m">${esc(s.roll)}</td>
              <td style="font-weight:500">${esc(s.name)}</td>
              <td><span class="chip ${r ? 'cg' : 'cr'}">${r ? '✅ Present' : '❌ Absent'}</span></td>
              <td style="color:var(--muted);font-size:0.8rem">${r ? r.time : '—'}</td>
            </tr>`;
          }).join('')}</tbody>
          </table>
        </div>`}`;
}

async function startScan() {
  if (location.protocol === 'file:') {
    const ss = g('scan-status');
    ss.innerHTML = `<div style="line-height:2">
      ⚠️ <strong>Camera file:// se nahi chalega!</strong><br/>
      ✅ <strong>Abhi ke liye:</strong> Neeche "QR Image Upload" use karo<br/>
      Student apna QR screenshot WhatsApp pe bheje → Teacher download kare → Upload kare → Done!
    </div>`;
    ss.className = 'alert a-wa';
    return;
  }
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 1280 } }
    });
  } catch(e) {
    const ss = g('scan-status');
    ss.innerHTML = `<div style="line-height:1.9">
      ❌ <strong>Camera permission nahi mili!</strong><br/>
      1️⃣ Address bar mein 🔒 icon tap karo<br/>
      2️⃣ Site Settings → Camera → Allow<br/>
      3️⃣ Page reload → dobara try karo<br/>
      <span style="opacity:.7;font-size:0.78rem">Ya Image Upload use karo (neeche)</span>
    </div>`;
    ss.className = 'alert a-er';
    return;
  }

  const video = g('sv'), box = g('scan-box'), canvas = g('sc'), ctx = canvas.getContext('2d');
  video.srcObject = stream;
  box.style.display = 'block';
  g('scan-start').style.display = 'none';
  g('scan-stop').style.display  = 'inline-flex';
  g('scan-status').innerHTML = '🟢 Camera active — student ka QR dikhao';
  g('scan-status').className = 'alert a-ok';

  video.onloadedmetadata = () => {
    video.play();
    const tick = () => {
      if (!stream) return;
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth; canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        if (typeof jsQR !== 'undefined') {
          const code = jsQR(imgData.data, imgData.width, imgData.height, { inversionAttempts: 'dontInvert' });
          if (code) processScan(code.data);
        }
      }
      loop = requestAnimationFrame(tick);
    };
    loop = requestAnimationFrame(tick);
  };
}

function stopScan() {
  if (loop)   { cancelAnimationFrame(loop); loop = null; }
  if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
  const video = g('sv');
  if (video) video.srcObject = null;
  const box = g('scan-box'), ss = g('scan-status');
  const startB = g('scan-start'), stopB = g('scan-stop');
  if (box)    box.style.display    = 'none';
  if (startB) startB.style.display = 'inline-flex';
  if (stopB)  stopB.style.display  = 'none';
  if (ss) { ss.innerHTML = '📷 Camera se scan karo ya QR image upload karo'; ss.className = 'alert a-in'; }
}

const scanCD = {};
function processScan(raw) {
  const parts = raw.split('|');
  if (parts.length < 3 || parts[0] !== 'ATTENDX') return;
  const roll = parts[1], name = parts[2];

  const now = Date.now();
  if (scanCD[roll] && (now - scanCD[roll]) < 3000) return;
  scanCD[roll] = now;

  const sessId = g('scan-sel').value;
  if (!sessId) { toast('⚠️ Session select karo pehle!', 'er'); return; }

  const sess = DB.sessions.find(s => s.id === sessId);
  const stu  = DB.students.find(s => s.roll === roll);
  const res  = g('scan-result');

  if (!stu) {
    res.innerHTML = `<div class="alert a-er">❌ Roll <strong>${esc(roll)}</strong> registered nahi hai!</div>`;
    toast('⛔ Unregistered: ' + roll, 'er'); return;
  }
  if (sess.records.find(r => r.roll === roll)) {
    res.innerHTML = `<div class="alert a-wa">⚠️ <strong>${esc(stu.name)}</strong> ki attendance is session mein pehle se mark hai!</div>`;
    toast('Already marked: ' + stu.name, ''); return;
  }

  const time = new Date().toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', second:'2-digit' });
  sess.records.push({ roll: stu.roll, name: stu.name, time });
  save();

  res.innerHTML = `<div class="alert a-ok" style="padding:16px 18px">
    <div style="font-size:1rem;font-weight:700;margin-bottom:8px">✅ Attendance Marked!</div>
    <div style="font-size:0.83rem;line-height:2;opacity:.9">
      👤 <strong>${esc(stu.name)}</strong> &nbsp; 🎫 ${esc(stu.roll)}<br/>
      📚 ${esc(sess.subject)} &nbsp; 🕐 ${time}
    </div>
  </div>`;
  toast('✅ ' + stu.name + ' — Present!', 'ok');
  renderProgress(sessId);
  renderDash();
}

function scanUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const res = g('scan-result');
  res.innerHTML = '<div class="alert a-in">⏳ QR scan ho raha hai...</div>';

  const imgURL = URL.createObjectURL(file);
  const img = new Image();

  img.onload = async () => {
    // Method 1: BarcodeDetector (Android Chrome native)
    if ('BarcodeDetector' in window) {
      try {
        const det = new BarcodeDetector({ formats: ['qr_code'] });
        const codes = await det.detect(img);
        if (codes.length > 0) {
          processScan(codes[0].rawValue);
          event.target.value = '';
          return;
        }
      } catch(e) {}
    }

    // Method 2: jsQR via canvas
    try {
      const c = document.createElement('canvas');
      const scale = Math.max(1, 600 / Math.max(img.width, img.height));
      c.width  = img.width  * scale;
      c.height = img.height * scale;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0, c.width, c.height);
      const data = ctx.getImageData(0, 0, c.width, c.height);
      if (typeof jsQR !== 'undefined') {
        const code = jsQR(data.data, data.width, data.height, { inversionAttempts: 'attemptBoth' });
        if (code) {
          processScan(code.data);
          event.target.value = '';
          return;
        }
      }
    } catch(e) {}

    // Not found
    res.innerHTML = `<div class="alert a-er">
      ❌ <strong>QR detect nahi hua!</strong><br/>
      <div style="font-size:0.78rem;margin-top:8px;line-height:1.9;opacity:.85">
        ✅ Check karo:<br/>
        • QR image clear ho, blur nahi<br/>
        • Poora QR frame capture hua ho<br/>
        • Screenshot seedha lo — rotate/crop mat karo<br/>
        • Dobara try karo
      </div>
    </div>`;
  };

  img.onerror = () => {
    res.innerHTML = '<div class="alert a-er">❌ Image load nahi hui</div>';
  };

  img.src = imgURL;
  event.target.value = '';
}

// ══════════════════════════════════
//  RECORDS
// ══════════════════════════════════
function initRecords() {
  const sel = g('rec-filter'), cur = sel.value;
  sel.innerHTML = '<option value="">— All Sessions —</option>' +
    [...DB.sessions].reverse().map(s =>
      `<option value="${s.id}">${esc(s.subject)} (${s.date})</option>`
    ).join('');
  if (cur) sel.value = cur;
  renderRecords();
}

function renderRecords() {
  const filt = g('rec-filter').value;
  const sessions = filt ? DB.sessions.filter(s => s.id === filt) : DB.sessions;
  const all = [];
  sessions.forEach(s => s.records.forEach(r => all.push({ ...r, subject: s.subject, date: s.date })));
  all.reverse();
  g('rec-stats').textContent = all.length + ' records';
  const tb = g('rec-tbody');
  if (!all.length) {
    tb.innerHTML = `<tr><td colspan="6"><div class="empty"><span class="ei">📋</span><div class="et">Koi record nahi</div></div></td></tr>`;
    return;
  }
  tb.innerHTML = all.map((r, i) => `
    <tr>
      <td class="td-n">${i+1}</td>
      <td class="td-m">${esc(r.roll)}</td>
      <td style="font-weight:500">${esc(r.name)}</td>
      <td>${esc(r.subject)}</td>
      <td style="color:var(--muted)">${r.date}</td>
      <td style="color:var(--muted)">${r.time}</td>
    </tr>`).join('');
}

function exportCSV() {
  const filt = g('rec-filter').value;
  const sessions = filt ? DB.sessions.filter(s => s.id === filt) : DB.sessions;
  const all = [];
  sessions.forEach(s => s.records.forEach(r => all.push({ ...r, subject: s.subject, date: s.date })));
  if (!all.length) { toast('No data to export', 'er'); return; }

  const rows = [['Sr','Roll Number','Name','Subject','Date','Time']];
  all.forEach((r,i) => rows.push([i+1, r.roll, r.name, r.subject, r.date, r.time]));
  const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(csv);
  a.download = 'attendance_' + today() + '.csv';
  a.click();
  toast('📥 CSV exported!', 'ok');
}

// ══════════════════════════════════
//  STUDENT VIEW
// ══════════════════════════════════
function lookupStu() {
  const roll = g('s-roll-inp').value.trim().toUpperCase();
  const err  = g('s-err');
  if (!roll) { err.innerHTML = '<div class="alert a-er">❌ Roll number daalo</div>'; return; }
  const stu = DB.students.find(s => s.roll === roll);
  if (!stu) {
    err.innerHTML = '<div class="alert a-er">❌ Yeh roll number registered nahi. Apne teacher se contact karo.</div>';
    return;
  }
  err.innerHTML = '';
  showStudentQR(stu);
}

function showStudentQR(stu) {
  g('sd-name').textContent = stu.name;
  g('sd-roll').textContent = '🎫 ' + stu.roll;
  g('sd-dept').textContent = stu.dept || '';
  const data = 'ATTENDX|' + stu.roll + '|' + stu.name;
  g('s-input').style.display = 'none';
  g('s-qr').style.display    = 'block';
  setTimeout(() => makeQR('sd-canvas', data, 175), 80);
}

function resetStu() {
  g('s-input').style.display = 'block';
  g('s-qr').style.display    = 'none';
  g('s-roll-inp').value      = '';
  g('sd-canvas').innerHTML   = '';
}

function dlQR() {
  const canvas = g('sd-canvas').querySelector('canvas');
  if (!canvas) { toast('QR load ho raha hai, dobara try karo', ''); return; }
  const a = document.createElement('a');
  a.href     = canvas.toDataURL('image/png');
  a.download = 'my_qr_card.png';
  a.click();
  toast('📥 QR Card downloaded!', 'ok');
}

// ══════════════════════════════════
//  SETTINGS
// ══════════════════════════════════
function changePass() {
  const old = g('cp-old').value, nw = g('cp-new').value.trim(), msg = g('cp-msg');
  if (old !== DB.pass) { msg.innerHTML = '<div class="alert a-er">❌ Current password wrong hai</div>'; return; }
  if (nw.length < 4)   { msg.innerHTML = '<div class="alert a-er">❌ Password min 4 characters ka hona chahiye</div>'; return; }
  DB.pass = nw; save();
  msg.innerHTML = '<div class="alert a-ok">✅ Password update ho gaya!</div>';
  g('cp-old').value = ''; g('cp-new').value = '';
  toast('Password updated!', 'ok');
}

function clearAll() {
  if (!confirm('Sab kuch delete ho jaayega — students + sessions + records. Sure?')) return;
  if (!confirm('Last chance! Confirm karo.')) return;
  DB = { pass: DB.pass, students: [], sessions: [] };
  save(); renderDash(); renderStudents(); renderSessions();
  toast('All data cleared', 'er');
}

// ══════════════════════════════════
//  QR MODAL
// ══════════════════════════════════
let _qrModalRoll = null;

function makeQR(containerId, text, size) {
  const el = g(containerId);
  el.innerHTML = '';
  return new QRCode(el, {
    text: text,
    width:  size || 190,
    height: size || 190,
    colorDark:  '#000000',
    colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.M
  });
}

function showQRModal(roll) {
  const stu = DB.students.find(s => s.roll === roll);
  if (!stu) return;
  _qrModalRoll = roll;
  g('qrm-title').textContent = 'QR Card — ' + stu.name;
  g('qrm-name').textContent  = stu.name;
  g('qrm-roll').textContent  = '🎫 ' + stu.roll + (stu.dept ? '  |  ' + stu.dept : '');
  const data = 'ATTENDX|' + stu.roll + '|' + stu.name;
  g('qr-modal').classList.add('on');
  setTimeout(() => makeQR('qrm-canvas', data, 190), 80);

  const waMsg = encodeURIComponent(
    '🎓 AttendX QR Card\n👤 ' + stu.name + '\n🎫 ' + stu.roll +
    '\n\nYeh QR save kar lo — class mein teacher ko dikhana hoga attendance ke liye.'
  );
  g('qrm-wa').onclick = () => window.open('https://wa.me/?text=' + waMsg, '_blank');
}

function closeQRModal() {
  g('qr-modal').classList.remove('on');
  _qrModalRoll = null;
}

function dlStudentQR() {
  const canvas = g('qrm-canvas').querySelector('canvas');
  if (!canvas) { toast('QR load ho raha hai, dobara try karo', ''); return; }
  const a = document.createElement('a');
  a.href     = canvas.toDataURL('image/png');
  a.download = 'qr_' + (_qrModalRoll || 'student') + '.png';
  a.click();
  toast('📥 QR downloaded!', 'ok');
}

// ══════════════════════════════════
//  HELPERS
// ══════════════════════════════════
function g(id)  { return document.getElementById(id); }
function esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function today(){ return new Date().toISOString().split('T')[0]; }

// ── Init ──
window.addEventListener('DOMContentLoaded', () => {
  const d = g('sess-date');
  if (d) d.value = today();
  renderDash();
});
