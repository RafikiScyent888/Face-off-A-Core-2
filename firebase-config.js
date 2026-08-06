/* =====================================================================
   FIREBASE CONFIG  —  Face-off: A+ Core 2
   ---------------------------------------------------------------------
   These are YOUR real project values (face-off-games), already filled in.

   ⚠ ONE THING TO CHECK — the databaseURL below.
   It is set to the DEFAULT (us-central1) form. Open the Firebase console:
       Build → Realtime Database
   and compare the URL shown at the top of that page to the one below.

     • If the page shows the SAME url  → nothing to change, you're done.
     • If it shows a REGION in it, e.g.
           https://face-off-games-default-rtdb.europe-west1.firebasedatabase.app
       → replace the databaseURL line below with exactly what it shows.
     • If there is NO database there at all → click "Create Database"
       (Realtime Database, NOT Firestore), then come back and copy the URL.

   Without a correct databaseURL, phones cannot join. The game will tell
   you so on screen instead of failing silently.
   ===================================================================== */

window.FACEOFF_FIREBASE = {
  enabled: true,

  config: {
    apiKey: "AIzaSyCHgdXXUQngfZNtu9saeE-tJFBWYLUMhUs",
    authDomain: "face-off-games.firebaseapp.com",
    databaseURL: "https://face-off-games-default-rtdb.firebaseio.com",
    projectId: "face-off-games",
    storageBucket: "face-off-games.firebasestorage.app",
    messagingSenderId: "126038768937",
    appId: "1:126038768937:web:aaef27e8c41dd356e9cb38",
    measurementId: "G-BMBJB3YC3Z"
  }
};
