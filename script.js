// true jika pengguna meminta animasi dikurangi (pengaturan sistem)
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// footer & menu
// tahun otomatis di footer
document.getElementById("tahun").textContent = new Date().getFullYear();

// menu mobile (tombol hamburger)
const toggle = document.querySelector(".nav-toggle");
const menu = document.getElementById("menu");

toggle.addEventListener("click", () => {
  // classList.toggle mengembalikan true jika class "open" sekarang aktif
  const isOpen = menu.classList.toggle("open");
  toggle.setAttribute("aria-expanded", isOpen);
});

// tutup menu otomatis setelah salah satu link diklik
menu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menu.classList.remove("open");
    toggle.setAttribute("aria-expanded", false);
  });
});

// gambar
// fallback: jika file gambar belum ada, tampilkan kotak berwarna + label
document.querySelectorAll(".photo img, .avatar img, .card-thumb img").forEach((img) => {
  const box = img.parentElement;
  const markMissing = () => box.classList.add("missing");

  img.addEventListener("error", markMissing);

  // jaga-jaga kalau error terjadi sebelum script ini jalan
  if (img.complete && img.naturalWidth === 0) {
    markMissing();
  }
});

// =========================================================
// hero: efek mengetik
// =========================================================
const typingEl = document.getElementById("typing-text");
const words = [
  "suka Indomie Ayam Geprek",
  "hobi Cekrak Cekrek",
  "buat aplikasi web",
  "mengajar praktikum",
  "suka Mie Sedap Singaporean Laksa",
];

if (typingEl && !reduceMotion) {
  let wordIndex = 0;  // kata ke berapa
  let charCount = 0;  // sudah berapa huruf yang tampil
  let deleting = false;

  function tick() {
    const word = words[wordIndex];
    typingEl.textContent = word.slice(0, charCount);

    if (!deleting && charCount < word.length) {
      charCount++;                       // menambah huruf
      setTimeout(tick, 90);
    } else if (!deleting) {
      deleting = true;                   // kata selesai, tunggu sebentar
      setTimeout(tick, 1400);
    } else if (charCount > 0) {
      charCount--;                       // menghapus huruf
      setTimeout(tick, 45);
    } else {
      deleting = false;                  // pindah ke kata berikutnya
      wordIndex = (wordIndex + 1) % words.length;
      setTimeout(tick, 300);
    }
  }

  tick();
}

// animasi muncul saat di-scroll + reverse saat scroll naik
// - elemen melewati garis pemicu (88% tinggi layar) saat scroll turun
//   -> class "visible" dipasang -> elemen naik & muncul
// - saat scroll naik dan elemen turun melewati garis itu lagi
//   -> class "visible" dilepas -> elemen turun & memudar (kebalikannya)
// - grup (galeri, proyek, keahlian, kontak): semua anaknya muncul
//   berurutan satu per satu, bukan per baris
// (ingin sekali saja tanpa reverse? hapus bagian "else if" di bawah)
if (!reduceMotion) {
  const groupSelector = ".gallery, .projects, .skill-grid, .contact-list";

  // elemen tunggal: muncul sendiri-sendiri
  const singles = document.querySelectorAll(
    "h2, .section-desc, .about-grid > *, .learning, .timeline-item, .topic-line"
  );

  // grup: anak-anaknya diberi jeda bertingkat (0s, 0.1s, 0.2s, ...)
  const groups = document.querySelectorAll(groupSelector);

  groups.forEach((group) => {
    [...group.children].forEach((child, i) => {
      child.classList.add("reveal");
      child.style.setProperty("--delay", `${(i * 0.1).toFixed(1)}s`);
    });
  });

  singles.forEach((el) => el.classList.add("reveal"));

  // yang diberi class "visible": elemen tunggal itu sendiri, atau semua anak sebuah grup
  const itemsOf = (el) => (el.matches(groupSelector) ? [...el.children] : [el]);
  const setVisible = (el, show) => {
    itemsOf(el).forEach((item) => item.classList.toggle("visible", show));
  };

  // yang diamati: elemen tunggal dan wadah grup
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisible(entry.target, true);
        } else if (entry.boundingClientRect.top > 0) {
          // tidak terlihat DAN posisinya di bawah garis pemicu
          // = pengguna scroll naik melewatinya -> mainkan terbalik
          setVisible(entry.target, false);
        }
        // jika keluar lewat atas layar (scroll turun), biarkan tetap visible
      });
    },
    // -12% = garis pemicu naik 12% dari tepi bawah layar
    { rootMargin: "0px 0px -12% 0px", threshold: 0 }
  );

  [...singles, ...groups].forEach((el) => revealObserver.observe(el));
}

