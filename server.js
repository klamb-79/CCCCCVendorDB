const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors'); // Import the cors package
const session = require('express-session');
const bcrypt = require('bcrypt');
const { permission } = require('process');


const app = express();
const PORT = 3001; // Port for the server
const dataFolderPath = path.join(__dirname, 'data');
const VENDORS_FILE = path.join(dataFolderPath, 'vendors.json');
const CATEGORIES_FILE = path.join(dataFolderPath, 'categories.json'); // Path to new file
const COUNTRIES_FILE = path.join(dataFolderPath, 'countries.json'); // Path to countries file
const USERS_FILE = path.join(__dirname, 'users.json');

app.use(cors()); // Enable CORS for all routes

// Middleware
app.use(express.json());


app.use(session({
    secret: 'your-very-secret-key-change-me', // Change this to a random, secure string
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if you are using HTTPS
}));

app.use(express.static('public', { index: false })); // Disable default index.html serving

// --- Helper Functions ---
const readUsers = async () => {
    try {
        const data = await fs.readFile(USERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') return []; // If file doesn't exist, return empty array
        throw error;
    }
};

const writeUsers = async (users) => {
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
};


// --- API Endpoints for Authentication ---
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    const users = await readUsers();
    if (users.find(user => user.username === username)) {
        return res.status(409).json({ message: 'Username already exists.' });
    }



    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
    const permission = (users.length === 0) ? 'admin' : 'viewer'; // First user is admin
    const newUser = { id: Date.now(), username, password: hashedPassword, permission:permission };
    users.push(newUser);
    await writeUsers(users);

    res.status(201).json({ message: 'User registered successfully!' });
});



app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const users = await readUsers();
    const user = users.find(u => u.username === username);

    if (user && await bcrypt.compare(password, user.password)) {
        // Passwords match
        req.session.user = { id: user.id, username: user.username, permission: user.permission  }; // Store user in session
        return res.status(200).json({ message: 'Login successful!' });
    }

    // User not found or password incorrect
    res.status(401).json({ message: 'Invalid username or password.' });
});

app.get('/api/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Could not log out.');
        }
        res.redirect('/login.html');
    });
});

app.get('/api/me', (req, res) => { // 'isAuthenticated' is now on the route
    if (req.session.user) {
        res.status(200).json(req.session.user);
    } else {
        res.status(401).json({ message: 'Not authenticated' });
    }
});



// --- Route Protection Middleware ---
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    res.redirect('/login.html');
};

const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.permission === 'admin') {
        return next();
    }
    // If not admin, send to dashboard (or show a 403 error)
    res.redirect('/index.html');
};

const isEditorOrAdmin = (req, res, next) => {
    if (req.session.user && (req.session.user.permission === 'admin' || req.session.user.permission === 'editor')) {
        return next();
    }
    // If not, send a "Forbidden" error. They are logged in, but not allowed.
    res.status(403).json({ message: 'You do not have permission to perform this action.' });
};

// NEW: Endpoint to get the current user's info


app.get('/api/me', isAuthenticated, (req, res) => {
    if (req.session.user) {
        res.status(200).json(req.session.user);
    } else {
        res.status(401).json({ message: 'Not authenticated' });
    }
});

app.delete('/api/users/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const idToDelete = parseInt(req.params.id, 10);
        const loggedInUserId = req.session.user.id;

        // Check 1: Prevent self-deletion
        if (idToDelete === loggedInUserId) {
            return res.status(400).json({ message: 'Error: You cannot delete yourself.' });
        }

        const users = await readUsers();
        const userToDelete = users.find(u => u.id === idToDelete);

        if (!userToDelete) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Check 2: Prevent deletion of the last admin
        if (userToDelete.permission === 'admin') {
            const adminCount = users.filter(u => u.permission === 'admin').length;
            if (adminCount <= 1) {
                return res.status(400).json({ message: 'Error: Cannot delete the last admin account.' });
            }
        }

        // Proceed with deletion
        const updatedUsers = users.filter(u => u.id !== idToDelete);
        await writeUsers(updatedUsers);
        
        res.status(200).json({ message: 'User deleted successfully.' });

    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Server error while deleting user.' });
    }
});


