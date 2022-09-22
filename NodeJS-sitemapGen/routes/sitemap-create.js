const {
	createWriteStream,
	mkdirSync,
	existsSync
} = require('fs');
const { createGzip } = require('zlib')
const moment = require('moment')
const { resolve } = require('path')

require('dotenv').config()
const db = require('../database')
const express = require('express')
const router = express.Router()
const {
	SitemapStream,
	SitemapAndIndexStream,
} = require('sitemap')

let dataDB = [];
let xmlUrls = [];
let dataForDB = [];
let sitemapsNumber = 0;

if (!existsSync("./sitemaps")) {
	mkdirSync("./sitemaps");
}


/* 
Method to Fetch dynamic List of URLs from DB 
*/
const generateSitemapFromDB = async () => {
	const sms = new SitemapAndIndexStream({
		limit: process.env.MAX_SITEMAP_LENGHT,
		lastmodDateOnly: false, // print date not time
		getSitemapStream: (i) => {
			const sitemapStream = new SitemapStream({ hostname: 'https://example.com' });
			const path = `./sitemaps/sitemap-${i}.xml`;

			const ws = sitemapStream
				.pipe(createGzip()) // compress the output of the sitemap
				.pipe(createWriteStream(resolve(path + '.gz'))); // write it to sitemap-NUMBER.xml.gz

			return [new URL(path, 'https://example.com/subdir/').toString(), sitemapStream, ws];
		},
	});
	dataDB = await db.promise().query(`SELECT * FROM businesses;`);
	dataDB = dataDB[0];
	xmlUrls = dataDB.map((data) => {
		return {
			id: data.id,
			url: `${process.env.BASE_URL}/${data.page_slug}`,
			changefreq: 'daily'
		};
	})

	xmlUrls.forEach((item, index) => {
		if (index % process.env.MAX_SITEMAP_LENGHT == 0) {
			sitemapsNumber++;
		}

		dataForDB.push({
			id: item.id,
			url: item.url,
			changefreq: item.changefreq,
			sitemap: sitemapsNumber - 1,
			sitemapDate: moment(new Date()).format('YYYY-MM-DD')
		})
	})


	// Putting all of the sitemaps in an sitemap-index.xml.gz file
	sms
		.pipe(createGzip())
		.pipe(createWriteStream(resolve('./sitemaps/sitemap-index.xml.gz')));

	xmlUrls.forEach(item => sms.write({ url: item.url, changefreq: item.changefreq }))

	sms.end()

	// Updating DB
	dataForDB.forEach(async (ele) => {
		await db.promise().query(`UPDATE businesses SET sitemap = '${ele.sitemap}' WHERE id = ${ele.id}`);
		await db.promise().query(`UPDATE businesses SET sitemapDate = '${ele.sitemapDate}' WHERE id = ${ele.id}`);
	})
}

router.route('/create/sitemap.xml').get(async (req, res) => {
	console.log("Writhing started");

	await generateSitemapFromDB();

	console.log("Writhing started END");
	res.status(200).send("GET call Success SIMPLE!")
});

module.exports = router;