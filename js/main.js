/* =========================================================
   hi. — site settings
   Fill these in on launch day. Empty values are hidden.
   ========================================================= */
const CONFIG = {
  // Token mint address from pump.fun (the long string in the coin's URL).
  // While empty, the address box is hidden and buy buttons go to pump.fun.
  ca: "6seKG7Trwo9nyV738v2Dz98VmaJFfPnZ4CPmdos1pump",

  // Full links, e.g. "https://x.com/yourhandle" and "https://t.me/yourgroup".
  x: "",
  telegram: "",
};

/* ========================================================= */

(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const ca = (CONFIG.ca || "").trim();
  const links = {
    buy: ca ? `https://pump.fun/coin/${ca}` : "https://pump.fun",
    chart: ca ? `https://dexscreener.com/solana/${ca}` : "",
    x: (CONFIG.x || "").trim(),
    telegram: (CONFIG.telegram || "").trim(),
  };

  // ---- links: set each [data-link], hide the ones without a url ----
  $$("[data-link]").forEach((a) => {
    const url = links[a.dataset.link];
    if (url) {
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener";
      a.hidden = false;
    } else {
      a.hidden = true;
    }
  });

  // ---- contract address + copy ----
  const caWrap = $("[data-ca-wrap]");
  const caValue = $("[data-ca]");
  const copyBtn = $("[data-copy]");
  const copyStatus = $("[data-copy-status]");

  if (ca && caWrap) {
    caValue.textContent = ca;
    caWrap.hidden = false;

    let resetTimer;
    copyBtn.addEventListener("click", async () => {
      const ok = await copyText(ca);
      copyBtn.textContent = ok ? "copied" : "copy";
      copyStatus.textContent = ok ? "copied. say hi." : "couldn't copy, select it by hand.";
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => {
        copyBtn.textContent = "copy";
        copyStatus.textContent = "";
      }, 1800);
    });
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // older browsers / non-https: fall back to a hidden textarea
      try {
        const t = document.createElement("textarea");
        t.value = text;
        t.setAttribute("readonly", "");
        t.style.position = "fixed";
        t.style.opacity = "0";
        document.body.appendChild(t);
        t.select();
        const ok = document.execCommand("copy");
        t.remove();
        return ok;
      } catch {
        return false;
      }
    }
  }

  // ---- live market cap and price (DexScreener, once the coin exists) ----
  const stats = $("[data-stats]");
  if (ca && stats) {
    const usdCompact = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    });
    const usdPrice = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumSignificantDigits: 3,
    });

    const loadStats = async () => {
      try {
        const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${encodeURIComponent(ca)}`);
        if (!res.ok) return;
        const data = await res.json();
        const pairs = (data.pairs || []).filter(
          (p) => p.chainId === "solana" && p.baseToken && p.baseToken.address === ca
        );
        if (!pairs.length) return;
        // the deepest pool is the most reliable price
        pairs.sort((a, b) => ((b.liquidity && b.liquidity.usd) || 0) - ((a.liquidity && a.liquidity.usd) || 0));
        const pair = pairs[0];
        const mcap = Number(pair.marketCap || pair.fdv);
        const price = Number(pair.priceUsd);
        if (!Number.isFinite(mcap) && !Number.isFinite(price)) return;

        $('[data-stat="mcap"]').textContent = Number.isFinite(mcap) ? usdCompact.format(mcap).toLowerCase() : "—";
        $('[data-stat="price"]').textContent = Number.isFinite(price) ? usdPrice.format(price) : "—";
        stats.hidden = false;
      } catch {
        /* stay hidden if the api is unreachable */
      }
    };

    loadStats();
    setInterval(() => {
      if (!document.hidden) loadStats();
    }, 60000);
  }

  // ---- hello in every language ----
  const track = $("[data-ticker]");
  if (track) {
    const words = [
      "hi", "hola", "bonjour", "ciao", "hallo", "olá", "hej", "merhaba", "salut",
      "ahoj", "cześć", "hei", "aloha", "namaste", "salam", "shalom", "jambo",
      "kia ora", "sawubona", "xin chào", "halo", "kamusta", "sveiki", "tere",
      "szia", "moïen", "dia duit", "sannu", "habari", "yo", "gm",
    ];
    const html = words
      .map((w) => `<span${w === "hi" ? ' class="is-hi"' : ""}>${w}.</span>`)
      .join("");
    // two copies so the loop is seamless
    track.innerHTML = html + html;
  }

  // ---- reveal sections on scroll ----
  const reveals = $$(".reveal");
  if ("IntersectionObserver" in window && !reducedMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  // ---- click anywhere: a small hi. floats up ----
  let pops = 0;
  document.addEventListener("click", (e) => {
    if (e.target.closest("a, button, input, textarea, [data-ca-box]")) return;
    if (pops > 24) return;
    const el = document.createElement("span");
    el.className = "pop";
    el.textContent = "hi.";
    el.setAttribute("aria-hidden", "true");
    el.style.left = `${e.clientX}px`;
    el.style.top = `${e.clientY}px`;
    el.style.setProperty("--size", `${Math.round(18 + Math.random() * 22)}px`);
    document.body.appendChild(el);
    pops++;
    el.addEventListener("animationend", () => {
      el.remove();
      pops--;
    });
  });

  const hint = $("[data-hint]");
  if (hint && window.matchMedia("(pointer: coarse)").matches) hint.textContent = "psst. tap anywhere.";

  // ---- footer year ----
  const year = $("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());
})();
