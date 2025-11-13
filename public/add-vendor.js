document.addEventListener('DOMContentLoaded', async () => {
    const addVendorForm = document.getElementById('add-vendor-form');
    const categorySelect = document.getElementById('categories');
    const countrySelect = document.getElementById('country');



    //console.log(addVendorForm)


    const response = await fetch('/api/countries');
    const countries = await response.json();
    countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country.name;
        option.textContent = country.name;
        countrySelect.appendChild(option);
    });


    // Fetches categories and populates the dropdown


    const responseCategories = await fetch('/api/categories');
    const categories = await responseCategories.json();

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.name;
        option.textContent = category.name;
        categorySelect.appendChild(option);
    });

    /*function dateFormatter(date) {
        const options = {
            timeZone: 'America/Belize',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',

        };
        
        const dateFormat = new Intl.DateTimeFormat('en-BZ', options).format((date));
        return dateFormat;
    };
    
    const addDays = (dateString, days) => {
            const date = new Date(dateString);
            date.setDate(date.getDate() + days);
            date.toISOString().split('T')[0];
            console.log(date)
            return (dateFormatter(date));
        };
    console.log(addDays('2024-06-20', 365));*/
    //console.log(new Date('08/26/2025'));
    
    function Convert(date) {
        const d = new Date(date);

        return d.toISOString().split('T')[0];
    }
    const date2 = Convert('10/08/2025');
    console.log(date2);

    function daysBetween1(date1,date2) {
            // The number of milliseconds in one day
            const ONE_DAY_MS = 1000 * 60 * 60 * 24;
            //const date1 = new Date();

            // Get the difference in milliseconds
            const diffInMs = Math.abs(date2.getTime() - date1.getTime());

            // Convert back to days and round
            return Math.round(diffInMs / ONE_DAY_MS);
        }


    


    addVendorForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        function dateFormatter(date) {
        const options = {
            timeZone: 'America/Belize',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',

        };
        
        const dateFormat = new Intl.DateTimeFormat('en-BZ', options).format((date));
        return dateFormat;
    };
    
    



    /*const addDays = (dateString, days) => {
            const date = new Date(dateString);
            date.setDate(date.getDate() + days);
            date.toISOString().split('T')[0];
            console.log(date)
            return (dateFormatter(date));
        };*/


        // Create the vendor object from form data
        /*const addDays = (dateString, days) => {
            const date = new Date(dateString);
            date.setDate(date.getDate() + days);
            return date.toISOString().split('T')[0];
        };*/

        function daysBetween(today, date2) {
            // The number of milliseconds in one day
            const ONE_DAY_MS = 1000 * 60 * 60 * 24;

            // Get the difference in milliseconds
            const diffInMs = Math.abs(date2.getTime() - today.getTime());

            // Convert back to days and round
            return Math.round(diffInMs / ONE_DAY_MS);
        }
        //comDate = dateFormatter(document.getElementById('comparasion-date').value);
        //console.log(comDate);
        const today = new Date();
        const comparasionExpireDate = new Date(addDays(document.getElementById('comparasion-date').value, 180));
        const amlExpireDate = new Date(addDays(document.getElementById('aml-date').value, 365));

        const newVendor = {
            name: document.getElementById('name').value,
            comparosionDate: document.getElementById('comparasion-date').value,
            comparasionDateExpire: addDays(document.getElementById('comparasion-date').value, 180),
            comparasionDaysLeft: daysBetween(today, comparasionExpireDate),
            vendorType: document.getElementById('vendor-type').value,
            amlDate: document.getElementById('aml-date').value,
            amlDateExpire: addDays(document.getElementById('aml-date').value, 365),
            amlDaysLeft: daysBetween(today, amlExpireDate),
            category: document.getElementById('categories').value,
            country: document.getElementById('country').value,
            contact: {
                phone: document.getElementById('phone').value,
                email: document.getElementById('email').value,
            },
            amlDocs: document.getElementById('support-docs').value,
        };
        console.log(newVendor);


        // Basic validation
        if (!newVendor.name || !newVendor.category || !newVendor.contact.phone || !newVendor.contact.email || !newVendor.country || !newVendor.vendorType || !newVendor.comparosionDate || !newVendor.amlDate) {
            alert('Please fill out all fields.');
            return;
        }

        try {
            // Send the new vendor data to the server
            const response = await fetch('/api/vendors', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newVendor),
            });

            if (!response.ok) {
                throw new Error('Failed to add vendor.');
            }

            // Redirect on success
            alert('Vendor added successfully!');
            window.location.href = 'index.html';

        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while adding the vendor.');
        }
    });


})