# VeloraPDF

Client-side PDF toolkit. No uploads — every operation runs in the visitor's
browser using `pdf-lib` (editing) and `pdf.js` (rendering/thumbnails), both
loaded from CDN.

## Structure

```
velora-pdf/
├── index.html        landing page + tool grid
├── merge.html         Merge PDF tool (first live tool)
├── css/style.css      design tokens + shared styles
├── js/merge.js         merge tool logic
└── README.md
```

Each additional tool follows the same pattern: `<tool>.html` + `js/<tool>.js`,
linked from a `.tool-card.live` entry in `index.html`. Copy `merge.html`
as a starting point — the dropzone, file-card, and action-bar styles in
`style.css` are shared across tools.

## Next tools to build (Phase 1 order)

1. ~~Merge PDF~~ ✅ done
2. Split PDF — same thumbnail grid, but per-page instead of per-file, with
   a range input or "extract selected" mode
3. Rotate PDF — reuse the per-page thumbnail grid from Split, add a rotate
   icon per card
4. Organize Pages — merge of Split's per-page grid + delete/reorder
5. Watermark — text/image overlay positioned on a `pdf-lib` page
6. Protect PDF — `pdf-lib`'s `.encrypt()` with a user password
7. Compress — re-encode embedded images at lower quality via `pdf-lib`
8. Sign PDF — canvas signature pad, placed as an embedded PNG
9. Image → PDF / PDF → JPG — `pdf.js` render to canvas + `jsPDF`

## Deployment (matches the VeloraGif setup)

1. Push this folder to a GitHub repo.
2. In Cloudflare Pages, connect the repo — no build command needed, this
   is static HTML/CSS/JS (build output directory: `/`).
3. Attach the domain via **Custom Domains** (not Workers Routes) so DNS
   resolves the same way VeloraGif does.
4. SSL is automatic via Cloudflare once nameservers are set.

## Notes

- `pdf-lib` and `pdf.js` are pulled from `unpkg.com` at runtime. If you'd
  rather self-host them (fully offline, no third-party request), download
  the two files referenced in `merge.html`'s `<script>` tags into
  `js/vendor/` and update the `src` paths.
- Large PDFs (50MB+) can be slow to thumbnail on low-end phones — worth
  adding a file-size warning before that becomes a support question.
- i18n isn't wired up yet. When you port VeloraGif's language switcher
  over, the copy that needs translating lives in `index.html` and
  `merge.html` — no logic changes required.
