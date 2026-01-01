// Nombre del viaje
const tripName = "Japan Countryside Trip";

// Objetos a comprar para el viaje
const shoppingItems = [
    {
        id: 1,
        name: "JR Pass 14 días",
        category: "transporte",
        price: 450,
        currency: "EUR",
        purchased: false,
        link: "https://www.jrpass.com"
    },
    {
        id: 2,
        name: "Adaptador de enchufe japonés",
        category: "electronica",
        price: 12,
        currency: "EUR",
        purchased: true,
        link: ""
    },
    {
        id: 3,
        name: "Pocket WiFi",
        category: "electronica",
        price: 80,
        currency: "EUR",
        purchased: false,
        link: ""
    },
    {
        id: 4,
        name: "Seguro de viaje",
        category: "documentos",
        price: 150,
        currency: "EUR",
        purchased: false,
        link: ""
    },
    {
        id: 5,
        name: "Entradas Museo Ghibli",
        category: "entradas",
        price: 40,
        currency: "EUR",
        purchased: false,
        link: ""
    },
    {
        id: 6,
        name: "Entradas PokePark",
        category: "entradas",
        price: 120,
        currency: "EUR",
        purchased: false,
        link: ""
    }
];

const accommodations = [
    {
        id: 1,
        name: "ShinOsaka Airbnb",
        price: 92,
        link: "https://www.airbnb.es/rooms/31774982?adults=2&check_in=2026-07-03&check_out=2026-07-04&children=2&location=Osaka%2C%20Japón&search_mode=regular_search&source_impression_id=p3_1766317504_P3b77foPsERBoXVj&previous_page_section_name=1001&federated_search_id=1823eed9-0f94-4b60-96d8-db901dca8fda",
        fromDay: 1,
        toDay: 1,
        coordinates: [34.7060, 135.4910]
    },
    {
        id: 2,
        name: "Ryokan Kinosaki",
        price: 220,
        link: "https://dormy-hotels.com/reserve/search-plan-room?keyword=城崎%20円山川温泉%20銀花&checkin=2026%2F07%2F04&search_by_tag=plan&number_of_nights=1&number_of_rooms=1&tags=&brands=&order_by=&hotelId=271&planId=4898&number_of_adults[]=2&number_of_children_need_futons[]=2&number_of_children_no_need_futons[]=0",
        fromDay: 2,
        toDay: 2,
        coordinates: [35.6283, 134.8141]
    },
    {
        id: 3,
        name: "ShinOsaka Airbnb",
        price: 92,
        link: "https://www.airbnb.es/rooms/31774982?adults=2&check_in=2026-07-03&check_out=2026-07-04&children=2&location=Osaka%2C%20Japón&search_mode=regular_search&source_impression_id=p3_1766317504_P3b77foPsERBoXVj&previous_page_section_name=1001&federated_search_id=1823eed9-0f94-4b60-96d8-db901dca8fda",
        fromDay: 3,
        toDay: 3,
        coordinates: [34.7055, 135.4910]
    },
    {
        id: 4,
        name: "Apartamento Tokyo",
        price: 100,
        link: "https://www.airbnb.es/rooms/46325248?adults=2&check_in=2026-07-06&check_out=2026-07-07&children=2&search_mode=regular_search&source_impression_id=p3_1766744958_P3slamj4HLrTlTKF&previous_page_section_name=1000&federated_search_id=9e056c25-318d-4f7b-b580-0e82719854b2",
        fromDay: 4,
        toDay: 4,
        coordinates: [35.6812, 139.7671]
    },
    {
        id: 5,
        name: "Apartamento Matsumoto",
        price: 200,
        link: "https://www.airbnb.es/rooms/19581084?check_in=2026-07-07&check_out=2026-07-09&guests=1&adults=2&children=2&s=67&unique_share_id=4e9bab46-99d4-45e6-a371-60bdc67bb9bb",
        fromDay: 5,
        toDay: 6,
        coordinates: [36.2381, 137.9715]
    },
    {
        id: 6,
        name: "Ryokan Hakone",
        price: 200,
        link: "https://www.booking.com/hotel/jp/bamboo-choju-yu-hakone.es.html?label=gen173nr-10CAEoggI46AdIM1gEaEaIAQGYATO4AQfIAQ3YAQPoAQH4AQGIAgGoAgG4AqrDucoGwAIB0gIkMGY4NDJiN2EtOTE0YS00MmU1LTg5MWItNzQwNThlYmYwNjdl2AIB4AIB&sid=5c0576d54ea6b4c1471230389d0f9e39&aid=304142&ucfs=1&checkin=2026-07-09&checkout=2026-07-10&dest_id=258925&dest_type=landmark&group_adults=2&no_rooms=1&group_children=2&age=4&req_age=4&age=8&req_age=8&srpvid=ce898e7fb7273a9992f11ddc15662e61&srepoch=1766753543&matching_block_id=126761001_423823373_3_0_0&atlas_src=sr_iw_title",
        fromDay: 7,
        toDay: 7,
        coordinates: [35.2039, 139.0220]
    },
    {
        id: 7,
        name: "Ryokan Tsurunoyu",
        price: 83,
        link: "https://www.tsurunoyu.com",
        fromDay: 8,
        toDay: 9,
        coordinates: [39.7450, 140.7860]
    },
    {
        id: 8,
        name: "Alojamiento Morioka",
        price: 90,
        link: "",
        fromDay: 10,
        toDay: 10,
        coordinates: [39.7036, 141.1527]
    },
    {
        id: 9,
        name: "Comfort Inn Ichinoseki",
        price: 90,
        link: "https://www.booking.com/hotel/jp/comfort-inn-iwate-ichinoseki-ic.es.html?aid=304142&label=gen173nr-10CAEoggI46AdIM1gEaEaIAQGYATO4AQfIAQ3YAQPoAQH4AQGIAgGoAgG4AqrDucoGwAIB0gIkMGY4NDJiN2EtOTE0YS00MmU1LTg5MWItNzQwNThlYmYwNjdl2AIB4AIB&sid=93cfe30cb393e684186c32dd5aca3382&age=4&age=8&all_sr_blocks=33296016_394322684_2_2_0%2C33296017_394322684_1_2_0&checkin=2026-07-13&checkout=2026-07-14&dest_id=-230081&dest_type=city&dist=0&group_adults=2&group_children=2&hapos=1&highlighted_blocks=33296016_394322684_2_2_0%2C33296017_394322684_1_2_0&hpos=1&matching_block_id=33296016_394322684_2_2_0&no_rooms=1&req_adults=2&req_age=4&req_age=8&req_children=2&room1=A%2CA%2C4%2C8&sb_price_type=total&sr_order=popularity&sr_pri_blocks=33296016_394322684_2_2_0__840000%2C33296017_394322684_1_2_0__690000&srepoch=1766769350&srpvid=f682fc9bf1a837bbb31acb4aab7381d3&type=total&ucfs=1&#_",
        fromDay: 11,
        toDay: 11,
        coordinates: [38.9342, 141.1267]
    },
    {
        id: 10,
        name: "Nikkoshi Ogurayama Forest Park",
        price: 120,
        link: "https://www.booking.com/hotel/jp/nikko-park-lodge-mountain-side.es.html?label=gen173nr-10CAEoggI46AdIM1gEaEaIAQGYATO4AQfIAQ3YAQPoAQH4AQGIAgGoAgG4AqrDucoGwAIB0gIkMGY4NDJiN2EtOTE0YS00MmU1LTg5MWItNzQwNThlYmYwNjdl2AIB4AIB&sid=5c0576d54ea6b4c1471230389d0f9e39&aid=304142&ucfs=1&checkin=2026-07-14&checkout=2026-07-15&dest_id=-238790&dest_type=city&group_adults=2&no_rooms=1&group_children=2&age=4&req_age=4&age=8&req_age=8&srpvid=a8305e5d1c56d05661bd2fabe70d5d35&srepoch=1766772517&matching_block_id=28187303_91917990_4_34_0&atlas_src=sr_iw_title#_",
        fromDay: 12,
        toDay: 12,
        coordinates: [36.7500, 139.6000]
    },
    {
        id: 11,
        name: "Apartamento Tokyo",
        price: 210,
        link: "https://www.airbnb.es/rooms/1161393077315930218?adults=2&check_in=2026-07-15&check_out=2026-07-18&children=2&location=Tokio%2C%20Japón&search_mode=regular_search&source_impression_id=p3_1766841296_P3Wnsi5qU57C_Jm6&previous_page_section_name=1001&federated_search_id=fb73b18c-372c-459c-b40f-db01d2971d4f&federated_search_id=c5737083-d114-4a46-a48c-f706e0bc1341",
        fromDay: 13,
        toDay: 15,
        coordinates: [35.6812, 139.7671]
    },
    {
        id: 12,
        name: "Alojamiento Gujo",
        price: 100,
        link: "",
        fromDay: 16,
        toDay: 16,
        coordinates: [35.7431, 136.9595]
    },
    {
        id: 13,
        name: "Apartamento Osaka",
        price: 380,
        link: "https://www.airbnb.es/rooms/23456224?adults=2&check_in=2026-07-19&check_out=2026-07-27&children=2&search_mode=regular_search&source_impression_id=p3_1766313739_P3uNVSk2TqIBHETX&previous_page_section_name=1000&federated_search_id=cd60147b-d38f-4eee-94ee-85879cb2802e",
        fromDay: 17,
        toDay: 24,
        coordinates: [34.7050, 135.4905]
    }
];

