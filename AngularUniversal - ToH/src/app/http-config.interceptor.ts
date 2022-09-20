import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { v4 as uuidv4 } from 'uuid';

// RXJS
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

// Services
// import { AuthService } from '../../../services/auth.service';

const consumerKey = 'tiz8huv66inettug5lxuqz228lstbgfn';
const consumerSecret = '3l1slw2tw15rsl3d5a8bgx1hxcqifru8';

@Injectable()
export class HttpConfigInterceptor implements HttpInterceptor {
  token: any;

  uuid: any;

  request!: HttpRequest<any>;

  constructor(
    // private auth: AuthService,
  ) { }

  intercept(requestParam: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.request = requestParam;
      const isOrderOwner = this.request.url.endsWith('view-order-owner');

      if (!localStorage.getItem('leion_uuid')) {
        this.uuid = uuidv4();
        localStorage.setItem('leion_uuid', this.uuid);
      }

      if (localStorage.getItem('leion_uuid') && (isOrderOwner)) {
        this.request = this.request.clone({
          headers: this.request.headers.set('leion_uuid', `${localStorage.getItem('leion_uuid')}`),
        });
      }



      this.token = JSON.parse(localStorage.getItem('user') || '{}');
      this.token = this.token.body.oauth_bear;

      const oauthToken = this.token.split('|')[0];
      const oauthSecret = this.token.split('|')[1];

      console.log(this.request);

      console.log(oauthToken);
      console.log(oauthSecret);
      console.log(consumerKey);
      console.log(consumerSecret);


      this.request = this.request.clone({
        headers:
          this.request.headers
            .set('oauth_token', oauthToken)
            .set('oauth_secret', oauthSecret)
            .append('oauth_consumer_key', consumerKey)
            .append('oauth_consumer_secret', consumerSecret),
      });

    return next.handle(this.request).pipe(
      map((event: HttpEvent<any>) => event),
      catchError((error: HttpErrorResponse) => throwError(error)),
    );
  }
}
