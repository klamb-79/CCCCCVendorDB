document.getElementById('register-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.target;
    const username = form.username.value;
    const password = form.password.value;
    const errorElement = document.getElementById('register-error');

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        
        const result = await response.json();

        if (response.ok) {
            alert(result.message);
            window.location.href = '/login.html'; // Redirect to login page after successful registration
        } else {
            errorElement.textContent = result.message;
            errorElement.style.display = 'block';
        }
    } catch (error) {
        errorElement.textContent = 'An error occurred. Please try again.';
        errorElement.style.display = 'block';
    }
});