// ===== DEMO DATA =====
const DEMO_USERS = [
  {
    id: 1, role: 'particulier',
    email: 'user@demo.fr', password: 'demo1234',
    firstName: 'Sophie', lastName: 'Martin',
    phone: '+33 6 12 34 56 78'
  },
  {
    id: 2, role: 'annonceur',
    email: 'annonceur@demo.fr', password: 'demo5678',
    firstName: 'Pierre', lastName: 'Dupont',
    phone: '+33 6 98 76 54 32',
    venueName: 'Espace Lumière', siret: '123 456 789 00012', iban: 'FR76 1234 5678 9012 3456 7890 123'
  }
];

const VENUES = [
  {
    id: 1, ownerId: 2,
    name: 'Espace Lumière',
    type: 'Loft / Studio',
    address: '12 rue du Commerce, 75015 Paris',
    city: 'Paris',
    description: 'Magnifique loft industriel de 300m² au cœur de Paris. Grandes baies vitrées, cuisine équipée, espace bar. Idéal pour séminaires, shootings et soirées privées.',
    price: 120,
    capacity: 80,
    rating: 4.8,
    reviewCount: 24,
    amenities: ['Sono professionnelle', 'Climatisation', 'Parking privé', 'Cuisine équipée', 'Wifi 1 Gbps', 'Projecteur 4K'],
    img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
    published: true
  },
  {
    id: 2, ownerId: 2,
    name: 'Rooftop Panorama',
    type: 'Rooftop',
    address: '8 avenue des Champs-Élysées, 75008 Paris',
    city: 'Paris',
    description: 'Rooftop exclusif avec vue imprenable sur Paris. 150m² en plein air, parfait pour cocktails et cérémonies. Disponible jour et soir.',
    price: 250,
    capacity: 120,
    rating: 4.9,
    reviewCount: 41,
    amenities: ['Vue panoramique', 'Bar intégré', 'Éclairage ambiance', 'Mobilier inclus'],
    img: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80',
    published: true
  },
  {
    id: 3, ownerId: 2,
    name: 'Manoir des Roses',
    type: 'Château / Manoir',
    address: '25 chemin des Vignes, 33000 Bordeaux',
    city: 'Bordeaux',
    description: 'Manoir du XIXe siècle entouré de jardins à la française. Salle de réception pour 200 personnes, hébergement disponible sur demande.',
    price: 480,
    capacity: 200,
    rating: 4.7,
    reviewCount: 18,
    amenities: ['Jardins privatifs', 'Hébergement', 'Traiteur agréé', 'Parking 50 places', 'Sono & lumières'],
    img: 'https://images.unsplash.com/photo-1464817739973-0128fe77aaa1?w=800&q=80',
    published: true
  },
  {
    id: 4, ownerId: 2,
    name: 'Studio Nord',
    type: 'Loft / Studio',
    address: '3 rue des Arts, 69001 Lyon',
    city: 'Lyon',
    description: 'Studio artistique modulable, idéal pour shootings photo, événements créatifs et présentations. Lumière naturelle zénithale.',
    price: 75,
    capacity: 40,
    rating: 4.6,
    reviewCount: 12,
    amenities: ['Fond blanc & noir', 'Flash studio', 'Vestiaires', 'Kitchenette'],
    img: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80',
    published: true
  },
  {
    id: 5, ownerId: 2,
    name: 'Jardin Secret',
    type: 'Jardin / Espace extérieur',
    address: '18 allée des Fleurs, 06000 Nice',
    city: 'Nice',
    description: 'Jardin méditerranéen de 500m² en plein cœur de Nice. Pergola, fontaine, éclairage guirlandes. Ambiance unique pour mariages et fêtes.',
    price: 180,
    capacity: 150,
    rating: 4.9,
    reviewCount: 33,
    amenities: ['Pergola', 'Éclairage guirlandes', 'Cuisine extérieure', 'Tables & chaises incluses'],
    img: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80',
    published: true
  },
  {
    id: 6, ownerId: 2,
    name: 'Salle Opéra',
    type: 'Salle de réception',
    address: '7 boulevard Haussmann, 75009 Paris',
    city: 'Paris',
    description: 'Salle haussmannienne de prestige, parquet en chêne, moulures dorées, 220m². Accueil jusqu\'à 150 personnes assis.',
    price: 350,
    capacity: 150,
    rating: 4.8,
    reviewCount: 29,
    amenities: ['Parquet chêne', 'Lustre cristal', 'Scène intégrée', 'Loges artistes', 'Sono & vidéo'],
    img: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800&q=80',
    published: true
  }
];

const DEMO_RESERVATIONS = [
  { id: 1, venueId: 1, userId: 1, date: '2026-06-14', start: '18:00', end: '23:00', guests: 40, eventType: 'Anniversaire', status: 'confirmed', total: 600 },
  { id: 2, venueId: 2, userId: 1, date: '2026-07-20', start: '19:00', end: '01:00', guests: 80, eventType: 'Soirée privée', status: 'pending', total: 1500 },
  { id: 3, venueId: 5, userId: 1, date: '2026-05-10', start: '14:00', end: '20:00', guests: 60, eventType: 'Mariage', status: 'confirmed', total: 1080 }
];

const DEMO_REVIEWS = [
  { id: 1, venueId: 1, author: 'Alice D.', rating: 5, text: 'Lieu absolument magnifique, tout s\'est passé parfaitement. L\'équipe est très professionnelle.', date: '2026-03-15' },
  { id: 2, venueId: 1, author: 'Marc B.', rating: 5, text: 'Superbe espace, grande qualité. On a adoré la sono et le bar. À recommander !', date: '2026-02-28' },
  { id: 3, venueId: 1, author: 'Julie R.', rating: 4, text: 'Très bel endroit. Parking pratique. Seul bémol : quelques petits détails à améliorer dans la cuisine.', date: '2026-01-10' }
];

const DEMO_MESSAGES = [
  { id: 1, from: 'Espace Lumière', text: 'Votre réservation du 14 juin a été confirmée ! N\'hésitez pas à nous contacter pour tout besoin logistique.', date: '2026-05-20' },
  { id: 2, from: 'Rooftop Panorama', text: 'Bonjour, votre demande est en cours d\'examen. Nous revenons vers vous dans 24h.', date: '2026-05-22' }
];
