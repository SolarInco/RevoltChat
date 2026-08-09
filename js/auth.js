import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDWnr-9qpfzW_y-LMuTorItQTUHJVvhLDk",
    authDomain: "revolt-chat-4fada.firebaseapp.com",
    databaseURL: "https://revolt-chat-4fada-default-rtdb.firebaseio.com/",
    projectId: "revolt-chat-4fada",
    storageBucket: "revolt-chat-4fada.firebasestorage.app",
    messagingSenderId: "488624788181",
    appId: "1:488624788181:web:1571ba31aafb8c1441c85c"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let isLoginMode = false;

document.getElementById("toggle-mode").addEventListener("click", (e) => {
    e.preventDefault();
    isLoginMode = !isLoginMode;
    
    document.getElementById("auth-title").innerText = isLoginMode ? "Log In" : "Sign Up";
    document.getElementById("auth-subtitle").innerText = isLoginMode ? "Welcome back." : "Create an account to join REVOLT CHAT.";
    document.getElementById("auth-action-btn").innerText = isLoginMode ? "Log In" : "Create Account";
    document.getElementById("toggle-prompt").innerText = isLoginMode ? "Don't have an account?" : "Already have an account?";
    document.getElementById("toggle-mode").innerText = isLoginMode ? "Sign up here" : "Log in here";
    
    document.getElementById("username-group").style.display = isLoginMode ? "none" : "block";
    document.getElementById("auth-error").innerText = "";
});

document.getElementById("auth-action-btn").addEventListener("click", async () => {
    const email = document.getElementById("email-input").value.trim();
    const password = document.getElementById("password-input").value.trim();
    const username = document.getElementById("username-input").value.trim();
    const errorTxt = document.getElementById("auth-error");

    errorTxt.innerText = "";

    if (!email || !password) {
        errorTxt.innerText = "Please fill in all fields.";
        return;
    }

    try {
        if (isLoginMode) {
            await signInWithEmailAndPassword(auth, email, password);
            window.location.href = "home.html";
        } else {
            if (!username) {
                errorTxt.innerText = "Username is required for Sign Up.";
                return;
            }
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            await setDoc(doc(db, "users", user.uid), {
                username: username,
                email: email,
                createdAt: new Date()
            });

            window.location.href = "home.html";
        }
    } catch (error) {
        errorTxt.innerText = error.message.replace("Firebase: ", "");
    }
});
