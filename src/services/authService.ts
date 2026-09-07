import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { AuthUser } from '../types';

const AUTH_STORAGE_KEY = 'mindconnect_auth_user';
const USERS_STORAGE_KEY = 'mindconnect_local_users';

type AuthListener = (user: AuthUser | null) => void;
const listeners: Set<AuthListener> = new Set();

export function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function subscribeAuth(listener: AuthListener): () => void {
  listeners.add(listener);
  listener(getStoredUser());
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners(user: AuthUser | null) {
  listeners.forEach((fn) => {
    try {
      fn(user);
    } catch (e) {
      console.error(e);
    }
  });
}

function getLocalUsers(): Record<string, { password: string; user: AuthUser }> {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalUser(username: string, record: { password: string; user: AuthUser }) {
  try {
    const map = getLocalUsers();
    map[username.toLowerCase()] = record;
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(map));
  } catch (err) {
    console.warn('Failed to save local user', err);
  }
}

/**
 * Ensures admin account (admin / 123) is provisioned
 */
export async function initDefaultAdmin() {
  const adminUser: AuthUser = {
    id: 'admin',
    username: 'admin',
    displayName: '최고 관리자 (Admin)',
    role: 'admin',
    createdAt: new Date().toISOString(),
  };

  saveLocalUser('admin', { password: '123', user: adminUser });

  try {
    const adminDocRef = doc(db, 'users', 'admin');
    const snap = await getDoc(adminDocRef);
    if (!snap.exists()) {
      await setDoc(adminDocRef, {
        username: 'admin',
        password: '123',
        displayName: '최고 관리자 (Admin)',
        role: 'admin',
        createdAt: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.warn('Could not sync admin to Firestore, fallback to local', err);
  }
}

// Automatically initialize admin
initDefaultAdmin().catch(console.error);

export async function loginWithCredentials(
  usernameInput: string,
  passwordInput: string
): Promise<AuthUser> {
  const username = usernameInput.trim().toLowerCase();
  const password = passwordInput.trim();

  if (!username) {
    throw new Error('아이디를 입력해주세요.');
  }
  if (!password) {
    throw new Error('비밀번호를 입력해주세요.');
  }

  // Pre-configured Admin check
  if (username === 'admin' && password === '123') {
    const adminUser: AuthUser = {
      id: 'admin',
      username: 'admin',
      displayName: '최고 관리자 (Admin)',
      role: 'admin',
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(adminUser));
    notifyListeners(adminUser);
    return adminUser;
  }

  // Check local users store first
  const localUsers = getLocalUsers();
  if (localUsers[username]) {
    const record = localUsers[username];
    if (record.password === password) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(record.user));
      notifyListeners(record.user);
      return record.user;
    } else {
      throw new Error('비밀번호가 일치하지 않습니다.');
    }
  }

  // Check Firestore users collection
  try {
    const userDocRef = doc(db, 'users', username);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data.password === password) {
        const authUser: AuthUser = {
          id: username,
          username: data.username,
          displayName: data.displayName || username,
          role: data.role || 'user',
          createdAt: data.createdAt,
        };
        saveLocalUser(username, { password, user: authUser });
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
        notifyListeners(authUser);
        return authUser;
      } else {
        throw new Error('비밀번호가 일치하지 않습니다.');
      }
    }
  } catch (err: any) {
    if (err.message && err.message.includes('비밀번호가 일치하지 않습니다')) {
      throw err;
    }
  }

  throw new Error('존재하지 않는 아이디이거나 비밀번호가 올바르지 않습니다.');
}

export async function signUpWithCredentials(params: {
  username: string;
  password: string;
  displayName: string;
}): Promise<AuthUser> {
  const username = params.username.trim().toLowerCase();
  const password = params.password.trim();
  const displayName = params.displayName.trim();

  if (!username) {
    throw new Error('사용할 아이디를 입력해주세요.');
  }
  if (username.length < 2 || username.length > 30) {
    throw new Error('아이디는 2자 이상 30자 이하로 입력해주세요.');
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    throw new Error('아이디는 영문, 숫자, 밑줄(_)만 사용할 수 있습니다.');
  }
  if (!password) {
    throw new Error('비밀번호를 입력해주세요.');
  }
  if (password.length < 3) {
    throw new Error('비밀번호는 최소 3자 이상이어야 합니다.');
  }
  if (!displayName) {
    throw new Error('성명 또는 닉네임을 입력해주세요.');
  }

  // Check if admin id attempted
  if (username === 'admin') {
    throw new Error('해당 아이디는 시스템 예약어이므로 사용하실 수 없습니다.');
  }

  // Check local users
  const localUsers = getLocalUsers();
  if (localUsers[username]) {
    throw new Error('이미 등록되어 있는 아이디입니다.');
  }

  // Check Firestore users collection
  try {
    const userDocRef = doc(db, 'users', username);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      throw new Error('이미 등록되어 있는 아이디입니다.');
    }

    const newUser: AuthUser = {
      id: username,
      username,
      displayName,
      role: 'user',
      createdAt: new Date().toISOString(),
    };

    await setDoc(userDocRef, {
      username,
      password,
      displayName,
      role: 'user',
      createdAt: new Date().toISOString(),
    });

    saveLocalUser(username, { password, user: newUser });
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    notifyListeners(newUser);
    return newUser;
  } catch (err: any) {
    if (err.message && err.message.includes('이미 등록되어 있는')) {
      throw err;
    }
    // Fallback if network issue
    const newUser: AuthUser = {
      id: username,
      username,
      displayName,
      role: 'user',
      createdAt: new Date().toISOString(),
    };
    saveLocalUser(username, { password, user: newUser });
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    notifyListeners(newUser);
    return newUser;
  }
}

export function logoutUser() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  notifyListeners(null);
}
