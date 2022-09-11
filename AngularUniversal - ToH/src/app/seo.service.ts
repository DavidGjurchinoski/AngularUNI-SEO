import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Hero } from './hero';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private readonly appTitle = 'Tour of Heroes';
  private readonly appDescription = 'Create your own hero';
  private readonly appKeywords = 'Create, Hero';

  constructor(private metaTagService: Meta, private titleService: Title) { }

  initDefaultMetaServiceInf(): void {
    this.titleService.setTitle(this.appTitle);

    this.metaTagService.addTags([
      {name: 'author', content: 'Dev One'},
    ])
  }

  updateMetaInformationForSite(hero?: Hero): void {
    this.metaTagService.updateTag(
      { name: 'keywords', content: `${hero?.id ?? this.appKeywords}: ${hero?.name ?? this.appKeywords}`}
    )

    this.metaTagService.updateTag(
      { name: 'description', content: `Details for hero ${hero?.name ?? this.appDescription} with ID: ${hero?.id ?? this.appDescription}.`}
    )
  }

  setTitle(hero?: Hero): void {
    const title = hero ? `${this.appTitle}: ${hero?.name}` : this.appTitle;
    this.titleService.setTitle(title);
  }

  setDefaultMetaData(): void {
    this.titleService.setTitle(this.appTitle);

    this.metaTagService.updateTag({ name: 'description', content: this.appDescription });
    this.metaTagService.updateTag({ name: 'keywords', content: this.appKeywords });
  }
}
