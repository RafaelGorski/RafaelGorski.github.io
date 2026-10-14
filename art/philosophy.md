# Contour Lineage

*An algorithmic philosophy for the mountain art of rafaelgorski.com.*

A name can be a map. Górski means "of the mountains", and Contour Lineage treats the surname as a survey that was never finished: every page of the site is a sheet from it, and every sheet is drawn by the same patient surveyor. The movement refuses the postcard mountain, the sunset silhouette and the stock alpine photograph. It draws the cartographer's mountain instead: a quantity of height, measured, levelled and inked in hairlines, where beauty comes from the evidence of measurement rather than from the view. The algorithm is the surveyor. It should read as the product of deep computational expertise, a meticulously crafted system whose every constant was set, looked at, doubted and set again.

The ground is a field, not a picture. A main ridge runs through the summit and side ridges hang off it like the bones of a fish, the way granite ranges actually organise themselves. Their union is smooth but sharp-bottomed, so valleys close into the V of a stream bed while crests stay knife-edged. Domain warping keeps the lines from looking computed; ridged multifractal noise roughens the rock only where the rock is high, and is held off the summit so the top stays where the sheet puts it. Every height is then normalised against one fixed number, so that no seed can raise a mountain taller than the one this system honours. Nothing here is random in the loose sense: randomness is seeded, bounded and answerable, the painstaking calibration of a master-level implementation rather than a dice roll.

The drawing is the measurement. Marching squares extract isohypses, lines of equal height, at a fixed interval from the valley floor upward; every fifth line is an index contour, drawn heavier, as on any survey sheet. Lines are smoothed once and simplified once, with tolerances tuned by eye until they hold the jaggedness of rock without the stutter of a grid. Seen from the side, the same logic becomes a panorama: a granite skyline at the back, rounder foothills in front, each layer a flat screen of one ink, separated from the next by a hairline of bare paper. One ink at several screen values, the way single-colour atlas plates were printed: the restraint is the craft.

The system knows where it is. On a page head it draws a sheet corner: the top and right edges are neatlines that cut the contours off, while the left and bottom fall away to the valley floor so the text can stand on open ground. Around the radar it draws only the apron, the slopes falling away beyond a disc whose four rings are already the top four contours. Above the map's six stages it draws one continuous route, each stage shaping its own stretch from its own seed and blending into its neighbours, so the slices join into a single ascent when they stand side by side and still read alone when they stand apart. Composition emerges from the algorithm's rules, not from placement by hand.

Variation is lineage. Each area of the site is a seed, and a seed is a family resemblance: the same ridge grammar, the same interval, the same ink, a different mountain. Turning the seed is walking along the range. The craftsmanship lies in making every seed compose, so that there is no bad mountain in the family, only quieter and louder ones; that is the mark of an algorithm refined through countless iterations by someone at the top of the field, and the standard this one is held to. The art is ground, never figure: it stays lighter than the lightest ink that carries meaning, it never moves on its own, and it disappears when the page is printed. One sheet answers the reader: on the home page the ascent becomes a panorama with a route walked up it, and as the reader climbs the camps the nearer ridges settle by a few percent, the way foothills sink as you gain height. The route itself is the surveyor's too: it keeps just below the skyline ridge and above the ridge in front, rising and dipping with the range, and its camps stand on the high points nearest even steps to the summit.

## Conceptual seed

Hidden in the parameters, for those who know:

- **2,499 m.** Every summit is normalised to the height of Rysy, the highest point in Poland. With a 50 m interval, 2,499 is 50² − 1, so the 50th contour, 2,500 m, is never drawn: each summit stands one metre short of closing its last line. The radar's rings are read as the 2,450, 2,400, 2,350 and 2,300 m contours, so Adopt is the summit's last 49 metres.
- **The red trail.** On the home page, where vermilion is the author's own voice, the summit carries a Polish trail blaze: one stripe of colour between two white ones, as painted on the rock along the marked routes of the Tatras, where red marks the principal routes.
- **Side ridges off a main ridge.** The massif grammar follows the Tatras: one main ridge, with side ridges spurring off it on both sides.
- **The name as seed.** The home seed is 2499. The other areas' seeds were derived from the name: the FNV-1a hash of `górski/<area>`, modulo 99,999, plus one.

## Where it lives

- `scripts/art.mjs`: the algorithm (between the `<core>` markers) and the Node wrapper that writes the site's SVGs.
- `site-data/art.json`: seeds and per-area settings, and `climb`, the home page's panorama and route (drawn from the ascent's seeds).
- `art/viewer.html`: the p5.js explorer, built from the algorithmic-art skill's viewer template. Its copy of the algorithm is refreshed from `scripts/art.mjs` on every build.
