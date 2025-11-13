document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Fetch all necessary data in parallel
        const [vendorsRes, categoriesRes] = await Promise.all([
            fetch('/api/vendors'),
            fetch('/api/categories')
        ]);

        if (!vendorsRes.ok || !categoriesRes.ok) {
            throw new Error('Failed to fetch initial data.');
        }

        const vendors = await vendorsRes.json();
        const categories = await categoriesRes.json();

        // --- 1. Populate Stat Cards ---
        populateStatCards(vendors, categories);

        // --- 2. Create and Render Pie Chart ---
        renderCategoryPieChart(vendors);

    } catch (error) {
        console.error("Error loading dashboard:", error);
        document.querySelector('.dashboard-grid').innerHTML = '<p>Could not load dashboard data.</p>';
    }
});

function populateStatCards(vendors, categories) {
    // Total Vendors
    document.getElementById('total-vendors-stat').textContent = vendors.length;

    // Total Categories
    document.getElementById('total-categories-stat').textContent = categories.length;

    // Top Country
    const topCountry = getTopCountry(vendors);
    document.getElementById('top-country-stat').textContent = topCountry;
}

function getTopCountry(vendors) {
    if (vendors.length === 0) return '-';

    const countryCounts = vendors.reduce((acc, vendor) => {
        acc[vendor.country] = (acc[vendor.country] || 0) + 1;
        return acc;
    }, {});

    // Find the country with the highest count
    return Object.keys(countryCounts).reduce((a, b) => countryCounts[a] > countryCounts[b] ? a : b);
}

function renderCategoryPieChart(vendors) {
    const ctx = document.getElementById('category-pie-chart').getContext('2d');
    
    // Process data for the chart
    const categoryCounts = vendors.reduce((acc, vendor) => {
        acc[vendor.category] = (acc[vendor.category] || 0) + 1;
        return acc;
    }, {});

    const chartLabels = Object.keys(categoryCounts);
    const chartData = Object.values(categoryCounts);

    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: chartLabels,
            datasets: [{
                label: 'Vendors',
                data: chartData,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(153, 102, 255, 0.8)',
                    'rgba(255, 159, 64, 0.8)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                }
            }
        }
    });
}

// NEW: Function to render a bar chart for vendors by type (category)
function renderCategoryBarChart(vendors) {
    const ctx = document.getElementById('category-bar-chart').getContext('2d');
    
    const categoryCounts = vendors.reduce((acc, vendor) => {
        acc[vendor.category] = (acc[vendor.category] || 0) + 1;
        return acc;
    }, {});

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(categoryCounts),
            datasets: [{
                label: '# of Vendors',
                data: Object.values(categoryCounts),
                backgroundColor: 'rgba(54, 162, 235, 0.8)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1 // Ensure y-axis shows whole numbers for counts
                    }
                }
            },
            plugins: {
                legend: {
                    display: false // Hide legend for cleaner look on bar charts
                }
            }
        }
    });
}

// NEW: Function to render a bar chart for vendors by country
function renderCountryBarChart(vendors) {
    const ctx = document.getElementById('country-bar-chart').getContext('2d');
    
    const countryCounts = vendors.reduce((acc, vendor) => {
        acc[vendor.country] = (acc[vendor.country] || 0) + 1;
        return acc;
    }, {});

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(countryCounts),
            datasets: [{
                label: '# of Vendors',
                data: Object.values(countryCounts),
                backgroundColor: 'rgba(75, 192, 192, 0.8)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}