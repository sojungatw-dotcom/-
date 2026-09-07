import React from 'react';
import { User } from 'firebase/auth';
import {
  MessageSquareText,
  LogIn,
  LogOut,
  ShieldCheck,
  UserPlus,
  User as UserIcon,
  LayoutDashboard,
} from 'lucide-react';
import { AuthUser } from '../types';

interface NavbarProps {
  user: User | null;
  authUser: AuthUser | null;
  isAdmin: boolean;
  activeTab: 'submit' | 'my-list' | 'admin';
  setActiveTab: (tab: 'submit' | 'my-list' | 'admin') => void;
  myCount: number;
  allCount: number;
  dbConnected: boolean;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  authUser,
  isAdmin,
  activeTab,
  setActiveTab,
  myCount,
  allCount,
  dbConnected,
  onOpenAuth,
  onLogout,
}) => {
  const currentDisplayName = authUser
    ? authUser.displayName
    : user
    ? user.displayName || user.email?.split('@')[0]
    : null;

  const currentUsername = authUser ? authUser.username : null;

  return (
    <header
      id="app-header"
      className="bg-[#0f172a]/85 backdrop-blur-md border-b border-white/10 sticky top-0 z-30 shadow-lg shadow-black/20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand Title */}
          <div
            onClick={() => setActiveTab(isAdmin ? 'admin' : 'submit')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <MessageSquareText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <span className="font-bold text-lg text-white tracking-tight group-hover:text-blue-300 transition-colors">
                  온라인 상담 포털
                </span>
                {dbConnected && (
                  <div
                    title="Firebase Firestore 연동됨"
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 backdrop-blur-xs"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#22c55e]" />
                    <span>Firebase Live</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                {isAdmin
                  ? '관리자 모드: 고객 상담 접수 현황 모니터링 & 답변 관리'
                  : '빠르고 안전한 맞춤 상담 접수 및 실시간 조회'}
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <div className="hidden md:flex items-center space-x-1 bg-white/5 border border-white/10 backdrop-blur-xl p-1 rounded-2xl">
            {isAdmin ? (
              <>
                <button
                  id="nav-tab-admin-dashboard"
                  onClick={() => setActiveTab('admin')}
                  className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all flex items-center gap-2 ${
                    activeTab === 'admin'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-900/40 border border-blue-400/30'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>통합 대시보드</span>
                  {allCount > 0 && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-white/20 text-white font-bold">
                      {allCount}
                    </span>
                  )}
                </button>
                <button
                  id="nav-tab-submit"
                  onClick={() => setActiveTab('submit')}
                  className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                    activeTab === 'submit'
                      ? 'bg-white/15 text-white shadow-inner font-semibold border border-white/15'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  상담 신청
                </button>
              </>
            ) : (
              <>
                <button
                  id="nav-tab-submit"
                  onClick={() => setActiveTab('submit')}
                  className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                    activeTab === 'submit'
                      ? 'bg-white/15 text-white shadow-inner font-semibold border border-white/15'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  상담 신청
                </button>
                <button
                  id="nav-tab-my-list"
                  onClick={() => setActiveTab('my-list')}
                  className={`px-4 py-2 text-sm font-medium rounded-xl transition-all flex items-center gap-1.5 ${
                    activeTab === 'my-list'
                      ? 'bg-white/15 text-white shadow-inner font-semibold border border-white/15'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  내 상담 내역
                  {myCount > 0 && (
                    <span className="px-1.5 py-0.2 text-xs rounded-full bg-blue-500/30 text-blue-300 font-semibold border border-blue-400/20">
                      {myCount}
                    </span>
                  )}
                </button>
              </>
            )}
          </div>

          {/* Right Top Auth Section */}
          <div className="flex items-center space-x-2.5">
            {authUser || user ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 bg-white/5 border border-white/10 rounded-2xl py-1.5 px-3 backdrop-blur-md">
                  {isAdmin ? (
                    <div className="w-6 h-6 rounded-lg bg-blue-600/30 text-blue-400 flex items-center justify-center text-xs font-bold border border-blue-400/30">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-lg bg-indigo-600/30 text-indigo-300 flex items-center justify-center text-xs font-bold border border-indigo-400/30">
                      <UserIcon className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-white max-w-[120px] truncate leading-tight">
                      {currentDisplayName}
                    </span>
                    {currentUsername && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        @{currentUsername}
                      </span>
                    )}
                  </div>

                  {isAdmin && (
                    <span className="text-[10px] bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold px-2 py-0.5 rounded-md shadow-xs ml-1">
                      ADMIN
                    </span>
                  )}
                </div>

                <button
                  id="btn-logout"
                  onClick={onLogout}
                  title="로그아웃"
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">로그아웃</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  id="btn-nav-login"
                  onClick={() => onOpenAuth('login')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/15 rounded-2xl transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 text-blue-400" />
                  <span>로그인</span>
                </button>
                <button
                  id="btn-nav-signup"
                  onClick={() => onOpenAuth('signup')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 shadow-md shadow-blue-900/30 rounded-2xl transition-all active:scale-95 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>회원가입</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden border-t border-white/10 py-2.5 space-x-2">
          {isAdmin ? (
            <>
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex-1 py-2 text-xs font-semibold text-center rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'admin'
                    ? 'bg-blue-600 text-white font-bold border border-blue-400/30'
                    : 'text-slate-400'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>대시보드 ({allCount})</span>
              </button>
              <button
                onClick={() => setActiveTab('submit')}
                className={`flex-1 py-2 text-xs font-medium text-center rounded-xl transition-all ${
                  activeTab === 'submit'
                    ? 'bg-white/15 text-white font-bold border border-white/10'
                    : 'text-slate-400'
                }`}
              >
                상담 작성
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('submit')}
                className={`flex-1 py-2 text-xs font-medium text-center rounded-xl transition-all ${
                  activeTab === 'submit'
                    ? 'bg-white/15 text-white font-bold border border-white/10'
                    : 'text-slate-400'
                }`}
              >
                상담 신청
              </button>
              <button
                onClick={() => setActiveTab('my-list')}
                className={`flex-1 py-2 text-xs font-medium text-center rounded-xl transition-all ${
                  activeTab === 'my-list'
                    ? 'bg-white/15 text-white font-bold border border-white/10'
                    : 'text-slate-400'
                }`}
              >
                내 상담 내역 ({myCount})
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
