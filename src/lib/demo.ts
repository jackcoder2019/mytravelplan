import { type Itinerary } from './types'

export function getDemoItinerary(): Itinerary {
  return {
    tripName: 'European Adventure',
    days: [
      {
        id: 'demo-day-1',
        date: '2026-07-01',
        title: 'Arrival',
        city: 'Paris',
        weather: { condition: 'Partly cloudy', tempHigh: '74°F', tempLow: '59°F', notes: '' },
        activities: [
          { id: 'demo-a1', name: 'Eiffel Tower', highlight: 'Iconic iron lattice tower', hours: '10am–12pm', address: 'Champ de Mars, Paris', notes: 'Book skip-the-line tickets in advance' },
          { id: 'demo-a2', name: 'Seine River Cruise', highlight: 'Scenic 1-hour boat tour', hours: '3pm–4pm', address: 'Port de la Bourdonnais, Paris', notes: '' },
        ],
        lodging: { name: 'Hôtel Plaza Athénée', address: '25 Av. Montaigne, 75008 Paris', checkIn: '2026-07-01T15:00', checkOut: '2026-07-03T11:00', confirmation: 'PAR-78234', notes: '' },
        dining: [
          { id: 'demo-d1', name: 'Café de Flore', meal: 'Breakfast', address: '172 Blvd Saint-Germain, Paris', hours: '9am', notes: 'Classic Parisian café' },
          { id: 'demo-d2', name: 'Le Cinq', meal: 'Dinner', address: '31 Av. George V, Paris', hours: '7:30pm', notes: 'Reservation required' },
        ],
        transportation: [{ id: 'demo-t1', mode: 'Flight', from: 'New York JFK', to: 'Paris CDG', departureDate: '2026-06-30', departureTime: '22:00', arrivalDate: '2026-07-01', arrivalTime: '12:00', confirmation: 'AF447', notes: 'Terminal 2E, seat 12A' }],
      },
      {
        id: 'demo-day-2',
        date: '2026-07-02',
        title: 'Museums & Montmartre',
        city: 'Paris',
        weather: { condition: 'Sunny', tempHigh: '78°F', tempLow: '62°F', notes: '' },
        activities: [
          { id: 'demo-a3', name: 'Louvre Museum', highlight: 'Home of the Mona Lisa', hours: '9am–1pm', address: 'Rue de Rivoli, Paris', notes: 'Get there early to beat crowds' },
          { id: 'demo-a4', name: 'Montmartre & Sacré-Cœur', highlight: 'Charming hilltop village', hours: '3pm–6pm', address: 'Place du Tertre, Paris', notes: '' },
        ],
        lodging: { name: 'Hôtel Plaza Athénée', address: '25 Av. Montaigne, 75008 Paris', checkIn: '2026-07-01T15:00', checkOut: '2026-07-03T11:00', confirmation: 'PAR-78234', notes: '' },
        dining: [
          { id: 'demo-d3', name: 'Angelina', meal: 'Lunch', address: '226 Rue de Rivoli, Paris', hours: '12pm', notes: 'Famous hot chocolate' },
          { id: 'demo-d4', name: 'Le Moulin de la Galette', meal: 'Dinner', address: '83 Rue Lepic, Paris', hours: '7pm', notes: '' },
        ],
        transportation: [],
      },
      {
        id: 'demo-day-3',
        date: '2026-07-03',
        title: 'Travel to London',
        city: 'London',
        weather: { condition: 'Overcast', tempHigh: '65°F', tempLow: '54°F', notes: 'Bring a light jacket' },
        activities: [
          { id: 'demo-a5', name: 'Tower of London', highlight: 'Historic castle and Crown Jewels', hours: '2pm–5pm', address: 'Tower of London, London EC3N 4AB', notes: '' },
          { id: 'demo-a6', name: 'Tower Bridge', highlight: 'Victorian Gothic suspension bridge', hours: '5pm–6pm', address: 'Tower Bridge Rd, London', notes: 'Great for photos at dusk' },
        ],
        lodging: { name: 'The Savoy', address: 'Strand, London WC2R 0EZ', checkIn: '2026-07-03T15:00', checkOut: '2026-07-06T11:00', confirmation: 'SAV-45621', notes: '' },
        dining: [
          { id: 'demo-d5', name: 'Dishoom', meal: 'Dinner', address: '12 Upper St Martin\'s Ln, London', hours: '7pm', notes: 'Queue early or book ahead' },
        ],
        transportation: [{ id: 'demo-t3', mode: 'Train', from: 'Paris Gare du Nord', to: 'London St Pancras', departureDate: '2026-07-03', departureTime: '11:13', arrivalDate: '2026-07-03', arrivalTime: '12:30', confirmation: 'EU-ST-9921', notes: 'Eurostar, car 12 seat 34' }],
      },
    ],
  }
}
