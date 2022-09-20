const { createReadStream, createWriteStream, writeFileSync, mkdirSync, existsSync, rm } = require('fs');
const { createGzip } = require('zlib')
const db = require('../database')
const moment = require('moment')
const express = require('express')
const router = express.Router()
const {
	SitemapStream,
	streamToPromise
} = require('sitemap')
const MAX_SITEMAP_LENGHT = 300;
const baseUrl = 'https://leion.com/business/page';

let dataDB = [];
let xmlUrls = [];
let currentSetOfUrls = [];
let currentSitemapNumber = 1; // We need a better solution for keeping track of the current sitemap that we are writing/reading
							  // possible fix query that gets the next available id/number for the sitemap-:id.xml.gz on start 

const compressFile = (filePath) => {
	const stream = createReadStream(filePath);
	stream
		.pipe(createGzip())
		.pipe(createWriteStream(`${filePath}.gz`))
		.on("finish", () => {
			console.log(`Successfully compressed the file at ${filePath}`)
			rm(filePath, () => {
				console.log(`Successfully deleted the file at ${filePath}`)
			});
		}
		);
};

const writeToFile = async (sitemapNumber) => {
	const sitemapStream = new SitemapStream({
		hostname: "https://example.com"
	})

	try {
		console.log(currentSetOfUrls.length);
		currentSetOfUrls.forEach((data) => {
			let url = data.url;

			sitemapStream.write({
				url,
				changefreq: "daily",
				priority: 1
			})
		});

		sitemapStream.end();

		const sitemapData = await streamToPromise(sitemapStream);

		if (!existsSync("./sitemaps")) {
			mkdirSync("./sitemaps");
		}

		writeFileSync(`./sitemaps/sitemap${sitemapNumber}.xml`, sitemapData, "utf-8");
		compressFile(`./sitemaps/sitemap${sitemapNumber}.xml`)


	} catch (err) {
		console.log(err);
	}
}

const updateDB = async () => {
	currentSetOfUrls.forEach(async (ele) => {
		await db.promise().query(`UPDATE businesses SET sitemap = '${currentSitemapNumber}' WHERE id = ${ele.id}`);
		await db.promise().query(`UPDATE businesses SET sitemapDate = '${moment(new Date()).format('YYYY-MM-DD')}' WHERE id = ${ele.id}`);
	})
}

const getNextSetOfUrls = () => {
	currentSetOfUrls = xmlUrls.splice(0, MAX_SITEMAP_LENGHT);
}

/* 
	Method to Fetch dynamic List of URLs from DB 
*/
const generateSitemapFromDB = async () => {
	await db.promise().query(`ALTER table businesses add column IF NOT EXISTS (sitemap varchar(255));`);
	await db.promise().query(`ALTER table businesses add column IF NOT EXISTS (sitemapDate date);`);

	dataDB = await db.promise().query(`SELECT * FROM businesses;`);
	dataDB = dataDB[0];
	xmlUrls = dataDB.map((data) => {
		return {
			id: data.id,
			url: `${baseUrl}/${data.page_slug}`
		};
	})
	numberOfsets = xmlUrls.length / MAX_SITEMAP_LENGHT;

	for (let i = 0; i < numberOfsets; i++) {
		console.log(i);
		getNextSetOfUrls();

		await writeToFile(currentSitemapNumber);
		await updateDB(currentSitemapNumber);

		currentSitemapNumber++;
	}

}

router.route('/create/sitemap.xml.gz').get(async (req, res) => {
	console.log("Writhing started");

	await generateSitemapFromDB();

	res.status(200).send("GET call Success!")
});

module.exports = router;