# Shelfie pitch deck

Beamer (metropolis theme), 16:9, ~3 min live pitch, 14 frames.

## Build
```
cd pitch/slides
latexmk -xelatex shelfie.tex     # produces shelfie.pdf
latexmk -c                       # remove aux files (keeps the PDF)
```
Needs `xelatex` (or `lualatex`), `metropolis`, `qrcode`, `tikz`. Fonts: Fira Sans if installed, otherwise Noto Sans.
If `xelatex.fmt` is missing, add `xelatex xetex language.def -translate-file=cp227.tcx *xelatex.ini` to `~/.texlive/texmf-config/web2c/fmtutil.cnf` and run `fmtutil-user --byfmt xelatex`.

## Edit
- **Facts** (names, numbers, tx hashes, explorer URLs, team, closing line): `facts.tex`. Placeholders render as red-on-orange `[...]` boxes via `\ph{...}`; replace the macro body with the real value.
- **Slides**: one file each in `sections/NN-name.tex`, included from `shelfie.tex`. Reorder or drop by editing the `\input` list.
- **Colours**: palette defined at the top of `shelfie.tex` (`cardano`, `warm`, ...).
- QR codes on the proof slide are generated from the `\Url...` macros.
- No dates anywhere (`\date{}` empty).
