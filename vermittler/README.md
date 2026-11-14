# 📮 Vermittler für den Wunschbriefkasten

Der Vermittler ist ein kleines Programm bei Cloudflare (kostenlos). Er nimmt die Wünsche vom Tablet an
und legt sie als **Issue** in einem privaten GitHub-Repo an. GitHub schickt dir dann eine Benachrichtigung.
Der GitHub-Schlüssel liegt nur beim Vermittler, nie in der App. Nur Tablets mit dem richtigen
Kopplungscode dürfen Wünsche schicken.

```
Tablet ──(Kopplungscode)──▶ Cloudflare-Vermittler ──(GitHub-Schlüssel)──▶ Issue im Repo „sternenstadt-wuensche“
```

Dauer: etwa 15 Minuten, am besten am Computer.

---

## 1. Privates Repo für die Wünsche anlegen

Die Wünsche sollen nicht öffentlich sein (das Spiel-Repo ist öffentlich).

1. https://github.com/new öffnen.
2. Name: **`sternenstadt-wuensche`**
3. **Private** auswählen → **Create repository**.

## 2. GitHub-Schlüssel erzeugen

1. https://github.com/settings/personal-access-tokens/new öffnen
   (GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token).
2. **Token name:** `Sternenstadt-Vermittler`
3. **Expiration:** möglichst lang (z. B. 1 Jahr). Danach einfach einen neuen erzeugen und in Schritt 3 austauschen.
4. **Repository access:** *Only select repositories* → **`sternenstadt-wuensche`**.
5. **Permissions → Repository permissions → Issues:** *Read and write*.
6. **Generate token** → den Schlüssel (beginnt mit `github_pat_`) kopieren. Er wird nur einmal angezeigt.

## 3. Vermittler bei Cloudflare anlegen

1. Kostenloses Konto anlegen: https://dash.cloudflare.com/sign-up
2. Links **Compute (Workers) → Workers & Pages** → **Create** → **Start with Hello World!**
3. Name: **`sternenstadt-vermittler`** → **Deploy**.
4. **Edit code** → den ganzen Inhalt löschen → den Inhalt von [`worker.js`](worker.js) einfügen → **Deploy**.
5. Zurück zum Worker → **Settings → Variables and Secrets** → **Add** (dreimal):

   | Typ    | Name            | Wert |
   |--------|-----------------|------|
   | Secret | `GITHUB_TOKEN`  | der Schlüssel aus Schritt 2 |
   | Secret | `KOPPLUNGSCODE` | ein langer Geheimcode, den du dir ausdenkst (mind. 16 Zeichen) |
   | Text   | `REPO`          | `toni12312/sternenstadt-wuensche` |

   → **Deploy** bzw. **Save**.
6. Oben steht die Adresse des Vermittlers, etwa `https://sternenstadt-vermittler.DEINNAME.workers.dev`.
   Wenn du sie im Browser öffnest, sollte dort „Sternenstadt-Vermittler läuft“ stehen.

## 4. Tablet koppeln (einmal pro Tablet)

1. Sternenstadt öffnen → **💌 Wunschbriefkasten** → ganz unten **🔗 Tablet koppeln**.
2. Adresse aus Schritt 3.6 und den Kopplungscode eintragen → **✅ Prüfen und koppeln**.
3. Fertig. Neue Wünsche werden sofort verschickt (bei den Wünschen steht dann „📨 verschickt“).
   Ohne Internet bleiben sie gespeichert und werden später nachgeschickt.

## 5. Benachrichtigungen

GitHub benachrichtigt dich standardmäßig über neue Issues in deinen eigenen Repos (E-Mail und GitHub-App).
Falls nicht: im Repo `sternenstadt-wuensche` oben auf **Watch → All Activity**.

## Wünsche umsetzen lassen

Im Text-Chat mit Claude: „Setz die offenen Sternenstadt-Wünsche um.“
Claude liest die offenen Issues aus `sternenstadt-wuensche`, baut die Wünsche ein und schließt die Issues danach.

## Wenn etwas nicht geht

- **„Der Kopplungscode stimmt nicht“:** Code in Cloudflare (`KOPPLUNGSCODE`) und auf dem Tablet vergleichen.
- **Wünsche bleiben bei „⏳ wird verschickt“:** Ist der GitHub-Schlüssel abgelaufen? Neuen erzeugen (Schritt 2) und `GITHUB_TOKEN` in Cloudflare ersetzen.
- **Tablet verloren:** einfach einen neuen `KOPPLUNGSCODE` setzen und die übrigen Tablets neu koppeln.
