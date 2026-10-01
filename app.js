/* ================= سيف شوبينج - المتجر ================= */
// إعادة توجيه لصفحة الأدمن إذا فتح الرابط admin-saif-shop
if (location.pathname.toLowerCase().includes("admin-saif-shop")) {
  location.replace("admin-saif-shop/");
}

const DB_KEY = "saifshop_db_v1";
const SESSION_KEY = "saifshop_user";

const DEFAULT_DB = {
  settings: { whatsapp: "962790000000", instagram: "https://instagram.com/", adminUser: "admin", adminPass: "saif1234" },
  categories: [
    { id: 1, name: { ar: "إلكترونيات", en: "Electronics" } },
    { id: 2, name: { ar: "ملابس", en: "Clothes" } },
    { id: 3, name: { ar: "إكسسوارات", en: "Accessories" } }
  ],
  products: [
    { id: 1, name: { ar: "ساعة أبل السلسلة 8", en: "Apple Watch Series 8" }, price: 399, cat: 1, img: "https://placehold.co/400x300/dff5f3/129c9c?text=Watch" },
    { id: 2, name: { ar: "لابتوب احترافي", en: "Pro Laptop" }, price: 899, cat: 1, img: "https://placehold.co/400x300/dff5f3/129c9c?text=Laptop" },
    { id: 3, name: { ar: "هاتف ذكي", en: "Smartphone" }, price: 699, cat: 1, img: "https://placehold.co/400x300/dff5f3/129c9c?text=Phone" },
    { id: 4, name: { ar: "قميص رجالي أنيق", en: "Men's Shirt" }, price: 25, cat: 2, img: "https://placehold.co/400x300/eaf7e0/7ac143?text=Shirt" },
    { id: 5, name: { ar: "حقيبة ظهر عصرية", en: "Modern Backpack" }, price: 35, cat: 3, img: "https://placehold.co/400x300/eaf7e0/7ac143?text=Bag" }
  ],
  users: []
};

function getDB() {
  try { return JSON.parse(localStorage.getItem(DB_KEY)) || structuredClone(DEFAULT_DB); }
  catch { return structuredClone(DEFAULT_DB); }
}
function saveDB(db) { localStorage.setItem(DB_KEY, JSON.stringify(db)); }

/* ============ اللغة ============ */
const I18N = {
  ar: {
    home:"الرئيسية", categories:"الفئات", about:"من نحن", contact:"تواصل معنا",
    search:"ابحث عن منتج...", all:"الكل", slogan_ar:"قمه للصل حبر اللذن وعلى شوبينج",
    slogan_en:"MODERN TRENDS, LIGHT SHOPPING", faq:"الأسئلة الشائعة", privacy:"سياسة الخصوصية",
    contact_us:"تواصل معنا", login:"تسجيل الدخول", signup:"إنشاء حساب", name:"الاسم الكامل",
    phone:"رقم الهاتف", email:"البريد الإلكتروني (Gmail)", cart:"🛒 عربة التسوق",
    total:"المجموع", send_order:"إرسال الطلب عبر واتساب", add_cart:"أضف إلى العربة",
    add_to_cart:"أضف إلى العربة", new:"جديد", empty_cart:"العربة فارغة", logout:"تسجيل الخروج",
    have_acc:"لديك حساب؟ <b>سجل دخول</b>", no_acc:"ليس لديك حساب؟ <b>أنشئ حساب</b>",
    added:"✅ تمت الإضافة إلى العربة", wa_contact:"تواصل معنا واتساب"
  },
  en: {
    home:"HOME", categories:"CATEGORIES", about:"ABOUT US", contact:"CONTACT US",
    search:"Search...", all:"All", slogan_ar:"Top quality, made for shopping",
    slogan_en:"MODERN TRENDS, LIGHT SHOPPING", faq:"FAQ", privacy:"Privacy Policy",
    contact_us:"Contact Us", login:"Login", signup:"Sign Up", name:"Full Name",
    phone:"Phone Number", email:"Email (Gmail)", cart:"🛒 Shopping Cart",
    total:"Total", send_order:"Send Order via WhatsApp", add_cart:"Add to Cart",
    add_to_cart:"ADD TO CART", new:"NEW", empty_cart:"Cart is empty", logout:"Logout",
    have_acc:"Have an account? <b>Login</b>", no_acc:"No account? <b>Sign up</b>",
    added:"✅ Added to cart", wa_contact:"Contact us on WhatsApp"
  }
};
let lang = localStorage.getItem("saifshop_lang") || "ar";

