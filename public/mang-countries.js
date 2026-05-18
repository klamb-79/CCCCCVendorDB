document.addEventListener('DOMContentLoaded', () => {
    const countryListContainer = document.getElementById('country-list-container');
    

    // Fetches and displays the list of countries
    const renderCountries = async () => {
        try {
            const response = await fetch('/api/countries');
            const countries = await response.json();

            countryListContainer.innerHTML = ''; // Clear the list

            if (countries.length === 0) {
                countryListContainer.innerHTML = '<p>No countries found. You can add one!</p>';
                return;
            }

            const list = document.createElement('ul');
            list.className = 'item-list';

            countries.forEach(country => {
                const listItem = document.createElement('li');
                listItem.className = 'item-list-row';
                listItem.innerHTML = `
                    <span>${country.name}</span>
                    <button class="btn-delete" data-id="${country.id}">Delete</button>
                    <button class="btn-edit" data-id="${country.id}" data-name="${country.name}">Edit</button>
                `;
                list.appendChild(listItem);
            });
            countryListContainer.appendChild(list);

        } catch (error) {
            console.error('Error fetching countries:', error);
            countryListContainer.innerHTML = '<p>Could not load countries.</p>';
        }
    };

    // Event listener for delete buttons (using event delegation)
    countryListContainer.addEventListener('click', async (event) => {
        if (event.target.classList.contains('btn-delete')) {
            const countryId = event.target.dataset.id;
            console.log(`Deleting country with ID: ${countryId}`);

            // Confirm before deleting
            if (confirm('Are you sure you want to delete this country? This cannot be undone.')) {
                try {
                    const response = await fetch(`/api/countries/${countryId}`, {
                        method: 'DELETE',
                    });

                    if (response.ok) {
                        alert('Country deleted successfully!');
                        renderCountries(); // Re-render the list
                    } else {
                        // Handle server-side errors, like country in use
                        const errorData = await response.json();
                        alert(`Error: ${errorData.message}`);
                    }
                } catch (error) {
                    console.error('Failed to delete country:', error);
                    alert('An error occurred during deletion.');
                }
            }
        }
    });
    countryListContainer.addEventListener('click', async (event) => {
        // Check if the clicked element is an Edit button
        if (event.target.classList.contains('btn-edit')) {
            const countryId = event.target.dataset.id;
            const currentName = event.target.dataset.name;
            
            // Ask the user for the new name
            const newName = prompt('Edit country name:', currentName);

            // Proceed if the user typed a name and it's different from the current one
            if (newName && newName.trim() !== '' && newName !== currentName) {
                try {
                    const response = await fetch(`/api/countries/${countryId}`, {
                        method: 'PUT',
                        headers: { 
                            'Content-Type': 'application/json' 
                        },
                        body: JSON.stringify({ newName: newName.trim() }),
                    });

                    if (response.ok) {
                        // Success! Refresh the list to show the updated name
                        // Call whatever function you use to fetch/draw the list:
                        // renderCountries(); 
                        alert('Country updated successfully.');
                        location.reload(); // Quick way to refresh if you don't have a render function handy
                    } else {
                        // Handle errors from the server (e.g., permissions, empty name)
                        const result = await response.json();
                        alert(`Error: ${result.message}`);
                    }
                } catch (error) {
                    console.error('Error during update:', error);
                    alert('Failed to connect to the server to update the country.');
                }
            }
        }
    });


    // Initial load
    renderCountries();
});