// --- Vendor API Endpoints ---
app.get('/api/vendors', async (req, res) => {
    try {
        const data = await fs.readFile(VENDORS_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        res.status(500).send('Server error while fetching vendors.');
    }
});

app.post('/api/vendors', async (req, res) => {
    try {
        const data = await fs.readFile(VENDORS_FILE, 'utf8');
        const vendors = JSON.parse(data);
        const newVendor = { id: Date.now(), ...req.body };
        vendors.push(newVendor);
        await fs.writeFile(VENDORS_FILE, JSON.stringify(vendors, null, 2));
        res.status(201).json(newVendor);
    } catch (error) {
        res.status(500).send('Server error while adding vendor.');
    }
});

//--- Protected Routes and APIs ---
// Serve main pages only if authenticated
app.get('/', isAuthenticated, (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/index.html', isAuthenticated, (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/dashboard.html', isAuthenticated, (req, res) => res.sendFile(path.join(__dirname, 'public', 'dashboard.html')));
// Add all other pages you want to protect here...
app.get('/admin.html', isAuthenticated, (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));

app.get('/api/users', isAuthenticated, isAdmin, async (req, res) => {
    const users = await readUsers();
    // CRITICAL: Never send passwords to the client
    const safeUsers = users.map(({ id, username, permission }) => ({ id, username, permission }));
    res.json(safeUsers);
});

app.put('/api/vendors/:id', isAuthenticated, isEditorOrAdmin, async (req, res) => {
    try {
        const idToUpdate = parseInt(req.params.id, 10);
        const updatedData = req.body;

        const data = await fs.readFile(VENDORS_FILE, 'utf8');
        let vendors = JSON.parse(data);

        const vendorIndex = vendors.findIndex(v => v.id === idToUpdate);
        if (vendorIndex === -1) {
            return res.status(404).json({ message: 'Vendor not found.' });
        }

        vendors[vendorIndex] = { ...vendors[vendorIndex], ...updatedData };
        await fs.writeFile(VENDORS_FILE, JSON.stringify(vendors, null, 2));
        res.status(200).json(vendors[vendorIndex]);

    } catch (error) {
        console.error('Error updating vendor:', error);
        res.status(500).json({ message: 'Server error while updating vendor.' });
    }
});


// Protect all other API endpoints
app.get('/api/vendors', isAuthenticated, async (req, res) => { /* ... existing code ... */ });
app.put('/api/vendors/:id', isAuthenticated, async (req, res) => { /* ... existing code ... */ });
// ... protect all other APIs similarly





// --- Category API Endpoints (NEW) ---

// GET /api/categories - Retrieve all categories
app.get('/api/categories', async (req, res) => {
    try {
        const data = await fs.readFile(CATEGORIES_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error('Error reading categories file:', error);
        res.status(500).send('Server error while fetching categories.');
    }
});

// POST /api/categories - Add a new category
app.post('/api/categories', async (req, res) => {
    try {
        const data = await fs.readFile(CATEGORIES_FILE, 'utf8');
        const categories = JSON.parse(data);
        const newCategory = {
            id: Date.now(),
            name: req.body.name
        };
        categories.push(newCategory);
        await fs.writeFile(CATEGORIES_FILE, JSON.stringify(categories, null, 2));
        res.status(201).json(newCategory);
    } catch (error) {
        console.error('Error adding new category:', error);
        res.status(500).send('Server error while adding category.');
    }
});

// --- Countries API Endpoints ---

app.get('/api/countries', async (req, res) => {
    try {
        const data = await fs.readFile(COUNTRIES_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error('Error reading countries file:', error);
        res.status(500).send('Server error while fetching countries.');
    }
});

// POST /api/countries - Add a new country
app.post('/api/countries', async (req, res) => {
    try {
        const data = await fs.readFile(COUNTRIES_FILE, 'utf8');
        const countries = JSON.parse(data);
        const newCountry = {
            id: Date.now(),
            name: req.body.name
        };
        countries.push(newCountry);
        await fs.writeFile(COUNTRIES_FILE, JSON.stringify(countries, null, 2));
        res.status(201).json(newCountry);
    } catch (error) {
        console.error('Error adding new country:', error);
        res.status(500).send('Server error while adding country.');
    }
});

// --- DELETE /api/categories/:id - Delete a category (NEW) ---
app.delete('/api/categories/:id', async (req, res) => {
    try {
        const idToDelete = parseInt(req.params.id, 10);

        // Read both vendors and categories to check for usage
        const [vendorsData, categoriesData] = await Promise.all([
            fs.readFile(VENDORS_FILE, 'utf8'),
            fs.readFile(CATEGORIES_FILE, 'utf8')
        ]);

        const vendors = JSON.parse(vendorsData);
        const categories = JSON.parse(categoriesData);

        const categoryToDelete = categories.find(c => c.id === idToDelete);

        // Check if the category exists
        if (!categoryToDelete) {
            return res.status(404).json({ message: 'Category not found.' });
        }

        // Check if the category is in use by any vendor
        const isCategoryInUse = vendors.some(vendor => vendor.category === categoryToDelete.name);
        if (isCategoryInUse) {
            return res.status(400).json({ message: 'Category is in use by a vendor and cannot be deleted.' });
        }

        // Filter out the category to be deleted
        const updatedCategories = categories.filter(c => c.id !== idToDelete);

        // Write the updated list back to the file
        await fs.writeFile(CATEGORIES_FILE, JSON.stringify(updatedCategories, null, 2));

        res.status(200).json({ message: 'Category deleted successfully.' });

    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ message: 'Server error while deleting category.' });
    }
})
// --- DELETE /api/countries/:id - Delete a country (NEW) ---
app.delete('/api/countries/:id', async (req, res) => {
    try {
        const idToDelete = parseInt(req.params.id, 10);

        // Read both vendors and countries to check for usage
        const [vendorsData, countriesData] = await Promise.all([
            fs.readFile(VENDORS_FILE, 'utf8'),
            fs.readFile(COUNTRIES_FILE, 'utf8')
        ]);

        const vendors = JSON.parse(vendorsData);
        const countries = JSON.parse(countriesData);

        const countryToDelete = countries.find(c => c.id === idToDelete);

        // Check if the country exists
        if (!countryToDelete) {
            return res.status(404).json({ message: 'Country not found.' });
        }

        // Check if the country is in use by any vendor
        const isCountryInUse = vendors.some(vendor => vendor.country === countryToDelete.name);
        if (isCountryInUse) {
            return res.status(400).json({ message: 'Country is in use by a vendor and cannot be deleted.' });
        }

        // Filter out the country to be deleted
        const updatedCountries = countries.filter(c => c.id !== idToDelete);

        // Write the updated list back to the file
        await fs.writeFile(COUNTRIES_FILE, JSON.stringify(updatedCountries, null, 2));

        res.status(200).json({ message: 'Country deleted successfully.' });

    } catch (error) {
        console.error('Error deleting country:', error);
        res.status(500).json({ message: 'Server error while deleting country.' });
    }
});

// --- PUT /api/vendors/:id - Update an existing vendor (NEW) ---
app.put('/api/vendors/:id', async (req, res) => {
    try {
        const idToUpdate = parseInt(req.params.id, 10);
        const updatedData = req.body;

        const data = await fs.readFile(VENDORS_FILE, 'utf8');
        let vendors = JSON.parse(data);

        // Find the index of the vendor to update
        const vendorIndex = vendors.findIndex(v => v.id === idToUpdate);

        if (vendorIndex === -1) {
            return res.status(404).json({ message: 'Vendor not found.' });
        }

        // Update the vendor object, keeping the original ID
        vendors[vendorIndex] = { ...vendors[vendorIndex], ...updatedData };

        // Write the entire updated list back to the file
        await fs.writeFile(VENDORS_FILE, JSON.stringify(vendors, null, 2));

        res.status(200).json(vendors[vendorIndex]);

    } catch (error) {
        console.error('Error updating vendor:', error);
        res.status(500).json({ message: 'Server error while updating vendor.' });
    }
});









app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});