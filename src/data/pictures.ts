// Picture per word, for "Picture" and "True or false" questions (not flashcards).
// Each picture is simple SVG markup drawn in a 100 x 100 box; `<Picture>` wraps it in an <svg>
// whose default style is: no fill, dark outline (stroke 3, round). Shapes set their own fill.
// Only words that one simple picture shows clearly are listed; others are never asked with a
// picture. Each picture must be unique (validated) so a picture has one answer.

const SKIN = '#fcd9b6'
const INK = '#1e293b'

export const pictures: Record<string, string> = {
  community: `<path d="M4 90h92"/><path d="M8 62l14-14 14 14v28H8z" fill="#fca5a5"/><path d="M36 54l16-16 16 16v36H36z" fill="#93c5fd"/><path d="M66 62l13-13 13 13v28H66z" fill="#fde68a"/><path d="M47 90V74h10v16M18 70h8v8h-8zM74 70h8v8h-8z" fill="#fff"/>`,
  garden: `<rect x="5" y="72" width="90" height="20" rx="4" fill="#92400e"/><path d="M25 72V46M50 72V40M75 72V46" stroke="#16a34a"/><circle cx="25" cy="40" r="9" fill="#f472b6"/><circle cx="50" cy="33" r="9" fill="#facc15"/><circle cx="75" cy="40" r="9" fill="#a78bfa"/><circle cx="25" cy="40" r="3" fill="#fff"/><circle cx="50" cy="33" r="3" fill="#fff"/><circle cx="75" cy="40" r="3" fill="#fff"/>`,
  plant: `<path d="M50 62V28" stroke="#16a34a"/><ellipse cx="37" cy="44" rx="13" ry="6" fill="#4ade80" transform="rotate(-30 37 44)"/><ellipse cx="63" cy="38" rx="13" ry="6" fill="#4ade80" transform="rotate(30 63 38)"/><ellipse cx="50" cy="22" rx="6" ry="11" fill="#4ade80"/><path d="M30 62h40l-6 30H36z" fill="#c2410c"/>`,
  apartment: `<rect x="26" y="8" width="48" height="86" fill="#94a3b8"/><path d="M34 16h9v9h-9zM57 16h9v9h-9zM34 33h9v9h-9zM57 33h9v9h-9zM34 50h9v9h-9zM57 50h9v9h-9zM34 67h9v9h-9zM57 67h9v9h-9z" fill="#fde68a"/><rect x="44" y="80" width="12" height="14" fill="#475569"/>`,
  brick: `<rect x="8" y="22" width="84" height="56" fill="#dc2626"/><path d="M8 41h84M8 59h84M32 22v19M62 22v19M18 41v18M47 41v18M77 41v18M32 59v19M62 59v19" stroke="#fecaca"/>`,
  stores: `<rect x="12" y="40" width="76" height="52" fill="#fef3c7"/><path d="M8 26h84l-4 16H12z" fill="#ef4444"/><path d="M29 26l-2 16M50 26v16M71 26l2 16" stroke="#fff"/><rect x="20" y="52" width="28" height="22" fill="#bae6fd"/><rect x="58" y="54" width="20" height="38" fill="#a16207"/><rect x="25" y="8" width="50" height="14" rx="3" fill="#0ea5e9"/>`,

  center: `<circle cx="50" cy="50" r="40" fill="#fff"/><path d="M50 14v14M50 72v14M14 50h14M72 50h14" stroke="#94a3b8"/><circle cx="50" cy="50" r="10" fill="#ef4444"/>`,
  meet: `<circle cx="28" cy="30" r="11" fill="${SKIN}"/><path d="M12 90c0-22 7-36 16-36s16 14 16 36z" fill="#60a5fa"/><circle cx="72" cy="30" r="11" fill="${SKIN}"/><path d="M56 90c0-22 7-36 16-36s16 14 16 36z" fill="#f472b6"/><path d="M40 66l10-6 10 6" stroke-width="5" stroke="${SKIN}"/><path d="M40 66l10-6 10 6"/>`,
  pieces: `<path d="M10 30h14a7 7 0 1 1 12 0h10v14a7 7 0 1 1 0 12v14H10z" fill="#60a5fa"/><path d="M58 40h12a7 7 0 1 0 12 0h8v40H58V66a7 7 0 1 1 0-12z" fill="#f59e0b"/>`,
  wooden: `<rect x="10" y="34" width="80" height="34" rx="6" fill="#d97706"/><path d="M18 44c20-5 40 4 64 0M18 58c22 4 40-4 64 0" stroke="#92400e"/><ellipse cx="78" cy="51" rx="5" ry="4" stroke="#92400e"/>`,
  beads: `<path d="M8 30q42 60 84 0" stroke="#64748b" stroke-width="2"/><circle cx="18" cy="41" r="7" fill="#ef4444"/><circle cx="30" cy="52" r="7" fill="#facc15"/><circle cx="42" cy="59" r="7" fill="#22c55e"/><circle cx="55" cy="60" r="7" fill="#3b82f6"/><circle cx="67" cy="55" r="7" fill="#a855f7"/><circle cx="79" cy="45" r="7" fill="#f472b6"/>`,
  instrument: `<circle cx="50" cy="62" r="16" fill="#f59e0b"/><circle cx="50" cy="80" r="16" fill="#f59e0b"/><circle cx="50" cy="67" r="5" fill="#451a03"/><rect x="46" y="12" width="8" height="52" fill="#78350f"/><rect x="43" y="5" width="14" height="10" rx="2" fill="#78350f"/><path d="M48 14v74M52 14v74" stroke="#fff" stroke-width="1"/>`,

  up: `<path d="M50 8L18 44h20v46h24V44h20z" fill="#22c55e"/>`,
  two: `<circle cx="30" cy="58" r="17" fill="#ef4444"/><circle cx="70" cy="58" r="17" fill="#ef4444"/><path d="M30 41v-9M70 41v-9" stroke="#78350f"/><ellipse cx="37" cy="33" rx="6" ry="3" fill="#22c55e"/><ellipse cx="77" cy="33" rx="6" ry="3" fill="#22c55e"/>`,

  crosswalk: `<rect x="5" y="18" width="90" height="64" fill="#475569" stroke="none"/><path d="M20 24v52M35 24v52M50 24v52M65 24v52M80 24v52" stroke="#fff" stroke-width="8" stroke-linecap="butt"/>`,
  first: `<rect x="8" y="58" width="28" height="34" fill="#cbd5e1"/><rect x="36" y="38" width="28" height="54" fill="#facc15"/><rect x="64" y="66" width="28" height="26" fill="#fdba74"/><text x="50" y="62" font-size="22" font-weight="bold" text-anchor="middle" fill="${INK}" stroke="none">1</text><circle cx="50" cy="20" r="11" fill="#facc15"/><path d="M45 9l-5-7M55 9l5-7" stroke="#3b82f6"/>`,
  guard: `<circle cx="36" cy="24" r="10" fill="${SKIN}"/><path d="M26 18h20v-6H26z" fill="#1e3a8a"/><rect x="26" y="35" width="20" height="30" rx="4" fill="#facc15"/><path d="M30 65l-4 25M42 65l4 25M46 42l18-4"/><path d="M64 50v42"/><path d="M58 22h12l8 8v12l-8 8H58l-8-8V30z" fill="#ef4444"/>`,
  walk: `<path d="M8 92h84"/><circle cx="50" cy="16" r="9" fill="${SKIN}"/><path d="M50 26l-2 30M49 34L36 48M49 34l13 12M48 56L36 90M48 56l14 34" stroke-width="6"/>`,

  pictures: `<rect x="12" y="18" width="76" height="64" fill="#fde68a"/><rect x="20" y="26" width="60" height="48" fill="#bae6fd"/><path d="M20 74l20-24 14 14 10-10 16 20z" fill="#22c55e"/><circle cx="66" cy="38" r="6" fill="#facc15"/>`,
  person: `<circle cx="50" cy="28" r="15" fill="${SKIN}"/><path d="M24 92c0-26 11-42 26-42s26 16 26 42z" fill="#60a5fa"/>`,

  label: `<rect x="32" y="12" width="36" height="12" rx="2" fill="#94a3b8"/><rect x="26" y="24" width="48" height="66" rx="8" fill="#bae6fd"/><rect x="30" y="46" width="40" height="22" fill="#fff"/><path d="M37 54h26M37 61h16"/>`,

  look: `<ellipse cx="30" cy="50" rx="18" ry="22" fill="#fff"/><ellipse cx="70" cy="50" rx="18" ry="22" fill="#fff"/><circle cx="35" cy="53" r="9" fill="${INK}"/><circle cx="75" cy="53" r="9" fill="${INK}"/><circle cx="38" cy="50" r="3" fill="#fff" stroke="none"/><circle cx="78" cy="50" r="3" fill="#fff" stroke="none"/>`,

  eat: `<circle cx="40" cy="50" r="32" fill="${SKIN}"/><circle cx="29" cy="40" r="3" fill="${INK}" stroke="none"/><circle cx="51" cy="40" r="3" fill="${INK}" stroke="none"/><ellipse cx="44" cy="63" rx="10" ry="8" fill="#7f1d1d"/><circle cx="76" cy="66" r="14" fill="#ef4444"/><path d="M76 52v-7" stroke="#78350f"/>`,
  dig: `<path d="M6 92q44-46 88 0z" fill="#92400e"/><path d="M66 8L50 58" stroke="#78350f" stroke-width="6"/><path d="M60 4h14" stroke="#78350f" stroke-width="6"/><path d="M40 54l18 6-6 20-16-6z" fill="#94a3b8"/>`,
  sleep: `<path d="M10 40v48M90 58v30"/><rect x="10" y="58" width="80" height="16" fill="#93c5fd"/><circle cx="24" cy="50" r="9" fill="${SKIN}"/><rect x="34" y="47" width="54" height="12" rx="5" fill="#f9a8d4"/><path d="M56 12h12L56 26h12M74 26h8l-8 10h8" stroke="#3b82f6"/>`,
  winter: `<circle cx="50" cy="72" r="19" fill="#fff"/><circle cx="50" cy="42" r="13" fill="#fff"/><rect x="42" y="18" width="16" height="12" fill="${INK}"/><path d="M36 30h28"/><circle cx="45" cy="40" r="2" fill="${INK}" stroke="none"/><circle cx="55" cy="40" r="2" fill="${INK}" stroke="none"/><path d="M50 44l9 3-9 2z" fill="#f97316" stroke="none"/><g fill="#93c5fd" stroke="none"><circle cx="14" cy="20" r="3"/><circle cx="84" cy="14" r="3"/><circle cx="20" cy="56" r="3"/><circle cx="86" cy="48" r="3"/><circle cx="74" cy="30" r="2"/></g>`,
  snowfalls: `<path d="M24 46a13 13 0 0 1 5-25 18 18 0 0 1 34-4 14 14 0 0 1 14 29z" fill="#e2e8f0"/><path d="M30 58v14M23 65h14M50 64v14M43 71h14M70 58v14M63 65h14M40 82v10M35 87h10M60 82v10M55 87h10" stroke="#38bdf8"/>`,

  spring: `<rect x="45" y="56" width="10" height="36" fill="#92400e"/><circle cx="50" cy="38" r="28" fill="#86efac"/><g fill="#f9a8d4"><circle cx="38" cy="28" r="5"/><circle cx="60" cy="24" r="5"/><circle cx="66" cy="44" r="5"/><circle cx="42" cy="48" r="5"/><circle cx="52" cy="36" r="5"/></g><path d="M10 92h80" stroke="#16a34a"/>`,
  summer: `<rect x="0" y="74" width="100" height="26" fill="#fde68a" stroke="none"/><rect x="0" y="56" width="100" height="18" fill="#38bdf8" stroke="none"/><circle cx="70" cy="26" r="12" fill="#facc15"/><path d="M70 6v4M70 42v4M50 26h4M86 26h4M56 12l3 3M81 37l3 3M84 12l-3 3M59 37l-3 3" stroke="#f59e0b"/><path d="M26 92V50" /><path d="M8 52a18 14 0 0 1 36 0z" fill="#ef4444"/>`,
  coat: `<path d="M35 14h30l20 16-8 14-7-5v51H30V39l-7 5-8-14z" fill="#f97316"/><path d="M50 14v76"/><circle cx="56" cy="40" r="2.5" fill="${INK}"/><circle cx="56" cy="56" r="2.5" fill="${INK}"/><circle cx="56" cy="72" r="2.5" fill="${INK}"/>`,
  brown: `<path d="M50 12c18 0 22 14 32 18s10 26-2 34-10 22-30 22-26-10-32-22S8 44 18 34s14-22 32-22z" fill="#92400e"/>`,
  burrow: `<path d="M0 64q50-36 100 0v36H0z" fill="#84cc16"/><ellipse cx="50" cy="70" rx="18" ry="11" fill="#1c1917"/><ellipse cx="44" cy="56" rx="3.5" ry="10" fill="#e7e5e4"/><ellipse cx="54" cy="56" rx="3.5" ry="10" fill="#e7e5e4"/>`,
  icy: `<rect x="5" y="14" width="90" height="12" fill="#cbd5e1"/><path d="M12 26l6 32 6-32M30 26l5 24 5-24M48 26l6 40 6-40M68 26l5 28 5-28M84 26l4 20 4-20" fill="#bae6fd"/>`,

  rhythm: `<path d="M12 50v28c0 6 14 10 30 10s30-4 30-10V50" fill="#ef4444"/><ellipse cx="42" cy="50" rx="30" ry="10" fill="#fef3c7"/><path d="M30 44L14 16M54 44l16-28" stroke="#a16207"/><path d="M80 40V16l12-4v24" /><circle cx="76" cy="40" r="4" fill="${INK}"/><circle cx="88" cy="36" r="4" fill="${INK}"/>`,

  shoes: `<path d="M6 60V30h18l6 14h18c10 0 14 8 14 16z" fill="#60a5fa"/><path d="M38 88V58h18l6 14h18c10 0 14 8 14 16z" fill="#f472b6"/><path d="M6 60h56M38 88h56" stroke-width="6"/><path d="M14 38h6M46 66h6" stroke="#fff"/>`,
  big: `<circle cx="40" cy="54" r="32" fill="#f97316"/><circle cx="86" cy="78" r="7" fill="#e2e8f0" stroke="#94a3b8"/>`,
  race: `<path d="M24 8v86"/><rect x="24" y="10" width="50" height="34" fill="#fff"/><path d="M24 10h12.5v11.3H24zM49 10h12.5v11.3H49zM36.5 21.3H49v11.3H36.5zM61.5 21.3H74v11.3H61.5zM24 32.6h12.5V44H24zM49 32.6h12.5V44H49z" fill="${INK}" stroke="none"/>`,
  fast: `<path d="M30 60l10-16h26l12 16h12v16H26V60z" fill="#ef4444"/><path d="M44 48h8v10h-12zM58 48h6l7 10H58z" fill="#bae6fd"/><circle cx="40" cy="78" r="8" fill="${INK}"/><circle cx="76" cy="78" r="8" fill="${INK}"/><path d="M4 48h16M2 60h16M6 72h12"/>`,
  running: `<circle cx="60" cy="16" r="9" fill="${SKIN}"/><path d="M57 26L46 52M54 33l14 9M54 33l-16-3M46 52l16 14-4 18M46 52L32 66l-14-4" stroke-width="6"/><path d="M8 30h14M4 42h14M8 54h12"/>`,
  small: `<circle cx="40" cy="54" r="32" fill="#e2e8f0" stroke="#94a3b8"/><circle cx="86" cy="78" r="7" fill="#f97316"/>`,

  drama: `<rect x="5" y="10" width="90" height="80" fill="#fef3c7"/><path d="M5 10h28q-8 40 0 80H5zM95 10H67q8 40 0 80h28z" fill="#dc2626"/><rect x="5" y="10" width="90" height="10" fill="#b91c1c"/><circle cx="50" cy="50" r="9" fill="${SKIN}"/><path d="M42 90c0-20 4-30 8-30s8 10 8 30z" fill="#a855f7"/>`,
  dialogue: `<path d="M8 14h50v30H28l-10 10V44H8z" fill="#bae6fd"/><path d="M42 48h50v30h-10v10L72 78H42z" fill="#fde68a"/><path d="M16 24h34M16 33h22M50 58h34M50 67h22"/>`,
  five: `<rect x="15" y="15" width="70" height="70" rx="12" fill="#fff"/><g fill="${INK}" stroke="none"><circle cx="32" cy="32" r="6"/><circle cx="68" cy="32" r="6"/><circle cx="50" cy="50" r="6"/><circle cx="32" cy="68" r="6"/><circle cx="68" cy="68" r="6"/></g>`,
  ride: `<circle cx="24" cy="72" r="15"/><circle cx="76" cy="72" r="15"/><path d="M24 72l20-26h22l10 26M44 46l-6-10M44 46l12 26M62 36h10" stroke="#ef4444"/><circle cx="54" cy="14" r="8" fill="${SKIN}"/><path d="M54 22l-8 20M52 28l12 8M46 42l10 30" stroke-width="5"/>`,
}