// Tipos de actividad disponibles:
// 'vuelo' - Actividades relacionadas con vuelos
// 'transporte' - Trenes, buses, alquiler de coches
// 'comida' - Restaurantes, cafés, comidas
// 'visita' - Visitas turísticas, museos, templos
// 'alojamiento' - Check-in, check-out de hoteles
// 'normal' - Actividades generales (por defecto)

const days = [
    {
        title: "2 de Julio - Vuelo",
        activities: [
            { time: "07:00", name: "Despertador", description: "Prepararse para el viaje hacia Japón." },
            { time: "07:30", name: "Uber al aeropuerto", description: "Traslado reservado hacia el aeropuerto de Barcelona.", type: "transporte", coordinates: [41.2974, 2.0833] },
            { time: "08:00", name: "Facturar maletas", description: "Facturar maletas para el vuelo internacional.", type: "vuelo" },
            { time: "08:30", name: "Desayunar en el aeropuerto", description: "Comer algo antes del vuelo.", type: "comida" },
            { time: "10:45", name: "Vuelo a Abu Dhabi", description: "Salida del vuelo hacia Abu Dhabi.", type: "vuelo", coordinates: [24.433, 54.6511] },
            { time: "19:10 (16:15 BCN)", name: "Llegada a Abu Dhabi", description: "Escala técnica antes de continuar hacia Osaka.", type: "vuelo" },
            { time: "21:15 (18:15 BCN)", name: "Vuelo a Osaka", description: "Conexión hacia Japón.", type: "vuelo" }
        ]
    },
    {
        title: "3 de Julio - Llegada",
        activities: [
            { time: "11:45 (04:45 BCN)", name: "Llegada a Osaka", description: "Aterrizaje en el Aeropuerto Internacional de Kansai.", coordinates: [34.4342, 135.2324] },
            { time: "14:00", name: "Shin Osaka - Piso Airbnb", description: "Llegada al apartamento y siesta.", importantInfo: "4450 yen (25€)", coordinates: [34.7336, 135.5001] },
            { time: "15:00", name: "Buscar donde comer", description: "Explorar la zona y decidir dónde comer.", importantInfo: "Pendiente de decidir" },
            { time: "16:00", name: "Pasar la tarde y comprar desayuno", description: "Paseo por la zona y comprar desayuno para el día siguiente." },
            { time: "19:30", name: "Cenar", description: "Cenar en algún restaurante cercano." },
            { time: "20:00", name: "Dormir", description: "Descansar tras el viaje." }
        ]
    },
    {
        title: "4 de Julio - Miyama y Kinosaki Onsen",
        activities: [
            { time: "08:00", name: "Alquilar coche en Shin-Osaka", description: "Recoger el coche de alquiler.", coordinates: [34.7336, 135.5001] },
            { time: "10:30", name: "Llegada a Kayabuki no Sato", description: "Aldea tradicional con casas de tejado de paja.", importantInfo: "1200 yen peaje", coordinates: [35.2906, 135.6741] },
            { time: "11:00", name: "Paseo por el pueblo y río", description: "Explorar el pintoresco pueblo de Miyama." },
            { time: "13:00", name: "Comer", description: "Almuerzo en la zona." },
            { time: "14:00", name: "Salida hacia Kinosaki", description: "Viaje en coche a la ciudad balneario." },
            { time: "16:30", name: "Llegada a Kinosaki - Check-in", description: "Llegada al ryokan y check-in.", coordinates: [35.6283, 134.8141] },
            { time: "17:00", name: "Pasear zona hotel / río", description: "Explorar los alrededores del hotel." },
            { time: "19:00", name: "Baño termal y cena", description: "Disfrutar del onsen y cenar en el ryokan." },
            { time: "22:00", name: "Bona nit", description: "Descanso." }
        ]
    },
    {
        title: "5 de Julio - Península de Ine - Amanohashidate",
        activities: [
            { time: "09:00", name: "Salida destino Ine", description: "Viaje en coche hacia la aldea de pescadores." },
            { time: "10:30", name: "Llegada a Ine", description: "Llegada a la pintoresca aldea.", coordinates: [35.6836, 135.2728] },
            { time: "11:00", name: "Visitar pueblo y paseo en barco", description: "Tour en barco para ver las casas flotantes (funaya)." },
            { time: "13:00", name: "Comer por la zona", description: "Marisco fresco y opciones locales." },
            { time: "15:00", name: "Pasear por puente de arena de Amanohashidate", description: "Visitar uno de los tres paisajes más bellos de Japón.", coordinates: [35.5614, 135.1897] },
            { time: "17:00", name: "Ir a Miyazu - Takigamijido Park", description: "Parque para que las niñas jueguen.", coordinates: [35.5361, 135.1986] },
            { time: "18:00", name: "Volver a Osaka", description: "Viaje de regreso a Osaka." },
            { time: "20:00", name: "Cena y dormir", description: "Cenar y descansar." },
            { time: "", name: "Extra papá: Dejar el coche", description: "Devolver el coche de alquiler.", isOptional: true }
        ]
    },
    {
        title: "6 de Julio - Tokyo",
        activities: [
            { time: "09:00", name: "Shinkansen a Tokyo", description: "Viaje en tren bala a Tokyo.", importantInfo: "37500 yen (203,43€)", coordinates: [35.6812, 139.7671] },
            { time: "12:30", name: "Comer", description: "Almuerzo en Tokyo." },
            { time: "15:00", name: "Buscar donde jugar", description: "Encontrar un parque o zona de juegos para las niñas." },
            { time: "16:00", name: "Café Pokémon", description: "Experiencia divertida para las niñas.", coordinates: [35.6295, 139.7109] },
            { time: "20:00", name: "Casa y dormir", description: "Volver al apartamento y descansar." }
        ]
    },
    {
        title: "7 de Julio - A Matsumoto",
        activities: [
            { time: "08:00", name: "Alquilar coche", description: "Recoger el coche de alquiler en Tokyo." },
            { time: "11:00", name: "Llegada a Matsumoto", description: "Llegada a la ciudad.", coordinates: [36.2381, 137.9715] },
            { time: "11:15", name: "Llegada a Daio Wasabi Farm", description: "Visitar la granja de wasabi más grande de Japón.", coordinates: [36.3419, 137.8968] },
            { time: "13:00", name: "Buscar donde comer y pasear", description: "Almuerzo y explorar la zona." },
            { time: "16:00", name: "Ir a Castillo de Matsumoto y pasear", description: "Visitar el Castillo del Cuervo.", coordinates: [36.2381, 137.9715] }
        ]
    },
    {
        title: "8 de Julio - Shirakawago",
        activities: [
            { time: "08:00", name: "Salida hacia Shirakawago", description: "Viaje en coche a la aldea patrimonio UNESCO." },
            { time: "10:30", name: "Llegada a Shirakawago", description: "Llegada a la aldea de casas gassho-zukuri.", coordinates: [36.2606, 136.9066] },
            { time: "13:00", name: "Comer", description: "Almuerzo local, prueba de soba y miso." },
            { time: "14:00", name: "Disfrutar del pueblo", description: "Explorar las casas tradicionales y vistas panorámicas." },
            { time: "17:00", name: "Volver a Matsumoto", description: "Regreso en coche." },
            { time: "19:30", name: "Dormir en Matsumoto", description: "Descanso en el apartamento." }
        ]
    },
    {
        title: "9 de Julio - Lagos del Monte Fuji",
        activities: [
            { time: "08:00", name: "Salida hacia Lago Kawaguchi", description: "Viaje en coche hacia la zona del Monte Fuji." },
            { time: "10:00", name: "Visitar Lago Kawaguchi", description: "Explorar la zona con vistas al Fuji.", coordinates: [35.5163, 138.7515] },
            { time: "12:00", name: "Salida al Lago Yamanaka", description: "Segundo lago de la zona.", coordinates: [35.4167, 138.8667] },
            { time: "13:00", name: "Comer", description: "Almuerzo en la zona." },
            { time: "14:00", name: "Salida al Lago Ashi", description: "Viaje hacia Hakone.", coordinates: [35.2039, 139.0220] },
            { time: "15:30", name: "Actividades - Barco pirata", description: "Crucero en barco pirata por el lago.", coordinates: [35.2039, 139.0220] }
        ]
    },
    {
        title: "10 de Julio - Shinkansen a Morioka",
        activities: [
            { time: "09:00", name: "Salida a Tokyo", description: "Viaje en coche de regreso a Tokyo.", importantInfo: "37500 yen (203,43€)" },
            { time: "11:00", name: "Devolver coche y Shinkansen a Morioka", description: "Devolver el coche y tomar el tren bala al norte.", coordinates: [39.7036, 141.1527] },
            { time: "15:00", name: "Alquilar coche", description: "Recoger coche de alquiler en Morioka." },
            { time: "16:00", name: "Ir a jugar a la zona del Lago Gosho", description: "Actividades al aire libre cerca del lago.", coordinates: [39.7500, 140.9500] }
        ]
    },
    {
        title: "11 de Julio - Tsurunoyu Onsen y Lago Tazawako",
        activities: [
            { time: "09:00", name: "Ir al Lago Tazawa", description: "Levantarse cuando apetezca e ir al lago más profundo de Japón.", coordinates: [39.7286, 140.6597] },
            { time: "16:00", name: "Disfrutar del día", description: "Hacer lo que queramos hasta ir a Tsurunoyu Onsen." },
            { time: "18:00", name: "Tsurunoyu Onsen", description: "Disfrutar de uno de los onsen más famosos de Japón.", coordinates: [39.7450, 140.7860] }
        ]
    },
    {
        title: "12 de Julio - Morioka",
        activities: [
            { time: "09:00", name: "Visitar Koiwai Farm", description: "Granja histórica con actividades para niños.", coordinates: [39.7544, 141.0056] },
            { time: "14:00", name: "Visitar Castillo Morioka", description: "Ruinas del castillo con parque. Por la noche hay luciérnagas.", coordinates: [39.7022, 141.1378] }
        ]
    },
    {
        title: "13 de Julio - Ichinoseki",
        activities: [
            { time: "08:00", name: "Tren de Morioka a Ichinoseki", description: "Viaje en tren hacia el sur.", importantInfo: "10500 yen (56,97€)", coordinates: [38.9342, 141.1267] },
            { time: "09:00", name: "Coger el tren Pikachu", description: "Experiencia especial en el tren temático de Pokémon." },
            { time: "10:00", name: "Bajar en Hiraizumi", description: "Visitar la zona histórica de Hiraizumi.", coordinates: [38.9867, 141.1136] },
            { time: "12:00", name: "Volver a Ichinoseki", description: "Regreso a la ciudad." },
            { time: "16:00", name: "Geibikei Gorge - Paseo en barca", description: "Paisajes espectaculares y paseo en barca tradicional.", coordinates: [38.9833, 141.2833] }
        ]
    },
    {
        title: "14 de Julio - Nikko",
        activities: [
            { time: "09:00", name: "Salir de Ichinoseki", description: "Viaje hacia Nikko.", importantInfo: "30000 yen (163€)" },
            { time: "13:00", name: "Llegada a Nikko - Comer y check-in", description: "Llegada, almuerzo e instalarse en el alojamiento.", coordinates: [36.7500, 139.6000] },
            { time: "15:00", name: "Visitar Shinkyo Bridge", description: "El puente sagrado rojo de Nikko.", coordinates: [36.7578, 139.5997] },
            { time: "16:30", name: "Nikkozan Rinnoji Temple", description: "Templo budista histórico.", importantInfo: "Pendiente de confirmar", coordinates: [36.7581, 139.5986] },
            { time: "17:30", name: "Nikko Toshogu", description: "Santuario más famoso de Nikko, patrimonio UNESCO.", coordinates: [36.7581, 139.5997] }
        ]
    },
    {
        title: "15 de Julio - Tokyo",
        activities: [
            { time: "09:00", name: "Salida de Nikko dirección Tokyo", description: "Viaje en tren a Tokyo.", importantInfo: "8750 yen (50€)" },
            { time: "12:00", name: "Llegada a Tokyo - Ir al piso", description: "Llegada e instalarse en el apartamento.", coordinates: [35.6812, 139.7671] },
            { time: "13:00", name: "Comer y descansar", description: "Almuerzo y tiempo de descanso." },
            { time: "15:00", name: "Tokyo SkyTree y tienda Pokémon", description: "Subida al mirador y visita a la tienda.", coordinates: [35.7101, 139.8107] },
            { time: "17:00", name: "Parque infantil al lado", description: "Tiempo de juego para las niñas." },
            { time: "19:00", name: "Cenar y dormir", description: "Cena y descanso." }
        ]
    },
    {
        title: "16 de Julio - Tokyo POKEPARK",
        activities: [
            { time: "10:00", name: "POKEPARK", description: "Día completo en el parque temático de Pokémon.", coordinates: [35.6295, 139.8836] }
        ]
    },
    {
        title: "17 de Julio - Tokyo Ghibli Museum",
        activities: [
            { time: "10:00", name: "Museo Ghibli", description: "Museo del Studio Ghibli en Mitaka.", coordinates: [35.6962, 139.5704] },
            { time: "13:00", name: "Comer", description: "Almuerzo en la zona." },
            { time: "15:00", name: "Visitar Parque Inokashira", description: "Parque con lago y naturaleza.", coordinates: [35.6994, 139.5731] }
        ]
    },
    {
        title: "18 de Julio - Gujo Hachiman",
        activities: [
            { time: "09:00", name: "Shinkansen a Nagoya", description: "Viaje en tren bala.", importantInfo: "29000 yen (158€)", coordinates: [35.1815, 136.9066] },
            { time: "11:00", name: "Tren a Gujo", description: "Conexión en tren local a Gujo Hachiman.", coordinates: [35.7431, 136.9595] },
            { time: "14:00", name: "Comer", description: "Almuerzo en el pueblo." },
            { time: "15:00", name: "Visitar pueblo y dormir", description: "Pasear por el río y el casco histórico." }
        ]
    },
    {
        title: "19 de Julio - Nagoya",
        activities: [
            { time: "10:00", name: "Explorar Nagoya", description: "Día libre en Nagoya.", coordinates: [35.1815, 136.9066] }
        ]
    },
    {
        title: "20 de Julio - Iga",
        activities: [
            { time: "08:00", name: "Salir de Nagoya dirección Iga", description: "Viaje en tren a la ciudad ninja.", importantInfo: "6650 yen (36€)", coordinates: [34.7667, 136.1333] },
            { time: "10:00", name: "Museo de los Ninjas", description: "Visitar el famoso museo ninja de Iga.", coordinates: [34.7694, 136.1306] },
            { time: "13:00", name: "Comer", description: "Almuerzo en Iga." },
            { time: "14:00", name: "Visitar castillo y parque", description: "Castillo de Iga Ueno y zonas verdes.", coordinates: [34.7694, 136.1306] },
            { time: "18:00", name: "Tren dirección Osaka", description: "Viaje a Osaka.", importantInfo: "6650 yen (36€)", coordinates: [34.6937, 135.5023] }
        ]
    },
    {
        title: "21 de Julio - Osaka",
        activities: [
            { time: "10:00", name: "Mañana libre", description: "Tiempo libre para descansar o explorar." },
            { time: "16:00", name: "Café Pokémon", description: "Visita al Pokémon Café de Osaka.", coordinates: [34.7025, 135.4959] }
        ]
    },
    {
        title: "22 de Julio - Osaka (Kurashiki?)",
        activities: [
            { time: "10:00", name: "Día libre / Kurashiki", description: "Opción de visitar Kurashiki o día libre en Osaka.", importantInfo: "Pendiente de decidir", isOptional: true, coordinates: [34.5958, 133.7719] }
        ]
    },
    {
        title: "23 de Julio - Nara y Fushimi",
        activities: [
            { time: "06:00", name: "Bon dia", description: "Despertar temprano." },
            { time: "07:00", name: "Excursión a Nara", description: "Visitar el parque de los ciervos y el templo Todai-ji.", coordinates: [34.6851, 135.8050] },
            { time: "12:00", name: "Comer", description: "Almuerzo en Nara." },
            { time: "13:00", name: "Fushimi Inari Taisha", description: "Santuario con miles de torii rojos.", coordinates: [34.9671, 135.7727] },
            { time: "17:00", name: "Lugar para jugar", description: "Buscar un parque para que las niñas jueguen." },
            { time: "20:00", name: "Dormir", description: "Regreso al alojamiento y descanso." }
        ]
    },
    {
        title: "24 de Julio - Kyoto - GION MATSURI",
        activities: [
            { time: "10:00", name: "GION MATSURI", description: "Uno de los festivales más importantes de Japón en Kyoto.", importantInfo: "Festival tradicional", coordinates: [35.0039, 135.7756] }
        ]
    },
    {
        title: "25 de Julio - Osaka - TENJIN MATSURI",
        activities: [
            { time: "10:00", name: "TENJIN MATSURI", description: "Uno de los tres grandes festivales de Japón, con procesión de barcos y fuegos artificiales.", importantInfo: "Festival tradicional de Osaka", coordinates: [34.6937, 135.5131] }
        ]
    },
    {
        title: "26 de Julio - Osaka",
        activities: [
            { time: "06:00", name: "Bon dia", description: "Despertar temprano." },
            { time: "07:00", name: "Visitar Namba y Dotonbori", description: "Explorar la zona más famosa de Osaka.", coordinates: [34.6687, 135.5010] },
            { time: "12:00", name: "Comer", description: "Almuerzo en Osaka." },
            { time: "14:00", name: "Visitar Umeda y tienda Pokémon", description: "Zona comercial y Pokémon Center.", coordinates: [34.7055, 135.4892] },
            { time: "16:00", name: "Ir al Acuario", description: "Visitar el Kaiyukan, uno de los acuarios más grandes del mundo.", coordinates: [34.6545, 135.4281] },
            { time: "18:00", name: "Subir a la noria", description: "Noria Tempozan con vistas a la bahía.", coordinates: [34.6559, 135.4292] },
            { time: "20:00", name: "Dormir", description: "Descanso." }
        ]
    },
    {
        title: "27 de Julio - Osaka - Vuelta a casa",
        activities: [
            { time: "12:30", name: "Comer", description: "Última comida en Japón.", type: "comida" },
            { time: "13:00", name: "Ir al aeropuerto", description: "Traslado al Aeropuerto Internacional de Kansai.", type: "transporte" },
            { time: "15:00", name: "Aeropuerto", description: "Llegada al aeropuerto y facturación.", type: "vuelo", coordinates: [34.4342, 135.2324] },
            { time: "18:10", name: "Sale el vuelo", description: "Vuelo de regreso a Barcelona.", type: "vuelo" }
        ]
    }
];
