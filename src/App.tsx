/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import {
  Shield,
  CheckCircle,
  Database,
  ArrowRight,
  Sparkles,
  LayoutDashboard,
  ShieldCheck,
} from 'lucide-react';
import { auth, testConnection } from './firebase';
import { Consultation, AuthUser } from './types';
import {
  subscribeUserConsultations,
  subscribeGuestConsultations,
  subscribeAllConsultations,
  deleteConsultation,
  getGuestConsultationIds,
  getOrCreateGuestId,
} from './services/consultationService';
import { subscribeAuth, logoutUser as logoutAppUser } from './services/authService';
import { Navbar } from './components/Navbar';
import { ConsultationForm } from './components/ConsultationForm';
import { MyConsultationList } from './components/MyConsultationList';
import { AdminPanel } from './components/AdminPanel';
import { ConsultationDetailModal } from './components/ConsultationDetailModal';
import { AuthModal } from './components/AuthModal';

const ADMIN_EMAIL = 'sojungatw@gmail.com';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [dbConnected, setDbConnected] = useState(false);

  const [activeTab, setActiveTab] = useState<'submit' | 'my-list' | 'admin'>('submit');
  const [myConsultations, setMyConsultations] = useState<Consultation[]>([]);
  const [allConsultations, setAllConsultations] = useState<Consultation[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);

  const [selectedItem, setSelectedItem] = useState<Consultation | null>(null);

  // Auth Modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

  const isAdmin = authUser?.role === 'admin' || user?.email === ADMIN_EMAIL;

  // 1. Check Firestore Connection
  useEffect(() => {
    testConnection().then((connected) => {
      setDbConnected(connected);
    });
  }, []);

  // 2. Firebase Auth State Observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // 3. App ID/PW Auth State Observer
  useEffect(() => {
    const unsubscribe = subscribeAuth((currentAuthUser) => {
      setAuthUser(currentAuthUser);
      if (currentAuthUser?.role === 'admin') {
        // Automatically switch to admin dashboard when admin logs in
        setActiveTab('admin');
      }
    });
    return () => unsubscribe();
  }, []);

  // 4. Subscribe to User or Guest Consultations
  useEffect(() => {
    setIsLoadingList(true);

    const currentId = authUser ? authUser.id : user ? user.uid : null;

    if (currentId) {
      const unsubscribe = subscribeUserConsultations(
        currentId,
        (data) => {
          setMyConsultations(data);
          setIsLoadingList(false);

          setSelectedItem((prev) => {
            if (!prev) return null;
            const updated = data.find((d) => d.id === prev.id);
            return updated || prev;
          });
        },
        (error) => {
          console.error('User consultations subscription error:', error);
          setIsLoadingList(false);
        }
      );
      return () => unsubscribe();
    } else {
      const guestIds = getGuestConsultationIds();
      const unsubscribe = subscribeGuestConsultations(
        guestIds,
        (data) => {
          setMyConsultations(data);
          setIsLoadingList(false);

          setSelectedItem((prev) => {
            if (!prev) return null;
            const updated = data.find((d) => d.id === prev.id);
            return updated || prev;
          });
        },
        (error) => {
          console.error('Guest consultations subscription error:', error);
          setIsLoadingList(false);
        }
      );
      return () => unsubscribe();
    }
  }, [user, authUser, activeTab]);

  // 5. Subscribe to All Consultations if Admin
  useEffect(() => {
    if (!isAdmin) {
      setAllConsultations([]);
      return;
    }

    const unsubscribe = subscribeAllConsultations(
      (data) => {
        setAllConsultations(data);
        setSelectedItem((prev) => {
          if (!prev) return null;
          const updated = data.find((d) => d.id === prev.id);
          return updated || prev;
        });
      },
      (error) => {
        console.error('All consultations subscription error:', error);
      }
    );

    return () => unsubscribe();
  }, [isAdmin]);

  const handleDeleteItem = async (id: string) => {
    try {
      await deleteConsultation(id);
      if (selectedItem?.id === id) {
        setSelectedItem(null);
      }
    } catch (err) {
      console.error(err);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const handleOpenAuth = (mode: 'login' | 'signup') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (loggedUser: AuthUser) => {
    if (loggedUser.role === 'admin') {
      setActiveTab('admin');
    } else {
      setActiveTab('my-list');
    }
  };

  const handleLogout = () => {
    logoutAppUser();
    setActiveTab('submit');
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col font-sans relative overflow-x-hidden selection:bg-blue-600/30 selection:text-white">
      {/* Frosted Glass Ambient Glow Orbs */}
      <div className="fixed top-[-100px] left-[-100px] w-[450px] h-[450px] bg-blue-600/25 rounded-full blur-[130px] pointer-events-none -z-0" />
      <div className="fixed bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none -z-0" />
      <div className="fixed top-[40%] right-[15%] w-[320px] h-[320px] bg-sky-500/10 rounded-full blur-[110px] pointer-events-none -z-0" />

      {/* Navbar */}
      <Navbar
        user={user}
        authUser={authUser}
        isAdmin={isAdmin}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        myCount={myConsultations.length}
        allCount={allConsultations.length}
        dbConnected={dbConnected}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
      />

      {/* Header Banner - Contextual for Admin or Regular User */}
      <div className="relative z-10 border-b border-white/10 bg-white/[0.02] backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-8">
          {isAdmin && activeTab === 'admin' ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 border border-blue-500/30 text-blue-300 mb-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span>관리자 대시보드 활성화 (계정: {authUser?.username || 'admin'})</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  고객 상담 통합 관제 및 실시간 통계
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  실제 고객들이 작성한 상담 데이터가 자동으로 집계되어 표시됩니다. 상태 변경 및 답변을 즉시 처리하세요.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('submit')}
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/15 border border-white/15 text-slate-200 hover:text-white rounded-2xl text-xs font-semibold transition-all cursor-pointer"
                >
                  상담 신청 폼 바로가기
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 border border-blue-500/20 text-blue-300 mb-3 backdrop-blur-md shadow-[0_0_12px_rgba(59,130,246,0.15)]">
                  <Database className="w-3.5 h-3.5 text-blue-400" />
                  <span>Firebase Cloud Firestore 실시간 연동 DB</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-sm">
                  상담 요청을 등록하고 실시간으로 확인하세요
                </h1>
                <p className="text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
                  마음의 짐을 덜어보세요. 입력하신 내용은 Firebase 데이터베이스에 안전하게 암호화 보관되며,
                  실시간으로 진행 상황과 전문가 답변을 확인하실 수 있습니다.
                </p>
              </div>

              {/* 3 Step Process Card */}
              <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-4 shadow-xl grid grid-cols-3 gap-3 text-center sm:text-left min-w-[320px]">
                <div className="space-y-1">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 flex items-center justify-center text-xs font-bold">
                    1
                  </div>
                  <div className="text-xs font-bold text-slate-200">제목/내용 작성</div>
                  <div className="text-[11px] text-slate-400">요청서 간단 등록</div>
                </div>
                <div className="space-y-1">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  <div className="text-xs font-bold text-slate-200">클라우드 DB</div>
                  <div className="text-[11px] text-slate-400">Firestore 안전 저장</div>
                </div>
                <div className="space-y-1">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 flex items-center justify-center text-xs font-bold">
                    3
                  </div>
                  <div className="text-xs font-bold text-slate-200">실시간 처리</div>
                  <div className="text-[11px] text-slate-400">상담 및 답변 확인</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* TAB 1: Submit Form */}
        {activeTab === 'submit' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Form Column */}
            <div className="lg:col-span-8">
              <ConsultationForm
                user={user}
                authUser={authUser}
                onSuccess={() => {
                  setActiveTab('my-list');
                }}
                onOpenAuth={handleOpenAuth}
              />
            </div>

            {/* Sidebar Guide Column */}
            <div className="lg:col-span-4 space-y-5">
              {/* Security Info Card */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[28px] p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.2)]">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-wide">
                      보안 안내 및 개인정보 보호
                    </h3>
                    <p className="text-[11px] text-slate-400">Security & Privacy Guard</p>
                  </div>
                </div>

                <ul className="space-y-3 text-xs text-slate-300 leading-relaxed">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>모든 상담 요청은 Firebase 보안 규칙(Security Rules)에 의해 안전하게 격리 보관됩니다.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>상담이 접수되면 담당 관리자가 확인 후 신속하게 처리 상태를 변경하고 정성스러운 답변을 등록합니다.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>우측 상단의 로그인 / 회원가입을 통해 본인 계정에 영구적으로 상담 내역을 보관하실 수 있습니다.</span>
                  </li>
                </ul>
              </div>

              {/* Recent Consultation Quick Box if any */}
              {myConsultations.length > 0 && (
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[28px] p-5 shadow-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-blue-300">최근 내 상담</span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      총 {myConsultations.length}건
                    </span>
                  </div>
                  <div className="text-sm font-bold text-slate-100 truncate mb-1">
                    {myConsultations[0].title}
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                    {myConsultations[0].content}
                  </p>
                  <button
                    onClick={() => setActiveTab('my-list')}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <span>내 상담 내역 보러가기</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: My List */}
        {activeTab === 'my-list' && (
          <MyConsultationList
            user={user}
            authUser={authUser}
            consultations={myConsultations}
            isLoading={isLoadingList}
            onSelect={(item) => setSelectedItem(item)}
            onEdit={(item) => setSelectedItem(item)}
            onDelete={handleDeleteItem}
            onNewRequest={() => setActiveTab('submit')}
            onOpenAuth={handleOpenAuth}
            currentUserId={authUser ? authUser.id : user ? user.uid : getOrCreateGuestId()}
          />
        )}

        {/* TAB 3: Admin Dashboard */}
        {activeTab === 'admin' && isAdmin && (
          <AdminPanel
            consultations={allConsultations}
            onSelect={(item) => setSelectedItem(item)}
            onEdit={(item) => setSelectedItem(item)}
            onDelete={handleDeleteItem}
          />
        )}
      </main>

      {/* Consultation Detail / Response Modal */}
      {selectedItem && (
        <ConsultationDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          currentUserId={authUser ? authUser.id : user ? user.uid : getOrCreateGuestId()}
          isAdmin={isAdmin}
        />
      )}

      {/* Sign Up / Login Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-[#0f172a]/60 backdrop-blur-lg py-6 mt-12 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span>© {new Date().getFullYear()} 온라인 상담 서비스. Frosted Glass Design with Firebase Cloud Firestore.</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>관리자 계정: admin / 123</span>
            <span>•</span>
            <span>실시간 자동 동기화</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
