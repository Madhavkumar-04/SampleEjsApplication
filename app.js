const express = require('express');
const path = require('path');
const app = express();

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));
function generateRandomData() {
    const labels = ['January', 'February', 'March', 'April', 'May', 'June'];
    const data = labels.map(() => Math.floor(Math.random() * 100));
    return {
        labels: labels,
        data: data
    };
}
// Define routes
app.get('/', (req, res) => {
    res.render('index'); // Home page
});

app.get('/dashboard', (req, res) => {
    res.render('dashboard');
});

app.get('/dashboard/data', (req, res) => {
    // Example data - replace with real data retrieval logic
    const chartData = generateRandomData();
    res.json(chartData);
});
app.get('/settings', (req, res) => {
    res.render('settings');
});

app.get('/profile', (req, res) => {
    res.render('profile');
});

app.get('/reports', (req, res) => {
    res.render('reports');
});

app.get("*", (req, res) => {
    res.send("<h1>Wrong Path</h1>")
})
// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
