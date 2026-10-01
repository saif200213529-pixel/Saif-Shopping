/* ================= لوحة تحكم الأدمن ================= */
const DB_KEY = "saifshop_db_v1";
const ADM_KEY = "saifshop_admin";

function getDB() { try { return JSON.parse(localStorage.getItem(DB_KEY)); } catch { return null; } }
function saveDB(db) { localStorage.setItem(DB_KEY, JSON.stringify(db)); }
function toast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg; el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2200);
}

/* ===== الدخول ===== */
function adminLogin() {
  const db = getDB();
  const u = document.getElementById("admUser").value.trim();
  const p = document.getElementById("admPass").value;
  if (u === db.settings.adminUser && p === db.settings.adminPass) {
    sessionStorage.setItem(ADM_KEY, "1");
    showPanel();
  } else document.getElementById("admErr").textContent = "⚠️ اسم المستخدم أو كلمة المرور غير صحيحة";
}
function adminLogout() { sessionStorage.removeItem(ADM_KEY); location.reload(); }
function showPanel() {
  document.getElementById("loginCard").style.display = "none";
  document.getElementById("adminPanel").style.display = "block";
  loadSettings(); renderProdTable(); renderCatTable(); fillCatSelect();
}
function showTab(name, btn) {
  document.querySelectorAll(".admin-panel").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".admin-tab").forEach(b => b.classList.remove("active"));
  document.getElementById("tab-" + name).classList.add("active");
  btn.classList.add("active");
}

/* ===== الفئات ===== */
function fillCatSelect() {
  const db = getDB();
  document.getElementById("pCat").innerHTML = '<option value="">اختر الفئة *</option>' +
    db.categories.map(c => `<option value="${c.id}">${c.name.ar}${c.name.en ? " / " + c.name.en : ""}</option>`).join("");
}
function addCategory() {
  const ar = document.getElementById("cNameAr").value.trim();
  const en = document.getElementById("cNameEn").value.trim();
  if (!ar) { toast("⚠️ أدخل اسم الفئة بالعربي"); return; }
  const db = getDB();
  db.categories.push({ id: Date.now(), name: { ar, en: en || ar } });
  saveDB(db);
  document.getElementById("cNameAr").value = ""; document.getElementById("cNameEn").value = "";
  renderCatTable(); fillCatSelect(); toast("✅ تمت إضافة الفئة");
}
function delCategory(id) {
  const db = getDB();
  if (db.products.some(p => p.cat == id)) { toast("⚠️ لا يمكن حذف فئة فيها منتجات — احذف منتجاتها أولاً"); return; }
  db.categories = db.categories.filter(c => c.id != id);
  saveDB(db); renderCatTable(); fillCatSelect(); toast("🗑️ تم حذف الفئة");
}
function renderCatTable() {
  const db = getDB();
  document.getElementById("catTable").innerHTML = db.categories.map(c => {
    const count = db.products.filter(p => p.cat == c.id).length;
    return `<tr><td><b>${c.name.ar}</b>${c.name.en && c.name.en !== c.name.ar ? " / " + c.name.en : ""}</td><td>${count}</td>
      <td><button class="btn-danger" onclick="delCategory(${c.id})">حذف</button></td></tr>`;
  }).join("") || '<tr><td colspan="3" style="text-align:center;color:#7d8a8a">لا توجد فئات</td></tr>';
}

/* ===== المنتجات ===== */
let tempImg = "";
function previewImg(input) {
  const f = input.files[0];
  if (!f) return;
  if (f.size > 2.5 * 1024 * 1024) { toast("⚠️ الصورة كبيرة (الحد الأقصى 2.5MB)"); input.value = ""; return; }
  const r = new FileReader();
  r.onload = e => { tempImg = e.target.result; const pv = document.getElementById("imgPreview"); pv.src = tempImg; pv.style.display = "block"; };
  r.readAsDataURL(f);
}
function addProduct() {
  const ar = document.getElementById("pNameAr").value.trim();
  const en = document.getElementById("pNameEn").value.trim();
  const price = parseFloat(document.getElementById("pPrice").value);
  const cat = document.getElementById("pCat").value;
  if (!ar) { toast("⚠️ أدخل اسم المنتج بالعربي"); return; }
  if (isNaN(price) || price < 0) { toast("⚠️ أدخل سعراً صحيحاً"); return; }
  if (!cat) { toast("⚠️ اختر الفئة"); return; }
  if (!tempImg) { toast("⚠️ أضف صورة للمنتج"); return; }
  const db = getDB();
  db.products.push({ id: Date.now(), name: { ar, en: en || ar }, price, cat: Number(cat), img: tempImg });
  saveDB(db);
  ["pNameAr","pNameEn","pPrice","pImg"].forEach(i => document.getElementById(i).value = "");
  tempImg = ""; document.getElementById("imgPreview").style.display = "none";
  renderProdTable(); toast("✅ تمت إضافة المنتج");
}
function delProduct(id) {
  if (!confirm("حذف هذا المنتج؟")) return;
  const db = getDB();
  db.products = db.products.filter(p => p.id != id);
  saveDB(db); renderProdTable(); toast("🗑️ تم حذف المنتج");
}
function renderProdTable() {
  const db = getDB();
  document.getElementById("prodTable").innerHTML = db.products.map(p => {
    const cat = db.categories.find(c => c.id == p.cat);
    return `<tr><td><img src="${p.img}"></td><td><b>${p.name.ar}</b>${p.name.en && p.name.en !== p.name.ar ? "<br><small style='color:#7d8a8a'>" + p.name.en + "</small>" : ""}</td>
      <td>$${p.price}</td><td>${cat ? cat.name.ar : "—"}</td>
      <td><button class="btn-danger" onclick="delProduct(${p.id})">حذف</button></td></tr>`;
  }).join("") || '<tr><td colspan="5" style="text-align:center;color:#7d8a8a">لا توجد منتجات — أضف أول منتج</td></tr>';
}

/* ===== الإعدادات ===== */
function loadSettings() {
  const s = getDB().settings;
  document.getElementById("sWa").value = s.whatsapp;
  document.getElementById("sInsta").value = s.instagram;
  document.getElementById("sUser").value = s.adminUser;
  document.getElementById("sPass").value = s.adminPass;
}
function saveSettings() {
  const db = getDB();
  db.settings.whatsapp = document.getElementById("sWa").value.replace(/\D/g, "");
  db.settings.instagram = document.getElementById("sInsta").value.trim();
  db.settings.adminUser = document.getElementById("sUser").value.trim() || "admin";
  db.settings.adminPass = document.getElementById("sPass").value || "saif1234";
  saveDB(db); toast("💾 تم حفظ الإعدادات");
}
function exportDB() {
  const blob = new Blob([localStorage.getItem(DB_KEY)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = "saifshop-backup.json"; a.click();
}
function importDB(input) {
  const f = input.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = e => { try { const db = JSON.parse(e.target.result); if (!db.settings) throw 0; saveDB(db); location.reload(); } catch { toast("⚠️ ملف غير صالح"); } };
  r.readAsText(f);
}
function resetAll() {
  if (!confirm("سيتم حذف جميع البيانات والعودة للوضع الافتراضي. متأكد؟")) return;
  localStorage.removeItem(DB_KEY); location.reload();
}

/* ===== تشغيل ===== */
if (sessionStorage.getItem(ADM_KEY) === "1" && getDB()) showPanel();
