document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    
    const toggleParticles = document.getElementById('toggle-particles');
    const saveBtn = document.getElementById('save-settings-btn');
    const themeBoxes = document.querySelectorAll('.theme-box');
    const particlesDiv = document.getElementById('particles-js');

    let activeTheme = localStorage.getItem('revolt_theme') || 'default';
    let previewTheme = activeTheme;
    let activeParticles = localStorage.getItem('revolt_particles') !== 'off';

    toggleParticles.checked = activeParticles;
    if (!activeParticles && particlesDiv) {
        particlesDiv.style.display = 'none';
    }

    document.body.className = activeTheme === 'default' ? '' : `theme-${activeTheme}`;

    themeBoxes.forEach(box => {
        if (box.getAttribute('data-theme') === activeTheme) {
            themeBoxes.forEach(b => b.classList.remove('selected'));
            box.classList.add('selected');
        }
    });

    themeBoxes.forEach(box => {
        box.addEventListener('click', (e) => {
            themeBoxes.forEach(b => b.classList.remove('selected'));
            e.target.classList.add('selected');

            previewTheme = e.target.getAttribute('data-theme');
            document.body.className = previewTheme === 'default' ? '' : `theme-${previewTheme}`;
        });
    });

    toggleParticles.addEventListener('change', (e) => {
        if (particlesDiv) {
            particlesDiv.style.display = e.target.checked ? 'block' : 'none';
        }
    });

    saveBtn.addEventListener('click', () => {
        const particlesSetting = toggleParticles.checked ? 'on' : 'off';
        
        localStorage.setItem('revolt_theme', previewTheme);
        localStorage.setItem('revolt_particles', particlesSetting);
        
        activeTheme = previewTheme;

        if (typeof firebase !== 'undefined' && firebase.auth().currentUser) {
            const userId = firebase.auth().currentUser.uid;
            firebase.firestore().collection('users').doc(userId).set({
                theme: previewTheme,
                particles: particlesSetting
            }, { merge: true });
        }
        
        const originalText = saveBtn.textContent;
        saveBtn.textContent = "Saved!";
        setTimeout(() => {
            saveBtn.textContent = originalText;
        }, 2000);
        
        if (window.showNotification) {
            window.showNotification("Settings saved");
        }
    });
});
