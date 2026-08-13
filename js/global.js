import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

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

document.addEventListener('DOMContentLoaded', () => {
    const particlesDiv = document.getElementById('particles-js');
    const loadingScreen = document.getElementById('loading-screen');

    function hideLoading() {
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => loadingScreen.style.display = 'none', 500);
        }
    }

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            try {
                const userRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(userRef);
                
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    
                    if (data.theme && data.theme !== 'default') {
                        document.documentElement.classList.add(`theme-${data.theme}`);
                        document.body.classList.add(`theme-${data.theme}`);
                    } else {
                        document.documentElement.className = '';
                        document.body.className = '';
                    }
                    
                    if (particlesDiv) {
                        particlesDiv.style.display = data.particles === 'off' ? 'none' : 'block';
                    }
                }
            } catch (error) {}
        }
        hideLoading();
    });

    setTimeout(hideLoading, 3000);
});

window.showNotification = function(message) {
    let popup = document.getElementById('global-popup');
    if (!popup) {
        popup = document.createElement('div');
        popup.id = 'global-popup';
        popup.style.position = 'fixed';
        popup.style.bottom = '20px';
        popup.style.left = '50%';
        popup.style.transform = 'translateX(-50%)';
        popup.style.backgroundColor = 'var(--border-color, #e60000)';
        popup.style.color = '#fff';
        popup.style.padding = '10px 20px';
        popup.style.borderRadius = '5px';
        popup.style.zIndex = '9999';
        popup.style.opacity = '0';
        popup.style.transition = 'opacity 0.3s ease';
        popup.style.pointerEvents = 'none';
        document.body.appendChild(popup);
    }
    
    popup.textContent = message;
    popup.style.opacity = '1';
    
    setTimeout(() => {
        popup.style.opacity = '0';
    }, 3000);
};
