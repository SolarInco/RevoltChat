import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

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
    const themeBoxes = document.querySelectorAll('.theme-box');
    const toggleParticles = document.getElementById('toggle-particles');
    const saveBtn = document.getElementById('save-settings-btn');
    
    let currentUid = null;

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUid = user.uid;
            try {
                const userRef = doc(db, "users", currentUid);
                const docSnap = await getDoc(userRef);
                
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    
                    if (data.theme) {
                        themeBoxes.forEach(box => {
                            box.classList.remove('selected');
                            if (box.dataset.theme === data.theme) {
                                box.classList.add('selected');
                            }
                        });
                    }
                    
                    if (data.particles !== undefined) {
                        if (toggleParticles) toggleParticles.checked = data.particles !== 'off';
                    } else {
                        if (toggleParticles) toggleParticles.checked = true;
                    }
                }
            } catch (error) {}
        }
    });

    themeBoxes.forEach(box => {
        box.addEventListener('click', () => {
            themeBoxes.forEach(b => b.classList.remove('selected'));
            box.classList.add('selected');
        });
    });

    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            if (!currentUid) return;
            
            const selectedThemeBox = document.querySelector('.theme-box.selected');
            const selectedTheme = selectedThemeBox ? selectedThemeBox.dataset.theme : 'default';
            const particlesEnabled = toggleParticles && toggleParticles.checked ? 'on' : 'off';
            
            try {
                const userRef = doc(db, "users", currentUid);
                await updateDoc(userRef, {
                    theme: selectedTheme,
                    particles: particlesEnabled
                });
                
                if (window.showNotification) {
                    window.showNotification('Settings saved to cloud!');
                }
                
                document.documentElement.className = '';
                document.body.className = '';
                if (selectedTheme !== 'default') {
                    document.documentElement.classList.add(`theme-${selectedTheme}`);
                    document.body.classList.add(`theme-${selectedTheme}`);
                }
                
                const particlesDiv = document.getElementById('particles-js');
                if (particlesDiv) {
                    particlesDiv.style.display = particlesEnabled === 'off' ? 'none' : 'block';
                }
            } catch (error) {
                if (window.showNotification) {
                    window.showNotification('Error saving settings.');
                }
            }
        });
    }
});
