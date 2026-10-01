// Firebase 專案設定（這些值本來就是公開的，資料安全由 Firestore 安全規則保護）
window.SHARK_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDgd7Z479KqaNIZL0jbEHsX8HGBm73EphI",
  authDomain: "shark-training.firebaseapp.com",
  projectId: "shark-training",
  storageBucket: "shark-training.firebasestorage.app",
  messagingSenderId: "1023210270688",
  appId: "1:1023210270688:web:2bd6d25a385970f4280585"
};
// 管理員：可以同意新使用者、移轉資料。要更換時，firestore.rules 裡的 email 也要一起改。
window.SHARK_ADMIN = "hi2002no@gmail.com";
// Google Drive 備份用的 OAuth 用戶端 ID（Google Cloud → API 和服務 → 憑證）。留空則不顯示 Drive 備份。
window.SHARK_GOOGLE_CLIENT_ID = "";
