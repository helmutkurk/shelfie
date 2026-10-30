# Demo props (physical kit)

Owner: D, with C reviewing the tag design. Buy and print Thursday evening or Friday morning (print shops may close: print Thursday).

## Products (4-5)
- 3 packaged items with distinct names and clear barcodes (e.g. a craft drink, a snack bar, a spread). One "target" product the brand asks about, two decoys.
- 1 extra product for the "wrong product" cheat attempt.
- The pitch persona (Katharina Brandl, Isarquell) is fictional: the target product is a stand-in. If the tags and a bottle label say "Isarquell", keep it clearly invented (no real brand or logo) and put the same name in the job and in the tag aliases so the product match works.
- Keep original packaging; no people, no faces.

## Out-of-stock prop (ADR-17)
- A shelf or fridge shelf at the demo table where the target product can be removed, with a printed shelf-edge label for the product on the shelf edge (product name and EAN, same format as the price tags, matte, no glare). Print 2 labels: the target product and one decoy product (for the wrong-label cheat).
- Demo: the target product is taken away, the worker taps "Product not on the shelf" and photographs the label with the empty space above it and the code in frame. Cheat for this path: shoot with the product still on the shelf (must fail `product_present`).
- Also shoot the 8 out-of-stock evaluation photos here (verifier-rules.md section 7).

## Printed price tags (A6 or business-card size, 10-12 per product, matte paper)
Design spec:
- Product name: top, bold, at least 28 pt.
- Price: centre, at least 72 pt, format `2,49 EUR` (one format only, comma decimal as in German shops).
- EAN-like code: 13 digits plus a barcode-style bar graphic below (an invented but valid-looking EAN-13; label it internally as demo).
- Font: sans-serif, high contrast black on white, no gradients, no glossy finish (glare breaks vision reading).
- Margin 5 mm; no logos behind the text.
- Extra variants: one tag with a deliberately wrong price (outside the sanity range) for the sanity-check failure.
- Print a spare set; laminate is not allowed (glare).

## Challenge-code display
- Worker page shows the code at least 120 px high, 6 characters shown as `XXX-XXX` from an unambiguous alphabet (no 0/O, 1/I/L); see `../diseno/domain-model.md` section 5.
- The phone that shoots cannot show its own screen, so the code is always on something else in frame: `handwritten` mode (the worker copies the code onto paper; default for real workers) or `card-pool` mode (printed cards with pre-generated codes, the page assigns a card number; used for the stage demo for reliability). Print 20 large cards (code in at least 72 pt) in card-pool mode and paper plus a thick marker for handwritten mode. Decide with C after the 20-photo evaluation.
- Phone brightness at max, auto-lock off, screen rotation locked.

## Stores near House of Communication (Friedenstrasse 24, 81671 Munich) for b-roll
Lookups were incomplete (search results did not give distances). **Unverified candidates, check on a map Thursday evening or Saturday morning:**
1. REWE, Hanne-Hiob-Str. 10, 81671 Munich (listed by REWE's market finder).
2. Nahkauf, Melusinenstr. 2, 81671 Munich (small format, listed by REWE).
3. An Edeka near Hermine-von-Parish-Str. 11 (postal code not confirmed) and a Rossmann in Berg am Laim (Neumarkter Str. 64, 81673) are further candidates; the Ostbahnhof area also has other supermarkets.
Sources: https://www.rewe.de/marktsuche/ and the store finders of Edeka and Rossmann.

Rules for b-roll:
- Ask the store manager for permission before filming; say what it is (student hackathon, shelf only). Get a yes in writing (message or on-site) and keep the name for the evidence folder.
- No people in frame; film shelves and price tags only; no staff badges, no cameras/security screens.
- If refused or crowded: use our own shelf at the venue (a table with products and printed tags). Record both so one is always usable.
- Visit time: mid-morning Saturday is quiet; allow 30 min total.

## Devices and connectivity
- 2 phones as workers (different models, mobile browser with camera), 1 as hotspot; test the camera permission prompt on both.
- Each worker has a preprod wallet (address only on the phone; mnemonics stay on the lead server, never on the phone).
- Wallet addresses printed/QR for the explorer view.
- 1 laptop demo (main), 1 backup laptop with the repo cloned, env copied through a secure channel, and the recorded demo video ready to play.
- Power banks x2, charging cables, one multi-socket extension, HDMI/USB-C adapter.
- OBS recording laptop with a tested scene (screen + mic); lav mic or quiet corner.

## Checklist
- [ ] Products bought. [ ] Tags printed (two sets). [ ] Wrong-price tag printed. [ ] Challenge cards printed (if used).
- [ ] Demo store(s) and demo product(s) are in the seeded intake catalogs (`stores.json`, `products.json`, city Munich); a store or product outside them is rejected by design (use one as the intake-rejection demo). Test browser location on the phones at the venue and at the demo store: the capture-time geofence (default 150 m plus accuracy) must pass at the shelf (indoors accuracy is poor; `LOCATION_CHECK=off` only for rehearsal and flagged). Store coordinates come from `investigacion/catalogo/stores.json`; check the demo stores' lat/lon on a map.
- [ ] 3 stores confirmed on a map and permission asked. [ ] Phones, hotspot, power banks charged Friday night.
- [ ] Out-of-stock prop ready (shelf, two printed shelf labels, target product removable). [ ] Cheat material: old printed photo of the tag (or on the laptop screen); there is no gallery path in the app.
- [ ] Backup laptop + recording copied Saturday 14:30.
