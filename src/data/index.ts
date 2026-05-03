import { Day, Accommodation, ShoppingItem, Traveler } from '../types';

export const tripName = "Japón 2025 - 2 al 27 de Julio";

export const initialTravelers: Traveler[] = [
  {
    id: 1,
    firstName: "Carlos",
    lastName: "García López",
    age: 34,
    email: "carlos.garcia@email.com",
    phonePrefix: "+34",
    phone: "612345678",
    documents: [
      { type: "passport", number: "AAB123456" },
      { type: "id", number: "12345678A" }
    ],
    paysBudget: true
  },
  {
    id: 2,
    firstName: "María",
    lastName: "Fernández Ruiz",
    age: 32,
    email: "maria.fernandez@email.com",
    phonePrefix: "+34",
    phone: "623456789",
    documents: [
      { type: "passport", number: "BBB234567" }
    ],
    paysBudget: true
  },
  {
    id: 3,
    firstName: "Pablo",
    lastName: "García Fernández",
    age: 8,
    documents: [
      { type: "id", number: "87654321B" }
    ],
    paysBudget: false
  },
  {
    id: 4,
    firstName: "Lucía",
    lastName: "García Fernández",
    age: 5,
    documents: [],
    paysBudget: false
  },
  {
    id: 5,
    firstName: "Carmen",
    lastName: "López Martínez",
    age: 65,
    phonePrefix: "+34",
    phone: "634567890",
    documents: [
      { type: "passport", number: "CCC345678" },
      { type: "driverLicense", number: "98765432" }
    ],
    paysBudget: false
  }
];

export const initialShoppingItems: ShoppingItem[] = [
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
    purchased: true
  },
  {
    id: 3,
    name: "Pocket WiFi",
    category: "electronica",
    price: 80,
    currency: "EUR",
    purchased: false
  },
  {
    id: 4,
    name: "Seguro de viaje",
    category: "documentos",
    price: 150,
    currency: "EUR",
    purchased: false
  },
  {
    id: 5,
    name: "Entradas Museo Ghibli",
    category: "entradas",
    price: 40,
    currency: "EUR",
    purchased: false
  },
  {
    id: 6,
    name: "Entradas PokéPark Kanto (Yomiuriland)",
    category: "entradas",
    price: 60,
    currency: "EUR",
    purchased: false
  },
  {
    id: 7,
    name: "Tren Pikachu (Pokemon with YOU Train)",
    category: "transporte",
    price: 0,
    currency: "EUR",
    purchased: false
  },
  {
    id: 8,
    name: "Alquiler de coche (Osaka, días 4-5)",
    category: "transporte",
    price: 0,
    currency: "EUR",
    purchased: false
  },
  {
    id: 9,
    name: "Alquiler de coche (Tokyo, días 7-10)",
    category: "transporte",
    price: 0,
    currency: "EUR",
    purchased: false
  }
];

export const initialAccommodations: Accommodation[] = [
  {
    id: 1,
    name: "Airbnb Shin-Osaka",
    price: 25,
    fromDay: 1,
    toDay: 1,
    coordinates: [34.7290, 135.4890]
  },
  {
    id: 2,
    name: "Sinonomesou Kinosaki Onsen",
    price: 0,
    fromDay: 2,
    toDay: 2,
    coordinates: [35.6283, 134.8141]
  },
  {
    id: 3,
    name: "MYSTAYS Shin Osaka Conference Center",
    price: 0,
    fromDay: 3,
    toDay: 3,
    coordinates: [34.7337, 135.5003]
  },
  {
    id: 4,
    name: "Hearton Hotel Higashi-Shinagawa",
    price: 0,
    fromDay: 4,
    toDay: 4,
    coordinates: [35.6085, 139.7400]
  },
  {
    id: 5,
    name: "Tomareru Himitsukichi L-Base",
    price: 0,
    fromDay: 5,
    toDay: 6,
    coordinates: [36.2381, 137.9719]
  },
  {
    id: 6,
    name: "Chojuyu Hakone",
    price: 0,
    fromDay: 7,
    toDay: 7,
    coordinates: [35.2308, 139.0539]
  },
  {
    id: 7,
    name: "Morioka Grand Hotel Annex",
    price: 0,
    fromDay: 8,
    toDay: 9,
    coordinates: [39.7036, 141.1527]
  },
  {
    id: 8,
    name: "Tsurunoyu Onsen",
    price: 0,
    fromDay: 10,
    toDay: 10,
    link: "https://www.tsurunoyu.com",
    coordinates: [39.6539, 140.6522]
  },
  {
    id: 9,
    name: "Roost Hostel Nikko",
    price: 0,
    fromDay: 11,
    toDay: 11,
    coordinates: [36.7200, 139.6980]
  },
  {
    id: 10,
    name: "Piso Tokyo",
    price: 0,
    fromDay: 12,
    toDay: 15,
    coordinates: [35.6812, 139.7671]
  },
  {
    id: 11,
    name: "Airbnb Osaka",
    price: 0,
    fromDay: 16,
    toDay: 24,
    coordinates: [34.6937, 135.5023]
  }
];

