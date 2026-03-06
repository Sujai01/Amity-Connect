import { db, auth } from '../firebaseConfig';
import { 
  doc, updateDoc, increment, arrayUnion, arrayRemove, 
  deleteDoc, getDoc, serverTimestamp, collection, addDoc 
} from 'firebase/firestore';

export const createNewPost = async (content) => {
  try {
    const userRef = doc(db, "users", auth.currentUser.uid);
    const userSnap = await getDoc(userRef);
    let userName = userSnap.exists() ? userSnap.data().name : "Amity Student";

    await addDoc(collection(db, "posts"), {
      content,
      authorName: userName,
      authorId: auth.currentUser.uid,
      likes: 0,
      likedBy: [],
      createdAt: serverTimestamp(),
      circle: "General"
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const toggleLike = async (postId, hasLiked) => {
  const postRef = doc(db, "posts", postId);
  try {
    await updateDoc(postRef, {
      likes: hasLiked ? increment(-1) : increment(1),
      likedBy: hasLiked ? arrayRemove(auth.currentUser.uid) : arrayUnion(auth.currentUser.uid)
    });
  } catch (e) { console.error(e); }
};

export const deletePost = async (postId) => {
  try {
    await deleteDoc(doc(db, "posts", postId));
    return { success: true };
  } catch (e) { return { success: false }; }
};

export const updateUserLocation = async (uid, location) => {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    location,
    updatedAt: new Date(),
  });
};