// saat scroll: bar progres, bayangan header, tombol ke atas, hero
const header = document.querySelector(".site-header");
const progress = document.getElementById("progress");
const toTop = document.getElementById("to-top");

const heroSection = document.querySelector(".hero");
const heroText = document.querySelector(".hero-text");
const heroAvatar = document.querySelector(".avatar-wrap");

// hero mengikuti scroll: makin turun, makin bergeser & pudar.
// nilainya dihitung dari posisi scroll, jadi saat scroll naik otomatis terbalik.
function heroScrub(y) {
  if (reduceMotion) return;
  // p = 0 (paling atas) sampai 1 (sudah turun 60% tinggi hero)
  const p = Math.min(Math.max(y / (heroSection.offsetHeight * 0.6), 0), 1);

  heroText.style.translate = `0 ${-60 * p}px`;
  heroText.style.opacity = 1 - 0.85 * p;

  heroAvatar.style.translate = `0 ${-30 * p}px`;
  heroAvatar.style.scale = 1 - 0.1 * p;
  heroAvatar.style.opacity = 1 - 0.6 * p;
}

function onScroll() {
  const y = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

  progress.style.width = (maxScroll > 0 ? (y / maxScroll) * 100 : 0) + "%";
  header.classList.toggle("scrolled", y > 10);
  toTop.classList.toggle("show", y > 500);
  heroScrub(y);
}

window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// menu aktif sesuai section yang sedang dilihat
const navLinks = document.querySelectorAll(".nav a");
const sections = document.querySelectorAll("main section[id]");

const spy = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id);
      });
    });
  },
  { rootMargin: "-45% 0px -50% 0px" } // garis pengamat di tengah layar
);

sections.forEach((section) => spy.observe(section));

// lightbox: klik foto untuk memperbesar
const lightbox = document.getElementById("lightbox");
const lbImg = document.getElementById("lightbox-img");
const lbCaption = document.getElementById("lightbox-caption");
const lbClose = document.getElementById("lightbox-close");
let lastFocus = null;

function openLightbox(photo) {
  const img = photo.querySelector("img");
  const caption = photo.closest("figure").querySelector("figcaption");

  lbImg.src = img.currentSrc || img.src;
  lbImg.alt = img.alt;
  lbCaption.textContent = caption ? caption.textContent : "";

  lastFocus = document.activeElement;
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden"; // kunci scroll halaman
  lbClose.focus();
}

function closeLightbox() {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  if (lastFocus) lastFocus.focus();
}

document.querySelectorAll(".photo").forEach((photo) => {
  // supaya bisa diakses dengan keyboard
  photo.tabIndex = 0;
  photo.setAttribute("role", "button");
  photo.setAttribute("aria-label", "Perbesar foto");

  photo.addEventListener("click", () => {
    if (!photo.classList.contains("missing")) openLightbox(photo);
  });

  photo.addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key === " ") && !photo.classList.contains("missing")) {
      e.preventDefault();
      openLightbox(photo);
    }
  });
});

lbClose.addEventListener("click", closeLightbox);

// klik area gelap di luar foto = tutup
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) closeLightbox();
});

// tombol Esc = tutup
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && lightbox.classList.contains("open")) closeLightbox();
});
