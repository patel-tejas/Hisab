// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyD0eUYMAL8iBQbDzsKdz3pSD6g2jrntD1k",
    authDomain: "hisaab-a026b.firebaseapp.com",
    projectId: "hisaab-a026b",
    storageBucket: "hisaab-a026b.firebasestorage.app",
    messagingSenderId: "735007434787",
    appId: "1:735007434787:web:1a3671079e43a119ca2996",
    measurementId: "G-FT86QP64DX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);