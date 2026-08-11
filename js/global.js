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
