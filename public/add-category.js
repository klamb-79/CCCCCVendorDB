document.addEventListener('DOMContentLoaded', () => {
    const addCategoryForm = document.getElementById('add-category-form');

    addCategoryForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const categoryName = document.getElementById('name').value;
        if (!categoryName) {
            alert('Please enter a category name.');
            return;
        }

        try {
            const response = await fetch('/api/categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: categoryName }),
            });

            if (!response.ok) {
                throw new Error('Failed to add category.');
            }
            
            alert('Category added successfully!');
            addCategoryForm.reset(); // Clear the form
            window.location.href = 'index.html'; // Or stay on page

        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while adding the category.');
        }
    });
});