(function() {
    const savedTheme = localStorage.getItem('revolt_theme') || 'default';
    if (savedTheme !== 'default') {
        document.documentElement.classList.add(`theme-${savedTheme}`);
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('revolt_theme') || 'default';
    
    if (savedTheme !== 'default') {
        document.body.classList.add(`theme-${savedTheme}`);
    } else {
        document.body.className = '';
    }

    const particlesActive = localStorage.getItem('revolt_particles') !== 'off';
    const particlesDiv = document.getElementById('particles-js');
    
    if (particlesDiv) {
        particlesDiv.style.display = particlesActive ? 'block' : 'none';
    }

    if (typeof firebase !== 'undefined') {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                firebase.firestore().collection('users').doc(user.uid).get()
                    .then((doc) => {
                        if (doc.exists) {
                            const data = doc.data();
                            
                            if (data.theme) {
                                localStorage.setItem('revolt_theme', data.theme);
                                document.documentElement.className = '';
                                document.body.className = '';
                                if (data.theme !== 'default') {
                                    document.documentElement.classList.add(`theme-${data.theme}`);
                                    document.body.classList.add(`theme-${data.theme}`);
                                }
                            }
                            
                            if (data.particles !== undefined) {
                                localStorage.setItem('revolt_particles', data.particles);
                                if (particlesDiv) {
                                    particlesDiv.style.display = data.particles === 'off' ? 'none' : 'block';
                                }
                            }
                        }
                    })
                    .catch((error) => console.error(error));
            }
        });
    }
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
