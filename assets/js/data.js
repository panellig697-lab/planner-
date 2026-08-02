/* ==========================================================================
   Maureen Osborne — Gallery content data
   Edit this file to add, remove, or update artwork. No other file needs to
   change: every page reads from the arrays below.
   - image paths point at placeholder SVGs in /assets/images/placeholders/
     Replace them with real photographs (same file name is fine) once
     available, ideally 2000px+ on the long edge, JPG or WebP.
   ========================================================================== */

const SITE = {
  artistName: "Maureen Osborne",
  location: "Jersey, Channel Islands",
  email: "hello@maureenosborne.art",       // TODO: replace with real contact email
  phone: "",                                // TODO: optional — add if Maureen wants a phone number listed
  instagram: "https://instagram.com/",      // TODO: replace with real handle
  facebook: "",                             // TODO: optional
  statement: "Paintings that hold onto Jersey's shifting coastal light — quiet, considered, and made slowly by hand.",
};

const COLLECTIONS = [
  {
    id: "coastal-light",
    name: "Coastal Light",
    description: "Studies of Jersey's shoreline at first and last light.",
    image: "assets/images/placeholders/painting-03.svg",
  },
  {
    id: "still-interiors",
    name: "Still Interiors",
    description: "Quiet still-life compositions built from studio objects and memory.",
    image: "assets/images/placeholders/painting-08.svg",
  },
  {
    id: "island-fields",
    name: "Island Fields",
    description: "The inland patchwork of Jersey's farmland through the seasons.",
    image: "assets/images/placeholders/painting-05.svg",
  },
];

/* status: "available" | "reserved" | "sold" */
const ARTWORKS = [
  {
    id: "low-tide-st-ouen",
    title: "Low Tide, St Ouen",
    collection: "coastal-light",
    medium: "Oil on linen",
    dimensions: "80 × 100 cm",
    year: 2025,
    price: "£1,450",
    status: "available",
    image: "assets/images/placeholders/painting-01.svg",
    description: "A wide, wet expanse of sand caught in the last hour of light, painted from the west coast during a late-autumn low tide.",
  },
  {
    id: "morning-corbiere",
    title: "Morning, Corbière",
    collection: "coastal-light",
    medium: "Oil on canvas",
    dimensions: "60 × 60 cm",
    year: 2025,
    price: "£980",
    status: "available",
    image: "assets/images/placeholders/painting-02.svg",
    description: "The lighthouse just visible through early sea mist — one of a small series painted on site over three mornings.",
  },
  {
    id: "harbour-blue",
    title: "Harbour Blue",
    collection: "coastal-light",
    medium: "Oil on board",
    dimensions: "40 × 50 cm",
    year: 2024,
    price: "£620",
    status: "available",
    image: "assets/images/placeholders/painting-11.svg",
    description: "A study of St Aubin's harbour at dusk, worked in a single sitting to keep the colour honest.",
  },
  {
    id: "jugs-and-linen",
    title: "Jugs and Linen",
    collection: "still-interiors",
    medium: "Oil on board",
    dimensions: "35 × 45 cm",
    year: 2024,
    price: "£540",
    status: "available",
    image: "assets/images/placeholders/painting-04.svg",
    description: "A small still life built from studio jugs and folded linen, revisited over several weeks.",
  },
  {
    id: "afternoon-table",
    title: "Afternoon Table",
    collection: "still-interiors",
    medium: "Oil on canvas",
    dimensions: "50 × 60 cm",
    year: 2025,
    price: "£720",
    status: "reserved",
    image: "assets/images/placeholders/painting-08.svg",
    description: "Late light across a kitchen table, painted from the studio window overlooking the garden.",
  },
  {
    id: "field-in-august",
    title: "Field in August",
    collection: "island-fields",
    medium: "Oil on linen",
    dimensions: "70 × 90 cm",
    year: 2024,
    price: "£1,150",
    status: "available",
    image: "assets/images/placeholders/painting-05.svg",
    description: "Cut hay fields inland from St Mary, painted in the heat of late summer.",
  },
  {
    id: "hedgerow-study",
    title: "Hedgerow Study",
    collection: "island-fields",
    medium: "Oil on board",
    dimensions: "30 × 40 cm",
    year: 2025,
    price: "£380",
    status: "available",
    image: "assets/images/placeholders/painting-09.svg",
    description: "A smaller, quicker study of the Jersey lanes near the studio, done as a warm-up piece.",
  },
  {
    id: "winter-shoreline",
    title: "Winter Shoreline",
    collection: "coastal-light",
    medium: "Oil on canvas",
    dimensions: "90 × 110 cm",
    year: 2025,
    price: "£1,850",
    status: "available",
    image: "assets/images/placeholders/painting-07.svg",
    description: "The largest coastal piece in the current body of work, built up over five weeks in the studio from on-site sketches.",
  },

  /* ---------------- Sold works ---------------- */
  {
    id: "evening-elizabeth-castle",
    title: "Evening, Elizabeth Castle",
    collection: "coastal-light",
    medium: "Oil on canvas",
    dimensions: "80 × 80 cm",
    year: 2023,
    yearSold: 2023,
    status: "sold",
    image: "assets/images/placeholders/painting-06.svg",
    description: "Sold to a private collector in Jersey.",
    story: "One of the first large coastal paintings Maureen completed after returning to full-time painting — a turning point piece that shaped the direction of the Coastal Light collection.", // TODO: replace with the real story, if Maureen wants one told
  },
  {
    id: "quiet-kitchen",
    title: "Quiet Kitchen",
    collection: "still-interiors",
    medium: "Oil on board",
    dimensions: "40 × 50 cm",
    year: 2023,
    yearSold: 2024,
    status: "sold",
    image: "assets/images/placeholders/painting-10.svg",
    description: "Sold to a collector in the UK.",
    story: "Commissioned as a keepsake of a family kitchen, painted from photographs and a single visit.", // TODO: confirm/replace with real commission story
  },
  {
    id: "st-brelade-dusk",
    title: "St Brelade, Dusk",
    collection: "coastal-light",
    medium: "Oil on linen",
    dimensions: "70 × 90 cm",
    year: 2022,
    yearSold: 2023,
    status: "sold",
    image: "assets/images/placeholders/painting-12.svg",
    description: "Sold during Maureen's most recent open studio weekend.",
    story: "", // TODO: add story
  },
  {
    id: "orchard-light",
    title: "Orchard Light",
    collection: "island-fields",
    medium: "Oil on board",
    dimensions: "45 × 55 cm",
    year: 2022,
    yearSold: 2022,
    status: "sold",
    image: "assets/images/placeholders/painting-09.svg",
    description: "Sold to a returning collector.",
    story: "", // TODO: add story
  },
];

/* Collector feedback — replace placeholders with real, permission-given quotes.
   Leave the array empty ( [] ) to hide the testimonials section entirely. */
const TESTIMONIALS = [
  // {
  //   quote: "Add a real collector quote here once you have permission to publish it.",
  //   name: "Collector name",
  //   detail: "Owns: “Artwork title”",
  // },
];

const PRESS = [
  // { label: "Exhibition", detail: "e.g. Group show, CCA Galleries, St Helier — 2024" }, // TODO: add real exhibitions/press/awards
];
