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

import { CreatePostResponseDto } from '../models/create-post-response-dto';
import { delete$ } from '../fn/post/delete';
import { Delete$Params } from '../fn/post/delete';
import { getAllPostIds } from '../fn/post/get-all-post-ids';
import { GetAllPostIds$Params } from '../fn/post/get-all-post-ids';
import { getPostIdsInThread } from '../fn/post/get-post-ids-in-thread';
import { GetPostIdsInThread$Params } from '../fn/post/get-post-ids-in-thread';
import { getPosts } from '../fn/post/get-posts';
import { GetPosts$Params } from '../fn/post/get-posts';
import { IdsPage } from '../models/ids-page';
import { like } from '../fn/post/like';
import { Like$Params } from '../fn/post/like';
import { PostDto } from '../models/post-dto';
import { publish } from '../fn/post/publish';
import { Publish$Params } from '../fn/post/publish';

@Injectable({ providedIn: 'root' })
export class ApiPostService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `getAllPostIds()` */
  static readonly GetAllPostIdsPath = '/api/post/all/ids';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getAllPostIds()` instead.
   *
   * This method doesn't expect any request body.
   */
  getAllPostIds$Response(params: GetAllPostIds$Params, context?: HttpContext): Observable<StrictHttpResponse<IdsPage>> {
    return getAllPostIds(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getAllPostIds$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getAllPostIds(params: GetAllPostIds$Params, context?: HttpContext): Observable<IdsPage> {
    return this.getAllPostIds$Response(params, context).pipe(
      map((r: StrictHttpResponse<IdsPage>): IdsPage => r.body)
    );
  }

  /** Path part for operation `getPostIdsInThread()` */
  static readonly GetPostIdsInThreadPath = '/api/post/thread/ids';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getPostIdsInThread()` instead.
   *
   * This method doesn't expect any request body.
   */
  getPostIdsInThread$Response(params: GetPostIdsInThread$Params, context?: HttpContext): Observable<StrictHttpResponse<IdsPage>> {
    return getPostIdsInThread(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getPostIdsInThread$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getPostIdsInThread(params: GetPostIdsInThread$Params, context?: HttpContext): Observable<IdsPage> {
    return this.getPostIdsInThread$Response(params, context).pipe(
      map((r: StrictHttpResponse<IdsPage>): IdsPage => r.body)
    );
  }

  /** Path part for operation `getPosts()` */
  static readonly GetPostsPath = '/api/post';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getPosts()` instead.
   *
   * This method doesn't expect any request body.
   */
  getPosts$Response(params: GetPosts$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<PostDto>>> {
    return getPosts(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getPosts$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getPosts(params: GetPosts$Params, context?: HttpContext): Observable<Array<PostDto>> {
    return this.getPosts$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<PostDto>>): Array<PostDto> => r.body)
    );
  }

  /** Path part for operation `delete()` */
  static readonly DeletePath = '/api/post';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `delete()` instead.
   *
   * This method doesn't expect any request body.
   */
  delete$Response(params: Delete$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return delete$(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `delete$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  delete(params: Delete$Params, context?: HttpContext): Observable<void> {
    return this.delete$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `publish()` */
  static readonly PublishPath = '/api/post/publish';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `publish()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  publish$Response(params: Publish$Params, context?: HttpContext): Observable<StrictHttpResponse<CreatePostResponseDto>> {
    return publish(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `publish$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  publish(params: Publish$Params, context?: HttpContext): Observable<CreatePostResponseDto> {
    return this.publish$Response(params, context).pipe(
      map((r: StrictHttpResponse<CreatePostResponseDto>): CreatePostResponseDto => r.body)
    );
  }

  /** Path part for operation `like()` */
  static readonly LikePath = '/api/post/like';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `like()` instead.
   *
   * This method doesn't expect any request body.
   */
  like$Response(params: Like$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return like(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `like$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  like(params: Like$Params, context?: HttpContext): Observable<void> {
    return this.like$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

}
