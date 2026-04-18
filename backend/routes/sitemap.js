const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');

function readDB() {
  const data = fs.readFileSync(DB_PATH, 'utf8');
  return JSON.parse(data);
}

router.get('/sitemap.xml', (req, res) => {
  const db = readDB();
  const baseUrl = 'http://localhost:5000';
  const today = new Date().toISOString().split('T')[0];

  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/about', priority: '0.5', changefreq: 'monthly' },
  ];

  const ridePages = db.rides
    .filter(ride => new Date(ride.dateTime) > new Date())
    .map(ride => ({
      url: `/ride/${ride.id}`,
      priority: '0.8',
      changefreq: 'weekly',
      lastmod: ride.createdAt?.split('T')[0] || today,
    }));

  const allPages = [...staticPages, ...ridePages];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allPages.map(page => `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod || today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
  `).join('')}
</urlset>`;

  res.header('Content-Type', 'application/xml');
  res.send(sitemap);
});

module.exports = router;