
export interface RecipientList {
  fingerprint: string;
  encryption_key: string;
}

export interface MessageCreation {
  data: string;
  message: string;
  iv: string;
  recipients: RecipientList[];
  sender_fingerprint: string;
}
