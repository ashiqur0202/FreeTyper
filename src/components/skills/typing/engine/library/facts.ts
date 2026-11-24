/**
 * Facts for the Practice "facts" tab. Each fact is a short sentence in our own words. It was checked on 2026-11-24
 * against the text of the Wikipedia article named in `source`: the article contains a phrase that says the same
 * thing (see freetyper.md for how the check was done). Wikipedia text is CC BY-SA 4.0; the facts here are
 * re-worded short statements, and the article is credited under the text.
 *
 * Add a fact only after checking it the same way. Keep it plain, stable and uncontroversial, and ASCII only.
 */

export interface Fact {
  id: string;
  text: string;
  source: { title: string; url: string };
  checked: string;
}

export const FACTS: Fact[] = [
  { id: "f001", text: "Light travels through a vacuum at exactly 299,792,458 metres per second.", source: { title: "Speed of light", url: "https://en.wikipedia.org/wiki/Speed_of_light" }, checked: '2026-11-24' },
  { id: "f002", text: "A day on Venus is longer than its year: it turns once in about 243 Earth days but circles the Sun in about 225.", source: { title: "Venus", url: "https://en.wikipedia.org/wiki/Venus" }, checked: '2026-11-24' },
  { id: "f003", text: "Jupiter is the largest planet in the Solar System, with nearly two and a half times the mass of all the other planets combined.", source: { title: "Jupiter", url: "https://en.wikipedia.org/wiki/Jupiter" }, checked: '2026-11-24' },
  { id: "f004", text: "Mercury is the smallest planet in the Solar System and the one closest to the Sun.", source: { title: "Mercury (planet)", url: "https://en.wikipedia.org/wiki/Mercury_(planet)" }, checked: '2026-11-24' },
  { id: "f005", text: "Saturn's rings are made mostly of pieces of water ice.", source: { title: "Rings of Saturn", url: "https://en.wikipedia.org/wiki/Rings_of_Saturn" }, checked: '2026-11-24' },
  { id: "f006", text: "The Moon takes about 27 days to go around the Earth once.", source: { title: "Moon", url: "https://en.wikipedia.org/wiki/Moon" }, checked: '2026-11-24' },
  { id: "f007", text: "The Sun is about eight light-minutes from Earth, so its light takes about eight minutes to reach us.", source: { title: "Sun", url: "https://en.wikipedia.org/wiki/Sun" }, checked: '2026-11-24' },
  { id: "f008", text: "Apollo 11 landed on the Moon on July 20, 1969, and Neil Armstrong became the first human to walk on it.", source: { title: "Apollo 11", url: "https://en.wikipedia.org/wiki/Apollo_11" }, checked: '2026-11-24' },
  { id: "f009", text: "An octopus has three hearts: one pumps blood around the body and two pump it through the gills.", source: { title: "Octopus", url: "https://en.wikipedia.org/wiki/Octopus" }, checked: '2026-11-24' },
  { id: "f010", text: "The blue whale is the largest animal known to have ever lived.", source: { title: "Blue whale", url: "https://en.wikipedia.org/wiki/Blue_whale" }, checked: '2026-11-24' },
  { id: "f011", text: "Honey bees use a waggle dance to tell each other the direction and distance to flowers.", source: { title: "Waggle dance", url: "https://en.wikipedia.org/wiki/Waggle_dance" }, checked: '2026-11-24' },
  { id: "f012", text: "Hyperion, a coast redwood in California, is the tallest known living tree in the world.", source: { title: "Hyperion (tree)", url: "https://en.wikipedia.org/wiki/Hyperion_(tree)" }, checked: '2026-11-24' },
  { id: "f013", text: "Botanically, a banana is a berry, but a strawberry is not.", source: { title: "Berry (botany)", url: "https://en.wikipedia.org/wiki/Berry_(botany)" }, checked: '2026-11-24' },
  { id: "f014", text: "A group of crows is called a murder.", source: { title: "Crow", url: "https://en.wikipedia.org/wiki/Crow" }, checked: '2026-11-24' },
  { id: "f015", text: "A giraffe's long neck has no extra bones: it has the usual seven neck vertebrae, each one just much longer.", source: { title: "Giraffe", url: "https://en.wikipedia.org/wiki/Giraffe" }, checked: '2026-11-24' },
  { id: "f016", text: "The cheetah is the fastest land animal.", source: { title: "Cheetah", url: "https://en.wikipedia.org/wiki/Cheetah" }, checked: '2026-11-24' },
  { id: "f017", text: "The peregrine falcon can reach over 320 kilometres per hour in a dive, which makes it the fastest animal on the planet.", source: { title: "Peregrine falcon", url: "https://en.wikipedia.org/wiki/Peregrine_falcon" }, checked: '2026-11-24' },
  { id: "f018", text: "An adult human skeleton has around 206 bones.", source: { title: "Human skeleton", url: "https://en.wikipedia.org/wiki/Human_skeleton" }, checked: '2026-11-24' },
  { id: "f019", text: "The femur in the thigh is the longest bone in the human body.", source: { title: "Femur", url: "https://en.wikipedia.org/wiki/Femur" }, checked: '2026-11-24' },
  { id: "f020", text: "People recognise five basic tastes: sweet, sour, salty, bitter and umami.", source: { title: "Taste", url: "https://en.wikipedia.org/wiki/Taste" }, checked: '2026-11-24' },
  { id: "f021", text: "A human heart is divided into four chambers.", source: { title: "Heart", url: "https://en.wikipedia.org/wiki/Heart" }, checked: '2026-11-24' },
  { id: "f022", text: "Red blood cells carry oxygen to the body's tissues.", source: { title: "Red blood cell", url: "https://en.wikipedia.org/wiki/Red_blood_cell" }, checked: '2026-11-24' },
  { id: "f023", text: "The Pacific is the largest and deepest of Earth's five oceans.", source: { title: "Pacific Ocean", url: "https://en.wikipedia.org/wiki/Pacific_Ocean" }, checked: '2026-11-24' },
  { id: "f024", text: "The Sahara is the largest hot desert in the world.", source: { title: "Sahara", url: "https://en.wikipedia.org/wiki/Sahara" }, checked: '2026-11-24' },
  { id: "f025", text: "Mount Everest is the highest mountain on Earth above sea level.", source: { title: "Mount Everest", url: "https://en.wikipedia.org/wiki/Mount_Everest" }, checked: '2026-11-24' },
  { id: "f026", text: "Antarctica is the coldest, driest and windiest continent.", source: { title: "Antarctica", url: "https://en.wikipedia.org/wiki/Antarctica" }, checked: '2026-11-24' },
  { id: "f027", text: "Russia is the largest country in the world.", source: { title: "Russia", url: "https://en.wikipedia.org/wiki/Russia" }, checked: '2026-11-24' },
  { id: "f028", text: "Vatican City is the smallest country in the world by area.", source: { title: "Vatican City", url: "https://en.wikipedia.org/wiki/Vatican_City" }, checked: '2026-11-24' },
  { id: "f029", text: "About 71 percent of the Earth's surface is covered by ocean water.", source: { title: "Earth", url: "https://en.wikipedia.org/wiki/Earth" }, checked: '2026-11-24' },
  { id: "f030", text: "The Nile flows north and empties into the Mediterranean Sea.", source: { title: "Nile", url: "https://en.wikipedia.org/wiki/Nile" }, checked: '2026-11-24' },
  { id: "f031", text: "The Amazon is the largest river in the world by the amount of water it carries.", source: { title: "Amazon River", url: "https://en.wikipedia.org/wiki/Amazon_River" }, checked: '2026-11-24' },
  { id: "f032", text: "Greenland is the largest island in the world.", source: { title: "Greenland", url: "https://en.wikipedia.org/wiki/Greenland" }, checked: '2026-11-24' },
  { id: "f033", text: "The chemical formula for water is H2O.", source: { title: "Water", url: "https://en.wikipedia.org/wiki/Water" }, checked: '2026-11-24' },
  { id: "f034", text: "Sound travels faster through water than through air.", source: { title: "Speed of sound", url: "https://en.wikipedia.org/wiki/Speed_of_sound" }, checked: '2026-11-24' },
  { id: "f035", text: "Diamond is a form of the element carbon.", source: { title: "Diamond", url: "https://en.wikipedia.org/wiki/Diamond" }, checked: '2026-11-24' },
  { id: "f036", text: "The chemical symbol for gold is Au, from the Latin word aurum.", source: { title: "Gold", url: "https://en.wikipedia.org/wiki/Gold" }, checked: '2026-11-24' },
  { id: "f037", text: "The periodic table lists 118 known chemical elements.", source: { title: "Periodic table", url: "https://en.wikipedia.org/wiki/Periodic_table" }, checked: '2026-11-24' },
  { id: "f038", text: "The air around a flash of lightning heats up to about 30,000 degrees Celsius.", source: { title: "Lightning", url: "https://en.wikipedia.org/wiki/Lightning" }, checked: '2026-11-24' },
  { id: "f039", text: "The first message sent over the ARPANET, an early computer network, went out on 29 October 1969.", source: { title: "ARPANET", url: "https://en.wikipedia.org/wiki/ARPANET" }, checked: '2026-11-24' },
  { id: "f040", text: "Tim Berners-Lee invented the World Wide Web while working at CERN in 1989.", source: { title: "World Wide Web", url: "https://en.wikipedia.org/wiki/World_Wide_Web" }, checked: '2026-11-24' },
  { id: "f041", text: "The QWERTY layout was devised in the early 1870s by Christopher Latham Sholes.", source: { title: "QWERTY", url: "https://en.wikipedia.org/wiki/QWERTY" }, checked: '2026-11-24' },
  { id: "f042", text: "The Sholes and Glidden was the first commercially successful typewriter.", source: { title: "Sholes and Glidden typewriter", url: "https://en.wikipedia.org/wiki/Sholes_and_Glidden_typewriter" }, checked: '2026-11-24' },
  { id: "f043", text: "The Dvorak keyboard layout was patented in 1936.", source: { title: "Dvorak Simplified Keyboard", url: "https://en.wikipedia.org/wiki/Dvorak_Simplified_Keyboard" }, checked: '2026-11-24' },
  { id: "f044", text: "Johannes Gutenberg, a German inventor, built a movable-type printing press that made printing much faster.", source: { title: "Johannes Gutenberg", url: "https://en.wikipedia.org/wiki/Johannes_Gutenberg" }, checked: '2026-11-24' },
  { id: "f045", text: "The first modern international Olympic Games were held in Athens in 1896.", source: { title: "1896 Summer Olympics", url: "https://en.wikipedia.org/wiki/1896_Summer_Olympics" }, checked: '2026-11-24' },
  { id: "f046", text: "The Eiffel Tower in Paris was built between 1887 and 1889.", source: { title: "Eiffel Tower", url: "https://en.wikipedia.org/wiki/Eiffel_Tower" }, checked: '2026-11-24' },
  { id: "f047", text: "The Scottish physician Alexander Fleming discovered penicillin in 1928.", source: { title: "Penicillin", url: "https://en.wikipedia.org/wiki/Penicillin" }, checked: '2026-11-24' },
  { id: "f048", text: "The Wright brothers made the first flight of an engine-powered aircraft on December 17, 1903.", source: { title: "Wright brothers", url: "https://en.wikipedia.org/wiki/Wright_brothers" }, checked: '2026-11-24' },
  { id: "f049", text: "The modern English alphabet has 26 letters.", source: { title: "English alphabet", url: "https://en.wikipedia.org/wiki/English_alphabet" }, checked: '2026-11-24' },
  { id: "f050", text: "In one count of English text, the most common letters in order are E, T, A, O and N.", source: { title: "Letter frequency", url: "https://en.wikipedia.org/wiki/Letter_frequency" }, checked: '2026-11-24' },
  { id: "f051", text: "Modern pianos have a row of 88 black and white keys.", source: { title: "Piano", url: "https://en.wikipedia.org/wiki/Piano" }, checked: '2026-11-24' },
  { id: "f052", text: "Pi is the ratio of a circle's circumference to its diameter.", source: { title: "Pi", url: "https://en.wikipedia.org/wiki/Pi" }, checked: '2026-11-24' },
  { id: "f053", text: "The word robot comes from a Czech word for forced labor.", source: { title: "Robot", url: "https://en.wikipedia.org/wiki/Robot" }, checked: '2026-11-24' },
  { id: "f054", text: "Some kinds of bamboo are among the fastest-growing plants in the world.", source: { title: "Bamboo", url: "https://en.wikipedia.org/wiki/Bamboo" }, checked: '2026-11-24' },
  { id: "f055", text: "Honey is made by bees from plant nectar and other sugary plant secretions.", source: { title: "Honey", url: "https://en.wikipedia.org/wiki/Honey" }, checked: '2026-11-24' },
];
