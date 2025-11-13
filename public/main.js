document.addEventListener('DOMContentLoaded', async () => {
    // Get references to DOM elements
    const vendorListContainer = document.getElementById('vendor-list-container');
    const categoryFilter = document.getElementById('category-filter');
    const countryFilter = document.getElementById('country-filter'); // New country filter element
    const searchBar = document.getElementById('search-bar'); // New search bar element
    const contractFilter = document.getElementById('contract-filter');
    const purchaseOrderFilter = document.getElementById('purchase-order-filter');
    const bothFilter = document.getElementById('both-filter');
    const modal = document.getElementById('vendor-modal');
    const modalBody = document.getElementById('modal-body');
    const closeModalBtn = document.querySelector('.modal-close-btn');
    const typeFilterGroup = document.getElementById('type-filter-group');
    let activeTypeFilter = 'All'; // Track the active type filter

    let allVendors = []; // To store the master list of vendors
    let allCategories = [];


    // Fetches both vendors and categories from the server
    const fetchData = async () => {
        try {
            const [vendorsRes, categoriesRes, countriesRes] = await Promise.all([
                fetch('/api/vendors'),
                fetch('/api/categories'),
                fetch('/api/countries')
            ]);
            allVendors = await vendorsRes.json();

            allCategories = await categoriesRes.json();
            const allCountries = await countriesRes.json();

            populateCategoryFilter(allCategories);
            populateCountryFilter(allCountries);
            applyFiltersAndRender(); // Render initial list
        } catch (error) {
            console.error("Could not fetch data:", error);

        }
        console.log(allVendors);
    };

    // Populates the category dropdown from fetched data
    const populateCategoryFilter = (categories) => {
        categoryFilter.innerHTML = '<option value="All">All</option>'; // Reset
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = category.name;
            categoryFilter.appendChild(option);
        });
    };
    // Populates the country dropdown from fetched data
    const populateCountryFilter = (countries) => {
        countryFilter.innerHTML = '<option value="All">All</option>'; // Reset
        countries.forEach(country => {
            const option = document.createElement('option');
            option.value = country.name;
            option.textContent = country.name;
            countryFilter.appendChild(option);
        });
    };

    // Central function to apply all active filters and render the result
    const applyFiltersAndRender = () => {
        const category = categoryFilter.value;
        const country = countryFilter.value;
        const searchTerm = searchBar.value.toLowerCase().trim();
        // The type filter is now read from the global variable
        const type = activeTypeFilter;

        let filteredVendors = allVendors;

        // 1. Apply type filter
        if (type !== 'All') {
            filteredVendors = filteredVendors.filter(vendor => vendor.vendorType === type);
            console.log(filteredVendors);
        }

        // 2. Apply category filter
        if (category !== 'All') {
            filteredVendors = filteredVendors.filter(vendor => vendor.category === category);
        }

        // 3. Apply country filter
        if (country !== 'All') {
            filteredVendors = filteredVendors.filter(vendor => vendor.country === country);
        }

        // 4. Apply search term filter
        if (searchTerm) {
            filteredVendors = filteredVendors.filter(vendor =>
                vendor.name.toLowerCase().includes(searchTerm)
            );
        }
        displayVendors(filteredVendors);
    };



    // Renders the final filtered list of vendors to the DOM
    const displayVendors = (vendors) => {
        vendorListContainer.innerHTML = '';
        if (vendors.length === 0) {
            vendorListContainer.innerHTML = '<p>No vendors match the current criteria.</p>';
            return;
        }
        vendors.forEach(vendor => {
            const vendorCard = document.createElement('div');
            vendorCard.className = 'vendor-card';

            // Check if the comparasionDaysLeft is 0 to add an 'expired' class to the card
            if (vendor.comparasionDaysLeft === 0) {
                vendorCard.classList.add('expired-vendor');
            } else {
                vendorCard.classList.add('active-vendor');
            }
            if (vendor.amlDaysLeft === 0) {
                vendorCard.classList.add('aml-expired-vendor');
            } else {
                vendorCard.classList.add('aml-active-vendor');
            }

            // Conditionally create the "Expired" status HTML tag
            const statusHtml = vendor.comparasionDaysLeft === 0
                ? '<p class="status-expired">Comparison Date Expired</p>'
                : '';
            const activeHtml = vendor.comparasionDaysLeft > 0
                ? '<p class="status-active"> Comparison Date Active</p>'
                : '';

            const amlStatusHtml = vendor.amlDaysLeft === 0
                ? '<p class="status-expired">AML Date Expired</p>'
                : '';
            const amlActiveHtml = vendor.amlDaysLeft > 0
                ? '<p class="status-active">AML Date Active</p>'
                : '';

            vendorCard.innerHTML = `

            <div class="vendor-header">
                <h3>${vendor.name}</h3>
            </div>
            ${statusHtml} 
            ${activeHtml}
            ${amlStatusHtml}
            ${amlActiveHtml}
            
            <p>
                <span class="category">${vendor.category}</span> 
                <span class="country-tag">${vendor.country}</span>
            </p>
            <p><strong>Type:</strong> ${vendor.vendorType}</p>
            <p><strong>Phone:</strong> ${vendor.contact.phone}</p>
            <p><strong>Email:</strong> ${vendor.contact.email}</p>
            <div class="vendor-card-actions">
                <button class="btn-details" data-id="${vendor.id}">View</button>
            </div>
        `;
            vendorListContainer.appendChild(vendorCard);
        });
    };

    // --- NEW: Modal Logic ---

    // Opens the modal and populates it with vendor details
    const openVendorModal = (vendor) => {
        displayVendorDetails(vendor);
        modal.style.display = 'flex';
    };

    // Closes the modal
    const closeVendorModal = () => {
        modal.style.display = 'none';
    };

    // Populates the modal with the vendor's information (view mode)
    const displayVendorDetails = (vendor) => {
        // NEW: Get the user's permission from session storage
        const userPermission = sessionStorage.getItem('userPermission');
        
        // NEW: Conditionally create the edit button
        let editButtonHtml = '';
        if (userPermission === 'admin' || userPermission === 'editor') {
            editButtonHtml = `<button class="btn btn-edit" data-id="${vendor.id}">Edit</button>`;
        }
        modalBody.innerHTML = `
            <h2>${vendor.name}</h2>
            <p><strong>Category:</strong> ${vendor.category}</p>
            <p><strong>Vendor Type:</strong> ${vendor.vendorType}</p>
            <p><strong>Country:</strong> ${vendor.country}</p>
            <p><strong>Comparasion Date:</strong> ${vendor.comparosionDate}</p>
            <p><strong>Comparasion Date Expire:</strong> ${vendor.comparasionDateExpire}</p>
            <p><strong>Comparasion Days Left:</strong> ${vendor.comparasionDaysLeft}</p>
            <p><strong>AML Date:</strong> ${vendor.amlDate}</p>
            <p><strong>AML Date Expire:</strong> ${vendor.amlDateExpire}</p>
            <p><strong>AML Days Left:</strong> ${vendor.amlDaysLeft}</p>
            <p><strong>Phone:</strong> ${vendor.contact.phone}</p>
            <p><strong>Email:</strong> ${vendor.contact.email}</p>
            <p><strong>Supporting Docs:</strong> <a href="${vendor.amlDocs}" target="_blank">Supporting Docs</a></p>
            <div class="modal-actions">
                ${editButtonHtml}
            </div>
        `;
    };

    // Populates the modal with an editable form (edit mode)
    const displayEditForm = (vendor) => {
        // Create category options dynamically
        const categoryOptions = allCategories.map(cat =>
            `<option value="${cat.name}" ${vendor.category === cat.name ? 'selected' : ''}>
                ${cat.name}
            </option>`
        ).join('');

        modalBody.innerHTML = `
            <h2>Edit ${vendor.name}</h2>
            <form class="modal-edit-form" data-id="${vendor.id}">
                <div class="form-group">
                    <label for="edit-name">Vendor Name</label>
                    <input type="text" id="edit-name" value="${vendor.name}" required>
                </div>
                <div class="form-group">
                    <label for="edit-vendor-type">Vendor Type</label>
                    <select id="edit-vendor-type" name="edit-vendor-typeId" required>
                        <option value="${vendor.vendorType}" disabled selected>${vendor.vendorType || 'Select a vendor type'}</option>
                        <option value="Contract">Contract</option>
                        <option value="Purchase Order">Purchase Order</option>
                        <option value="Both">Both</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="edit-comparasion-date">Comparison Date</label>
                    <input type="date" id="edit-comparasion-date" value="${vendor.comparosionDate}" required>
                </div>

                <div class="form-group">
                    <label for="edit-aml-date">AML Date</label>
                    <input type="date" id="edit-aml-date" value="${vendor.amlDate}" required>
                </div>
                
                <div class="form-group">
                    <label for="edit-category">Category</label>
                    <select id="edit-category">${categoryOptions}</select>
                </div>
                <div class="form-group">
                    <label for="edit-phone">Phone</label>
                    <input type="tel" id="edit-phone" value="${vendor.contact.phone}" required>
                </div>
                <div class="form-group">
                    <label for="edit-email">Email</label>
                    <input type="email" id="edit-email" value="${vendor.contact.email}" required>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn btn-cancel">Cancel</button><br>
                    <button type="submit" class="btn btn-save">Save Changes</button>
                </div>
            </form>
        `;
    };

    // Handles saving the edited vendor data
    const handleSaveVendor = async (vendorId) => {
        // Create the vendor object from form data

        const calComparasionExpiryDate = (dateString) => {
            const date = new Date(dateString);
            const comexpiryDate = new Date(date.getTime() + 180 * 24 * 60 * 60 * 1000);
            return comexpiryDate.toISOString().split('T')[0];
        };
        const calAmlExpiryDate = (dateString) => {
            const date = new Date(dateString);
            const expiryDate = new Date(date.getTime() + 365 * 24 * 60 * 60 * 1000);

            return expiryDate.toISOString().split('T')[0];
        };

        function daysRemaining(expiryDate) {
            // The number of milliseconds in one day
            const ONE_DAY_MS = 1000 * 60 * 60 * 24;
            const today = new Date();
            const expiry = new Date(expiryDate);
            const diffInMs = expiry - today;
            // Convert milliseconds to days
            var diffInDays = Math.ceil(diffInMs / ONE_DAY_MS);
            if (diffInDays < 0) {
                diffInDays = 0;
                console.log('The expiry date has already passed.');
            }
            //const diffInMs = Math.abs(expiry.getTime() - today.getTime());


            // Convert back to days and round
            return diffInDays;
        }

        const today = new Date();
        const editComparasionExpireDate = calComparasionExpiryDate(document.getElementById('edit-comparasion-date').value);
        const editAmlExpireDate = calAmlExpiryDate(document.getElementById('edit-aml-date').value);

        const updatedVendor = {
            name: document.getElementById('edit-name').value,
            vendorType: document.getElementById('edit-vendor-type').value,
            comparosionDate: document.getElementById('edit-comparasion-date').value,
            comparasionDateExpire: editComparasionExpireDate,
            comparasionDaysLeft: daysRemaining(editComparasionExpireDate),
            amlDate: document.getElementById('edit-aml-date').value,
            amlDateExpire: editAmlExpireDate,
            amlDaysLeft: daysRemaining(editAmlExpireDate),
            category: document.getElementById('edit-category').value,
            contact: {
                phone: document.getElementById('edit-phone').value,
                email: document.getElementById('edit-email').value,
            }
        };
        //console.log('Updated Vendor:', updatedVendor);

        try {
            const response = await fetch(`/api/vendors/${vendorId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedVendor)
            });

            if (!response.ok) {
                throw new Error('Failed to update vendor.');
            }

            alert('Vendor updated successfully!');
            closeVendorModal();
            fetchData(); // Refresh the list with new data

        } catch (error) {
            console.error('Error updating vendor:', error);
            alert('An error occurred while saving.');
        }
    };

    // NEW: Listener for the type filter button group
    typeFilterGroup.addEventListener('click', (event) => {
        const target = event.target;
        if (target.tagName === 'BUTTON') {
            // Update active state variable
            activeTypeFilter = target.dataset.type;
            console.log('Active Type Filter:', activeTypeFilter);

            // Update button visual state
            typeFilterGroup.querySelector('.active').classList.remove('active');
            target.classList.add('active');

            // Re-render the list with the new filter
            applyFiltersAndRender();
        }
    });






    // Event listeners for both controls
    categoryFilter.addEventListener('change', applyFiltersAndRender);
    countryFilter.addEventListener('change', applyFiltersAndRender); // Add listener for country filter
    searchBar.addEventListener('input', applyFiltersAndRender); // 'input' for live search
    closeModalBtn.addEventListener('click', closeVendorModal);

    // Close modal if user clicks on the overlay background
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeVendorModal();
        }
    });

    // Event delegation for dynamically created buttons
    vendorListContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('btn-details')) {
            const vendorId = parseInt(event.target.dataset.id, 10);
            const vendor = allVendors.find(v => v.id === vendorId);
            if (vendor) {
                openVendorModal(vendor);
            }
        }
    });

    modalBody.addEventListener('click', (event) => {
        const target = event.target;

        // Switch to edit mode
        if (target.classList.contains('btn-edit')) {
            const vendorId = parseInt(target.dataset.id, 10);
            const vendor = allVendors.find(v => v.id === vendorId);
            displayEditForm(vendor);
        }

        // Cancel edit and return to view mode
        if (target.classList.contains('btn-cancel')) {
            const form = target.closest('.modal-edit-form');
            const vendorId = parseInt(form.dataset.id, 10);
            const vendor = allVendors.find(v => v.id === vendorId);
            displayVendorDetails(vendor);
        }

        // Handle form submission for saving
        if (target.closest('.modal-edit-form')) {
            event.preventDefault(); // Prevent default form submission
            if (target.classList.contains('btn-save')) {
                console.log('Save button clicked');
                const form = target.closest('.modal-edit-form');
                const vendorId = parseInt(form.dataset.id, 10);
                handleSaveVendor(vendorId);
            }
        }
    });


    // Initial data load
    fetchData();
});