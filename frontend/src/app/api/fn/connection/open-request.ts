/* tslint:disable */
/* eslint-disable */
/* Code generated by ng-openapi-gen DO NOT EDIT. */

import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ConnectionEntity } from '../../models/connection-entity';

export interface OpenRequest$Params {
}

export function openRequest(http: HttpClient, rootUrl: string, params?: OpenRequest$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<ConnectionEntity>>> {
  const rb = new RequestBuilder(rootUrl, openRequest.PATH, 'get');
  if (params) {
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Array<ConnectionEntity>>;
    })
  );
}

openRequest.PATH = '/api/connection/request/open';
