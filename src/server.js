require('dotenv').config();

const app = require('./app');

const PORT = process.env.API_PORT || 3000;

app.listen(PORT, () => {
    console.log(`TaaS API is running on port ${PORT}`);
});
