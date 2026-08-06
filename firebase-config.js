/* =====================================================================
   FIREBASE CONFIG 
   ---------------------------------------------------------------------
   Leave this exactly as-is and the game runs in LOCAL MODE:
   it still works perfectly, but only across tabs on ONE computer
   (great for testing and for a single-screen classroom setup).

   To let students join from their own phones/laptops, follow
   FIREBASE-SETUP.md, then paste your config object below and set
   enabled: true.
   ===================================================================== */

window.FACEOFF_FIREBASE = {
  enabled: false,

  config: {
   apiKey: "AIzaSyCHgdXXUQngfZNtu9saeE-tJFBWYLUMhUs",
  authDomain: "face-off-games.firebaseapp.com",
  projectId: "face-off-games",
  storageBucket: "face-off-games.firebasestorage.app",
  messagingSenderId: "126038768937",
  appId: "1:126038768937:web:aaef27e8c41dd356e9cb38",
  measurementId: "G-BMBJB3YC3Z"  }
};
