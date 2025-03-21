export interface Message {
  id: number,
  sender_fingerprint: string,
  recipient_fingerprint: string,
  message: string,
  data: string,
  encrypted_key: string,
  iv: string,
  created_at: number
}
