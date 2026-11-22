/* סנטושה – סקריפט משותף לכל העמודים */
{
/* ---- חיבור ל-Boostapp: מדביקים כאן את כתובת ה-Apps Script (/exec). ריק = מצב תצוגה, שום דבר לא נשלח. ---- */
const ENDPOINT = "";

/* ---- סדנאות ואירועים: כדי להוסיף אירוע, מעתיקים בלוק ומעדכנים. אירועים שעברו נעלמים לבד.
   sample:true = דוגמה בלבד (מסומנת בעמוד). למחוק לפני העלייה לאוויר. ---- */
const EVENTS = [
  {
    id: "hanukkah-2026",
    sample: true,
    date: "2026-12-11",
    time: "10:30–13:00",
    title: "סדנת חנוכה: גב תחתון ונשימה",
    text: "שעתיים וחצי של עבודה מדויקת עם כיסאות, חגורות ובולסטרים: לשחרר את הגב התחתון, ללמוד לשבת ולעמוד נכון, ולסיים בנשימה ומנוחה עמוקה. מתאים גם למי שלא תרגל מעולם.",
    place: "הסטודיו בקיבוץ דורות",
    price: "150 ₪",
    spots: "עד 12 משתתפים"
  }
];

const MONTHS = ["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"];
const DAYS = ["ראשון","שני","שלישי","רביעי","חמישי","שישי","שבת"];


/* active nav link */
const here = location.pathname.split("/").pop() || "index.html";
document.querySelectorAll(".nav a").forEach(a => {
  if (a.getAttribute("href") === here) a.setAttribute("aria-current", "page");
});

/* ---- מצב הערות: נפתח עם ?review בכתובת, ונשמר לכל הגלישה. לחיצה פותחת ווטסאפ לרועי עם שם העמוד והחלק. ---- */
const REVIEW_PHONE = "972546240255";
let review = false;
try {
  if (new URLSearchParams(location.search).has("review")) sessionStorage.setItem("review", "1");
  review = sessionStorage.getItem("review") === "1";
} catch (e) { review = new URLSearchParams(location.search).has("review"); }
if (review) {
  document.body.classList.add("rv-on");
  const pageName = (document.querySelector(".nav a[aria-current=page]") || {}).textContent || document.title;
  document.querySelectorAll("main > section, footer").forEach(sec => {
    const h = sec.querySelector("h1, h2");
    const part = sec.tagName === "FOOTER" ? "תחתית העמוד" : (h ? h.textContent.trim() : "חלק בעמוד");
    const a = document.createElement("a");
    a.className = "rv-btn";
    a.href = "https://wa.me/" + REVIEW_PHONE + "?text=" + encodeURIComponent("הערה על עמוד " + pageName + " › " + part + ":\n");
    a.target = "_blank"; a.rel = "noopener";
    a.textContent = "💬 הערה";
    sec.appendChild(a);
  });
  const bar = document.createElement("div");
  bar.className = "rv-banner";
  bar.textContent = "מצב הערות: לחצי על 💬 ליד כל חלק כדי לשלוח הערה בווטסאפ. הטפסים עדיין לא מחוברים, ושום פרט לא נשלח מהם.";
  document.body.appendChild(bar);
}

/* events list */
const list = document.getElementById("events");
if (list) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const upcoming = EVENTS
    .filter(e => new Date(e.date + "T00:00:00") >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
  if (!upcoming.length) {
    list.innerHTML = '<div class="empty">כרגע אין סדנה פתוחה להרשמה. השאירו פרטים למטה, ונעדכן ראשונים כשתיפתח הבאה.</div>';
  } else {
    list.innerHTML = upcoming.map(e => {
      const d = new Date(e.date + "T00:00:00");
      return `<article class="event${e.sample ? " sample" : ""}">
        <div class="date"><b>${d.getDate()}</b><span>${MONTHS[d.getMonth()]}</span><span>יום ${DAYS[d.getDay()]}</span></div>
        <div>
          <h3>${e.title}${e.sample ? '<span class="badge">דוגמה</span>' : ""}</h3>
          <p class="meta"><span class="ltr">${e.time}</span> · ${e.place} · ${e.price} · ${e.spots}</p>
          <p>${e.text}</p>
        </div>
        <a class="btn" href="#register" data-event="${e.id}">להרשמה</a>
      </article>`;
    }).join("");
    const sel = document.getElementById("eventPick");
    if (sel) sel.innerHTML += upcoming.map(e => `<option value="${e.id}">${e.title}</option>`).join("");
    list.addEventListener("click", ev => {
      const b = ev.target.closest("[data-event]");
      if (b && sel) sel.value = b.dataset.event;
    });
  }
}

/* preselect a choice from the link, e.g. contact.html#private */
const pick = location.hash.slice(1);
if (pick) {
  const r = document.querySelector(`input[type=radio][data-key="${pick}"]`);
  if (r) r.checked = true;
}

/* forms */
function leadSource() {
  try { return new URLSearchParams(location.search).get("src") || ""; } catch (e) { return ""; }
}
const normPhone = v => (v || "").replace(/\D/g, "").replace(/^972/, "0");

document.querySelectorAll("form[data-form]").forEach(form => {
  const errBox = form.querySelector(".err");
  const btn = form.querySelector("button[type=submit]");
  const label = btn.textContent;
  const done = document.getElementById(form.dataset.done);
  const fail = (msg, field) => { errBox.textContent = msg; errBox.hidden = false; if (field) field.focus(); };

  form.addEventListener("submit", async e => {
    e.preventDefault();
    errBox.hidden = true;
    const f = form.elements;
    const name = f.fullName.value.trim();
    const phone = normPhone(f.phone.value);
    if (name.length < 2) return fail("נא למלא שם מלא.", f.fullName);
    if (!/^05\d{8}$/.test(phone)) return fail("מספר הטלפון לא תקין. נא לכתוב מספר נייד, למשל 050-1234567.", f.phone);
    if (!f.consent.checked) return fail("כדי שרותם תוכל לחזור אליכם, נא לסמן את האישור.", f.consent);

    const kind = form.dataset.form;
    let classPref = "", extra = [];
    if (kind === "trial") {
      const c = form.querySelector("input[name=classPref]:checked");
      classPref = c ? c.value : "";
    } else if (kind === "workshop") {
      const s = f.eventPick;
      classPref = "סדנה: " + (s.value ? s.options[s.selectedIndex].text : "עדכון על סדנאות הבאות");
    } else if (kind === "org") {
      classPref = "סדנה לקבוצה / ארגון";
      extra = ["ארגון: " + f.org.value.trim(), "גודל קבוצה: " + f.size.value];
    }
    const data = {
      fullName: name,
      phone: phone,
      classPref: classPref,
      heardFrom: f.heardFrom ? f.heardFrom.value : "",
      remarks: [...extra, f.remarks ? f.remarks.value.trim() : ""].filter(Boolean).join(" | "),
      source: leadSource(),
      page: location.href,
      sentAt: new Date().toISOString()
    };

    btn.disabled = true; btn.textContent = "שולח...";
    try {
      if (ENDPOINT) {
        await fetch(ENDPOINT, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(data) });
      }
      done.querySelector("h3").textContent = `תודה, ${name.split(" ")[0]}!`;
      form.hidden = true; done.hidden = false;
    } catch (err) {
      fail("השליחה לא הצליחה. נסו שוב, או התקשרו ל-052-4766124.");
    } finally {
      btn.disabled = false; btn.textContent = label;
    }
  });
});
}
