document.addEventListener('DOMContentLoaded', () => {
    const categoryListContainer = document.getElementById('category-list-container');

    // Fetches and displays the list of categories
    const renderCategories = async () => {
        try {
            const response = await fetch('/api/categories');
            const categories = await response.json();

            categoryListContainer.innerHTML = ''; // Clear the list

            if (categories.length === 0) {
                categoryListContainer.innerHTML = '<p>No categories found. You can add one!</p>';
                return;
            }

            const list = document.createElement('ul');
            list.className = 'item-list';

            categories.forEach(category => {
                const listItem = document.createElement('li');
                listItem.className = 'item-list-row';
                listItem.innerHTML = `
                    <span>${category.name}</span>
                    <button class="btn-delete" data-id="${category.id}">Delete</button>
                    <button class="btn-edit" data-id="${category.id}" data-name="${category.name}">Edit</button>
                `;
                list.appendChild(listItem);
            });
            categoryListContainer.appendChild(list);

        } catch (error) {
            console.error('Error fetching categories:', error);
            categoryListContainer.innerHTML = '<p>Could not load categories.</p>';
        }
    };

    // Event listener for delete buttons (using event delegation)
    categoryListContainer.addEventListener('click', async (event) => {
        if (event.target.classList.contains('btn-delete')) {
            const categoryId = event.target.dataset.id;
            console.log(`Deleting category with ID: ${categoryId}`);
            
            // Confirm before deleting
            if (confirm('Are you sure you want to delete this category? This cannot be undone.')) {
                try {
                    const response = await fetch(`/api/categories/${categoryId}`, {
                        method: 'DELETE',
                    });

                    if (response.ok) {
                        alert('Category deleted successfully!');
                        renderCategories(); // Re-render the list
                    } else {
                        // Handle server-side errors, like category in use
                        const errorData = await response.json();
                        alert(`Error: ${errorData.message}`);
                    }
                } catch (error) {
                    console.error('Failed to delete category:', error);
                    alert('An error occurred during deletion.');
                }
            }
        }
    });
    

    // ... (Your existing code to fetch and render the categories goes here) ...

    // --- Event Listener for Editing a Category ---
    categoryListContainer.addEventListener('click', async (event) => {
        // Check if the clicked element is an Edit button
        if (event.target.classList.contains('btn-edit')) {
            const categoryId = event.target.dataset.id;
            const currentName = event.target.dataset.name;
            
            // Ask the user for the new name
            const newName = prompt('Edit category name:', currentName);

            // Proceed if the user typed a name and it's different from the current one
            if (newName && newName.trim() !== '' && newName !== currentName) {
                try {
                    const response = await fetch(`/api/categories/${categoryId}`, {
                        method: 'PUT',
                        headers: { 
                            'Content-Type': 'application/json' 
                        },
                        body: JSON.stringify({ newName: newName.trim() }),
                    });

                    if (response.ok) {
                        // Success! Refresh the page to show the updated name
                        alert('Category updated successfully.');
                        location.reload(); 
                    } else {
                        // Handle errors from the server (e.g., permissions)
                        const result = await response.json();
                        alert(`Error: ${result.message}`);
                    }
                } catch (error) {
                    console.error('Error during update:', error);
                    alert('Failed to connect to the server to update the category.');
                }
            }
        }
    
});

    // Initial load
    renderCategories();
});