import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, where, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

const messageForm = document.getElementById('input-container');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const messagesContainer = document.getElementById('messages-container');
const roomElements = document.querySelectorAll('.room');
const logoutBtn = document.getElementById('logout-btn');

let currentUser = null;
let currentUsername = "Unknown User";
let currentRoom = "General";
let unsubscribe = null;

onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
                currentUsername = userDoc.data().username || "User";
            }
        } catch (e) {
            currentUsername = user.email ? user.email.split('@')[0] : "User";
        }
        loadMessages(currentRoom);
    } else {
        window.location.href = "../index.html";
    }
});

roomElements.forEach(room => {
    room.addEventListener('click', (e) => {
        roomElements.forEach(r => r.classList.remove('active'));
        const selected = e.currentTarget;
        selected.classList.add('active');
        currentRoom = selected.getAttribute('data-room');
        loadMessages(currentRoom);
    });
});

function loadMessages(room) {
    if (unsubscribe) unsubscribe();
    messagesContainer.innerHTML = '';
    
    const q = query(
        collection(db, "messages"), 
        where("room", "==", room),
        orderBy("createdAt", "asc")
    );

    unsubscribe = onSnapshot(q, (snapshot) => {
        messagesContainer.innerHTML = '';
        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const messageDiv = document.createElement('div');
            const isSentByMe = currentUser && data.uid === currentUser.uid;
            
            messageDiv.className = `message ${isSentByMe ? 'sent' : 'received'}`;
            messageDiv.innerHTML = `
                <div class="message-info">
                    <span class="sender-id">${data.username || "Anonymous"}</span>
                </div>
                <div class="message-text">${data.text || ""}</div>
            `;
            messagesContainer.appendChild(messageDiv);
        });
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, (error) => {
        console.error("Error loading messages:", error);
    });
}

async function sendMessage() {
    const text = messageInput.value.trim();
    if (!text || !currentUser) return;
    
    messageInput.value = '';
    
    try {
        await addDoc(collection(db, "messages"), {
            text: text,
            room: currentRoom,
            uid: currentUser.uid,
            username: currentUsername,
            createdAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error sending message:", error);
        alert("Failed to send message: " + error.message);
    }
}

if (messageForm) {
    messageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        sendMessage();
    });
}

if (sendButton) {
    sendButton.addEventListener('click', (e) => {
        e.preventDefault();
        sendMessage();
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        signOut(auth).then(() => {
            window.location.href = "../index.html";
        });
    });
}
