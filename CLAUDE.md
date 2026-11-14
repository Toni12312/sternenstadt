# Sternenstadt – Hinweise für Änderungen

- **Bei jeder Änderung an `index.html` die Konstante `APP_VERSION` erhöhen** (Format `JJJJ-MM-TT` + Buchstabe, z. B. `2026-11-14b`).
  Die App vergleicht diese Nummer mit der Version auf GitHub Pages und fragt die Kinder dann, ob sie neu starten soll.
  Ohne neue Nummer erscheint kein Update-Hinweis.
- Die erste Zeile mit `const APP_VERSION='…'` in `index.html` wird ausgelesen – sie muss oben im Skript stehen bleiben.
- Werden Symbole oder andere Dateien außer `index.html` geändert, zusätzlich `CACHE` in `sw.js` hochzählen.
