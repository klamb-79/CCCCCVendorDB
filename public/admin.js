document.addEventListener('DOMContentLoaded', () => {
    const userListContainer = document.getElementById('user-list-container');
    const availablePermissions = ['admin', 'editor', 'viewer'];

    const renderUsers = async () => {
        try {
            const response = await fetch('/api/users');
            if (!response.ok) {
                userListContainer.innerHTML = '<p>Error: You do not have permission to view this page.</p>';
                return;
            }
            const users = await response.json();

            userListContainer.innerHTML = '';
            const list = document.createElement('ul');
            list.className = 'item-list';

            users.forEach(user => {
                const listItem = document.createElement('li');
                listItem.className = 'item-list-row';
                
                // User's name
                const nameSpan = document.createElement('span');
                nameSpan.textContent = user.username;

                // Permission dropdown
                const select = document.createElement('select');
                select.dataset.id = user.id;

                availablePermissions.forEach(perm => {
                    const option = document.createElement('option');
                    option.value = perm;
                    option.textContent = perm.charAt(0).toUpperCase() + perm.slice(1);
                    if (perm === user.permission) {
                        option.selected = true;
                    }
                    select.appendChild(option);
                });

                // NEW: Delete button
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'btn-delete';
                deleteBtn.textContent = 'Delete';
                deleteBtn.dataset.id = user.id;

                listItem.appendChild(nameSpan);
                listItem.appendChild(select);
                listItem.appendChild(deleteBtn);
                list.appendChild(listItem);
            });
            userListContainer.appendChild(list);
        } catch (error) {
            console.error('Error fetching users:', error);
            userListContainer.innerHTML = '<p>Error loading user data.</p>';
        }
    };

    // Event listener for changing permissions
    userListContainer.addEventListener('change', async (event) => {
        if (event.target.tagName === 'SELECT') {
            const userId = event.target.dataset.id;
            const newPermission = event.target.value;

            try {
                const response = await fetch(`/api/users/${userId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ permission: newPermission }),
                });

                if (!response.ok) throw new Error('Failed to update');
                
                alert('Permission updated successfully!');
            } catch (error) {
                console.error('Error updating permission:', error);
                alert('Failed to update permission.');
                renderUsers(); // Re-render to show correct state
            }
        }
    });
    // NEW: Event listener for deleting a user
    userListContainer.addEventListener('click', async (event) => {
        if (event.target.classList.contains('btn-delete')) {
            const userId = event.target.dataset.id;
            
            if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
                try {
                    const response = await fetch(`/api/users/${userId}`, {
                        method: 'DELETE',
                    });

                    if (response.ok) {
                        alert('User deleted successfully.');
                        renderUsers(); // Refresh the list
                    } else {
                        const result = await response.json();
                        alert(result.message); // Show error from server (e.g., "Cannot delete yourself")
                    }
                } catch (error) {
                    console.error('Error deleting user:', error);
                    alert('An error occurred. Please try again.');
                }
            }
        }
    });

    renderUsers();
});