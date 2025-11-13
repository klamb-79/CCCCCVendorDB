document.addEventListener('DOMContentLoaded', () => {
    const addCountryForm = document.getElementById('add-country-form');

    addCountryForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const countryName = document.getElementById('name').value;
        if (!countryName) {
            alert('Please enter a country name.');
            return;
        }

        try {
            const response = await fetch('/api/countries', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: countryName }),
            });

            if (!response.ok) {
                throw new Error('Failed to add country.');
            }

            alert('Country added successfully!');
            addCountryForm.reset(); // Clear the form
            window.location.href = 'index.html'; // Or stay on page

        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while adding the country.');
        }
    });
});