import { db, auth } from '../firebaseConfig';
import { doc, updateDoc, GeoPoint, serverTimestamp } from 'firebase/firestore';

export const updateUserLocation = async (latitude, longitude) => {
  if (!auth.currentUser) return;
  try {
    const userRef = doc(db, "users", auth.currentUser.uid);
    await updateDoc(userRef, {
      location: new GeoPoint(latitude, longitude),
      lastActive: serverTimestamp()
    });
  } catch (e) { console.error(e); }
};