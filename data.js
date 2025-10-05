const days = [
    {
        title: "2 de Julio - Vuelo",
        activities: [
            { time: "07:00", name: "Despertador", description: "Prepararse para el viaje hacia Japón." },
            { time: "07:30", name: "Uber al aeropuerto", description: "Traslado reservado hacia el aeropuerto de Barcelona.", coordinates: [41.2974, 2.0833] },
            { time: "08:00", name: "Facturación", description: "Facturar maletas para el vuelo internacional.", importantInfo: "AAABBB"},
            { time: "08:30", name: "Desayuno en el aeropuerto", description: "Comer algo antes del vuelo." },
            { time: "10:45", name: "Vuelo a Abu Dhabi", description: "Salida del vuelo hacia Abu Dhabi.", coordinates: [24.433, 54.6511] },
            { time: "19:10 (16:15 BCN)", name: "Llegada a Abu Dhabi", description: "Escala técnica antes de continuar hacia Osaka." },
            { time: "21:15 (18:15 BCN)", name: "Vuelo a Osaka", description: "Conexión hacia Japón." }
        ]
    },
    {
        title: "3 de Julio - Llegada a Osaka",
        activities: [
            { time: "11:45 (04:45 BCN)", name: "Llegada a Osaka", description: "Aterrizaje en el Aeropuerto Internacional de Kansai.", coordinates: [34.4342, 135.2324] },
            { time: "14:00", name: "Check-in en Airbnb", description: "Llegada al apartamento y siesta.", coordinates: [34.6937, 135.5023] },
            { time: "15:00", name: "Buscar restaurante", description: "Explorar la zona y decidir dónde comer." },
            { time: "16:00", name: "Tarde libre y compras", description: "Paseo por la ciudad y comprar desayuno para el día siguiente." },
            { time: "19:30", name: "Cena", description: "Cenar en algún restaurante cercano." },
            { time: "20:00", name: "Dormir", description: "Descansar tras el viaje." }
        ]
    },
    {
        title: "4 de Julio - Osaka",
        activities: [
            { time: "06:00", name: "Bon dia", description: "Despertarse temprano." },
            { time: "07:00", name: "Namba y Dotonbori", description: "Explorar Namba y el canal Dotonbori.", coordinates: [34.6687, 135.5010] },
            { time: "12:00", name: "Comida", description: "Almuerzo en Osaka." },
            { time: "14:00", name: "Umeda Sky Building y Pokémon Center", description: "Visitar el observatorio y la tienda Pokémon.", coordinates: [34.7055, 135.4892] },
            { time: "16:00", name: "Acuario de Osaka", description: "Visitar el Kaiyukan, uno de los acuarios más grandes del mundo.", coordinates: [34.6545, 135.4281] },
            { time: "18:00", name: "Noria Tempozan", description: "Subir a la noria con vistas a la bahía.", coordinates: [34.6559, 135.4292] },
            { time: "20:00", name: "Dormir", description: "Descanso." }
        ]
    },
    {
        title: "5 de Julio - Nara y Fushimi Inari",
        activities: [
            { time: "06:00", name: "Bon dia", description: "Despertar temprano." },
            { time: "07:00", name: "Excursión a Nara", description: "Visitar el parque de los ciervos y el templo Todai-ji.", coordinates: [34.6851, 135.8050] },
            { time: "12:00", name: "Comida", description: "Almuerzo en Nara." },
            { time: "13:00", name: "Fushimi Inari Taisha", description: "Santuario con miles de torii rojos.", coordinates: [34.9671, 135.7727] },
            { time: "17:00", name: "Parque infantil", description: "Lugar para que las niñas jueguen y descansen." },
            { time: "20:00", name: "Dormir", description: "Regreso al alojamiento y descanso." }
        ]
    },
    {
        title: "6 de Julio - Kurashiki y Kinosaki Onsen",
        activities: [
            { time: "07:00", name: "Viaje a Kurashiki", description: "Explorar el barrio histórico de Kurashiki Bikan.", coordinates: [34.5958, 133.7719] },
            { time: "10:00", name: "Museo del Juguete", description: "Museo con juguetes japoneses tradicionales y antiguos." },
            { time: "13:00", name: "Comida en Kurashiki", description: "Platos locales de Okayama." },
            { time: "15:00", name: "Viaje a Kinosaki Onsen", description: "Llegada a la ciudad balneario.", coordinates: [35.624, 134.82] },
            { time: "17:00", name: "Onsen familiar", description: "Disfrutar de baños termales en un ryokan adaptado a familias." }
        ]
    },
    {
        title: "7 de Julio - Península de Ine",
        activities: [
            { time: "08:00", name: "Viaje a Ine", description: "Traslado a la pintoresca aldea de pescadores.", coordinates: [35.6836, 135.2728] },
            { time: "10:00", name: "Paseo en barco", description: "Tour en barco para ver las casas flotantes (funaya)." },
            { time: "12:30", name: "Comida", description: "Marisco fresco y opciones para niños." },
            { time: "15:00", name: "Playa tranquila", description: "Tiempo libre para que los niños jueguen cerca del mar." }
        ]
    },
    {
        title: "8 de Julio - Península de Ine",
        activities: [
            { time: "09:00", name: "Explorar senderos", description: "Caminata fácil por la costa." },
            { time: "12:00", name: "Comida", description: "Almuerzo en Ine." },
            { time: "14:00", name: "Juegos en la naturaleza", description: "Tarde relajada con picnic y juegos." }
        ]
    },
    {
        title: "9 de Julio - Miyama",
        activities: [
            { time: "08:00", name: "Viaje a Miyama", description: "Visita a la aldea de casas con techos de paja.", coordinates: [35.0906, 135.5241] },
            { time: "10:00", name: "Museo del Pueblo", description: "Explicaciones sobre la vida tradicional japonesa." },
            { time: "12:30", name: "Comida campestre", description: "Platos locales en un entorno rural." },
            { time: "15:00", name: "Actividades al aire libre", description: "Niños jugando en campos y río." }
        ]
    },
    {
        title: "10 de Julio - Shirakawago",
        activities: [
            { time: "08:00", name: "Viaje a Shirakawago", description: "Aldea patrimonio mundial de la UNESCO.", coordinates: [36.2606, 136.9066] },
            { time: "11:00", name: "Exploración a pie", description: "Casas gassho-zukuri y vistas panorámicas." },
            { time: "13:00", name: "Comida local", description: "Prueba de soba y miso." },
            { time: "15:00", name: "Juegos en el río", description: "Tiempo para que los niños disfruten de la naturaleza." }
        ]
    },
    {
        title: "11 de Julio - Matsumoto",
        activities: [
            { time: "09:00", name: "Castillo de Matsumoto", description: "Castillo del cuervo con actividades para niños.", coordinates: [36.2381, 137.9715] },
            { time: "12:00", name: "Comida en Matsumoto", description: "Restaurante familiar japonés." },
            { time: "14:00", name: "Museo Ukiyo-e", description: "Exposición de arte japonesa con talleres familiares." },
            { time: "16:00", name: "Parque infantil", description: "Espacio para que las niñas descansen." }
        ]
    },
    {
        title: "12 de Julio - Hakone",
        activities: [
            { time: "09:00", name: "Viaje a Hakone", description: "Llegada a la región termal.", coordinates: [35.2324, 139.1056] },
            { time: "11:00", name: "Museo al aire libre", description: "Esculturas y espacios verdes ideales para niños." },
            { time: "13:00", name: "Comida", description: "Ramen o soba local." },
            { time: "15:00", name: "Crucero en el Lago Ashi", description: "Barco pirata para familias." },
            { time: "17:00", name: "Onsen familiar", description: "Descanso en un ryokan." }
        ]
    },
    {
        title: "13 de Julio - Tokyo",
        activities: [
            { time: "10:00", name: "Llegada a Tokyo", description: "Instalarse en el alojamiento.", coordinates: [35.6812, 139.7671] },
            { time: "12:00", name: "Comida", description: "Almuerzo en restaurante familiar." },
            { time: "14:00", name: "Tokyo Skytree", description: "Subida al mirador.", coordinates: [35.7101, 139.8107] },
            { time: "16:00", name: "Pokémon Café", description: "Experiencia divertida para las niñas." }
        ]
    },
    {
        title: "14 de Julio - Tokyo",
        activities: [
            { time: "10:00", name: "Parque Ueno", description: "Visita al zoo y áreas de juegos.", coordinates: [35.7156, 139.7745] },
            { time: "13:00", name: "Comida", description: "Bento o ramen en familia." },
            { time: "15:00", name: "Museo Nacional de Naturaleza y Ciencia", description: "Exhibiciones interactivas para niños." }
        ]
    },
    {
        title: "15 de Julio - Tokyo",
        activities: [
            { time: "09:00", name: "Odaiba", description: "Visita a TeamLab Planets o Miraikan.", coordinates: [35.619, 139.776] },
            { time: "13:00", name: "Comida en Odaiba", description: "Restaurantes con vistas a la bahía." },
            { time: "15:00", name: "Legoland Discovery Center", description: "Diversión para niños pequeños." }
        ]
    },
    {
        title: "16 de Julio - Tokyo",
        activities: [
            { time: "10:00", name: "Shibuya y Harajuku", description: "Paseo por zonas vibrantes." },
            { time: "12:00", name: "Comida en Takeshita Street", description: "Snacks japoneses divertidos." },
            { time: "14:00", name: "Yoyogi Park", description: "Picnic y juegos al aire libre." }
        ]
    },
    {
        title: "17 de Julio - Nikko",
        activities: [
            { time: "09:00", name: "Viaje a Nikko", description: "Explorar templos y naturaleza.", coordinates: [36.75, 139.6] },
            { time: "12:00", name: "Comida", description: "Comida típica de la región." },
            { time: "14:00", name: "Cascadas Kegon", description: "Impresionante paisaje natural.", coordinates: [36.73, 139.5] }
        ]
    },
    {
        title: "18 de Julio - Ichinoseki",
        activities: [
            { time: "10:00", name: "Viaje a Ichinoseki", description: "Llegada y check-in.", coordinates: [38.93, 141.13] },
            { time: "13:00", name: "Comida", description: "Platos locales." },
            { time: "15:00", name: "Gembikei Gorge", description: "Paisajes y dulces lanzados en bandejas por el río." }
        ]
    },
    {
        title: "19 de Julio - Ichinoseki",
        activities: [
            { time: "10:00", name: "Motsuji Temple y jardín", description: "Paseo tranquilo con espacio para niños.", coordinates: [38.98, 141.12] },
            { time: "13:00", name: "Comida", description: "Almuerzo local." },
            { time: "15:00", name: "Museo de Geoparques", description: "Actividades educativas para niños." }
        ]
    },
    {
        title: "20 de Julio - Tsurunoyu Onsen y Monte Akita",
        activities: [
            { time: "09:00", name: "Tsurunoyu Onsen", description: "Disfrutar de uno de los onsen más famosos de Japón.", coordinates: [39.745, 140.786] },
            { time: "13:00", name: "Comida local", description: "Almuerzo campestre." },
            { time: "15:00", name: "Monte Akita-Komagatake", description: "Excursión sencilla con vistas." }
        ]
    },
    {
        title: "21 de Julio - Nagoya y Gujo Hachiman",
        activities: [
            { time: "09:00", name: "Viaje a Nagoya", description: "Traslado hacia la ciudad.", coordinates: [35.1815, 136.9066] },
            { time: "12:00", name: "Comida en Nagoya", description: "Miso katsu o hitsumabushi." },
            { time: "15:00", name: "Gujo Hachiman", description: "Paseo por el río y el casco histórico.", coordinates: [35.7431, 136.9595] }
        ]
    },
    {
        title: "22 de Julio - Nagoya",
        activities: [
            { time: "10:00", name: "Legoland Nagoya", description: "Diversión asegurada para los niños.", coordinates: [35.0494, 136.8431] },
            { time: "13:00", name: "Comida en el parque", description: "Opciones para toda la familia." },
            { time: "15:00", name: "Museo Ferroviario SCMAGLEV", description: "Trenes bala y actividades interactivas." }
        ]
    },
    {
        title: "23 de Julio",
        activities: [
            { time: "10:00", name: "Parque local o descanso", description: "Día tranquilo tras muchos traslados." },
            { time: "13:00", name: "Comida relajada", description: "Restaurante familiar." },
            { time: "15:00", name: "Compras de recuerdos", description: "Souvenirs para casa." }
        ]
    },
    {
        title: "24 de Julio",
        activities: [
            { time: "09:00", name: "Visita cultural ligera", description: "Un templo cercano o museo interactivo." },
            { time: "12:00", name: "Comida", description: "Almuerzo sencillo." },
            { time: "14:00", name: "Tarde en parque acuático o piscina", description: "Diversión para niños." }
        ]
    },
    {
        title: "25 de Julio",
        activities: [
            { time: "10:00", name: "Excursión corta", description: "Pueblo cercano para pasear." },
            { time: "12:00", name: "Comida local", description: "Almuerzo en un restaurante tradicional." },
            { time: "15:00", name: "Tarde libre", description: "Descanso antes del regreso." }
        ]
    },
    {
        title: "26 de Julio",
        activities: [
            { time: "09:00", name: "Últimas compras", description: "Buscar recuerdos o snacks para el viaje." },
            { time: "12:00", name: "Comida final en Japón", description: "Disfrutar de una última comida japonesa." },
            { time: "15:00", name: "Preparar maletas", description: "Organizar equipaje para el regreso." }
        ]
    },
    {
        title: "27 de Julio - Vuelta a casa",
        activities: [
            { time: "18:10", name: "Vuelo de regreso", description: "Salida del vuelo desde Japón hacia Barcelona.", coordinates: [34.4342, 135.2324] }
        ]
    }
];
