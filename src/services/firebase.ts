import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

// Based on android/app/google-services.json
const firebaseConfig = {
  apiKey: "AIzaSyBJxVM-uS_UpMz2pwqu0EKjHjE8-JUkBbE",
  authDomain: "ion-cleaner.firebaseapp.com",
  projectId: "ion-cleaner",
  storageBucket: "ion-cleaner.firebasestorage.app",
  messagingSenderId: "994277632531",
  appId: "1:994277632531:web:ca37107bf482594a" // dummy web app id, enough for firestore
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Helper functions for Banner Admin
export const updateBannerConfig = async (imageUrl: string, linkUrl: string) => {
  const bannerRef = doc(db, 'config', 'banner');
  await setDoc(bannerRef, {
    imageUrl: imageUrl || null,
    linkUrl: linkUrl || null,
    updatedAt: Date.now()
  });
};

export const subscribeToBannerConfig = (callback: (data: { imageUrl: string | null; linkUrl: string | null }) => void) => {
  const bannerRef = doc(db, 'config', 'banner');
  return onSnapshot(bannerRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      callback({
        imageUrl: data.imageUrl || null,
        linkUrl: data.linkUrl || null
      });
    } else {
      callback({ imageUrl: null, linkUrl: null });
    }
  });
};
