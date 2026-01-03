import { Day, Accommodation, ShoppingItem, Traveler } from '../types';

export const tripName = "Japan Countryside Trip";

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
  }
];

export const initialAccommodations: Accommodation[] = [
  {
    id: 1,
    name: "ShinOsaka Airbnb",
    price: 92,
    link: "https://www.airbnb.es/rooms/31774982",
    fromDay: 0,
    toDay: 0,
    coordinates: [34.7060, 135.4910]
  },
  {
    id: 2,
    name: "Ryokan Kinosaki",
    price: 220,
    link: "https://dormy-hotels.com",
    fromDay: 1,
    toDay: 1,
    coordinates: [35.6283, 134.8141]
  },
  {
    id: 3,
    name: "Apartamento Tokyo",
    price: 100,
    link: "https://www.airbnb.es/rooms/46325248",
    fromDay: 2,
    toDay: 3,
    coordinates: [35.6812, 139.7671]
  }
];

export const initialData: Day[] = [
  {
    title: "Llegada a Osaka",
    activities: [
      {
        time: "10:00",
        name: "Vuelo Madrid - Osaka",
        description: "Llegada al aeropuerto de Kansai",
        type: "vuelo",
        price: 800,
        currency: "EUR",
        coordinates: [34.4348, 135.2440]
      },
      {
        time: "14:00",
        name: "Check-in Airbnb",
        description: "Instalación en el apartamento de ShinOsaka",
        type: "normal",
        coordinates: [34.7060, 135.4910]
      },
      {
        time: "18:00",
        name: "Cena en Dotonbori",
        description: "Explorar la zona de Dotonbori y cenar takoyaki",
        type: "comida",
        price: 30,
        currency: "EUR",
        coordinates: [34.6687, 135.5032]
      }
    ]
  },
  {
    title: "Kinosaki Onsen",
    activities: [
      {
        time: "09:00",
        name: "Tren a Kinosaki",
        description: "JR Limited Express Kounotori desde Osaka",
        type: "transporte",
        coordinates: [35.6283, 134.8141]
      },
      {
        time: "14:00",
        name: "Baños termales",
        description: "Recorrido por los 7 onsen públicos del pueblo",
        type: "visita",
        price: 15,
        currency: "EUR"
      },
      {
        time: "19:00",
        name: "Cena Kaiseki en Ryokan",
        description: "Cena tradicional japonesa incluida en el alojamiento",
        type: "comida"
      }
    ]
  },
  {
    title: "Viaje a Tokyo",
    activities: [
      {
        time: "08:00",
        name: "Shinkansen a Tokyo",
        description: "Tren bala desde Osaka hasta Tokyo",
        type: "transporte",
        coordinates: [35.6812, 139.7671]
      },
      {
        time: "12:00",
        name: "Check-in apartamento",
        description: "Instalación en Shinjuku",
        type: "normal",
        coordinates: [35.6938, 139.7034]
      },
      {
        time: "15:00",
        name: "Explorar Shibuya",
        description: "Cruce de Shibuya y alrededores",
        type: "visita",
        coordinates: [35.6595, 139.7004]
      }
    ]
  },
  {
    title: "Tokyo - Día libre",
    activities: [
      {
        time: "10:00",
        name: "Museo Ghibli",
        description: "Visita al museo de Studio Ghibli en Mitaka",
        type: "visita",
        price: 20,
        currency: "EUR",
        coordinates: [35.6962, 139.5704],
        isOptional: true
      },
      {
        time: "14:00",
        name: "Almuerzo en Nakano",
        description: "Explorar Nakano Broadway",
        type: "comida",
        price: 25,
        currency: "EUR",
        isOptional: true
      }
    ]
  }
];
