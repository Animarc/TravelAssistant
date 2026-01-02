import { Day, Accommodation, ShoppingItem } from '../types';

export const tripName = "Japan Countryside Trip";

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
