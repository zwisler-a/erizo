/* tslint:disable */
/* eslint-disable */
/* Code generated by ng-openapi-gen DO NOT EDIT. */

import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { createThread } from '../fn/thread/create-thread';
import { CreateThread$Params } from '../fn/thread/create-thread';
import { deleteThread } from '../fn/thread/delete-thread';
import { DeleteThread$Params } from '../fn/thread/delete-thread';
import { getThread } from '../fn/thread/get-thread';
import { GetThread$Params } from '../fn/thread/get-thread';
import { getThreads } from '../fn/thread/get-threads';
import { GetThreads$Params } from '../fn/thread/get-threads';
import { ThreadEntity } from '../models/thread-entity';

@Injectable({ providedIn: 'root' })
export class ApiThreadService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `getThread()` */
  static readonly GetThreadPath = '/api/thread';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getThread()` instead.
   *
   * This method doesn't expect any request body.
   */
  getThread$Response(params: GetThread$Params, context?: HttpContext): Observable<StrictHttpResponse<ThreadEntity>> {
    return getThread(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getThread$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getThread(params: GetThread$Params, context?: HttpContext): Observable<ThreadEntity> {
    return this.getThread$Response(params, context).pipe(
      map((r: StrictHttpResponse<ThreadEntity>): ThreadEntity => r.body)
    );
  }

  /** Path part for operation `deleteThread()` */
  static readonly DeleteThreadPath = '/api/thread';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `deleteThread()` instead.
   *
   * This method doesn't expect any request body.
   */
  deleteThread$Response(params: DeleteThread$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return deleteThread(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `deleteThread$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  deleteThread(params: DeleteThread$Params, context?: HttpContext): Observable<void> {
    return this.deleteThread$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `getThreads()` */
  static readonly GetThreadsPath = '/api/thread/all';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getThreads()` instead.
   *
   * This method doesn't expect any request body.
   */
  getThreads$Response(params?: GetThreads$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<ThreadEntity>>> {
    return getThreads(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getThreads$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getThreads(params?: GetThreads$Params, context?: HttpContext): Observable<Array<ThreadEntity>> {
    return this.getThreads$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<ThreadEntity>>): Array<ThreadEntity> => r.body)
    );
  }

  /** Path part for operation `createThread()` */
  static readonly CreateThreadPath = '/api/thread/new';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `createThread()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  createThread$Response(params: CreateThread$Params, context?: HttpContext): Observable<StrictHttpResponse<ThreadEntity>> {
    return createThread(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `createThread$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  createThread(params: CreateThread$Params, context?: HttpContext): Observable<ThreadEntity> {
    return this.createThread$Response(params, context).pipe(
      map((r: StrictHttpResponse<ThreadEntity>): ThreadEntity => r.body)
    );
  }

}
