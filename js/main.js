// js/main.js
document.addEventListener("DOMContentLoaded", () => {
  // ---- Smooth scroll for in-page links ----
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length > 1) {
        e.preventDefault();
        document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  // ---- Add a soft shadow to header on scroll + nav highlight (scroll spy) ----
  const header = document.querySelector(".site-header");
  const navLinks = document.querySelectorAll(".nav a");
  const sections = [...document.querySelectorAll(".hero, main section")];

  function setActiveLink() {
    const pos = window.scrollY + 120; // offset so header doesn't hide titles
    let current = null;
    for (const s of sections) {
      if (s.offsetTop <= pos) current = s.id || "top";
    }
    navLinks.forEach((a) => {
      const id = a.getAttribute("href").replace("#", "");
      a.classList.toggle("active", id === current);
    });
  }

  // ---- Back-to-top button (create FIRST so it's defined) ----
  let backToTop = document.createElement("button");
  backToTop.id = "toTop";
  backToTop.setAttribute("aria-label", "Back to top");
  backToTop.textContent = "↑";
  Object.assign(backToTop.style, {
    position: "fixed",
    right: "18px",
    bottom: "18px",
    width: "42px",
    height: "42px",
    display: "none",
    placeItems: "center",
    borderRadius: "50%",
    border: "1px solid #e2e2e2",
    background: "#ffffff",
    boxShadow: "0 6px 20px rgba(0,0,0,.12)",
    cursor: "pointer",
    fontSize: "18px",
    zIndex: "9999",
  });
  backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  document.body.appendChild(backToTop);

  function onScroll() {
    header?.classList.toggle("scrolled", window.scrollY > 10);
    setActiveLink();
    // Guard in case styles are overridden or element removed
    if (backToTop) {
      backToTop.style.display = window.scrollY > 600 ? "grid" : "none";
    }
  }

  window.addEventListener("scroll", onScroll);
  setActiveLink();

  // ---- Reveal animations on cards/hero when they enter the viewport ----
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("reveal");
      });
    },
    { threshold: 0.15 }
  );
  document.querySelectorAll(".card, .hero-content").forEach((el) => observer.observe(el));

  // ---- Rotate hero headline every few seconds ----
  const heroH2 = document.querySelector(".hero h2");
  const messages = [
    "Fresh • Fast • Open Late",
    "Halal • Boar’s Head • Made to Order",
    "Gyros • Chopped Cheese • Deli Classics",
  ];
  let msgIdx = 0;
  if (heroH2) {
    setInterval(() => {
      msgIdx = (msgIdx + 1) % messages.length;
      heroH2.style.transition = "opacity .25s";
      heroH2.style.opacity = "0";
      setTimeout(() => {
        heroH2.textContent = messages[msgIdx];
        heroH2.style.opacity = "1";
      }, 250);
    }, 4000);
  }

  // ---- Open/Closed pill + highlight today's hours ----
  // Represent late closing times using "27:00" for 3 AM, "28:00" for 4 AM, etc.
  const hoursMap = {
    Sunday: ["09:00-22:00"],
    Monday: ["09:00-24:00"],
    Tuesday: ["09:00-27:00"],
    Wednesday: ["09:00-24:00"],
    Thursday: ["09:00-24:00"],
    Friday: ["09:00-28:00"],
    Saturday: ["09:00-28:00"],
  };

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  function timeToMin(t) {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + (m || 0);
    // allows "27:00" -> 1620
  }

  function isOpenNow(date = new Date()) {
    const day = dayNames[date.getDay()];
    const now = date.getHours() * 60 + date.getMinutes();
    for (const range of hoursMap[day] || []) {
      const [s, e] = range.split("-");
      const start = timeToMin(s);
      const end = timeToMin(e);
      if (end < 24 * 60) {
        if (now >= start && now < end) return true;
      } else {
        // crosses midnight: open today from start->24:00 and next day 00:00->end-24:00
        if (now >= start && now < 24 * 60) return true; // tonight
        // also consider the case after midnight but before end on the NEXT day
        const prev = (date.getDay() - 1 + 7) % 7;
        const prevDay = dayNames[prev];
        const prevRanges = hoursMap[prevDay] || [];
        for (const pr of prevRanges) {
          const [ps, pe] = pr.split("-");
          const pend = timeToMin(pe);
          if (pend > 24 * 60 && now < pend - 24 * 60) return true;
        }
      }
    }
    return false;
  }

  // Create pill next to the brand
  const brand = document.querySelector(".brand");
  if (brand) {
    const pill = document.createElement("span");
    pill.id = "openStatus";
    const open = isOpenNow();
    pill.textContent = open ? "Open now" : "Closed";
    Object.assign(pill.style, {
      marginLeft: "10px",
      padding: "4px 10px",
      borderRadius: "999px",
      background: open ? "#16a34a" : "#b91c1c",
      color: "#fff",
      fontSize: "12px",
      fontWeight: "600",
      letterSpacing: "0.2px",
    });
    brand.insertAdjacentElement("afterend", pill);
  }

  // Bold the current day's line in the Hours list and append "(today)"
  const hoursItems = document.querySelectorAll(".hours li");
  const order = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const todayName = dayNames[new Date().getDay()];
  const todayIdx = order.indexOf(todayName);
  if (todayIdx > -1 && hoursItems[todayIdx]) {
    const li = hoursItems[todayIdx];
    li.style.fontWeight = "700";
    const firstSpan = li.querySelector("span");
    if (firstSpan && !firstSpan.textContent.toLowerCase().includes("(today)")) {
      firstSpan.textContent = firstSpan.textContent.trimEnd() + " (today) ";
    }
  }
});
