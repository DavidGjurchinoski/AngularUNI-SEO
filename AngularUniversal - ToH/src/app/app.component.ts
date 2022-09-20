import { Component } from '@angular/core';
import { SitemapService } from './sitemap.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Tour of Heroes';

  constructor(private sitemapService: SitemapService) {}

  
}
