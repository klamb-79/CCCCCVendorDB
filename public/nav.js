document.addEventListener('DOMContentLoaded', () => {
    // Get references to all the necessary elements
    const settingsBtn = document.getElementById('settings-btn');
    const sideOverlay = document.getElementById('side-overlay');
    const overlayBackdrop = document.getElementById('overlay-backdrop');
    const closeOverlayBtn = document.getElementById('close-overlay-btn');


    // --- NEW: Function to load user info ---
    const loadUserInfo = async () => {
        try {
            const response = await fetch('/api/me');
            if (!response.ok) return;
            
            const user = await response.json();
            const userElement = document.getElementById('current-user');
            
            if (userElement && user.username) {
                userElement.textContent = `Welcome, ${user.username}`;
            }

            sessionStorage.setItem('userPermission', user.permission);

            // NEW: Hide admin link if not an admin
            const adminLink = document.querySelector('.overlay-links a[href="admin.html"]');
            if (adminLink && user.permission !== 'admin') {
                adminLink.style.display = 'none';
            }
            const vendorLink = document.querySelector('.overlay-links a[href="add-vendor.html"]');
            if (vendorLink && user.permission !== 'admin') {
                vendorLink.style.display = 'none';
            }

            const countryLink = document.querySelector('.overlay-links a[href="add-country.html"]');
            if (countryLink && user.permission !== 'admin') {
                countryLink.style.display = 'none';
            }
            const categoryLink = document.querySelector('.overlay-links a[href="add-category.html"]');
            if (categoryLink && user.permission !== 'admin') {
                categoryLink.style.display = 'none';
            }

            const EditBtn = document.querySelector('.modals-close-btn');
            if (user.permission !== 'admin') {
                EditBtn.style.pointerEvents = 'none';
            }

        } catch (error) {
            console.error('Error fetching user info:', error);
        }
    };

    // Function to open the overlay
    const openOverlay = () => {
        if (sideOverlay && overlayBackdrop) {
            sideOverlay.classList.add('is-open');
            overlayBackdrop.style.display = 'block';
        }
    };

    // Function to close the overlay
    const closeOverlay = () => {
        if (sideOverlay && overlayBackdrop) {
            sideOverlay.classList.remove('is-open');
            overlayBackdrop.style.display = 'none';
        }
    };

    // Add event listeners to trigger the functions
    if (settingsBtn) {
        settingsBtn.addEventListener('click', openOverlay);
    }
    if (closeOverlayBtn) {
        closeOverlayBtn.addEventListener('click', closeOverlay);
    }
    if (overlayBackdrop) {
        overlayBackdrop.addEventListener('click', closeOverlay);
    }
    loadUserInfo();
});