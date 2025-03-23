import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
    apiKey: "AIzaSyCwIQiX6pQaiqzzwReEfV-O1s8uSi_o8Fo",
    authDomain: "sparkbites-68dbc.firebaseapp.com",
    projectId: "sparkbites-68dbc",
    storageBucket: "sparkbites-68dbc.firebasestorage.app",
    messagingSenderId: "144687146516",
    appId: "1:144687146516:web:1c576abaa6a368e7dde901",
    measurementId: "G-V2GGN1VCB3"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        //const credential = GoogleAuthProvider.credentialFromResult(result);
        //const token = credential.accessToken;
        const user = result.user;
        console.log("User Info:", user);
        return user;
    } catch (error) {
        console.error("Error during sign-in:", error);
    }
};

export const logout = async () => {
    try {
        await signOut(auth);
        console.log("User signed out successfully");
    } catch (error) {
        console.error("Error during sign-out:", error);
    }
};
