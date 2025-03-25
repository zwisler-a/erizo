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

import { getChatMessages } from '../fn/message/get-chat-messages';
import { GetChatMessages$Params } from '../fn/message/get-chat-messages';
import { getMessages } from '../fn/message/get-messages';
import { GetMessages$Params } from '../fn/message/get-messages';
import { MessageDto } from '../models/message-dto';
import { send } from '../fn/message/send';
import { Send$Params } from '../fn/message/send';

@Injectable({ providedIn: 'root' })
export class ApiMessageService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `getMessages()` */
  static readonly GetMessagesPath = '/api/message/all';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getMessages()` instead.
   *
   * This method doesn't expect any request body.
   */
  getMessages$Response(params?: GetMessages$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<MessageDto>>> {
    return getMessages(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getMessages$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getMessages(params?: GetMessages$Params, context?: HttpContext): Observable<Array<MessageDto>> {
    return this.getMessages$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<MessageDto>>): Array<MessageDto> => r.body)
    );
  }

  /** Path part for operation `getChatMessages()` */
  static readonly GetChatMessagesPath = '/api/message/chat';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getChatMessages()` instead.
   *
   * This method doesn't expect any request body.
   */
  getChatMessages$Response(params: GetChatMessages$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<MessageDto>>> {
    return getChatMessages(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getChatMessages$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getChatMessages(params: GetChatMessages$Params, context?: HttpContext): Observable<Array<MessageDto>> {
    return this.getChatMessages$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<MessageDto>>): Array<MessageDto> => r.body)
    );
  }

  /** Path part for operation `send()` */
  static readonly SendPath = '/api/message/send';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `send()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  send$Response(params: Send$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return send(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `send$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  send(params: Send$Params, context?: HttpContext): Observable<void> {
    return this.send$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

}
