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

import { acceptRequest } from '../fn/connection/accept-request';
import { AcceptRequest$Params } from '../fn/connection/accept-request';
import { ConnectionEntity } from '../models/connection-entity';
import { deleteConnection } from '../fn/connection/delete-connection';
import { DeleteConnection$Params } from '../fn/connection/delete-connection';
import { getConnections } from '../fn/connection/get-connections';
import { GetConnections$Params } from '../fn/connection/get-connections';
import { openRequest } from '../fn/connection/open-request';
import { OpenRequest$Params } from '../fn/connection/open-request';
import { request } from '../fn/connection/request';
import { Request$Params } from '../fn/connection/request';

@Injectable({ providedIn: 'root' })
export class ApiConnectionService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `getConnections()` */
  static readonly GetConnectionsPath = '/api/connection';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getConnections()` instead.
   *
   * This method doesn't expect any request body.
   */
  getConnections$Response(params?: GetConnections$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<ConnectionEntity>>> {
    return getConnections(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getConnections$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getConnections(params?: GetConnections$Params, context?: HttpContext): Observable<Array<ConnectionEntity>> {
    return this.getConnections$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<ConnectionEntity>>): Array<ConnectionEntity> => r.body)
    );
  }

  /** Path part for operation `deleteConnection()` */
  static readonly DeleteConnectionPath = '/api/connection';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `deleteConnection()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  deleteConnection$Response(params: DeleteConnection$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return deleteConnection(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `deleteConnection$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  deleteConnection(params: DeleteConnection$Params, context?: HttpContext): Observable<void> {
    return this.deleteConnection$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `request()` */
  static readonly RequestPath = '/api/connection/request';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `request()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  request$Response(params: Request$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return request(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `request$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  request(params: Request$Params, context?: HttpContext): Observable<void> {
    return this.request$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `acceptRequest()` */
  static readonly AcceptRequestPath = '/api/connection/request/accept';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `acceptRequest()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  acceptRequest$Response(params: AcceptRequest$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return acceptRequest(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `acceptRequest$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  acceptRequest(params: AcceptRequest$Params, context?: HttpContext): Observable<void> {
    return this.acceptRequest$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `openRequest()` */
  static readonly OpenRequestPath = '/api/connection/request/open';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `openRequest()` instead.
   *
   * This method doesn't expect any request body.
   */
  openRequest$Response(params?: OpenRequest$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<ConnectionEntity>>> {
    return openRequest(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `openRequest$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  openRequest(params?: OpenRequest$Params, context?: HttpContext): Observable<Array<ConnectionEntity>> {
    return this.openRequest$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<ConnectionEntity>>): Array<ConnectionEntity> => r.body)
    );
  }

}