function t(k) { return (I18N[lang] && I18N[lang][k]) || k; }
function applyLang() {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  document.querySelectorAll("[data-i18n]").forEach(el => el.innerHTML = t(el.dataset.i18n));
  document.querySelectorAll("[data-i18n-ph]").forEach(el => el.placeholder = t(el.dataset.i18nPh));
  document.getElementById("langBtn").textContent = lang === "ar" ? "EN" : "عربي";
}
document.getElementById("langBtn").onclick = () => {
  lang = lang === "ar" ? "en" : "ar";
  localStorage.setItem("saifshop_lang", lang);
  applyLang(); renderCats(); renderProducts(); updateCartUI();
};

/* ============ أدوات واتساب ============ */
function waLink(text) {
  const num = getDB().settings.whatsapp.replace(/\D/g, "");
  return "https://wa.me/" + num + "?text=" + encodeURIComponent(text);
}
const WA_SVG = '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2z"/></svg>';

/* ============ عرض الفئات ============ */
let activeCat = "all", searchQ = "";
function renderCats() {
  const db = getDB();
  const bar = document.getElementById("catBar");
  bar.innerHTML = `<button class="cat-chip ${activeCat==='all'?'active':''}" data-cat="all">${t('all')}</button>` +
    db.categories.map(c => `<button class="cat-chip ${activeCat==c.id?'active':''}" data-cat="${c.id}">${c.name[lang]||c.name.ar}</button>`).join("");
  bar.querySelectorAll(".cat-chip").forEach(b => b.onclick = () => { activeCat = b.dataset.cat; renderCats(); renderProducts(); });
}

