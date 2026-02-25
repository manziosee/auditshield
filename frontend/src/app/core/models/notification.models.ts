export type NotificationType =
  | 'document_expiry'
  | 'compliance_due'
  | 'contract_renewal'
  | 'system'
  | 'reminder';

export interface AppNotification {
  id: string;
  notification_type: NotificationType;
  title: string;
  body: string;
  is_read: boolean;
  is_sent_email: boolean;
  related_object_id: string | null;
  related_object_type: string;
  created_at: string;
}
