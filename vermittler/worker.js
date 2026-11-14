// Sternenstadt – Vermittler für den Wunschbriefkasten (Cloudflare Worker)
//
// Nimmt Wünsche von gekoppelten Tablets entgegen und legt sie als GitHub-Issue an.
// Der GitHub-Schlüssel liegt nur hier im Worker, nie in der App.
//
// Einstellungen im Cloudflare-Dashboard (Settings → Variables and Secrets):
//   GITHUB_TOKEN   (Secret)  Fine-grained Token, nur für das Wunsch-Repo, Recht „Issues: Read and write“
//   KOPPLUNGSCODE  (Secret)  Geheimcode, den du einmal pro Tablet eingibst
//   REPO           (Text)    z. B. toni12312/sternenstadt-wuensche

const ERLAUBTE_SEITEN = ['https://toni12312.github.io'];

export default {
  async fetch(req, env) {
    const origin = req.headers.get('Origin') || '';
    const cors = {
      'Access-Control-Allow-Origin': ERLAUBTE_SEITEN.includes(origin) ? origin : ERLAUBTE_SEITEN[0],
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Kopplung',
      'Vary': 'Origin',
    };
    const antwort = (obj, status = 200) =>
      new Response(JSON.stringify(obj), { status, headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8' } });

    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (req.method !== 'POST') return antwort({ ok: true, info: 'Sternenstadt-Vermittler läuft' });

    if (!env.GITHUB_TOKEN || !env.KOPPLUNGSCODE || !env.REPO) {
      return antwort({ ok: false, fehler: 'Vermittler ist noch nicht fertig eingerichtet' }, 500);
    }
    if (!(await gleich(req.headers.get('X-Kopplung') || '', env.KOPPLUNGSCODE))) {
      return antwort({ ok: false, fehler: 'falscher Kopplungscode' }, 401);
    }

    const pfad = new URL(req.url).pathname;
    if (pfad === '/pruefen') return antwort({ ok: true });
    if (pfad !== '/wunsch') return antwort({ ok: false, fehler: 'unbekannt' }, 404);

    let daten;
    try { daten = await req.json(); } catch (e) { return antwort({ ok: false, fehler: 'ungültige Daten' }, 400); }
    const text = String(daten.text || '').trim().slice(0, 1000);
    const wer = String(daten.who || '').trim().slice(0, 20);
    const id = String(daten.id || '').slice(0, 20);
    if (!text) return antwort({ ok: false, fehler: 'leerer Wunsch' }, 400);

    const kurz = text.replace(/\s+/g, ' ');
    const titel = (wer ? wer + ': ' : '') + (kurz.length > 70 ? kurz.slice(0, 67) + '…' : kurz);
    const datum = new Date(Number(daten.t) || Date.now()).toLocaleString('de-DE', { timeZone: 'Europe/Berlin' });
    const ohneErwaehnung = s => s.replace(/@/g, '@​'); // keine @-Benachrichtigungen auslösen
    const body = [
      `**Wunsch von:** ${ohneErwaehnung(wer) || '(ohne Namen)'}`,
      `**Eingeworfen:** ${datum}`,
      '',
      ohneErwaehnung(text).split('\n').map(z => '> ' + z).join('\n'),
      '',
      `<sub>aus dem Sternenstadt-Wunschbriefkasten · ${id}</sub>`,
    ].join('\n');

    const anlegen = labels => fetch(`https://api.github.com/repos/${env.REPO}/issues`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + env.GITHUB_TOKEN,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'sternenstadt-vermittler',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(labels ? { title: titel, body, labels } : { title: titel, body }),
    });

    let r = await anlegen(['wunsch']);
    if (r.status === 422 || r.status === 403) r = await anlegen(null); // falls das Label nicht angelegt werden darf
    if (!r.ok) return antwort({ ok: false, fehler: 'GitHub hat abgelehnt (' + r.status + ')' }, 502);
    const issue = await r.json();
    return antwort({ ok: true, nummer: issue.number });
  },
};

// Vergleich, der nicht verrät, wie viele Zeichen stimmen
async function gleich(a, b) {
  const enc = new TextEncoder();
  const [x, y] = await Promise.all([a, b].map(s => crypto.subtle.digest('SHA-256', enc.encode(s))));
  const ux = new Uint8Array(x), uy = new Uint8Array(y);
  let diff = 0;
  for (let i = 0; i < ux.length; i++) diff |= ux[i] ^ uy[i];
  return diff === 0;
}
