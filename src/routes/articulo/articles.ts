import type { ArticleMetadata } from "../../components/types";


export const articles: ArticleMetadata[] = [
    {
        slug: 'quienes-son',
        title: '¿Quienes son?',
        is_new: true,
        is_available: false,
        date: new Date(2025, 5, 11),
        abstract: "Uno por uno, los 17 candidatos en las legislativas de CABA.",
        tags: ["Política", "Scrollytelling"],
        photo: "/images/covers/candidatos-caba-2025.png",
        credit: "",
        alt_photo: "Candidatos CABA 2025",
        hero_photo: "/images/covers/candidatos-caba-2025.png",
        hero_credit: "",
        caption: "Los 17 candidatos a las elecciones legislativas de CABA durante el debate de la Ciudad."
    },
    {
        slug: 'simulador-legislativas-caba-2025',
        title: 'Simulador de escenarios para las legislativas de CABA 2025',
        is_new: false,
        is_available: true,
        date: new Date(2025, 5, 11),
        abstract: "Los distintos escenarios posibles según las últimas encuestas.",
        tags: ["Política", "Elecciones", "Simulador"],
        photo: "/images/covers/legislatura-caba-2025.png",
        credit: "",
        alt_photo: "Legislatura porteña",
        hero_photo: "/images/heros/simulador-legislativas-caba-2025.jpg",
        hero_credit: "",
        caption: ""
    },
    {
        slug: 'hacerle-el-juego-a-la-derecha',
        title: 'Hacerle el juego a la derecha',
        is_new: true,
        is_available: false,
        date: new Date(2025, 5, 11),
        abstract: "Todos se acusan, pero realmente... ¿Quién le hace el juego a la derecha?",
        tags: ["Política"],
        photo: "/images/covers/revista-barcelona-juego-a-la-derecha.png",
        credit: "",
        alt_photo: "Tapa de la Revista Barcelona N° 185 de abril 2010 (https://digital.revisbarcelona.com/library/publication/barcelona-185)",
        hero_photo: "/images/covers/revista-barcelona-juego-a-la-derecha.png",
        hero_credit: "",
        caption: "Tapa de la Revista Barcelona N° 185 de abril 2010"
    },
    {
        slug: 'antiperonismo-y-bahia-blanca',
        title: 'Bahía Blanca y el antiperonismo',
        is_new: true,
        is_available: true,
        date: new Date(2025, 8, 11),
        abstract: "Una radiografía de las últimas elecciones de medio término con foco en el municipio bonaerense.",
        tags: ["Política", "Elecciones", "SIG"],
        photo: "/images/covers/antiperonismo-y-bahia-blanca.png",
        credit: "Por Juan Corral (Fotógrafo, Subdirección de Prensa y Contenidos Públicos del Municipio de Bahía Blanca) - Municipio de Bahía Blanca, CC BY 2.5 ar, https://commons.wikimedia.org/w/index.php?curid=101247573",
        alt_photo: "Legislatura de la Provincia de Buenos Aires",
        hero_photo: "/images/heros/antiperonismo-y-bahia-blanca.jpg",
        hero_credit: "Por Juan Corral (Fotógrafo, Subdirección de Prensa y Contenidos Públicos del Municipio de Bahía Blanca) - Municipio de Bahía Blanca, CC BY 2.5 ar, https://commons.wikimedia.org/w/index.php?curid=101171861",
        caption: ""
    },
];
