import type { Trip } from '../types';

export const interlakenTrip: Trip = {
  id: 'interlaken-road-trip',
  tripName: 'Interlaken en coche · 7 días',
  currentDay: 0,
  travelers: [
    {
      id: 1,
      firstName: 'Carlos',
      lastName: 'García López',
      age: 34,
      email: 'carlos.garcia@email.com',
      phonePrefix: '+34',
      phone: '612345678',
      documents: [{ type: 'driverLicense', number: '12345678A' }],
      paysBudget: true
    },
    {
      id: 2,
      firstName: 'María',
      lastName: 'Fernández Ruiz',
      age: 32,
      email: 'maria.fernandez@email.com',
      documents: [{ type: 'id', number: '23456789B' }],
      paysBudget: true
    }
  ],
  shoppingItems: [
    { id: 1, name: 'Viñeta de autopistas de Suiza', category: 'transporte', price: 42, currency: 'EUR', purchased: false },
    { id: 2, name: 'Billetes Jungfraujoch', category: 'entradas', price: 420, currency: 'EUR', purchased: false },
    { id: 3, name: 'Seguro de viaje y asistencia en carretera', category: 'documentos', price: 95, currency: 'EUR', purchased: true },
    { id: 4, name: 'Reserva parking Interlaken Ost', category: 'transporte', price: 85, currency: 'EUR', purchased: false }
  ],
  accommodations: [
    { id: 1, name: 'Hôtel des Artistes Lyon', price: 140, fromDay: 0, toDay: 0, coordinates: [45.7578, 4.8320] },
    { id: 2, name: 'Apartamento Interlaken West', price: 1080, fromDay: 1, toDay: 4, coordinates: [46.6839, 7.8510] },
    { id: 3, name: 'Hôtel Aragon Montpellier', price: 130, fromDay: 5, toDay: 5, coordinates: [43.6108, 3.8767] }
  ],
  days: [
    {
      title: 'Día 1 · Barcelona → Lyon',
      activities: [
        { time: '07:00', name: 'Salida de Barcelona', description: 'Coche cargado, depósito lleno y documentación preparada.', type: 'transporte', coordinates: [41.3874, 2.1686] },
        { time: '10:00', name: 'Parada en Narbona', description: 'Descanso, café y paseo corto antes de continuar por la A9.', type: 'comida', coordinates: [43.1843, 3.0031] },
        { time: '13:30', name: 'Comida en Nîmes', description: 'Parada larga junto al centro histórico y recarga de energía.', type: 'comida', coordinates: [43.8367, 4.3601] },
        { time: '18:00', name: 'Llegada a Lyon', description: 'Check-in y aparcar el coche hasta la mañana siguiente.', type: 'transporte', coordinates: [45.7578, 4.8320] },
        { time: '19:30', name: 'Paseo por Vieux Lyon', description: 'Cena y paseo por las calles del casco antiguo.', type: 'visita', coordinates: [45.7622, 4.8271] }
      ]
    },
    {
      title: 'Día 2 · Lyon → Interlaken',
      activities: [
        { time: '08:00', name: 'Salida hacia Suiza', description: 'Ruta por Ginebra y Lausana dirección Berna.', type: 'transporte', coordinates: [45.7578, 4.8320] },
        { time: '10:30', name: 'Parada junto al lago Lemán', description: 'Descanso con vistas al lago en la zona de Lausana.', type: 'visita', coordinates: [46.5197, 6.6323] },
        { time: '13:00', name: 'Comida en Gruyères', description: 'Paseo por el pueblo medieval y comida temprana.', type: 'comida', coordinates: [46.5847, 7.0821] },
        { time: '17:00', name: 'Llegada a Interlaken', description: 'Check-in y compra básica para el apartamento.', type: 'transporte', coordinates: [46.6863, 7.8632] },
        { time: '19:00', name: 'Paseo por Höhematte', description: 'Primeras vistas del Jungfrau desde el centro de Interlaken.', type: 'visita', coordinates: [46.6865, 7.8657] }
      ]
    },
    {
      title: 'Día 3 · Lauterbrunnen y Wengen',
      activities: [
        { time: '08:00', name: 'Coche a Lauterbrunnen', description: 'Salida temprano para encontrar aparcamiento junto a la estación.', type: 'transporte', coordinates: [46.5935, 7.9091] },
        { time: '09:00', name: 'Cascada Staubbach', description: 'Paseo por el valle y visita a la cascada más emblemática.', type: 'visita', coordinates: [46.5891, 7.9054] },
        { time: '11:00', name: 'Tren a Wengen', description: 'Subida en tren; el coche se queda en Lauterbrunnen.', type: 'transporte', coordinates: [46.6050, 7.9210] },
        { time: '12:00', name: 'Wengen y mirador', description: 'Paseo por el pueblo, comida y vistas sobre el valle.', type: 'visita', coordinates: [46.6050, 7.9210] },
        { time: '16:30', name: 'Cascadas de Trümmelbach', description: 'Visita a las cascadas interiores antes de regresar.', type: 'visita', coordinates: [46.5717, 7.9146] }
      ]
    },
    {
      title: 'Día 4 · Grindelwald y First',
      activities: [
        { time: '08:00', name: 'Salida hacia Grindelwald', description: 'Trayecto en coche y aparcamiento cerca de la terminal.', type: 'transporte', coordinates: [46.6242, 8.0414] },
        { time: '09:00', name: 'Telecabina a First', description: 'Subida a First para aprovechar la mañana.', type: 'transporte', coordinates: [46.6601, 8.0548] },
        { time: '10:00', name: 'First Cliff Walk', description: 'Pasarela panorámica sobre el valle de Grindelwald.', type: 'visita', coordinates: [46.6601, 8.0548] },
        { time: '11:00', name: 'Ruta al Bachalpsee', description: 'Caminata de ida y vuelta al lago con picnic.', type: 'visita', coordinates: [46.6694, 8.0239] },
        { time: '16:30', name: 'Paseo por Grindelwald', description: 'Merienda y paseo tranquilo antes de volver a Interlaken.', type: 'visita', coordinates: [46.6242, 8.0414] }
      ]
    },
    {
      title: 'Día 5 · Brienz, Giessbach y Thun',
      activities: [
        { time: '08:30', name: 'Ruta por el lago de Brienz', description: 'Salida por la orilla norte hasta el pueblo de Brienz.', type: 'transporte', coordinates: [46.7541, 8.0298] },
        { time: '10:00', name: 'Cascadas de Giessbach', description: 'Paseo por el bosque y las pasarelas de las cascadas.', type: 'visita', coordinates: [46.7332, 8.0245] },
        { time: '13:00', name: 'Comida junto al lago', description: 'Parada relajada en Brienz con vistas al agua.', type: 'comida', coordinates: [46.7541, 8.0298] },
        { time: '15:30', name: 'Castillo y casco antiguo de Thun', description: 'Tarde entre el castillo, los puentes y la ribera del Aar.', type: 'visita', coordinates: [46.7580, 7.6296] },
        { time: '19:00', name: 'Última cena en Interlaken', description: 'Cena cerca del apartamento y preparación de la vuelta.', type: 'comida', coordinates: [46.6839, 7.8510] }
      ]
    },
    {
      title: 'Día 6 · Interlaken → Montpellier',
      activities: [
        { time: '07:30', name: 'Salida de Interlaken', description: 'Inicio de la ruta de regreso pasando por Berna y Ginebra.', type: 'transporte', coordinates: [46.6863, 7.8632] },
        { time: '10:00', name: 'Pausa en Ginebra', description: 'Desayuno tardío y paseo breve junto al Jet d’Eau.', type: 'visita', coordinates: [46.2044, 6.1432] },
        { time: '13:30', name: 'Comida en Valence', description: 'Parada de carretera larga antes del último tramo.', type: 'comida', coordinates: [44.9334, 4.8924] },
        { time: '18:00', name: 'Llegada a Montpellier', description: 'Check-in y dejar el coche en el parking del hotel.', type: 'transporte', coordinates: [43.6108, 3.8767] },
        { time: '19:30', name: 'Cena en Place de la Comédie', description: 'Paseo y cena por el centro antes de descansar.', type: 'comida', coordinates: [43.6085, 3.8796] }
      ]
    },
    {
      title: 'Día 7 · Montpellier → Barcelona',
      activities: [
        { time: '09:00', name: 'Salida hacia Barcelona', description: 'Último tramo por la A9 y la AP-7.', type: 'transporte', coordinates: [43.6108, 3.8767] },
        { time: '11:30', name: 'Parada en Collioure', description: 'Café y paseo corto frente al mar antes de cruzar la frontera.', type: 'visita', coordinates: [42.5250, 3.0832] },
        { time: '14:00', name: 'Comida en Girona', description: 'Última parada del viaje y paseo por el casco histórico.', type: 'comida', coordinates: [41.9794, 2.8214] },
        { time: '18:00', name: 'Llegada a Barcelona', description: 'Fin del road trip y descarga del coche.', type: 'transporte', coordinates: [41.3874, 2.1686] }
      ]
    }
  ]
};
