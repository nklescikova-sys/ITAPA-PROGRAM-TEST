# 🎯 Jarná ITAPA 2026 - Program Konferencie

Moderna a responsívna webová stránka pre zobrazenie programu Jarnej ITAPA konferencie 2026.

## ✨ Vlastnosti

- **Moderný dizajn** - Čistý a fresh UI s gradient pozadím
- **Responsívny** - Perfektne funguje na všetkých zariadeniach (mobil, tablet, desktop)
- **Interaktívny** - Filtrovanie programu podľa typu prednášky
- **Animácie** - Plynulé fade-in animácie a hover efekty
- **Prístupnosť** - Semantické HTML a dobrá čitateľnosť

## 📋 Obsah Stránky

Stránka zobrazuje program konferencie organizovaný do časových slotov s nasledujúcimi informáciami:

- **Čas konania** - Presný čas prednášky/aktivity
- **Miestnosť** - Lokalita konania
- **Názov** - Názov prednášky alebo aktivity
- **Lektor** - Meno osoby vedúcej prednášku
- **Popis** - Stručný popis obsahu
- **Tagy** - Kategorizácia podľa typu a témy

## 🎨 Dizajn Prvky

### Farby
- **Primárna** - Fialová gradient (#667eea - #764ba2)
- **Accent farby**:
  - Červená (#ff6b6b) - Pre highlight sloty
  - Zlatá (#ffd700) - Pre keynote prednášky
  - Zelená (#51cf66) - Pre prestávky

### Typografia
- Modern sans-serif font (Segoe UI)
- Hierarchia veľkostí pre ľahkú čitateľnosť

## 🔧 Filtrovanie

Stránka ponúka filtrovanie podľa:
- **Všetko** - Zobrazí všetky sloty
- **Keynote Prednášky** - Hlavné prednášky
- **Workshopy** - Praktické workshopy
- **Prestávky** - Časy na oddych

## 📱 Responsívny Dizajn

Stránka sa automaticky prispôsobí:
- **Desktop** - Multi-column layout (grid)
- **Tablet** - 2-3 stĺpce
- **Mobil** - Jeden stĺpec pre lepšiu čitateľnosť

## 🚀 Ako Používať

1. Otvorte súbor `index.html` vo webovom prehliadači
2. Prehliadajte program konferencie
3. Použite filtrovacie tlačidla pre filtrovanie podľa typu
4. Najeďte myšou na event karty pre animácie a detaily

## 📝 Úprava Obsahu

Ak chcete upraviť program, upravte časové sloty v HTML v sekcii `<div class="schedule" id="schedule">`.

Každý slot má nasledujúcu štruktúru:

```html
<div class="time-slot" data-type="keynote">
    <div class="time">HH:MM - HH:MM</div>
    <div class="room">Miestnosť</div>
    <div class="title">Názov Prednášky</div>
    <div class="speaker">👤 Meno Lektora</div>
    <div class="description">Popis obsahu...</div>
    <div class="tags">
        <span class="tag">Tag1</span>
        <span class="tag">Tag2</span>
    </div>
</div>
```

## 🎯 Typy Slotov

Použite nasledujúce `data-type` hodnoty:
- `keynote` - Keynote prednášky (žltá farba)
- `workshop` - Workshopy (štandardná farba)
- `break` - Prestávky a networking (zelená farba)

A nasledujúce CSS triedy:
- `keynote-slot` - Pre keynote prednášky
- `highlight-slot` - Pre highlight sloty
- `break-slot` - Pre prestávky

## 💡 Ďalšie Vylepšenia (Optional)

- Pridať viac dní konferencie
- Importovať program z JSON súboru
- Pridať mapu miestností
- Integrácia s kalendárom
- Dark mode
- Viacjazyčnosť

---

**Vytvorené pre:** Jarnú ITAPA 2026  
**Dátum:** 22. apríl 2026
## Abeceda – aplikácia na učenie písmen

Prototyp detskej aplikácie je v priečinku [`abeceda/`](abeceda/README.md) (vlastné README po slovensky).
