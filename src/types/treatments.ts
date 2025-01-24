export interface Treatment {
  id: string;
  title: string;
  category?: string;
  image?: string;
  shortDescription?: string;
  price?: {
    from: number;
    to: number;
  };
  duration?: {
    from: number;
    to: number;
  };
  fordeler: string[];
  ulemper: string[];
  alternativeNames?: string[];
}

export const TREATMENTS: Treatment[] = [
  {
    id: "botox",
    title: "Botox",
    category: "Injeksjonsbehandlinger",
    shortDescription: "Reduser rynker og linjer med Botox-behandling",
    image: "/botox.jpg",
    price: { from: 2500, to: 4500 },
    duration: { from: 30, to: 45 },
    fordeler: [
      "Rask og effektiv behandling",
      "Minimalt med nedetid",
      "Forebygger nye rynker",
      "Resultater varer i 3-6 måneder"
    ],
    ulemper: [
      "Midlertidig effekt",
      "Kan trenge oppfriskning",
      "Lett hevelse første dagene",
      "Bør unngå trening samme dag"
    ]
  },
  {
    id: "hifu",
    title: "HIFU",
    category: "Hudstrammende behandlinger",
    shortDescription: "Ikke-kirurgisk ansiktsløft med ultralyd",
    image: "/hifu.jpg",
    price: { from: 4500, to: 12000 },
    duration: { from: 45, to: 90 },
    fordeler: [
      "Ingen kirurgi eller nåler",
      "Langvarig effekt",
      "Stimulerer naturlig kollagen",
      "Kan behandle flere områder"
    ],
    ulemper: [
      "Kan være noe ubehagelig",
      "Gradvis resultat over tid",
      "Kan trenge flere behandlinger",
      "Forbigående rødhet"
    ]
  },
  {
    id: "leppefiller",
    title: "Leppefiller",
    category: "Injeksjonsbehandlinger",
    shortDescription: "Få fyldigere og mer definerte lepper",
    image: "/leppefiller.jpg",
    price: { from: 3500, to: 5500 },
    duration: { from: 45, to: 60 },
    fordeler: [
      "Umiddelbart synlig resultat",
      "Kan tilpasses ønsket volum",
      "Naturlig følelse",
      "Reversibel behandling"
    ],
    ulemper: [
      "Midlertidig effekt (6-12 måneder)",
      "Lett hevelse første dagene",
      "Kan få blåmerker",
      "Bør unngå trening samme dag"
    ]
  },
  {
    id: "fjerning-av-fillers",
    title: "Fjerning av fillers",
    category: "Injeksjonsbehandlinger",
    shortDescription: "Trygg fjerning av fillere med hyaluronidase",
    image: "/fjerning-av-fillers.jpg",
    price: { from: 2000, to: 4000 },
    duration: { from: 30, to: 45 },
    fordeler: [
      "Rask og effektiv prosedyre",
      "Umiddelbar effekt",
      "Mulighet for ny behandling senere",
      "Løser opp uønskede fillere"
    ],
    ulemper: [
      "Lett hevelse første dagen",
      "Kan trenge flere behandlinger",
      "Midlertidig rødhet",
      "Bør vente før ny fillerbehandling"
    ]
  },
  {
    id: "muskelavslappende",
    title: "Muskelavslappende behandling",
    category: "Injeksjonsbehandlinger",
    shortDescription: "Effektiv behandling mot overdreven svetting og migrene",
    image: "/muskelavslappende.jpg",
    price: { from: 3000, to: 5000 },
    duration: { from: 30, to: 45 },
    fordeler: [
      "Effektiv mot svetting",
      "Lindrer migrene",
      "Lite ubehag under behandling",
      "Langvarig effekt (4-6 måneder)"
    ],
    ulemper: [
      "Gradvis start av effekt",
      "Kan trenge justering av dose",
      "Midlertidig effekt",
      "Lett ømhet første dagen"
    ]
  },
  {
    id: "hudforbedrende",
    title: "Hudforbedrende laserbehandlinger",
    category: "Laserbehandlinger",
    shortDescription: "Forbedre hudtekstur og reduser arr med laser",
    image: "/hudforbedrende.jpg",
    price: { from: 2500, to: 6000 },
    duration: { from: 30, to: 60 },
    fordeler: [
      "Effektiv mot arr og pigmentering",
      "Forbedrer hudens tekstur",
      "Stimulerer kollagenproduksjon",
      "Tilpasses ulike hudtyper"
    ],
    ulemper: [
      "Kan trenge flere behandlinger",
      "Noe rødhet etter behandling",
      "Bør unngå sol etter behandling",
      "Gradvis resultat over tid"
    ]
  },
  {
    id: "em-muskelbygging",
    title: "EM-Muskelbygging",
    category: "Kroppsbehandlinger",
    shortDescription: "Styrk muskler og form kroppen uten kirurgi",
    image: "/em.jpg",
    price: { from: 1500, to: 3500 },
    duration: { from: 30, to: 45 },
    fordeler: [
      "Ingen operasjon nødvendig",
      "Ingen nedetid",
      "Bygger muskler effektivt",
      "Kan behandle flere områder"
    ],
    ulemper: [
      "Trenger flere behandlinger",
      "Lett muskelsårhet",
      "Gradvis resultatutvikling",
      "Bør kombineres med sunt kosthold"
    ]
  },
  {
    id: "profhilo",
    title: "Profhilo og Biosculpture",
    category: "Injeksjonsbehandlinger",
    shortDescription: "Forny og stram opp huden med hyaluronsyre",
    image: "/profhilo.jpg",
    price: { from: 4000, to: 7000 },
    duration: { from: 45, to: 60 },
    fordeler: [
      "Naturlig hudforbedring",
      "Økt hudelastisitet",
      "Langvarig fuktighetseffekt",
      "Stimulerer kollagenproduksjon"
    ],
    ulemper: [
      "Optimal effekt etter flere behandlinger",
      "Små hevelser ved injeksjonspunkter",
      "Gradvis resultatutvikling",
      "Periodisk vedlikehold anbefales"
    ]
  },
  {
    id: "ansiktsskulpturering",
    title: "Ansiktsskulpturering",
    category: "Injeksjonsbehandlinger",
    shortDescription: "Skap harmoni og balanse i ansiktet",
    image: "/ansiktsskulpturering.jpg",
    price: { from: 5000, to: 15000 },
    duration: { from: 60, to: 90 },
    fordeler: [
      "Naturlig resultat",
      "Tilpasset individuelt ansikt",
      "Langtidsvirkende effekt",
      "Kan kombineres med andre behandlinger"
    ],
    ulemper: [
      "Gradvis resultatutvikling",
      "Kan trenge vedlikehold",
      "Lett hevelse første dagene",
      "Bør planlegge i god tid før events"
    ]
  },
  {
    id: "tear-trough",
    title: "Tear Trough",
    category: "Injeksjonsbehandlinger",
    shortDescription: "Reduser mørke ringer og trette øyne",
    image: "/tear.jpg",
    price: { from: 4000, to: 6000 },
    duration: { from: 45, to: 60 },
    fordeler: [
      "Friskere blikk",
      "Reduserer skygger under øynene",
      "Naturlig resultat",
      "Minimal nedetid"
    ],
    ulemper: [
      "Kan trenge oppfriskning",
      "Lett hevelse første dager",
      "Forsiktig behandling kreves",
      "Gradvis integrasjon i vevet"
    ]
  },
  {
    id: "fettfjerning",
    title: "Fettfjerning",
    category: "Kroppsbehandlinger",
    shortDescription: "Målrettet fettreduksjon uten kirurgi",
    image: "/fettfjerning.jpg",
    price: { from: 3500, to: 8000 },
    duration: { from: 45, to: 90 },
    fordeler: [
      "Ingen operasjon nødvendig",
      "Målrettet behandling",
      "Permanent resultat",
      "Naturlig nedbrytning"
    ],
    ulemper: [
      "Gradvis resultat over tid",
      "Kan trenge flere behandlinger",
      "Lett ubehag under behandling",
      "Best i kombinasjon med sunn livsstil"
    ]
  },
  {
    id: "nesekorreksjón",
    title: "Nesekorreksjón",
    category: "Injeksjonsbehandlinger",
    shortDescription: "Forbedre nesens form uten kirurgi",
    image: "/nese.jpg",
    price: { from: 4500, to: 7500 },
    duration: { from: 45, to: 60 },
    fordeler: [
      "Ingen kirurgi nødvendig",
      "Umiddelbart resultat",
      "Minimal nedetid",
      "Reversibel behandling"
    ],
    ulemper: [
      "Midlertidig effekt",
      "Lett hevelse første dagene",
      "Kan trenge vedlikehold",
      "Begrenset korreksjonsgrad"
    ]
  },
  {
    id: "hydrafacial",
    title: "HydraFacial",
    category: "Hudpleie",
    shortDescription: "Dyprens og fuktighetsbehandling for huden",
    image: "/hydrafacial.jpg",
    price: { from: 1500, to: 2500 },
    duration: { from: 45, to: 75 },
    fordeler: [
      "Umiddelbar glød",
      "Grundig dyprens",
      "Tilpasset hudtype",
      "Ingen nedetid"
    ],
    ulemper: [
      "Midlertidig effekt",
      "Anbefales regelmessig behandling",
      "Lett rødhet rett etter",
      "Unngå sminke samme dag"
    ]
  },
  {
    id: "prp-behandling",
    title: "PRP-behandling",
    category: "Regenerativ behandling",
    shortDescription: "Naturlig hudfornyelse med egen plasma",
    image: "/prp-behandling.jpg",
    price: { from: 3000, to: 5000 },
    duration: { from: 45, to: 60 },
    fordeler: [
      "Helt naturlig behandling",
      "Stimulerer hudens egne prosesser",
      "Langsiktig hudfornyelse",
      "Kan kombineres med andre behandlinger"
    ],
    ulemper: [
      "Krever blodprøvetaking",
      "Gradvis resultatutvikling",
      "Kan trenge flere behandlinger",
      "Lett rødhet første dagen"
    ]
  },
  {
    id: "biostimulatorer",
    title: "Biostimulatorer",
    category: "Injeksjonsbehandlinger",
    shortDescription: "Stimuler naturlig kollagenproduksjon",
    image: "/biostimulatorer.jpg",
    price: { from: 4500, to: 8000 },
    duration: { from: 45, to: 60 },
    fordeler: [
      "Langvarig effekt",
      "Naturlig resultat",
      "Stimulerer egen kollagenproduksjon",
      "Forbedrer hudens kvalitet"
    ],
    ulemper: [
      "Gradvis resultatutvikling",
      "Kan være noe ubehagelig",
      "Lett hevelse første dagene",
      "Optimal effekt etter flere behandlinger"
    ]
  },
  {
    id: "medisinsk-hudpleie",
    title: "Medisinsk hudpleie",
    category: "Hudpleie",
    shortDescription: "Skreddersydd hudpleie for dine behov",
    image: "/medisinsk-hudpleie.jpg",
    price: { from: 1200, to: 2500 },
    duration: { from: 45, to: 60 },
    fordeler: [
      "Personlig tilpasset behandling",
      "Profesjonelle produkter",
      "Forbedrer hudkvalitet",
      "Forebyggende effekt"
    ],
    ulemper: [
      "Kan trenge regelmessig oppfølging",
      "Midlertidig rødhet",
      "Gradvis resultatutvikling",
      "Krever hjemmepleie for best resultat"
    ]
  },
  {
    id: "dermapen",
    title: "Dermapen",
    category: "Hudforbedrende behandlinger",
    shortDescription: "Mikronåling for bedre hudkvalitet",
    image: "/dermapen.jpg",
    price: { from: 2000, to: 3500 },
    duration: { from: 45, to: 60 },
    fordeler: [
      "Effektiv hudfornyelse",
      "Stimulerer kollagenproduksjon",
      "Kan behandle flere hudtilstander",
      "Minimal nedetid"
    ],
    ulemper: [
      "Lett rødhet 1-2 dager",
      "Kan trenge flere behandlinger",
      "Bør unngå sol etter behandling",
      "Gradvis resultatutvikling"
    ]
  },
  {
    id: "vanityshape",
    title: "VanityShape Cellulittreduksjon",
    category: "Kroppsbehandlinger",
    shortDescription: "Effektiv behandling mot cellulitter",
    image: "/vanityshape.jpg",
    price: { from: 1500, to: 3000 },
    duration: { from: 45, to: 60 },
    fordeler: [
      "Ikke-invasiv behandling",
      "Behagelig prosedyre",
      "Forbedrer hudens tekstur",
      "Ingen nedetid"
    ],
    ulemper: [
      "Krever flere behandlinger",
      "Best resultat med sunn livsstil",
      "Gradvis forbedring",
      "Vedlikeholdsbehandling anbefales"
    ]
  },
  {
    id: "tatoveringsfjerning",
    title: "Tatoveringsfjerning",
    category: "Laserbehandlinger",
    shortDescription: "Sikker fjerning av uønskede tatoveringer",
    image: "/tatoveringsfjerning.jpg",
    price: { from: 1500, to: 4000 },
    duration: { from: 30, to: 45 },
    fordeler: [
      "Effektiv fjerning av tatoveringer",
      "Moderne laserteknologi",
      "Kan behandle ulike farger",
      "Minimal risiko for arrdannelse"
    ],
    ulemper: [
      "Krever flere behandlinger",
      "Gradvis bleking over tid",
      "Lett ubehag under behandling",
      "Bør unngå sol på behandlet område"
    ]
  },
  {
    id: "pluryal-elixir",
    title: "Pluryal ELIXIR og Mesoterapi",
    category: "Hudforbedrende behandlinger",
    shortDescription: "Revitaliserende behandling for glødende hud",
    image: "/pluryal-elixir.jpg",
    price: { from: 2500, to: 4000 },
    duration: { from: 45, to: 60 },
    fordeler: [
      "Dyp hydrering av huden",
      "Forbedrer hudens glød",
      "Reduserer fine linjer",
      "Kan kombineres med andre behandlinger"
    ],
    ulemper: [
      "Kan trenge vedlikeholdsbehandlinger",
      "Lett rødhet første dagen",
      "Gradvis resultatutvikling",
      "Midlertidig følsomhet i huden"
    ]
  },
  {
    id: "harfjerning",
    title: "Hårfjerning med laser",
    category: "Laserbehandlinger",
    shortDescription: "Permanent hårreduksjon med laser",
    image: "/harfjerning.jpg",
    price: { from: 1000, to: 5000 },
    duration: { from: 30, to: 90 },
    fordeler: [
      "Langvarig hårreduksjon",
      "Behandler større områder",
      "Reduserer inngrodd hår",
      "Glattere hud over tid"
    ],
    ulemper: [
      "Krever flere behandlinger",
      "Best effekt på mørkt hår",
      "Bør unngå sol før/etter",
      "Gradvis resultatutvikling"
    ]
  },
  {
    id: "visia",
    title: "Visia hudskanner",
    category: "Hudanalyse",
    shortDescription: "Avansert hudanalyse for personlig behandlingsplan",
    image: "/visia.jpg",
    price: { from: 500, to: 1000 },
    duration: { from: 30, to: 45 },
    fordeler: [
      "Detaljert hudanalyse",
      "Personlig behandlingsplan",
      "Dokumenterer hudforandringer",
      "Målbare resultater"
    ],
    ulemper: [
      "Kun analyseverktøy",
      "Krever oppfølgingsanalyser",
      "Begrenset til synlige hudlag",
      "Bør kombineres med behandling"
    ]
  },
  {
    id: "ipl",
    title: "IPL-behandling",
    category: "Laserbehandlinger",
    shortDescription: "Effektiv behandling av pigmentflekker og karspreng",
    image: "/ipl.jpg",
    price: { from: 1500, to: 3500 },
    duration: { from: 30, to: 60 },
    fordeler: [
      "Behandler flere hudtilstander",
      "Jevnere hudtone",
      "Reduserer pigmentflekker",
      "Minimal nedetid"
    ],
    ulemper: [
      "Kan trenge flere behandlinger",
      "Midlertidig rødhet",
      "Bør unngå sol etter behandling",
      "Ikke egnet for alle hudtyper"
    ]
  },
  {
    id: "tannbleking",
    title: "Tannbleking",
    category: "Tannbehandlinger",
    shortDescription: "Profesjonell bleking for hvitere tenner",
    image: "/tannbleking.jpg",
    price: { from: 2500, to: 4500 },
    duration: { from: 60, to: 90 },
    fordeler: [
      "Umiddelbart synlig resultat",
      "Profesjonell behandling",
      "Langvarig effekt",
      "Skånsom for tennene"
    ],
    ulemper: [
      "Forbigående følsomhet",
      "Bør unngå fargesterke matvarer",
      "Kan trenge vedlikehold",
      "Ikke egnet for alle"
    ]
  },
  {
    id: "green-peel",
    title: "Green Peel",
    category: "Hudpleie",
    shortDescription: "Naturlig peeling for fornyet hud",
    image: "/green-peel.jpg",
    price: { from: 1500, to: 2500 },
    duration: { from: 45, to: 60 },
    fordeler: [
      "100% naturlige ingredienser",
      "Effektiv hudfornyelse",
      "Tilpasset ulike hudtyper",
      "Forbedrer hudtekstur"
    ],
    ulemper: [
      "Huden kan flasse lett",
      "Noe rødhet første dagene",
      "Bør unngå sol etter behandling",
      "Kan trenge gjentatte behandlinger"
    ]
  },
  {
    id: "akne",
    title: "Akne og aknearr",
    category: "Hudforbedrende behandlinger",
    shortDescription: "Effektiv behandling av aktiv akne og arr",
    image: "/akne.jpg",
    price: { from: 1500, to: 3500 },
    duration: { from: 45, to: 60 },
    fordeler: [
      "Målrettet behandling",
      "Reduserer arrdannelse",
      "Kombinerer ulike metoder",
      "Langsiktig hudforbedrende effekt"
    ],
    ulemper: [
      "Kan trenge flere behandlinger",
      "Midlertidig rødhet",
      "Gradvis forbedring",
      "Krever god hjemmepleie"
    ]
  }
];