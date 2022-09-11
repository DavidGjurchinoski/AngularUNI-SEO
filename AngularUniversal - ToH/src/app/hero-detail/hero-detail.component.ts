import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { Hero } from '../hero';
import { HeroService } from '../hero.service';
import { SeoService } from '../seo.service';

@Component({
  selector: 'app-hero-detail',
  templateUrl: './hero-detail.component.html',
  styleUrls: [ './hero-detail.component.css' ]
})
export class HeroDetailComponent implements OnInit {
  hero: Hero | undefined;
  //VAR for rich search data
  schema: any;

  constructor(
    private route: ActivatedRoute,
    private heroService: HeroService,
    private location: Location,
    private seoService: SeoService,
  ) {}

  ngOnInit(): void {
    this.getHero();
  }

  getHero(): void {
    const id = parseInt(this.route.snapshot.paramMap.get('id')!, 10);
    this.heroService.getHero(id)
      .subscribe(hero => {
        this.hero = hero
        this.seoService.setTitle(this.hero);
        this.seoService.updateMetaInformationForSite(this.hero);
        //Changing rich search result schema(JSON-LD) for every URL depending on the product
        this.schema = {
          "@context": "https://schema.org/",
          "@type": "Product",
          "name": `${this.hero.name}`,
          "image": "http://www.example.com/anvil_executive.jpg",
          "description": `Details about hero: ${this.hero.name}.`,
          "brand": {
            "@type": "Thing",
            "name": "ACME"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.4",
            "reviewCount": "89"
          },
          "offers": {
            "@type": "Offer",
            "priceCurrency": "USD",
            "price": "119.99",
            "priceValidUntil": "2020-11-05",
            "itemCondition": "http://schema.org/UsedCondition",
            "availability": "http://schema.org/InStock",
            "seller": {
              "@type": "Organization",
              "name": "Executive Objects"
            }
          }
        };
      });
  }

  goBack(): void {
    this.location.back();
  }

  save(): void {
    if (this.hero) {
      this.heroService.updateHero(this.hero)
        .subscribe(() => this.goBack());
    }
  }
}
