# hi.

Website for **$hi**, a memecoin launching on [pump.fun](https://pump.fun).

Plain HTML, CSS and JavaScript. No build step, no dependencies.

## Launch-day checklist

1. **Add the contract address.** Open `js/main.js` and fill in `CONFIG` at the top:

   ```js
   const CONFIG = {
     ca: "YourMintAddressFromPumpFun...pump",
     x: "https://x.com/yourhandle",
     telegram: "https://t.me/yourgroup",
   };
   ```

   With `ca` set, the site automatically:
   - shows the address with a copy button
   - points every buy button to `https://pump.fun/coin/<ca>`
   - adds a "chart" link to DexScreener
   - shows live market cap and price (from the DexScreener API, refreshed every minute)

   Empty links (`x`, `telegram`) are hidden, so leave one blank if you don't have it yet.

2. **Fix the social preview image.** X and Telegram need a full URL for the link preview.
   Once you know your domain, replace `assets/og.png` in the `og:image` and `twitter:image`
   tags in `index.html` with the full URL, e.g. `https://hicoin.xyz/assets/og.png`.

## Preview locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Deploy

Any static host works. Pick one:

- **Vercel / Netlify / Cloudflare Pages:** import this repo, no build command, output directory is the repo root.
- **Netlify Drop:** drag the folder onto https://app.netlify.com/drop.
- **GitHub Pages:** repo Settings → Pages → deploy from branch, root folder.

## Files

```
index.html            the page
css/style.css         all styles
js/main.js            settings (CONFIG) and the small bits of interaction
assets/logo.svg       the hi. logo as a vector, traced from the original artwork
assets/brand/         original pfp and banner (linked from the footer for the community)
assets/og.png         social preview image
assets/fonts/         DM Sans, self-hosted (SIL Open Font License, see OFL.txt)
```
