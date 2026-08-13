document.addEventListener('DOMContentLoaded', () => {
    const themeBoxes = document.querySelectorAll('.theme-box');
    const toggleParticles = document.getElementById('toggle-particles');
    const saveBtn = document.getElementById('save-settings-btn');
    
    let currentUserRef = null;

    if (typeof firebase !== 'undefined') {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                currentUserRef = firebase.firestore().collection('users').doc(user.uid);
                currentUserRef.get().then((doc) => {
                    if (doc.exists) {
                        const data = doc.data();
                        
                        if (data.theme) {
                            themeBoxes.forEach(box => {
                                box.classList.remove('selected');
                                if (box.dataset.theme === data.theme) {
                                    box.classList.add('selected');
                                }
                            });
                        }
                        
                        if (data.particles !== undefined) {
                            toggleParticles.checked = data.particles !== 'off';
                        } else {
                            toggleParticles.checked = true;
                        }
                    }
                });
            }
        });
    }

    themeBoxes.forEach(box => {
        box.addEventListener('click', () => {
            themeBoxes.forEach(b => b.classList.remove('selected'));
            box.classList.add('selected');
        });
    });

    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            if (!currentUserRef) return;
            
            const selectedThemeBox = document.querySelector('.theme-box.selected');
            const selectedTheme = selectedThemeBox ? selectedThemeBox.dataset.theme : 'default';
            const particlesEnabled = toggleParticles.checked ? 'on' : 'off';
            
            currentUserRef.update({
                theme: selectedTheme,
                particles: particlesEnabled
            }).then(() => {
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
            });
        });
    }
});
