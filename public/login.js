document.getElementById('login-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.target;
    const username = form.username.value;
    const password = form.password.value;
    const errorElement = document.getElementById('login-error');

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
            window.location.href = '/index.html'; // Redirect on success
        } else {
            const result = await response.json();
            errorElement.textContent = result.message;
            errorElement.style.display = 'block';
        }
    } catch (error) {
        errorElement.textContent = 'An error occurred. Please try again.';
        errorElement.style.display = 'block';
    }
});