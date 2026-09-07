export type ConsultationCategory = 'general' | 'service' | 'pricing' | 'other';

export type ConsultationStatus = 'pending' | 'in_progress' | 'completed';

export interface Consultation {
  id: string;
  title: string;
  content: string;
  category: ConsultationCategory;
  status: ConsultationStatus;
  authorId: string;
  authorName: string;
  authorEmail: string;
  createdAt: any;
  updatedAt: any;
  adminReply?: string;
}

export interface AuthUser {
  id: string;
  username: string;
  displayName: string;
  role: 'admin' | 'user';
  email?: string;
  createdAt?: string;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}
