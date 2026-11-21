# Abeceda – prototyp aplikácie na učenie písmen (A–E)

Webová aplikácia (PWA) pre deti vo veku 4–6 rokov. Dopĺňa tlačený zošit: dieťa obťahuje písmená,
počúva, dozvie sa zaujímavosť o zvieratku a naučí sa anglické slovíčko. Na každej strane zošita je
QR kód, ktorý otvorí dané písmeno priamo v aplikácii.

> **Stav:** testovací prototyp – písmená A, B, C, D, E, bez platieb a účtov, zástupné obrázky, syntetický hlas.
> Pracovný názov je v konštante `APP_NAME` v súbore `src/content/letters.ts`.

---

## Obsah

1. [Spustenie na počítači (krok za krokom)](#1-spustenie-na-počítači-krok-za-krokom)
2. [Nasadenie na internet (GitHub Pages / Netlify)](#2-nasadenie-na-internet)
3. [Ako pridať nové písmeno (F–Z)](#3-ako-pridať-nové-písmeno-fz)
4. [Výmena obrázkov a doplnenie MP3 nahrávok](#4-výmena-obrázkov-a-doplnenie-mp3-nahrávok)
5. [Zoznam viet a slov na nahranie](#5-zoznam-viet-a-slov-na-nahranie)
6. [Definície ťahov (na kontrolu odborníkom)](#6-definície-ťahov-na-kontrolu-odborníkom)
7. [QR kódy](#7-qr-kódy)
8. [Štruktúra projektu a dátový model](#8-štruktúra-projektu-a-dátový-model)
9. [Testy](#9-testy)
10. [Rozhodnutia a predpoklady](#10-rozhodnutia-a-predpoklady)

---

## 1. Spustenie na počítači (krok za krokom)

1. Nainštalujte **Node.js** (verzia 20 alebo novšia) zo stránky <https://nodejs.org> – stačí verzia „LTS“.
2. Stiahnite si tento repozitár (na GitHube tlačidlo **Code → Download ZIP**, rozbaľte) alebo ho naklonujte cez `git clone`.
3. Otvorte terminál (Windows: „Príkazový riadok“ alebo „PowerShell“, Mac: „Terminál“) a prejdite do priečinka aplikácie:
   ```bash
   cd ITAPA-PROGRAM-TEST/abeceda
   ```
4. Nainštalujte knižnice (stačí raz):
   ```bash
   npm install
   ```
5. Spustite aplikáciu:
   ```bash
   npm run dev
   ```
6. V prehliadači otvorte adresu, ktorú vypíše terminál (zvyčajne <http://localhost:5173>).

**Vyskúšanie na mobile/tablete v tej istej Wi-Fi sieti:** spustite `npm run dev -- --host` a v mobile otvorte
adresu „Network“, ktorú vypíše terminál (napr. `http://192.168.1.20:5173`). Pozor: funkcia „pridať na plochu“
a offline režim fungujú až na adrese s `https://` (po nasadení, pozri nižšie).

Ďalšie príkazy:

| Príkaz | Čo robí |
| --- | --- |
| `npm run build` | pripraví hotovú verziu do priečinka `dist/` |
| `npm run preview` | spustí hotovú verziu z `dist/` (aj s offline režimom) |
| `npm test` | spustí automatické testy obťahovania |
| `npm run qr` | vygeneruje QR kódy do priečinka `qr/` |
| `npm run nahravky` | vypíše zoznam viet na nahranie |
| `npm run obrazky` | znova vygeneruje zástupné obrázky zvieratiek |

## 2. Nasadenie na internet

### Adresa aplikácie (dôležité kvôli QR kódom)

V súbore `abeceda/.env` je riadok:

```
VITE_BASE_URL=https://nklescikova-sys.github.io/ITAPA-PROGRAM-TEST/abeceda/
```

Nastavte ho na skutočnú adresu, kde bude aplikácia bežať (musí končiť lomkou `/`). Z tejto adresy sa
generujú QR kódy a odvodí sa aj cesta pre build. Po zmene spustite `npm run build` aj `npm run qr`.

### Možnosť A: Netlify (najjednoduchšie, bez nastavovania)

1. Nastavte v `.env` adresu, ktorú vám Netlify pridelí, napr. `VITE_BASE_URL=https://abeceda-test.netlify.app/`.
2. Spustite `npm run build`.
3. Prihláste sa na <https://app.netlify.com/drop> a myšou presuňte priečinok `abeceda/dist` do okna.
4. Netlify vypíše adresu. Ak sa líši od tej v `.env`, opravte `.env`, znova spustite `npm run build` a nahrajte znova.

### Možnosť B: GitHub Pages (automaticky pri každej zmene)

V tomto repozitári je na adrese `…github.io/ITAPA-PROGRAM-TEST/` už stránka programu ITAPA,
preto je aplikácia nastavená na podpriečinok `/abeceda/`. Postup:

1. Na GitHube otvorte **Settings → Pages** a v časti „Build and deployment“ zvoľte **Source: GitHub Actions**.
2. Vytvorte súbor `.github/workflows/pages.yml` (v koreni repozitára) s týmto obsahom:
   ```yaml
   name: Nasadenie na GitHub Pages
   on:
     push:
       branches: [main]
     workflow_dispatch:
   permissions:
     contents: read
     pages: write
     id-token: write
   jobs:
     deploy:
       runs-on: ubuntu-latest
       environment:
         name: github-pages
         url: ${{ steps.deployment.outputs.page_url }}
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: 22
         - run: npm ci
           working-directory: abeceda
         - run: npm run build
           working-directory: abeceda
         # pôvodná stránka ITAPA zostane v koreni, aplikácia pôjde do /abeceda/
         - run: |
             mkdir -p _site
             cp index.html weather-dashboard.html _site/ 2>/dev/null || true
             cp -r abeceda/dist _site/abeceda
         - uses: actions/upload-pages-artifact@v3
           with:
             path: _site
         - id: deployment
           uses: actions/deploy-pages@v4
   ```
3. Po uložení do vetvy `main` sa aplikácia sama nasadí (stav uvidíte v záložke **Actions**).
4. Aplikácia bude na adrese `https://nklescikova-sys.github.io/ITAPA-PROGRAM-TEST/abeceda/`.

### Pridanie na plochu

Na mobile otvorte adresu aplikácie, potom:
- **Android / Chrome:** menu ⋮ → **Pridať na plochu** (alebo „Inštalovať aplikáciu“),
- **iPhone / iPad / Safari:** tlačidlo Zdieľať → **Pridať na plochu**.

Po prvom načítaní aplikácia funguje aj **offline** (v režime lietadlo).

## 3. Ako pridať nové písmeno (F–Z)

Logiku netreba meniť. Upravíte len obsah v priečinku `src/content/`:

1. **`src/content/letters.ts`** – na koniec poľa `LETTERS` pridajte nový objekt podľa vzoru (napr. písmena B):
   `id` (malé písmeno do adresy), `upper`, `lower`, `animal` (názov SK/EN, obrázok, emoji, farba,
   zaujímavosť, miesto na mape), voliteľne `extra` (doplnkové písmeno s diakritikou) a `parentTip`.
2. **`src/content/strokes.ts`** – do objektu `GLYPHS` doplňte ťahy veľkého aj malého písmena
   (a prípadne doplnkového písmena). Pomocné funkcie:
   - `line(x1, y1, x2, y2)` – úsečka v smere ťahu,
   - `arc(cx, cy, rx, ry, odUhla, poUhol)` – oblúk; 0° = vpravo, 90° = dole, −90° = hore;
     rastúci uhol = v smere hodinových ručičiek, klesajúci = proti smeru,
   - `join(...)` – spojí časti do jedného ťahu, `dot(x, y)` – bodka.
   Súradnice: pozri [časť 6](#6-definície-ťahov-na-kontrolu-odborníkom).
3. **`public/images/`** – pridajte obrázok zvieratka (alebo spustite `npm run obrazky` pre zástupný obrázok).
4. Ak zvieratko patrí na nové miesto na mape, doplňte ho do `src/content/map.ts` a do typu `MapPlaceId` v `src/content/types.ts`.
5. Spustite `npm test` – test automaticky skontroluje, že sa každé písmeno dá obtiahnuť podľa definície.
6. Spustite `npm run qr` – vygeneruje sa aj QR kód nového písmena.

## 4. Výmena obrázkov a doplnenie MP3 nahrávok

### Obrázky

Zástupné obrázky sú v `public/images/` (napr. `aligator.svg`). Skutočný obrázok:

- buď uložte **pod rovnakým názvom** (napr. nový `aligator.svg`),
- alebo uložte napr. `aligator.png` a v `src/content/letters.ts` zmeňte `image: 'images/aligator.svg'` na `'images/aligator.png'`.

Odporúčanie: štvorcový obrázok aspoň 512 × 512 px, **priehľadné pozadie** (PNG/WebP/SVG). Na mape sa
z obrázka s priehľadným pozadím vytvorí aj silueta pre ešte nedokončené zvieratko.

### Nahrávky (MP3)

Aplikácia pri každej vete najprv skúsi prehrať MP3 súbor. Ak súbor neexistuje, použije syntetický hlas
prehliadača. Stačí teda nahrávky **len nakopírovať** do priečinkov:

- `public/audio/sk/` – slovenské vety,
- `public/audio/en/` – anglické slová,

s názvami podľa tabuľky v [časti 5](#5-zoznam-viet-a-slov-na-nahranie). Potom spustite `npm run build` a nasaďte.
Ak zmeníte text vety v `src/content/`, aktuálny zoznam vypíše príkaz `npm run nahravky`.

Zvuky zvierat (variant hry „Kto takto robí?“): uložte napr. `public/audio/zvuky/bobor.mp3` a v
`letters.ts` nastavte pri zvieratku `soundPath: 'audio/zvuky/bobor.mp3'`. Bez zvuku sa tento variant preskočí.

## 5. Zoznam viet a slov na nahranie

### Slovensky

| Súbor | Text |
| --- | --- |
| `public/audio/sk/vitaj.mp3` | Ahoj! Vyber si písmenko. |
| `public/audio/sk/vyborne.mp3` | Výborne! |
| `public/audio/sk/skus-este-raz.mp3` | Skús ešte raz. |
| `public/audio/sk/pozri-sa.mp3` | Pozri sa, ako sa to píše. |
| `public/audio/sk/kto-sa-hra.mp3` | Kto sa bude hrať? Ťukni na svoj obrázok. |
| `public/audio/sk/mapa.mp3` | Toto je tvoja mapa. Ťukni na zvieratko. |
| `public/audio/sk/kto-takto-robi.mp3` | Kto takto robí? |
| `public/audio/sk/tukni-na-obrazok.mp3` | Ťukni na obrázok: |
| `public/audio/sk/povedz-to-aj-ty.mp3` | Povedz to aj ty: |
| `public/audio/sk/aligator-uvod.mp3` | A ako aligátor. |
| `public/audio/sk/obtiahni-velke-a.mp3` | Obtiahni veľké písmeno A. |
| `public/audio/sk/obtiahni-male-a.mp3` | Teraz malé písmeno a. |
| `public/audio/sk/otazka-a.mp3` | Ktoré zvieratko začína na A? |
| `public/audio/sk/aligator.mp3` | aligátor |
| `public/audio/sk/aligator-zaujimavost.mp3` | Aligátor má v papuli asi osemdesiat zubov. Keď mu nejaký vypadne, narastie mu nový. |
| `public/audio/sk/aligator-mapa.mp3` | Aligátor sa presťahoval na tvoju mapu! |
| `public/audio/sk/zrieba-ponuka.mp3` | Chceš skúsiť aj Ä ako žriebä? |
| `public/audio/sk/obtiahni-velke-a-dve-bodky.mp3` | Obtiahni veľké písmeno Ä. |
| `public/audio/sk/obtiahni-male-a-dve-bodky.mp3` | Teraz malé písmeno ä. |
| `public/audio/sk/zrieba.mp3` | žriebä |
| `public/audio/sk/zrieba-zaujimavost.mp3` | Žriebä sa postaví na nohy už krátko po narodení. |
| `public/audio/sk/zrieba-mapa.mp3` | Žriebä sa presťahovalo na tvoju mapu! |
| `public/audio/sk/bobor-uvod.mp3` | B ako bobor. |
| `public/audio/sk/obtiahni-velke-b.mp3` | Obtiahni veľké písmeno B. |
| `public/audio/sk/obtiahni-male-b.mp3` | Teraz malé písmeno b. |
| `public/audio/sk/otazka-b.mp3` | Ktoré zvieratko začína na B? |
| `public/audio/sk/bobor.mp3` | bobor |
| `public/audio/sk/bobor-zaujimavost.mp3` | Bobor má oranžové zuby, ktoré mu rastú celý život. Obrusuje si ich tým, že hryzie stromy. |
| `public/audio/sk/bobor-mapa.mp3` | Bobor sa presťahoval na tvoju mapu! |
| `public/audio/sk/cvrcek-uvod.mp3` | C ako cvrček. |
| `public/audio/sk/obtiahni-velke-c.mp3` | Obtiahni veľké písmeno C. |
| `public/audio/sk/obtiahni-male-c.mp3` | Teraz malé písmeno c. |
| `public/audio/sk/otazka-c.mp3` | Ktoré zvieratko začína na C? |
| `public/audio/sk/cvrcek.mp3` | cvrček |
| `public/audio/sk/cvrcek-zaujimavost.mp3` | Cvrček cvrliká tak, že si šúcha krídla o seba. A uši má na predných nohách! |
| `public/audio/sk/cvrcek-mapa.mp3` | Cvrček sa presťahoval na tvoju mapu! |
| `public/audio/sk/cmeliak-ponuka.mp3` | Chceš skúsiť aj Č ako čmeliak? |
| `public/audio/sk/obtiahni-velke-c-makcen.mp3` | Obtiahni veľké písmeno Č. |
| `public/audio/sk/obtiahni-male-c-makcen.mp3` | Teraz malé písmeno č. |
| `public/audio/sk/cmeliak.mp3` | čmeliak |
| `public/audio/sk/cmeliak-zaujimavost.mp3` | Čmeliak má chlpaté telíčko, preto mu nie je zima ani v chladnom počasí. |
| `public/audio/sk/cmeliak-mapa.mp3` | Čmeliak sa presťahoval na tvoju mapu! |
| `public/audio/sk/delfin-uvod.mp3` | D ako delfín. |
| `public/audio/sk/obtiahni-velke-d.mp3` | Obtiahni veľké písmeno D. |
| `public/audio/sk/obtiahni-male-d.mp3` | Teraz malé písmeno d. |
| `public/audio/sk/otazka-d.mp3` | Ktoré zvieratko začína na D? |
| `public/audio/sk/delfin.mp3` | delfín |
| `public/audio/sk/delfin-zaujimavost.mp3` | Keď delfín spí, odpočíva mu len polovica mozgu. Druhá polovica dáva pozor. |
| `public/audio/sk/delfin-mapa.mp3` | Delfín sa presťahoval na tvoju mapu! |
| `public/audio/sk/datel-ponuka.mp3` | Chceš skúsiť aj Ď ako ďateľ? |
| `public/audio/sk/obtiahni-velke-d-makcen.mp3` | Obtiahni veľké písmeno Ď. |
| `public/audio/sk/obtiahni-male-d-makcen.mp3` | Teraz malé písmeno ď. |
| `public/audio/sk/datel.mp3` | ďateľ |
| `public/audio/sk/datel-zaujimavost.mp3` | Ďateľ bubnuje zobákom do stromov a hľadá v kôre chrobáky. |
| `public/audio/sk/datel-mapa.mp3` | Ďateľ sa presťahoval na tvoju mapu! |
| `public/audio/sk/emu-uvod.mp3` | E ako emu. |
| `public/audio/sk/obtiahni-velke-e.mp3` | Obtiahni veľké písmeno E. |
| `public/audio/sk/obtiahni-male-e.mp3` | Teraz malé písmeno e. |
| `public/audio/sk/otazka-e.mp3` | Ktoré zvieratko začína na E? |
| `public/audio/sk/emu.mp3` | emu |
| `public/audio/sk/emu-zaujimavost.mp3` | Emu nevie lietať, ale veľmi rýchlo behá. Na vajíčkach sedí ocko emu. |
| `public/audio/sk/emu-mapa.mp3` | Emu sa presťahoval na tvoju mapu! |

### Anglicky

| Súbor | Slovo |
| --- | --- |
| `public/audio/en/aligator.mp3` | alligator |
| `public/audio/en/zrieba.mp3` | foal |
| `public/audio/en/bobor.mp3` | beaver |
| `public/audio/en/cvrcek.mp3` | cricket |
| `public/audio/en/cmeliak.mp3` | bumblebee |
| `public/audio/en/delfin.mp3` | dolphin |
| `public/audio/en/datel.mp3` | woodpecker |
| `public/audio/en/emu.mp3` | emu |

## 6. Definície ťahov (na kontrolu odborníkom)

Definície sú v súbore `src/content/strokes.ts`. Písmená sú **tlačené**, ťahy idú **zhora nadol a zľava doprava**,
oblúky malých písmen a, c, d, e idú **proti smeru hodinových ručičiek**.

Súradnice štvorlinajky (os y smeruje nadol): horná linka y = 20, stredná y = 50, základná y = 80,
spodná y = 105. Veľké písmeno má výšku 60 (od 20 po 80), malé písmeno 30 (od 50 po 80), dlhé ťahy b, d
siahajú po hornú linku.

| Písmeno | Poradie a smer ťahov |
| --- | --- |
| **A** | 1. ľavá šikmá čiara od vrcholu dole doľava · 2. pravá šikmá čiara od vrcholu dole doprava · 3. vodorovná priečka zľava doprava |
| **B** | 1. zvislá čiara zhora nadol · 2. horné bruško: zhora doprava, oblúk v smere hodinových ručičiek k stredu · 3. dolné bruško: od stredu doprava, oblúk v smere hodinových ručičiek k základnej linke |
| **C** | 1. jeden oblúk proti smeru hodinových ručičiek, začína vpravo hore, končí vpravo dole |
| **D** | 1. zvislá čiara zhora nadol · 2. zhora doprava veľký oblúk v smere hodinových ručičiek späť dole k zvislej čiare |
| **E** | 1. zvislá čiara zhora nadol · 2. horná vodorovná · 3. stredná vodorovná (kratšia) · 4. dolná vodorovná – všetky zľava doprava |
| **a** | 1. krúžok proti smeru hodinových ručičiek, začína vpravo hore · 2. zvislá čiara vpravo zhora nadol (od strednej po základnú linku) |
| **b** | 1. dlhá zvislá čiara zhora nadol (od hornej linky) · 2. bruško v smere hodinových ručičiek, začína pri zvislej čiare |
| **c** | 1. oblúk proti smeru hodinových ručičiek, začína vpravo hore |
| **d** | 1. krúžok proti smeru hodinových ručičiek, začína vpravo hore · 2. dlhá zvislá čiara vpravo zhora nadol (od hornej linky) |
| **e** | 1. jeden ťah: vodorovná čiara zľava doprava v polovici výšky, plynule pokračuje oblúkom proti smeru hodinových ručičiek |
| **Ä / ä** | ako A / a, potom 3. (resp. 4.) ľavá bodka a ďalšia pravá bodka (ťuknutím) |
| **Č / č** | ako C / c, potom mäkčeň: zľava dole do stredu a hore doprava (jeden ťah) |
| **Ď** | ako D, potom mäkčeň ako pri Č |
| **ď** | ako d, potom krátka čiarka vpravo hore zhora nadol |

> Poznámka pre kontrolu: pri **b** sme zvolili bruško v smere hodinových ručičiek (prirodzene nadväzuje na zvislú čiaru).
> Pri **B** a **D** sú bruška samostatné ťahy začínajúce na hornej linke. Ak sa v škôlkach učí inak, stačí upraviť `strokes.ts`.

### Ako funguje vyhodnotenie

- Pozdĺž každého ťahu sú **kontrolné body** každé 4 jednotky.
- Ťah je splnený, keď prst prejde všetkými kontrolnými bodmi **v správnom poradí** a v rámci tolerančnej zóny.
- Ťah musí začať pri **začiatočnej bodke**. Inak sa nezapočíta a bodka jemne zabliká.
- **Tolerancia** (polomer zóny okolo čiary) podľa nastavenia: Ľahká 12 %, Stredná 8 %, Ťažká 5 % výšky veľkého písmena.
- **Vybočenie:** mimo zóny sa nič nezapočítava, ale ťah sa nezruší. Po návrate do zóny dieťa pokračuje.
  Ťah sa resetuje až po zdvihnutí prsta pred dokončením.
- **Ochrana proti čmáraniu:** body sa počítajú iba v poradí. Opačný smer ani skákanie preto neprejdú.
  Navyše ak prst prejde viac ako 3× dĺžku čiary (+ rezerva), ťah sa už nezapočíta.
- **3 neúspechy po sebe** pri jednom písmene: automaticky sa prehrá ukážka a tolerancia sa zväčší 1,5×
  (do konca daného písmena). Počet automatických ukážok vidí rodič v prehľade.

## 7. QR kódy

```bash
npm run qr
```

Vygeneruje `qr/qr-a.svg`, `qr/qr-a.png` … `qr/qr-e.png` podľa `VITE_BASE_URL` v `.env`.
Každý kód vedie na adresu typu `…/#/pismeno/a` a otvorí priamo dané písmeno (pri viacerých profiloch sa
najprv zobrazí výber dieťaťa). QR kódy sa dajú stiahnuť aj v aplikácii v časti **Pre rodičov → QR kódy**.

> Kódy v priečinku `qr/` sú vygenerované pre adresu `https://nklescikova-sys.github.io/ITAPA-PROGRAM-TEST/abeceda/`.
> Ak aplikáciu nasadíte inde, zmeňte `.env` a kódy vygenerujte znova.

## 8. Štruktúra projektu a dátový model

```
abeceda/
├── .env                    adresa aplikácie (VITE_BASE_URL)
├── public/
│   ├── images/             obrázky zvieratiek (zatiaľ zástupné SVG)
│   ├── audio/sk, audio/en  MP3 nahrávky (zatiaľ prázdne → syntetický hlas)
│   └── icons/              ikony aplikácie
├── qr/                     vygenerované QR kódy
├── scripts/                qr.ts, audio-list.ts, placeholders.ts
├── src/
│   ├── content/            ← OBSAH (meníte tu)
│   │   ├── letters.ts      písmená, zvieratká, zaujímavosti, angličtina, tipy, APP_NAME
│   │   ├── strokes.ts      definície ťahov písmen
│   │   ├── phrases.ts      všetky vety, ktoré hovorí hlas, a názvy MP3 súborov
│   │   ├── map.ts          miesta na mape Slovenska
│   │   └── types.ts        dátové typy
│   ├── lib/                ← LOGIKA
│   │   ├── tracing.ts      vyhodnocovanie obťahovania (bez závislosti na prehliadači, testované)
│   │   ├── speech.ts       hlas: MP3 → Web Speech API → text v bubline
│   │   ├── sfx.ts          jemné zvuky odmeny (generované, bez súborov)
│   │   ├── store.tsx       profily, pokrok, nastavenia (localStorage)
│   │   ├── router.ts       adresy #/pismeno/a, #/mapa, #/rodicia
│   │   └── qr.ts
│   ├── components/         tlačidlá, ikony, plocha na obťahovanie, ochrana rodičovskej časti
│   └── screens/            obrazovky: Home, LetterJourney (5 krokov), MapScreen, Parents, ProfilePicker
└── tests/tracing.test.ts   testy obťahovania
```

**Dátový model (uložený v `localStorage` pod kľúčom `abeceda:v1`):**

```ts
{
  version: 1,
  welcomed: boolean,                 // už zaznel pozdrav pri prvom spustení
  settings: { difficulty: 'easy' | 'medium' | 'hard', leftHanded, volume /*0–1*/, sfx },
  profiles: [{                       // max. 4
    id, name /* pre rodiča */, avatar /* emoji pre dieťa */, lastPlayed?,
    progress: { [písmeno]: { completed, completedAt?, autoDemos, extraDone } }
  }]
}
```

**Písmeno** (`LetterContent`): `id`, `upper`, `lower`, `animal`, voliteľne `extra` (doplnkové písmeno so zvieratkom), `parentTip`.
**Zvieratko** (`Animal`): `name`, `nameEn`, `image`, `emoji`, `color`, `fact`, `mapPlace`, `soundPath`, `highlight?`, `neuter?`.
**Glyf** (`Glyph`): `char`, `width`, `strokes` – zoznam ťahov, každý ťah je zoznam bodov v poradí ťahania.

## 9. Testy

```bash
npm test
```

Testy v `tests/tracing.test.ts` overujú:
- každé písmeno (A–E, a–e, Ä ä Č č Ď ď) sa dá obtiahnuť podľa definície aj na Ťažkej úrovni,
- **nesprávne poradie** ťahov sa nepočíta (napr. E od dolnej čiary, A pravou nohou),
- **opačný smer** sa nepočíta (zdola nahor, oblúk c a krúžok a v smere hodinových ručičiek),
- **čmáranica** a skratky mimo čiary neprejdú,
- **vybočenie** ťah nezruší a po návrate sa dá pokračovať; úsek mimo zóny sa nezapočíta,
- **tolerancia**: čiara posunutá o 6 jednotiek prejde na Ľahkej, na Ťažkej nie,
- počítanie neúspechov po sebe (pre automatickú ukážku) a bodky pri Ä.

## 10. Rozhodnutia a predpoklady

- **Umiestnenie:** aplikácia je v priečinku `abeceda/`, aby sa nemiešala s existujúcou stránkou programu ITAPA v koreni repozitára.
- **Stack:** Vite + React + TypeScript + `vite-plugin-pwa` (podľa odporúčania v zadaní).
- **Úvodné ťuknutie:** prehliadače nedovolia prehrať zvuk bez ťuknutia, preto aplikácia začína veľkým zeleným
  tlačidlom ▶ (pri viacerých profiloch namiesto neho obrázkami detí). Pozdrav „Ahoj! Vyber si písmenko.“ zaznie
  po ňom, pri prvom spustení.
- **Obrázky:** zástupné SVG s emoji (`public/images/*.svg`). Emu má dočasne emoji dronta 🦤 a ďateľ všeobecného vtáčika 🐦 (vhodné emoji neexistujú).
- **Hlas:** Web Speech API. Bez slovenského hlasu sa text ukáže v bubline a rodič uvidí upozornenie s návodom,
  ako hlas doinštalovať. Na mnohých Androidoch je slovenský hlas dostupný až po stiahnutí v nastaveniach.
- **Výslovnosť písmen:** syntetický hlas môže písmeno vysloviť ako „bé“, „cé“. Opravia to až nahrávky (MP3).
- **Doplnkové písmená:** po hlavnej časti ponuka áno/preskočiť. Pri „áno“ sa veľké aj malé doplnkové písmeno
  obťahuje **1-krát** (nie 3-krát), aby to zostalo dobrovoľné a krátke. Na mape sa objaví aj zvieratko
  doplnkového písmena (ak ho dieťa obtiahlo).
- **Opakovania:** veľké aj malé písmeno 3-krát; pri treťom sú skryté šípky a čísla, začiatočné bodky ostávajú.
- **Zväčšenie tolerancie** po 3 neúspechoch platí do konca daného písmena (veľkého alebo malého) a potom sa vráti na nastavenú úroveň.
- **Neúspech** = prst zdvihnutý pred dokončením ťahu, ktorý začal na začiatočnej bodke, alebo čiara nakreslená
  mimo začiatku. Samotné ťuknutie mimo bodky sa nepočíta (iba zabliká bodka).
- **Počúvam:** hra „Ktoré zvieratko začína na …?“ ponúka 3 hlavné zvieratká (správne + 2 z iných písmen).
  Variant „Kto takto robí?“ je pripravený a zapne sa automaticky, keď zvieratko dostane `soundPath`.
- **Po anglicky – mini hra:** zaznie anglické slovo aktuálneho zvieratka a dieťa vyberie z 3 obrázkov.
  Ťuknutím na obrázok zaznie jeho anglický názov.
- **Tlačidlo „Ďalej“** v hrách (Počúvam, Po anglicky) sa zapne až po správnej odpovedi. V ostatných krokoch je aktívne hneď.
- **Nastavenia** (presnosť, ľaváci, hlasitosť, zvuky) sú spoločné pre celé zariadenie, nie pre každý profil.
- **Ochrana rodičovskej časti:** podržanie 3 s a príklad na sčítanie (súčet do 18) s výberom z 3 možností.
  Po odchode z rodičovskej časti sa treba znova overiť.
- **Mapa:** kreslený obrys Slovenska (nie presná geografia) s miestami Dunaj, dedina, les, Tatry, lúka a zónou „Svet“ 🌍.
  Tatry sú zatiaľ prázdne (žiadne zvieratko A–E tam nepatrí).
- **Písmo:** Baloo 2 je uložené lokálne v aplikácii (iba latinka a latinka s diakritikou). Aplikácia nerobí žiadne požiadavky na cudzie servery.
- **QR kódy v aplikácii** sa generujú priamo v prehliadači (knižnica `qrcode`), bez internetu.
