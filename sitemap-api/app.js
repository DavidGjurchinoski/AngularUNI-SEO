const express = require('express');
const sitemapRoutesCreate = require('./routes/sitemap-create');
const app = express();

app.use('/api', [ sitemapRoutesCreate ]);

app.listen(5000, () => {
	console.log("Server Started!");
});