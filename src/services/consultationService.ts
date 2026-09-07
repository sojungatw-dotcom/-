import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError } from '../firebase';
import {
  Consultation,
  ConsultationCategory,
  ConsultationStatus,
  OperationType,
} from '../types';

const COLLECTION_NAME = 'consultations';
const GUEST_ID_KEY = 'guest_user_id';
const GUEST_CONSULTATIONS_KEY = 'guest_consultation_ids';

export function getOrCreateGuestId(): string {
  try {
    let guestId = localStorage.getItem(GUEST_ID_KEY);
    if (!guestId || !guestId.startsWith('guest_')) {
      guestId = 'guest_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now().toString(36);
      localStorage.setItem(GUEST_ID_KEY, guestId);
    }
    return guestId;
  } catch {
    return 'guest_' + Math.random().toString(36).substring(2, 10);
  }
}

export function getGuestConsultationIds(): string[] {
  try {
    const raw = localStorage.getItem(GUEST_CONSULTATIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveGuestConsultationId(id: string) {
  try {
    const ids = getGuestConsultationIds();
    if (!ids.includes(id)) {
      ids.unshift(id);
      localStorage.setItem(GUEST_CONSULTATIONS_KEY, JSON.stringify(ids));
    }
  } catch (err) {
    console.warn('Failed to save guest consultation ID', err);
  }
}

export function removeGuestConsultationId(id: string) {
  try {
    const ids = getGuestConsultationIds().filter((existingId) => existingId !== id);
    localStorage.setItem(GUEST_CONSULTATIONS_KEY, JSON.stringify(ids));
  } catch (err) {
    console.warn('Failed to remove guest consultation ID', err);
  }
}

export async function createConsultation(params: {
  title: string;
  content: string;
  category: ConsultationCategory;
  authorName?: string;
  authorEmail?: string;
  authorId?: string;
}): Promise<string> {
  const user = auth.currentUser;

  const trimmedTitle = params.title.trim();
  const trimmedContent = params.content.trim();

  if (!trimmedTitle || trimmedTitle.length > 100) {
    throw new Error('제목은 1자 이상 100자 이하로 입력해주세요.');
  }
  if (!trimmedContent || trimmedContent.length > 3000) {
    throw new Error('상담 내용은 1자 이상 3,000자 이하로 입력해주세요.');
  }

  const authorId = params.authorId || (user ? user.uid : getOrCreateGuestId());
  const authorName = params.authorName?.trim() ||
    (user ? (user.displayName || user.email?.split('@')[0] || '회원') : '비회원 신청자');
  const authorEmail = params.authorEmail?.trim() ||
    (user ? (user.email || '') : '');

  const payload = {
    title: trimmedTitle,
    content: trimmedContent,
    category: params.category,
    status: 'pending' as ConsultationStatus,
    authorId,
    authorName,
    authorEmail,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    const colRef = collection(db, COLLECTION_NAME);
    const docRef = await addDoc(colRef, payload);
    saveGuestConsultationId(docRef.id);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
  }
}

export function subscribeUserConsultations(
  userId: string,
  onData: (consultations: Consultation[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const colRef = collection(db, COLLECTION_NAME);
  const q = query(colRef, where('authorId', '==', userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: Consultation[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          title: data.title,
          content: data.content,
          category: data.category,
          status: data.status,
          authorId: data.authorId,
          authorName: data.authorName,
          authorEmail: data.authorEmail,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          adminReply: data.adminReply,
        });
      });

      list.sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() || (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
        const timeB = b.createdAt?.toMillis?.() || (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
        return timeB - timeA;
      });

      onData(list);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
      } catch (wrappedError) {
        onError(wrappedError instanceof Error ? wrappedError : new Error(String(wrappedError)));
      }
    }
  );
}

export function subscribeGuestConsultations(
  consultationIds: string[],
  onData: (consultations: Consultation[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  if (consultationIds.length === 0) {
    onData([]);
    return () => {};
  }

  const itemsMap = new Map<string, Consultation>();
  const unsubs: Unsubscribe[] = [];

  consultationIds.forEach((id) => {
    const docRef = doc(db, COLLECTION_NAME, id);
    const unsub = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          itemsMap.set(id, {
            id: docSnap.id,
            title: data.title,
            content: data.content,
            category: data.category,
            status: data.status,
            authorId: data.authorId,
            authorName: data.authorName,
            authorEmail: data.authorEmail,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            adminReply: data.adminReply,
          });
        } else {
          itemsMap.delete(id);
        }

        const list = Array.from(itemsMap.values());
        list.sort((a, b) => {
          const timeA = a.createdAt?.toMillis?.() || (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
          const timeB = b.createdAt?.toMillis?.() || (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
          return timeB - timeA;
        });
        onData(list);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.GET, `${COLLECTION_NAME}/${id}`);
        } catch (wrappedError) {
          onError(wrappedError instanceof Error ? wrappedError : new Error(String(wrappedError)));
        }
      }
    );
    unsubs.push(unsub);
  });

  return () => {
    unsubs.forEach((u) => u());
  };
}

export function subscribeAllConsultations(
  onData: (consultations: Consultation[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const colRef = collection(db, COLLECTION_NAME);

  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: Consultation[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          title: data.title,
          content: data.content,
          category: data.category,
          status: data.status,
          authorId: data.authorId,
          authorName: data.authorName,
          authorEmail: data.authorEmail,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          adminReply: data.adminReply,
        });
      });

      list.sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() || (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
        const timeB = b.createdAt?.toMillis?.() || (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
        return timeB - timeA;
      });

      onData(list);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
      } catch (wrappedError) {
        onError(wrappedError instanceof Error ? wrappedError : new Error(String(wrappedError)));
      }
    }
  );
}

export async function updateConsultationContent(
  id: string,
  params: { title: string; content: string; category: ConsultationCategory }
): Promise<void> {
  const path = `${COLLECTION_NAME}/${id}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      title: params.title.trim(),
      content: params.content.trim(),
      category: params.category,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function adminRespondConsultation(
  id: string,
  params: { status: ConsultationStatus; adminReply?: string }
): Promise<void> {
  const path = `${COLLECTION_NAME}/${id}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const updateData: Record<string, any> = {
      status: params.status,
      updatedAt: serverTimestamp(),
    };
    if (params.adminReply !== undefined) {
      updateData.adminReply = params.adminReply.trim();
    }
    await updateDoc(docRef, updateData);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteConsultation(id: string): Promise<void> {
  const path = `${COLLECTION_NAME}/${id}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
    removeGuestConsultationId(id);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
