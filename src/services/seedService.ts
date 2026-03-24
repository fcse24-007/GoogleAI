import { collection, getDocs, addDoc, query, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { GABORONE_LOCATIONS, ACCOMMODATION_TYPES, AMENITIES_LIST, GABORONE_CENTER } from '../constants';
import { Accommodation } from '../types';

const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80"
];

export async function seedDatabase() {
  const q = query(collection(db, 'accommodations'), limit(1));
  const snapshot = await getDocs(q);
  
  if (!snapshot.empty) {
    console.log("Database already seeded.");
    return;
  }

  console.log("Seeding database with 50 listings...");
  
  for (let i = 1; i <= 50; i++) {
    const location = GABORONE_LOCATIONS[Math.floor(Math.random() * GABORONE_LOCATIONS.length)];
    const type = ACCOMMODATION_TYPES[Math.floor(Math.random() * ACCOMMODATION_TYPES.length)] as any;
    const price = Math.floor(Math.random() * 5000) + 1500;
    const deposit = Math.floor(price * 0.5);
    
    // Random amenities
    const amenities = AMENITIES_LIST.sort(() => 0.5 - Math.random()).slice(0, 4);
    
    // Random date in next 3 months
    const date = new Date();
    date.setDate(date.getDate() + Math.floor(Math.random() * 90));
    const availabilityDate = date.toISOString().split('T')[0];

    // Random coordinates around Gaborone center
    const latitude = GABORONE_CENTER.lat + (Math.random() - 0.5) * 0.1;
    const longitude = GABORONE_CENTER.lng + (Math.random() - 0.5) * 0.1;

    const accommodation: Omit<Accommodation, 'id'> = {
      title: `${type} in ${location} - Option ${i}`,
      price,
      location,
      type,
      amenities,
      availabilityDate,
      depositAmount: deposit,
      imageUrl: PLACEHOLDER_IMAGES[Math.floor(Math.random() * PLACEHOLDER_IMAGES.length)],
      status: 'Available',
      providerId: 'system-provider',
      description: `A lovely ${type.toLowerCase()} located in the heart of ${location}. Perfect for students looking for a quiet and safe environment. Includes ${amenities.join(', ')}.`,
      latitude,
      longitude
    };

    await addDoc(collection(db, 'accommodations'), accommodation);
  }
  
  console.log("Seeding complete.");
}
