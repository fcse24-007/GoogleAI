import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  setDoc,
  getDoc
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Accommodation, Reservation, Message, FilterPreference } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const accommodationService = {
  async getListings(): Promise<Accommodation[]> {
    const path = 'accommodations';
    try {
      const q = query(collection(db, path), orderBy('price', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Accommodation));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async getListingById(id: string): Promise<Accommodation | null> {
    const path = `accommodations/${id}`;
    try {
      const docRef = doc(db, 'accommodations', id);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as Accommodation;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return null;
    }
  },

  async reserveListing(accommodationId: string, userId: string): Promise<string> {
    const path = `reservations`;
    try {
      const receiptNumber = `REF-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      const reservation: Omit<Reservation, 'id'> = {
        userId,
        accommodationId,
        receiptNumber,
        timestamp: new Date().toISOString()
      };
      
      await addDoc(collection(db, 'reservations'), reservation);
      await updateDoc(doc(db, 'accommodations', accommodationId), { status: 'Reserved' });
      
      return receiptNumber;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
      return '';
    }
  },

  async savePreferences(userId: string, preferences: FilterPreference): Promise<void> {
    const path = `preferences/${userId}`;
    try {
      await setDoc(doc(db, 'preferences', userId), preferences);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async getPreferences(userId: string): Promise<FilterPreference | null> {
    const path = `preferences/${userId}`;
    try {
      const snapshot = await getDoc(doc(db, 'preferences', userId));
      return snapshot.exists() ? snapshot.data() as FilterPreference : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return null;
    }
  },

  async sendMessage(message: Omit<Message, 'id'>): Promise<void> {
    const path = 'messages';
    try {
      await addDoc(collection(db, 'messages'), message);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  subscribeToMessages(accommodationId: string, callback: (messages: Message[]) => void) {
    const q = query(
      collection(db, 'messages'),
      where('accommodationId', '==', accommodationId),
      orderBy('timestamp', 'asc')
    );
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'messages');
    });
  }
};
