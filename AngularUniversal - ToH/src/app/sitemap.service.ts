import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SitemapService {

  constructor(private http: HttpClient) { }

MAX_SITEMAP_LENGHT = 50000;

database = [
	'site1',
	'site2',
	'site3',
	'site4',
	'site5',
	'site6',
	'site7',
	'site8',
	'site9',
	'site10',
	'site11',
	'site12',
	'site13',
	'site14',
	'site15',
	'site16',
	'site17',
];

buildSiteMap() {
  this.http.get('https://api.extfox.com/master/leion-v2/backend/api/rest/pages/browse?limit=101000').subscribe(data => {
    console.log(data);
  })
}

createSitemap(dataBaseURLs: any) {
	let repeatCount = dataBaseURLs.length / this.MAX_SITEMAP_LENGHT;

	for (let countSplice = 0; countSplice < repeatCount; countSplice++) {
		var doc = document.implementation.createDocument('', '', null);
		console.log('repeatCOunter: ' + repeatCount);
		console.log('countSplice: ' + countSplice);
		var database50 = dataBaseURLs.splice(0, this.MAX_SITEMAP_LENGHT);
		console.log(dataBaseURLs);
		console.log(database50);

		//create the outer tag
		var urlset = doc.createElement("urlset");
		urlset.setAttribute("xmlns", " http://www.sitemaps.org/schemas/sitemap/0.9");

		for (var i = 0; i < 5; i++) {
			console.log(database50[i]);

			let url = doc.createElement("url");
			let loc = doc.createElement('loc');
			loc.innerHTML = database50[i];
			let changefreq = doc.createElement("changefreq");
			changefreq.innerHTML = 'monthly';
			url.appendChild(loc);
			url.appendChild(changefreq);

			if (loc.innerHTML != 'undefined') {
				urlset.appendChild(url);
			} else {
				break;
			}
		}

		//Let's add the dynamic data here

		doc.appendChild(urlset);


		//code you can use to serialize your xml and then download the file
		//serialize the xml file to txt
		var oSerializer = new XMLSerializer();
		var xmltext = oSerializer.serializeToString(doc);
		xmltext = '<?xml version="1.0" encoding="UTF-8"?>' + xmltext;
		//download the file
		var pom = document.createElement('a');
		var filename = "sitemap.xml";
		var pom = document.createElement('a');
		var bb = new Blob([xmltext], { type: 'text/plain' });
		pom.setAttribute('href', window.URL.createObjectURL(bb));
		pom.setAttribute('download', filename);
		pom.dataset['downloadurl'] = ['text/plain', pom.download, pom.href].join(':');
		pom.draggable = true;
		pom.classList.add('dragout');
		pom.click();
	}
}
}
