/* tslint:disable */
/* eslint-disable */
/* Code generated by ng-openapi-gen DO NOT EDIT. */

import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { CreatePostDto } from '../../models/create-post-dto';
import { CreatePostResponseDto } from '../../models/create-post-response-dto';

export interface Publish$Params {
      body: CreatePostDto
}

export function publish(http: HttpClient, rootUrl: string, params: Publish$Params, context?: HttpContext): Observable<StrictHttpResponse<CreatePostResponseDto>> {
  const rb = new RequestBuilder(rootUrl, publish.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<CreatePostResponseDto>;
    })
  );
}

publish.PATH = '/api/post/publish';
