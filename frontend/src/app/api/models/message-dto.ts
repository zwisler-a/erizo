/* tslint:disable */
/* eslint-disable */
/* Code generated by ng-openapi-gen DO NOT EDIT. */

import { ChatEntity } from '../models/chat-entity';
import { DecryptionKeyEntity } from '../models/decryption-key-entity';
export interface MessageDto {
  chat: ChatEntity;
  created_at: number;
  data: string;
  days_to_live: number;
  decryptionKeys: Array<DecryptionKeyEntity>;
  id: number;
  iv: string;
  message: string;
  sender_fingerprint: string;
}
