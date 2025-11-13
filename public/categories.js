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

    // Initial load
    renderCategories();
});