export const initialData: Day[] = [
  // Día 0 - 2 Julio
  {
    title: "2 Julio - Vuelo",
    activities: [
      {
        time: "07:30",
        name: "Uber al aeropuerto",
        description: "Uber reservado con antelación dirección El Prat",
        type: "transporte",
        coordinates: [41.2974, 2.0833]
      },
      {
        time: "08:00",
        name: "Facturar maletas",
        description: "Facturación de equipaje en el aeropuerto de Barcelona",
        type: "normal",
        coordinates: [41.2974, 2.0833]
      },
      {
        time: "08:30",
        name: "Desayuno en el aeropuerto",
        description: "Desayunar con calma dentro del aeropuerto antes de embarcar",
        type: "comida",
        coordinates: [41.2974, 2.0833]
      },
      {
        time: "10:45",
        name: "Vuelo Barcelona → Abu Dhabi",
        description: "Salida hacia Abu Dhabi con Etihad Airways",
        type: "vuelo",
        coordinates: [24.4334, 54.6516]
      },
      {
        time: "19:10",
        name: "Escala Abu Dhabi",
        description: "Llegada a Abu Dhabi (16:15 hora Barcelona). Escala hasta próximo vuelo",
        type: "transporte",
        coordinates: [24.4334, 54.6516]
      },
      {
        time: "21:15",
        name: "Vuelo Abu Dhabi → Osaka",
        description: "Salida hacia Osaka (18:15 hora Barcelona)",
        type: "vuelo",
        coordinates: [34.4348, 135.2440]
      }
    ]
  },
  // Día 1 - 3 Julio
  {
    title: "3 Julio - Llegada a Osaka",
    activities: [
      {
        time: "11:45",
        name: "Llegada al aeropuerto de Osaka (KIX)",
        description: "Aterrizaje en Kansai International Airport (4:45 hora Barcelona). Pasar control de pasaportes y recoger maletas",
        type: "vuelo",
        coordinates: [34.4348, 135.2440]
      },
      {
        time: "14:00",
        name: "Check-in Airbnb Shin-Osaka",
        description: "Llegada a Shin-Osaka, 4.450 ¥ (~25€). Instalarse y echar la siesta para recuperar el vuelo",
        type: "normal",
        price: 4450,
        currency: "JPY",
        coordinates: [34.7290, 135.4890]
      },
      {
        time: "15:00",
        name: "Buscar dónde comer",
        description: "Explorar el barrio para encontrar restaurante local",
        type: "comida",
        coordinates: [34.7290, 135.4890]
      },
      {
        time: "16:00",
        name: "Paseo por el barrio",
        description: "Pasear la tarde y comprar desayuno para el día siguiente en un konbini o supermercado",
        type: "visita",
        coordinates: [34.7290, 135.4890]
      },
      {
        time: "19:30",
        name: "Cena",
        description: "Cenar por la zona de Shin-Osaka",
        type: "comida",
        coordinates: [34.7290, 135.4890]
      }
    ]
  },
  // Día 2 - 4 Julio
  {
    title: "4 Julio - Miyama y Kinosaki Onsen",
    activities: [
      {
        time: "08:00",
        name: "Alquiler de coche en Shin-Osaka",
        description: "Recoger el coche alquilado para los dos próximos días",
        type: "transporte",
        coordinates: [34.7337, 135.5003]
      },
      {
        time: "10:30",
        name: "Kayabuki no Sato (Miyama)",
        description: "Llegada al pueblo de tejados de paja de Miyama. Peaje: 1.200 ¥",
        type: "visita",
        price: 1200,
        currency: "JPY",
        coordinates: [35.3833, 135.6833]
      },
      {
        time: "11:00",
        name: "Paseo por el pueblo y el río",
        description: "Recorrer las calles tradicionales de Kayabuki no Sato y el entorno del río",
        type: "visita",
        coordinates: [35.3833, 135.6833]
      },
      {
        time: "13:00",
        name: "Comer en Miyama",
        description: "Buscar restaurante local en la zona de Miyama",
        type: "comida",
        coordinates: [35.3833, 135.6833]
      },
      {
        time: "14:00",
        name: "Viaje hacia Kinosaki Onsen",
        description: "Salida en coche dirección Kinosaki Onsen",
        type: "transporte",
        coordinates: [35.6283, 134.8141]
      },
      {
        time: "16:30",
        name: "Check-in Sinonomesou Kinosaki",
        description: "Llegada a Kinosaki Onsen y check-in en el hotel Sinonomesou",
        type: "normal",
        coordinates: [35.6283, 134.8141]
      },
      {
        time: "17:00",
        name: "Paseo por el río de Kinosaki",
        description: "Pasear por el pueblo y la zona del río en yukata",
        type: "visita",
        coordinates: [35.6283, 134.8141]
      },
      {
        time: "19:00",
        name: "Baños termales y cena",
        description: "Recorrido por los onsen públicos del pueblo y cena tradicional",
        type: "visita",
        coordinates: [35.6283, 134.8141]
      }
    ]
  },
  // Día 3 - 5 Julio
  {
    title: "5 Julio - Ine y Amanohashidate",
    activities: [
      {
        time: "09:00",
        name: "Salida hacia Ine",
        description: "Salida en coche desde Kinosaki dirección Ine fishing village",
        type: "transporte",
        coordinates: [35.6833, 135.3167]
      },
      {
        time: "10:30",
        name: "Ine Fishing Village",
        description: "Llegada al pueblo pesquero de Ine, famoso por sus casas-barco (funaya) sobre el agua",
        type: "visita",
        coordinates: [35.6833, 135.3167]
      },
      {
        time: "11:00",
        name: "Paseo en barco por Ine",
        description: "Visita al pueblo en barco para ver las funaya desde el agua",
        type: "visita",
        coordinates: [35.6833, 135.3167]
      },
      {
        time: "13:00",
        name: "Comer por la zona de Ine",
        description: "Comer pescado fresco en algún restaurante local cerca del puerto",
        type: "comida",
        coordinates: [35.6833, 135.3167]
      },
      {
        time: "15:00",
        name: "Amanohashidate",
        description: "Paseo por el banco de arena de Amanohashidate, una de las tres vistas más bellas de Japón",
        type: "visita",
        coordinates: [35.5556, 135.1833]
      },
      {
        time: "17:00",
        name: "Miyazu - Takigamijido Park",
        description: "Ir a Miyazu a que las niñas jueguen en el Takigamijido Park",
        type: "visita",
        coordinates: [35.5333, 135.2000]
      },
      {
        time: "18:00",
        name: "Vuelta a Osaka",
        description: "Regreso a Osaka al hotel MYSTAYS Shin Osaka Conference Center. Dejar el coche.",
        type: "transporte",
        coordinates: [34.7337, 135.5003]
      },
      {
        time: "20:00",
        name: "Cena y descanso",
        description: "Cenar en Osaka y descansar antes del Shinkansen de mañana",
        type: "comida",
        coordinates: [34.7337, 135.5003]
      }
    ]
  },
  // Día 4 - 6 Julio
  {
    title: "6 Julio - Viaje a Tokyo",
    activities: [
      {
        time: "09:00",
        name: "Shinkansen Osaka → Tokyo",
        description: "Tren bala desde Shin-Osaka hasta Tokyo. 37.500 ¥ (~203€)",
        type: "transporte",
        price: 37500,
        currency: "JPY",
        coordinates: [35.6812, 139.7671]
      },
      {
        time: "12:30",
        name: "Comer en Tokyo",
        description: "Buscar restaurante en la zona de llegada",
        type: "comida",
        coordinates: [35.6812, 139.7671]
      },
      {
        time: "15:00",
        name: "Explorar Tokyo",
        description: "Buscar qué hacer y a dónde ir por la tarde",
        type: "visita",
        coordinates: [35.6812, 139.7671]
      },
      {
        time: "16:00",
        name: "Café Pokémon",
        description: "Visita al Café Pokémon - cerrado ese día. Buscar alternativa",
        type: "visita",
        isOptional: true,
        coordinates: [35.6938, 139.7034]
      },
      {
        time: "20:00",
        name: "Check-in Hearton Hotel Higashi-Shinagawa",
        description: "Llegada al hotel en Shinagawa. Descanso tras el viaje.",
        type: "normal",
        coordinates: [35.6085, 139.7400]
      }
    ]
  },
  // Día 5 - 7 Julio
  {
    title: "7 Julio - Matsumoto",
    activities: [
      {
        time: "08:00",
        name: "Alquiler de coche en Tokyo",
        description: "Recoger el coche alquilado para los próximos días de ruta",
        type: "transporte",
        coordinates: [35.6812, 139.7671]
      },
      {
        time: "11:00",
        name: "Daio Wasabi Farm (Azumino)",
        description: "Granja de wasabi más grande del mundo. Pasear por los campos y canales de agua",
        type: "visita",
        coordinates: [36.3041, 137.8716]
      },
      {
        time: "13:00",
        name: "Comer y pasear por Azumino",
        description: "Comer en la zona de Azumino y explorar los alrededores",
        type: "comida",
        coordinates: [36.3041, 137.8716]
      },
      {
        time: "16:00",
        name: "Castillo de Matsumoto",
        description: "Visitar el castillo negro de Matsumoto (Karasu-jo) y pasear por sus alrededores",
        type: "visita",
        coordinates: [36.2383, 137.9715]
      },
      {
        time: "18:00",
        name: "Check-in Tomareru Himitsukichi L-Base",
        description: "Check-in en el alojamiento en Matsumoto",
        type: "normal",
        coordinates: [36.2381, 137.9719]
      }
    ]
  },
  // Día 6 - 8 Julio
  {
    title: "8 Julio - Shirakawago",
    activities: [
      {
        time: "08:00",
        name: "Salida hacia Shirakawago",
        description: "Ruta en coche desde Matsumoto hasta la aldea histórica de Shirakawago",
        type: "transporte",
        coordinates: [36.2570, 136.9056]
      },
      {
        time: "10:30",
        name: "Shirakawago",
        description: "Llegada a la aldea Patrimonio UNESCO famosa por sus casas gasshō-zukuri de tejados de paja",
        type: "visita",
        coordinates: [36.2570, 136.9056]
      },
      {
        time: "13:00",
        name: "Comer en Shirakawago",
        description: "Comer en la aldea, ideal probar hida-beef y cocina tradicional",
        type: "comida",
        coordinates: [36.2570, 136.9056]
      },
      {
        time: "14:00",
        name: "Explorar el pueblo",
        description: "Disfrutar del pueblo el resto de la tarde: mirador Shiroyama, interior de casas gasshō",
        type: "visita",
        coordinates: [36.2570, 136.9056]
      },
      {
        time: "17:00",
        name: "Vuelta a Matsumoto",
        description: "Regreso en coche a Matsumoto",
        type: "transporte",
        coordinates: [36.2381, 137.9719]
      },
      {
        time: "19:30",
        name: "Tomareru Himitsukichi L-Base",
        description: "Llegada al alojamiento en Matsumoto. Descanso y cena.",
        type: "normal",
        coordinates: [36.2381, 137.9719]
      }
    ]
  },
  // Día 7 - 9 Julio
  {
    title: "9 Julio - Lagos de Monte Fuji",
    activities: [
      {
        time: "08:00",
        name: "Salida hacia Lago Kawaguchi",
        description: "Ruta en coche desde Matsumoto hasta los lagos del Monte Fuji",
        type: "transporte",
        coordinates: [35.5075, 138.7520]
      },
      {
        time: "10:00",
        name: "Lago Kawaguchi",
        description: "Visita al lago Kawaguchi con vistas al Fuji. Paseo por la orilla.",
        type: "visita",
        coordinates: [35.5075, 138.7520]
      },
      {
        time: "12:00",
        name: "Lago Yamanaka",
        description: "Traslado al lago Yamanaka, el más grande de los cinco lagos del Fuji",
        type: "visita",
        coordinates: [35.4267, 138.8552]
      },
      {
        time: "13:00",
        name: "Comer en la zona",
        description: "Comer cerca del lago Yamanaka",
        type: "comida",
        coordinates: [35.4267, 138.8552]
      },
      {
        time: "14:00",
        name: "Lago Ashi (Hakone)",
        description: "Traslado al lago Ashi en Hakone para las actividades de la tarde",
        type: "transporte",
        coordinates: [35.1965, 138.9892]
      },
      {
        time: "15:30",
        name: "Barco pirata en el Lago Ashi",
        description: "Actividad en barco pirata cruzando el lago Ashi con vistas al Fuji",
        type: "visita",
        coordinates: [35.1965, 138.9892]
      },
      {
        time: "19:00",
        name: "Check-in Chojuyu Hakone",
        description: "Check-in en el ryokan Chojuyu en Hakone",
        type: "normal",
        coordinates: [35.2308, 139.0539]
      }
    ]
  },
  // Día 8 - 10 Julio
  {
    title: "10 Julio - Shinkansen a Morioka",
    activities: [
      {
        time: "09:00",
        name: "Ruta en coche hacia Tokyo",
        description: "Salida desde Hakone hacia Tokyo para devolver el coche. 37.500 ¥ (~203€)",
        type: "transporte",
        price: 37500,
        currency: "JPY",
        coordinates: [35.6812, 139.7671]
      },
      {
        time: "11:00",
        name: "Devolver coche y Shinkansen a Morioka",
        description: "Devolver el coche en Tokyo y coger el Shinkansen dirección Morioka",
        type: "transporte",
        coordinates: [39.7036, 141.1527]
      },
      {
        time: "17:00",
        name: "Castillo de Morioka",
        description: "Visita al castillo de Morioka al atardecer. Por la noche se pueden ver luciérnagas.",
        type: "visita",
        coordinates: [39.7025, 141.1377]
      },
      {
        time: "20:00",
        name: "Check-in Morioka Grand Hotel Annex",
        description: "Llegada y check-in en el hotel en Morioka",
        type: "normal",
        coordinates: [39.7036, 141.1527]
      }
    ]
  },
  // Día 9 - 11 Julio
  {
    title: "11 Julio - Morioka y Miyako",
    activities: [
      {
        time: "08:51",
        name: "Tren Pikachu a Miyako",
        description: "Salida en el Pokemon with YOU Train (tren Pikachu) desde Morioka hacia Miyako",
        type: "transporte",
        coordinates: [39.6414, 141.9575]
      },
      {
        time: "11:19",
        name: "Llegada a Miyako",
        description: "Llegada a la ciudad costera de Miyako",
        type: "normal",
        coordinates: [39.6414, 141.9575]
      },
      {
        time: "11:30",
        name: "Jodogahama Beach",
        description: "Playa de Jodogahama, una de las más bonitas de Japón. Chapuzón y descanso.",
        type: "visita",
        coordinates: [39.6388, 141.9777]
      },
      {
        time: "13:30",
        name: "Comer en el puerto de Miyako",
        description: "Comer marisco fresco en el puerto de Miyako",
        type: "comida",
        coordinates: [39.6414, 141.9575]
      },
      {
        time: "14:47",
        name: "Bus/tren de vuelta a Morioka",
        description: "Tomar el bus 106 特急バス (más económico) o tren de vuelta a Morioka",
        type: "transporte",
        coordinates: [39.7036, 141.1527]
      },
      {
        time: "17:00",
        name: "Llegada a Morioka",
        description: "Vuelta al hotel en Morioka. Tarde libre.",
        type: "normal",
        coordinates: [39.7036, 141.1527]
      }
    ]
  },
  // Día 10 - 12 Julio
  {
    title: "12 Julio - Tsurunoyu Onsen y Lago Tazawa",
    activities: [
      {
        time: "09:00",
        name: "Lago Tazawa",
        description: "Ir al lago Tazawa cuando nos apetezca. El lago más profundo de Japón, aguas azul zafiro.",
        type: "visita",
        coordinates: [39.7217, 140.6606]
      },
      {
        time: "16:00",
        name: "Tsurunoyu Onsen",
        description: "Ir al onsen histórico Tsurunoyu a dormir. Fundado en 1638, aguas blancas lechosas al aire libre.",
        type: "visita",
        coordinates: [39.6539, 140.6522]
      }
    ]
  },
  // Día 11 - 13 Julio
  {
    title: "13 Julio - Nikko",
    activities: [
      {
        time: "09:00",
        name: "Salida hacia Nikko",
        description: "Salida desde Tsurunoyu Onsen dirección Nikko en tren",
        type: "transporte",
        coordinates: [36.7199, 139.6978]
      },
      {
        time: "13:00",
        name: "Llegada a Nikko y comer",
        description: "Llegada a Nikko. Check-in en Roost Hostel y comer por la zona",
        type: "comida",
        coordinates: [36.7199, 139.6978]
      },
      {
        time: "15:00",
        name: "Shinkyo Bridge",
        description: "El famoso puente rojo sagrado de Nikko sobre el río Daiya",
        type: "visita",
        coordinates: [36.7482, 139.5992]
      },
      {
        time: "16:30",
        name: "Nikko Toshogu",
        description: "Visita al santuario Toshogu, complejo UNESCO con la decoración más elaborada de Japón",
        type: "visita",
        coordinates: [36.7483, 139.5988]
      },
      {
        time: "17:30",
        name: "Paseo por la zona de Nikko",
        description: "Explorar los alrededores del santuario y los cedros centenarios",
        type: "visita",
        coordinates: [36.7199, 139.6978]
      }
    ]
  },
  // Día 12 - 14 Julio
  {
    title: "14 Julio - Tokyo",
    activities: [
      {
        time: "09:00",
        name: "Lo que quede pendiente de Nikko",
        description: "Visitar sin prisas lo que quede por ver de Nikko",
        type: "visita",
        isOptional: true,
        coordinates: [36.7199, 139.6978]
      },
      {
        time: "11:00",
        name: "Shinkansen Nikko → Tokyo",
        description: "Salida hacia Tokyo. 8.750 ¥ (~50€)",
        type: "transporte",
        price: 8750,
        currency: "JPY",
        coordinates: [35.6812, 139.7671]
      },
      {
        time: "13:00",
        name: "Llegada al piso en Tokyo y comer",
        description: "Check-in en el apartamento de Tokyo. Comer y descansar.",
        type: "comida",
        coordinates: [35.6812, 139.7671]
      }
    ]
  },
  // Día 13 - 15 Julio
  {
    title: "15 Julio - Tokyo SkyTree e Ikebukuro",
    activities: [
      {
        time: "10:00",
        name: "Tokyo SkyTree",
        description: "Visita a la torre más alta de Japón (634m) y la tienda Pokémon de la planta baja",
        type: "visita",
        coordinates: [35.7101, 139.8107]
      },
      {
        time: "12:30",
        name: "Comer cerca del SkyTree",
        description: "Comer en la zona de Asakusa o Oshiage",
        type: "comida",
        coordinates: [35.7101, 139.8107]
      },
      {
        time: "14:30",
        name: "Metro a Ikebukuro",
        description: "Coger el metro dirección Ikebukuro - Sunshine City Mall",
        type: "transporte",
        coordinates: [35.7295, 139.7109]
      },
      {
        time: "15:00",
        name: "Sanrio Café Ikebukuro",
        description: "Visita al Sanrio Café en Ikebukuro",
        type: "visita",
        coordinates: [35.7291, 139.7193]
      },
      {
        time: "16:30",
        name: "Sunshine City",
        description: "Explorar Sunshine City: Pokémon Centre, tienda Ghibli, Kiddy Land",
        type: "visita",
        coordinates: [35.7291, 139.7193]
      },
      {
        time: "19:00",
        name: "Cena en Ikebukuro",
        description: "Cenar por Ikebukuro y volver al piso",
        type: "comida",
        coordinates: [35.7295, 139.7109]
      }
    ]
  },
  // Día 14 - 16 Julio
  {
    title: "16 Julio - Tokyo PokéPark Kanto",
    activities: [
      {
        time: "09:00",
        name: "Salida a Yomiuriland",
        description: "Salida desde Shinjuku hacia Yomiuriland (25 min en tren)",
        type: "transporte",
        coordinates: [35.6264, 139.5218]
      },
      {
        time: "10:00",
        name: "Apertura PokéPark Kanto",
        description: "Entrada al parque. Registrar la app oficial PokéPark nada más entrar para tickets de acceso limitado a tiendas y shows",
        type: "visita",
        importantInfo: "Registrar app oficial PokéPark nada más entrar para acceder a tiendas y shows con cupo limitado",
        coordinates: [35.6264, 139.5218]
      },
      {
        time: "10:30",
        name: "Pokémon Forest",
        description: "Explorar la zona Pokémon Forest del parque",
        type: "visita",
        coordinates: [35.6264, 139.5218]
      },
      {
        time: "13:00",
        name: "Comer en el parque",
        description: "Comida temática dentro del PokéPark",
        type: "comida",
        coordinates: [35.6264, 139.5218]
      },
      {
        time: "14:30",
        name: "Sedge Town",
        description: "Atracciones, shows y merchandising en la zona Sedge Town",
        type: "visita",
        coordinates: [35.6264, 139.5218]
      },
      {
        time: "17:00",
        name: "Resto de Yomiuriland",
        description: "Disfrutar del resto del parque de atracciones si queda energía",
        type: "visita",
        isOptional: true,
        coordinates: [35.6264, 139.5218]
      },
      {
        time: "19:00",
        name: "Vuelta al piso",
        description: "Regreso desde Yomiuriland al apartamento en Tokyo",
        type: "transporte",
        coordinates: [35.6812, 139.7671]
      }
    ]
  },
  // Día 15 - 17 Julio
  {
    title: "17 Julio - Museo Ghibli",
    activities: [
      {
        time: "09:00",
        name: "Salida a Mitaka",
        description: "Tomar la línea JR Chuo desde Shinjuku hasta Mitaka (30 min)",
        type: "transporte",
        coordinates: [35.6962, 139.5704]
      },
      {
        time: "10:00",
        name: "Museo Ghibli",
        description: "Entrada al Museo Ghibli de Studio Ghibli (turno 10:00). Exposiciones, corto exclusivo y café.",
        type: "visita",
        price: 20,
        currency: "EUR",
        coordinates: [35.6962, 139.5704]
      },
      {
        time: "13:00",
        name: "Comer en Kichijoji",
        description: "Comer en el barrio de Kichijoji, uno de los más queridos de Tokyo",
        type: "comida",
        coordinates: [35.7027, 139.5797]
      },
      {
        time: "15:00",
        name: "Parque Inokashira",
        description: "Pasear por el parque y dar un paseo en barca a pedales por el lago",
        type: "visita",
        coordinates: [35.6991, 139.5745]
      },
      {
        time: "17:00",
        name: "Explorar Kichijoji",
        description: "Explorar las tiendas y el ambiente del barrio de Kichijoji",
        type: "visita",
        coordinates: [35.7027, 139.5797]
      },
      {
        time: "19:00",
        name: "Cena y vuelta al piso",
        description: "Cenar por la zona de Kichijoji y volver al piso en Tokyo",
        type: "comida",
        coordinates: [35.6812, 139.7671]
      }
    ]
  },
  // Día 16 - 18 Julio
  {
    title: "18 Julio - Traslado Tokyo → Osaka",
    activities: [
      {
        time: "09:00",
        name: "Salida a Tokyo Station",
        description: "Ir en metro hacia Tokyo Station con las maletas",
        type: "transporte",
        coordinates: [35.6812, 139.7671]
      },
      {
        time: "10:00",
        name: "Shinkansen Tokyo → Osaka",
        description: "Tren bala desde Tokyo hasta Osaka. 29.000 ¥ (~158€)",
        type: "transporte",
        price: 29000,
        currency: "JPY",
        coordinates: [34.6937, 135.5023]
      },
      {
        time: "12:30",
        name: "Llegada a Osaka y check-in Airbnb",
        description: "Llegada a Osaka y check-in en el Airbnb para los últimos días del viaje",
        type: "normal",
        coordinates: [34.6937, 135.5023]
      },
      {
        time: "13:00",
        name: "Comer y descansar",
        description: "Comer cerca del Airbnb y descansar",
        type: "comida",
        coordinates: [34.6937, 135.5023]
      },
      {
        time: "19:00",
        name: "Cena",
        description: "Cenar por la zona del Airbnb en Osaka",
        type: "comida",
        coordinates: [34.6937, 135.5023]
      }
    ]
  },
  // Día 17 - 19 Julio
  {
    title: "19 Julio - Iga (Ninjas)",
    activities: [
      {
        time: "08:30",
        name: "Salida a Iga desde Osaka",
        description: "Tren desde Osaka dirección Iga (~90 min)",
        type: "transporte",
        coordinates: [34.7697, 136.1311]
      },
      {
        time: "10:00",
        name: "Llegada a Iga - Ueno Park",
        description: "Llegada a la ciudad natal del ninjutsu. Dirección al parque Ueno.",
        type: "normal",
        coordinates: [34.7697, 136.1311]
      },
      {
        time: "10:15",
        name: "Museo Ninja Igaryu",
        description: "Visita a la casa ninja con mecanismos secretos: suelos trampa, puertas ocultas y pasadizos",
        type: "visita",
        coordinates: [34.7697, 136.1311]
      },
      {
        time: "11:30",
        name: "Show de ninjas",
        description: "Espectáculo de ninjas en el museo. Verificar horario en la web oficial.",
        type: "visita",
        importantInfo: "Verificar horario en la web oficial antes de ir",
        coordinates: [34.7697, 136.1311]
      },
      {
        time: "12:15",
        name: "Lanzamiento de shurikens",
        description: "Actividad de lanzamiento de shurikens para los peques (y los mayores)",
        type: "visita",
        coordinates: [34.7697, 136.1311]
      },
      {
        time: "13:00",
        name: "Comer en Iga",
        description: "Comer por la zona de Iga Ueno",
        type: "comida",
        coordinates: [34.7697, 136.1311]
      },
      {
        time: "14:30",
        name: "Castillo de Iga Ueno",
        description: "Visita al castillo blanco de Iga Ueno con vistas a la ciudad",
        type: "visita",
        coordinates: [34.7697, 136.1311]
      },
      {
        time: "16:00",
        name: "Paseo por el pueblo de Iga",
        description: "Explorar las calles y el ambiente del pueblo de Iga",
        type: "visita",
        coordinates: [34.7697, 136.1311]
      },
      {
        time: "17:30",
        name: "Tren de vuelta a Osaka",
        description: "Salida en tren dirección Osaka",
        type: "transporte",
        coordinates: [34.6937, 135.5023]
      },
      {
        time: "19:00",
        name: "Llegada a Osaka y cena",
        description: "Vuelta al Airbnb, cenar y dormir",
        type: "comida",
        coordinates: [34.6937, 135.5023]
      }
    ]
  },
  // Día 18 - 20 Julio
  {
    title: "20 Julio - Osaka (Pokémon Café)",
    activities: [
      {
        time: "09:30",
        name: "Paseo por Shinsaibashi y Dotonbori",
        description: "Desayuno y paseo por las zonas más icónicas de Osaka",
        type: "visita",
        coordinates: [34.6687, 135.5032]
      },
      {
        time: "11:00",
        name: "Explorar Namba",
        description: "Recorrer Namba y sus alrededores, tiendas y ambiente",
        type: "visita",
        coordinates: [34.6630, 135.5011]
      },
      {
        time: "12:30",
        name: "Pokémon Café Shinsaibashi",
        description: "Turno en el Pokémon Café. Planta 9, Daimaru Shinsaibashi.",
        type: "comida",
        importantInfo: "Turno de 90 minutos fijo. Baile de Pikachu una vez por turno. Planta 9, Daimaru Shinsaibashi.",
        coordinates: [34.6731, 135.5018]
      },
      {
        time: "14:30",
        name: "Pokémon Center Shinsaibashi",
        description: "Visita al Pokémon Center en el mismo edificio Daimaru",
        type: "visita",
        coordinates: [34.6731, 135.5018]
      },
      {
        time: "16:00",
        name: "Amerikamura o Den Den Town",
        description: "Explorar Amerikamura (moda alternativa) o Den Den Town (el Akihabara de Osaka: anime, manga, retro)",
        type: "visita",
        coordinates: [34.6617, 135.5072]
      },
      {
        time: "18:30",
        name: "Cena en Dotonbori",
        description: "Cenar en la icónica calle Dotonbori: takoyaki, okonomiyaki, ramen",
        type: "comida",
        coordinates: [34.6687, 135.5032]
      }
    ]
  },
  // Día 19 - 21 Julio
  {
    title: "21 Julio - Universal Studios Japan (tarde)",
    activities: [
      {
        time: "09:00",
        name: "Mañana libre",
        description: "Descanso, piscina si el Airbnb tiene, o paseo tranquilo por el barrio",
        type: "normal",
        coordinates: [34.6937, 135.5023]
      },
      {
        time: "12:00",
        name: "Comer antes del parque",
        description: "Comer bien antes de la tarde en el parque",
        type: "comida",
        coordinates: [34.6937, 135.5023]
      },
      {
        time: "13:30",
        name: "Salida a Universal City",
        description: "Coger el tren a Universal City (13 min desde Osaka)",
        type: "transporte",
        coordinates: [34.6654, 135.4323]
      },
      {
        time: "15:00",
        name: "Universal Studios Japan",
        description: "Acceso con pase 1,5 días. Ir directo a Super Nintendo World (menos cola que por la mañana)",
        type: "visita",
        importantInfo: "Pase 1,5 días. Al entrar ir directo a Super Nintendo World.",
        coordinates: [34.6654, 135.4323]
      },
      {
        time: "15:30",
        name: "Super Nintendo World",
        description: "Mario Kart: Koopa's Challenge + Yoshi's Adventure",
        type: "visita",
        coordinates: [34.6654, 135.4323]
      },
      {
        time: "17:30",
        name: "Donkey Kong Country",
        description: "Zona de Donkey Kong en USJ",
        type: "visita",
        coordinates: [34.6654, 135.4323]
      },
      {
        time: "19:00",
        name: "Cena en el parque",
        description: "Cena con temática dentro de Universal Studios",
        type: "comida",
        coordinates: [34.6654, 135.4323]
      },
      {
        time: "20:30",
        name: "Harry Potter - Hogsmeade",
        description: "Zona de Harry Potter de noche: Hogsmeade y butterbeer nocturno",
        type: "visita",
        coordinates: [34.6654, 135.4323]
      }
    ]
  },
  // Día 20 - 22 Julio
  {
    title: "22 Julio - Universal Studios Japan",
    activities: [
      {
        time: "08:00",
        name: "Salida a Universal City",
        description: "Coger el tren temprano a Universal City (13 min desde Osaka)",
        type: "transporte",
        coordinates: [34.6654, 135.4323]
      },
      {
        time: "08:30",
        name: "Llegada al parque",
        description: "Abrir la app oficial y reservar acceso a Super Nintendo World nada más pasar los torniquetes",
        type: "normal",
        importantInfo: "Reservar acceso a Super Nintendo World en la app oficial nada más entrar",
        coordinates: [34.6654, 135.4323]
      },
      {
        time: "09:00",
        name: "Super Nintendo World",
        description: "Correr directo a Super Nintendo World en la apertura. Mario Kart + Yoshi's Adventure.",
        type: "visita",
        coordinates: [34.6654, 135.4323]
      },
      {
        time: "11:00",
        name: "Donkey Kong Country",
        description: "Zona de Donkey Kong: atracciones y ambiente temático",
        type: "visita",
        coordinates: [34.6654, 135.4323]
      },
      {
        time: "12:30",
        name: "Comer en el parque",
        description: "Comida temática dentro de Universal Studios",
        type: "comida",
        coordinates: [34.6654, 135.4323]
      },
      {
        time: "14:00",
        name: "Minion Park y Universal Wonderland",
        description: "Zona de Minions y Universal Wonderland para las niñas",
        type: "visita",
        coordinates: [34.6654, 135.4323]
      },
      {
        time: "16:30",
        name: "Harry Potter - Hogsmeade",
        description: "Visita a la zona de Harry Potter y cerveza de mantequilla",
        type: "visita",
        coordinates: [34.6654, 135.4323]
      },
      {
        time: "18:30",
        name: "Última vuelta y tiendas",
        description: "Última vuelta al parque y compras de souvenirs",
        type: "visita",
        coordinates: [34.6654, 135.4323]
      },
      {
        time: "20:00",
        name: "Vuelta a Osaka",
        description: "Regreso al Airbnb en Osaka",
        type: "transporte",
        coordinates: [34.6937, 135.5023]
      }
    ]
  },
  // Día 21 - 23 Julio
  {
    title: "23 Julio - Fushimi Inari y Nara",
    activities: [
      {
        time: "09:00",
        name: "Salida a Fushimi Inari",
        description: "Salida desde Osaka dirección Fushimi Inari (20 min en tren)",
        type: "transporte",
        coordinates: [34.9671, 135.7727]
      },
      {
        time: "09:30",
        name: "Fushimi Inari Taisha",
        description: "Paseo por los miles de toriis naranjas del santuario Fushimi Inari. Entrada libre.",
        type: "visita",
        coordinates: [34.9671, 135.7727]
      },
      {
        time: "11:30",
        name: "Salida a Nara",
        description: "Tren desde Fushimi Inari dirección Nara (~50 min)",
        type: "transporte",
        coordinates: [34.6851, 135.8048]
      },
      {
        time: "12:30",
        name: "Llegada a Nara y comer",
        description: "Comer en Nara por la zona del parque",
        type: "comida",
        coordinates: [34.6851, 135.8048]
      },
      {
        time: "14:00",
        name: "Parque de los Ciervos de Nara",
        description: "Paseo por el parque de Nara con los ciervos sagrados. Comprar senbei para alimentarlos.",
        type: "visita",
        coordinates: [34.6851, 135.8394]
      },
      {
        time: "16:30",
        name: "Zona de juego para las niñas",
        description: "Buscar zona donde las niñas puedan jugar con calma",
        type: "normal",
        isOptional: true,
        coordinates: [34.6851, 135.8048]
      },
      {
        time: "18:30",
        name: "Vuelta a Osaka",
        description: "Regreso en tren a Osaka",
        type: "transporte",
        coordinates: [34.6937, 135.5023]
      }
    ]
  },
  // Día 22 - 24 Julio
  {
    title: "24 Julio - Gion Matsuri (Kyoto)",
    activities: [
      {
        time: "09:00",
        name: "Salida a Kyoto",
        description: "Salida desde Osaka hacia Kyoto (15 min en Shinkansen o 30-40 min en tren normal)",
        type: "transporte",
        coordinates: [35.0116, 135.7681]
      },
      {
        time: "09:30",
        name: "Posicionarse en la ruta del desfile",
        description: "Llegar pronto a Karasuma-Oike para encontrar buen sitio. Se llena rápido. Buscar cruce para ver girar las carrozas.",
        type: "normal",
        importantInfo: "Llegar pronto - se llena rápido. Mejor posición: en un cruce para ver girar las carrozas.",
        coordinates: [35.0125, 135.7567]
      },
      {
        time: "09:30",
        name: "Yamaboko Junko - Desfile de carrozas",
        description: "Desfile de las 33 carrozas del Gion Matsuri (9:30 - ~11:50). Las carrozas miden hasta 25m y pesan 12 toneladas, construidas sin un solo clavo.",
        type: "visita",
        importantInfo: "Duración: 9:30 - ~11:50. Las carrozas miden hasta 25m y pesan 12 toneladas, sin un solo clavo.",
        coordinates: [35.0125, 135.7567]
      },
      {
        time: "12:00",
        name: "Comer cerca del centro de Kyoto",
        description: "Comer en la zona de Shijo/Kawaramachi",
        type: "comida",
        coordinates: [35.0063, 135.7680]
      },
      {
        time: "13:30",
        name: "Paseo por el barrio de Gion",
        description: "Pasear por Gion con las niñas en ambiente festivo de matsuri",
        type: "visita",
        coordinates: [35.0039, 135.7784]
      },
      {
        time: "15:00",
        name: "Santuario Yasaka",
        description: "Visita al santuario Yasaka, epicentro del Gion Matsuri",
        type: "visita",
        coordinates: [35.0039, 135.7784]
      },
      {
        time: "17:30",
        name: "Puestos de comida callejera",
        description: "Disfrutar de la comida callejera del matsuri: yakitori, kakigori... Buen momento para alquilar yukatas.",
        type: "comida",
        importantInfo: "Buen momento para alquilar yukatas para la procesión de la noche",
        coordinates: [35.0039, 135.7784]
      },
      {
        time: "18:00",
        name: "Mikoshi Togyo",
        description: "Procesión de los tres santuarios portátiles (mikoshi) por las calles de Kyoto",
        type: "visita",
        coordinates: [35.0039, 135.7784]
      },
      {
        time: "19:30",
        name: "Cena en Kyoto",
        description: "Cena con ambiente de matsuri en Kyoto",
        type: "comida",
        coordinates: [35.0116, 135.7681]
      },
      {
        time: "21:00",
        name: "Regreso a Osaka",
        description: "Volver a Osaka en tren",
        type: "transporte",
        coordinates: [34.6937, 135.5023]
      }
    ]
  },
  // Día 23 - 25 Julio
  {
    title: "25 Julio - Tenjin Matsuri (Osaka)",
    activities: [
      {
        time: "09:30",
        name: "Mañana libre",
        description: "Paseo por Osaka, compras y descanso antes del festival",
        type: "normal",
        coordinates: [34.6937, 135.5023]
      },
      {
        time: "12:30",
        name: "Comer antes del festival",
        description: "Comer bien antes de la tarde de matsuri",
        type: "comida",
        coordinates: [34.6937, 135.5023]
      },
      {
        time: "14:30",
        name: "Salida al Santuario Osaka Tenmangu",
        description: "Ir al santuario Osaka Tenmangu en la zona de Temmabashi (15 min andando desde Temmabashi Station)",
        type: "transporte",
        coordinates: [34.6992, 135.5127]
      },
      {
        time: "15:00",
        name: "Santuario Osaka Tenmangu",
        description: "Llegada al santuario. Ambiente previo, puestos de comida y preparativos del desfile.",
        type: "visita",
        coordinates: [34.6992, 135.5127]
      },
      {
        time: "15:30",
        name: "Rikutogyo - Desfile terrestre",
        description: "3.000 personas en trajes de época, danzas del león, músicos y mikoshi portátiles por las calles. Los tambores se sienten en el pecho de cerca.",
        type: "visita",
        importantInfo: "3.000 personas en trajes de época. Los tambores se sienten en el pecho - ponerse cerca.",
        coordinates: [34.6992, 135.5127]
      },
      {
        time: "18:00",
        name: "Procesión al río Okawa",
        description: "La procesión llega al río Okawa. Posicionarse en la orilla para ver los barcos.",
        type: "visita",
        coordinates: [34.7033, 135.5194]
      },
      {
        time: "18:30",
        name: "Funatogyo - Barcos iluminados",
        description: "~100 barcos iluminados con linternas navegando por el río Okawa con performers a bordo. El reflejo al atardecer es espectacular.",
        type: "visita",
        importantInfo: "~100 barcos iluminados. El reflejo en el agua al atardecer es espectacular.",
        coordinates: [34.7033, 135.5194]
      },
      {
        time: "19:30",
        name: "Fuegos artificiales - Hono Hanabi",
        description: "~3.000-5.000 cohetes de fuegos artificiales sobre el río Okawa.",
        type: "visita",
        importantInfo: "Mejor punto: Puente Genpachi (vistas al río + Osaka Castle al fondo). ~3.000-5.000 cohetes.",
        coordinates: [34.7033, 135.5194]
      },
      {
        time: "21:00",
        name: "Vuelta a casa entre puestos",
        description: "Paseo de vuelta al Airbnb entre puestos callejeros: takoyaki, yakisoba, kakigori de despedida",
        type: "normal",
        coordinates: [34.6937, 135.5023]
      }
    ]
  },
  // Día 24 - 26 Julio
  {
    title: "26 Julio - Osaka (Último día)",
    activities: [
      {
        time: "07:00",
        name: "Paseo matutino por Namba y Dotonbori",
        description: "Calles tranquilas a primera hora, perfectas para fotos sin gente y último takoyaki del viaje",
        type: "visita",
        coordinates: [34.6687, 135.5032]
      },
      {
        time: "09:00",
        name: "Metro a Umeda",
        description: "Coger el metro hacia el barrio de Umeda",
        type: "transporte",
        coordinates: [34.7055, 135.4983]
      },
      {
        time: "09:30",
        name: "Explorar Umeda",
        description: "Pokémon Center Osaka, tiendas y últimas compras en Umeda",
        type: "visita",
        coordinates: [34.7055, 135.4983]
      },
      {
        time: "12:00",
        name: "Comer en Umeda",
        description: "Última comida tranquila en Umeda antes del acuario",
        type: "comida",
        coordinates: [34.7055, 135.4983]
      },
      {
        time: "13:30",
        name: "Metro a Tempozan",
        description: "Metro hacia Tempozan (~30 min, línea Chuo)",
        type: "transporte",
        coordinates: [34.6544, 135.4285]
      },
      {
        time: "14:00",
        name: "Paseo por el puerto de Tempozan",
        description: "Pasear por la zona del puerto de Osaka en Tempozan",
        type: "visita",
        coordinates: [34.6544, 135.4285]
      },
      {
        time: "15:00",
        name: "Kaiyukan (Acuario de Osaka)",
        description: "Uno de los mejores acuarios del mundo (~2,5h). Tiburón ballena, medusas, focas árticas.",
        type: "visita",
        importantInfo: "Luces y música especial 'El mar de noche' desde las 17:00",
        coordinates: [34.6544, 135.4285]
      },
      {
        time: "17:30",
        name: "Noria Tempozan",
        description: "Noria de 100m de altura con vistas al puerto y toda la ciudad de Osaka",
        type: "visita",
        coordinates: [34.6544, 135.4285]
      },
      {
        time: "18:30",
        name: "Vuelta al apartamento",
        description: "Regreso al Airbnb en Osaka",
        type: "normal",
        coordinates: [34.6937, 135.5023]
      },
      {
        time: "20:00",
        name: "Preparar maletas",
        description: "Hacer maletas y descansar antes del vuelo de mañana",
        type: "normal",
        coordinates: [34.6937, 135.5023]
      }
    ]
  },
  // Día 25 - 27 Julio
  {
    title: "27 Julio - Vuelta a Casa",
    activities: [
      {
        time: "12:30",
        name: "Última comida en Osaka",
        description: "Última comida en Japón antes de ir al aeropuerto",
        type: "comida",
        coordinates: [34.6937, 135.5023]
      },
      {
        time: "13:00",
        name: "Salida al aeropuerto",
        description: "Salida hacia el aeropuerto de Kansai (KIX)",
        type: "transporte",
        coordinates: [34.4348, 135.2440]
      },
      {
        time: "15:00",
        name: "Aeropuerto de Kansai (KIX)",
        description: "Llegada al aeropuerto. Facturación, controles y despedida de Japón.",
        type: "normal",
        coordinates: [34.4348, 135.2440]
      },
      {
        time: "18:10",
        name: "Vuelo de vuelta a casa",
        description: "Salida del vuelo de regreso desde Osaka",
        type: "vuelo",
        coordinates: [34.4348, 135.2440]
      }
    ]
  }
];
