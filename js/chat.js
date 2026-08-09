import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getDatabase, ref, onValue, set, onDisconnect } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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
const rtdb = getDatabase(app);

let currentUsername = null;

lucide.createIcons();

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "auth.html";
        return;
    }

    try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().username) {
            currentUsername = userDoc.data().username;
        } else {
            await signOut(auth);
            window.location.href = "auth.html";
            return;
        }
    } catch (error) {
        console.error(error);
    }

    const userStatusRef = ref(rtdb, '/status/' + user.uid);
    set(userStatusRef, { state: 'online', username: currentUsername });
    onDisconnect(userStatusRef).remove();

    const messagesQuery = query(collection(db, "messages"), orderBy("createdAt", "asc"));

    onSnapshot(messagesQuery, (snapshot) => {
        const container = document.getElementById("messages-container");
        if (!container) return;
        
        container.innerHTML = ""; 

        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            let timeString = "Just now";
            if (data.createdAt) {
                const date = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
                timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }

            const sender = data.username;
            const isMe = user.uid === data.uid;

            const msgDiv = document.createElement("div");
            msgDiv.className = `message ${isMe ? "sent" : "received"}`;
            
            msgDiv.innerHTML = `
                <div class="message-info">
                    <span class="sender-id"><i data-lucide="user" style="width:14px; height:14px;"></i> ${sender}</span>
                    <span class="timestamp">${timeString}</span>
                </div>
                <div class="message-text">${escapeHtml(data.text || "")}</div>
            `;
            container.appendChild(msgDiv);
        });
        
        lucide.createIcons();
        container.scrollTop = container.scrollHeight;
    });
});

const onlineCountRef = ref(rtdb, '/status');
onValue(onlineCountRef, (snapshot) => {
    const data = snapshot.val();
    const listElement = document.getElementById("online-users-list");
    const countElement = document.getElementById("online-count");
    
    listElement.innerHTML = "";
    let count = 0;
    
    if (data) {
        for (const uid in data) {
            if (data[uid].state === 'online' && data[uid].username) {
                count++;
                const li = document.createElement("li");
                li.innerHTML = `<i data-lucide="user-check"></i> ${escapeHtml(data[uid].username)}`;
                listElement.appendChild(li);
            }
        }
    }
    
    countElement.innerText = count;
    lucide.createIcons();
});

function sendMessage() {
    const input = document.getElementById("message-input");
    const text = input.value.trim().substring(0, 30); 
    
    if (text.length > 0 && auth.currentUser && currentUsername) {
        input.value = "";
        addDoc(collection(db, "messages"), {
            text: text,
            uid: auth.currentUser.uid,
            username: currentUsername,
            createdAt: serverTimestamp()
        }).catch(err => console.error(err));
    }
}

function escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

document.getElementById("send-button").addEventListener("click", sendMessage);
document.getElementById("message-input").addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
});

document.getElementById("logout-btn").addEventListener("click", () => {
    signOut(auth).then(() => {
        window.location.href = "auth.html";
    });
});