/* ============ عرض المنتجات ============ */
function renderProducts() {
  const db = getDB();
  const grid = document.getElementById("productsGrid");
  let items = db.products.filter(p =>
    (activeCat === "all" || p.cat == activeCat) &&
    (p.name.ar + p.name.en).toLowerCase().includes(searchQ.toLowerCase())
  );
  if (!items.length) { grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:#7d8a8a;padding:40px">😕 ${lang==='ar'?'لا توجد منتجات':'No products found'}</p>`; return; }
  grid.innerHTML = items.map(p => `
    <div class="card">
      <div class="card-img"><span class="badge">${t('new')}</span><img src="${p.img}" alt="${p.name[lang]}"></div>
      <div class="card-body">
        <div class="card-title">${p.name[lang]||p.name.ar}</div>
        <div class="stars">★★★★★</div>
        <div class="price">$${p.price}</div>
        <a class="btn-wa" href="${waLink(productMsg(p))}" target="_blank">${WA_SVG}<span>${t('wa_contact')}</span></a>
        <button class="btn-cart" onclick="addToCart(${p.id})">${t('add_to_cart')} 🛒</button>
      </div>
    </div>`).join("");
}
function productMsg(p) {
  return lang === "ar"
    ? `مرحباً، أريد شراء هذا المنتج من سيف شوبينج:\n🛍️ ${p.name.ar}\n💰 السعر: $${p.price}\nرابط المنتج: ${location.href}`
    : `Hello, I want to buy this product from Saif Shopping:\n🛍️ ${p.name.en}\n💰 Price: $${p.price}\nLink: ${location.href}`;
}

/* ============ عربة التسوق ============ */
function getCart() { try { return JSON.parse(localStorage.getItem("saifshop_cart")) || []; } catch { return []; } }
function setCart(c) { localStorage.setItem("saifshop_cart", JSON.stringify(c)); updateCartUI(); }
function addToCart(id) {
  const cart = getCart(); cart.push(id); setCart(cart);
  toast(t('added'));
}
function removeFromCart(i) { const c = getCart(); c.splice(i, 1); setCart(c); renderCartModal(); }
function updateCartUI() { document.getElementById("cartCount").textContent = getCart().length; }

function renderCartModal() {
  const db = getDB(), cart = getCart();
  const box = document.getElementById("cartItems");
  let total = 0;
  if (!cart.length) { box.innerHTML = `<p class="empty-cart">${t('empty_cart')}</p>`; document.getElementById("cartWaBtn").style.display = "none"; }
  else {
    box.innerHTML = cart.map((id, i) => {
      const p = db.products.find(x => x.id == id); if (!p) return "";
      total += Number(p.price);
      return `<div class="cart-item"><img src="${p.img}"><div class="ci-info"><b>${p.name[lang]||p.name.ar}</b><br>$${p.price}</div><button onclick="removeFromCart(${i})">✕</button></div>`;
    }).join("");
    document.getElementById("cartWaBtn").style.display = "flex";
  }
  document.getElementById("cartTotal").textContent = total;
  document.getElementById("cartWaBtn").href = waLink(cartMsg(db, cart));
}
function cartMsg(db, cart) {
  const items = cart.map(id => db.products.find(x => x.id == id)).filter(Boolean);
  const total = items.reduce((s, p) => s + Number(p.price), 0);
  const list = items.map((p, i) => `${i+1}. ${p.name.ar} - $${p.price}`).join("\n");
  const user = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  return `🛒 طلب جديد من سيف شوبينج:\n${list}\n━━━━━━━━━━━━\n💰 المجموع: $${total}` +
    (user ? `\n👤 العميل: ${user.name}\n📱 الهاتف: ${user.phone}` : "");
}
document.getElementById("cartBtn").onclick = () => { renderCartModal(); openModal("cartModal"); };

/* ============ تسجيل الدخول / إنشاء حساب ============ */
let authMode = "login";
const FAKE_DOMAINS = ["tempmail.com","10minutemail.com","guerrillamail.com","mailinator.com","yopmail.com","trashmail.com","fakeinbox.com","temp-mail.org","sharklasers.com","getnada.com"];
function setAuthMode(m) {
  authMode = m;
  document.getElementById("authName").style.display = m === "signup" ? "block" : "none";
  document.getElementById("authSubmit").textContent = t(m);
  document.getElementById("switchAuth").innerHTML = t(m === "login" ? "no_acc" : "have_acc");
  document.getElementById("authErr").textContent = "";
}
document.getElementById("switchAuth").onclick = () => setAuthMode(authMode === "login" ? "signup" : "login");
document.getElementById("authSubmit").onclick = () => {
  const err = document.getElementById("authErr");
  const name = document.getElementById("authName").value.trim();
  const phone = document.getElementById("authPhone").value.trim();
  const email = document.getElementById("authEmail").value.trim().toLowerCase();
  err.textContent = "";
  if (!/^\+?[0-9\s\-]{8,15}$/.test(phone)) { err.textContent = lang==='ar'?'⚠️ رقم هاتف غير صالح':'⚠️ Invalid phone number'; return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { err.textContent = lang==='ar'?'⚠️ بريد إلكتروني غير صالح':'⚠️ Invalid email'; return; }
  const domain = email.split("@")[1];
  if (FAKE_DOMAINS.includes(domain)) { err.textContent = lang==='ar'?'⚠️ لا نقبل البريد المؤقت أو الوهمي':'⚠️ Temporary/fake emails not allowed'; return; }
  if (authMode === "signup" && name.length < 2) { err.textContent = lang==='ar'?'⚠️ أدخل الاسم الكامل':'⚠️ Enter your full name'; return; }
  const db = getDB();
  const exist = db.users.find(u => u.phone === phone || u.email === email);
  if (authMode === "signup" && exist) { err.textContent = lang==='ar'?'⚠️ الحساب موجود مسبقاً، سجل دخول':'⚠️ Account exists, please login'; return; }
  let user = exist;
  if (!user) {
    user = { name: name || "Customer", phone, email };
    db.users.push(user); saveDB(db);
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  closeModal("authModal");
  updateLoginBtn(); toast("👋 " + user.name);
};
function updateLoginBtn() {
  const user = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  document.getElementById("loginBtn").textContent = user ? "🚪" : "👤";
  document.getElementById("loginBtn").title = user ? t('logout') : t('login');
}
document.getElementById("loginBtn").onclick = () => {
  if (localStorage.getItem(SESSION_KEY)) { localStorage.removeItem(SESSION_KEY); updateLoginBtn(); toast("👋"); }
  else { setAuthMode("login"); openModal("authModal"); }
};

/* ============ مساعدات ============ */
function openModal(id) { document.getElementById(id).classList.add("open"); }
function closeModal(id) { document.getElementById(id).classList.remove("open"); }
function toast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg; el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2200);
}
document.getElementById("searchInput").oninput = e => { searchQ = e.target.value; renderProducts(); };
document.querySelectorAll(".modal").forEach(m => m.addEventListener("click", e => { if (e.target === m) m.classList.remove("open"); }));

/* ============ التشغيل ============ */
(function init() {
  const db = getDB();
  document.getElementById("floatWa").href = waLink(lang==='ar' ? "مرحباً، لدي استفسار عن منتجات سيف شوبينج" : "Hello, I have a question about Saif Shopping products");
  document.getElementById("instaLink").href = db.settings.instagram;
  applyLang(); setAuthMode("login"); updateLoginBtn(); updateCartUI();
  renderCats(); renderProducts();
})();
