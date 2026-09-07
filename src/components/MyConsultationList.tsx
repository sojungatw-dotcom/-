import React, { useState } from 'react';
import { User } from 'firebase/auth';
import {
  Inbox,
  PlusCircle,
  LogIn,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { Consultation, AuthUser } from '../types';
import { ConsultationCard } from './ConsultationCard';

interface MyConsultationListProps {
  user: User | null;
  authUser: AuthUser | null;
  consultations: Consultation[];
  isLoading: boolean;
  onSelect: (item: Consultation) => void;
  onEdit: (item: Consultation) => void;
  onDelete: (id: string) => void;
  onNewRequest: () => void;
  onOpenAuth?: (mode: 'login' | 'signup') => void;
  currentUserId: string;
}

export const MyConsultationList: React.FC<MyConsultationListProps> = ({
  user,
  authUser,
  consultations,
  isLoading,
  onSelect,
  onEdit,
  onDelete,
  onNewRequest,
  onOpenAuth,
  currentUserId,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const isLoggedIn = !!authUser || !!user;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center pb-4 border-b border-white/10">
          <div className="h-6 w-32 bg-white/10 rounded animate-pulse" />
          <div className="h-8 w-24 bg-white/10 rounded animate-pulse" />
        </div>
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg animate-pulse space-y-3"
          >
            <div className="h-4 bg-white/10 rounded w-1/4" />
            <div className="h-5 bg-white/10 rounded w-3/4" />
            <div className="h-4 bg-white/5 rounded w-full" />
          </div>
        ))}
      </div>
    );
  }

  const filtered = consultations.filter((item) => {
    if (filterStatus === 'all') return true;
    return item.status === filterStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Notice based on auth state */}
      {!isLoggedIn ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-white">비회원 브라우저 보관 내역</div>
              <div className="text-slate-400 text-[11px]">
                이 브라우저에서 등록하신 상담 내역입니다. 다른 기기에서도 확인하려면 로그인해주세요.
              </div>
            </div>
          </div>
          {onOpenAuth && (
            <button
              type="button"
              onClick={() => onOpenAuth('login')}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-blue-600/30 hover:bg-blue-600/40 border border-blue-400/30 text-blue-200 hover:text-white rounded-xl text-xs font-semibold transition-colors shrink-0"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>로그인하여 내역 연동</span>
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md flex items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-white">
                {authUser ? authUser.displayName : user?.displayName || '회원'} 님의 전용 상담함
              </div>
              <div className="text-slate-400 text-[11px]">
                계정과 연동된 모든 상담 요청과 전문가의 공식 답변이 안전하게 보관됩니다.
              </div>
            </div>
          </div>
          <span className="text-emerald-400 text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full hidden sm:inline-block">
            클라우드 동기화 완료
          </span>
        </div>
      )}

      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
            내 상담 신청 내역
            <span className="text-xs bg-white/10 text-blue-300 border border-white/10 font-semibold px-2.5 py-0.5 rounded-full">
              총 {consultations.length}건
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            접수 대기 상태의 요청은 내용 수정 및 취소가 가능합니다.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white/5 border border-white/10 p-1 rounded-2xl backdrop-blur-md text-xs font-medium">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                filterStatus === 'all'
                  ? 'bg-white/15 text-white shadow-inner font-semibold border border-white/15'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              전체 ({consultations.length})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                filterStatus === 'pending'
                  ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              대기 ({consultations.filter((c) => c.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                filterStatus === 'completed'
                  ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              답변완료 ({consultations.filter((c) => c.status === 'completed').length})
            </button>
          </div>

          <button
            onClick={onNewRequest}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white rounded-2xl text-xs font-bold transition-all shadow-lg shadow-blue-900/20 active:scale-[0.99]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>신규 상담</span>
          </button>
        </div>
      </div>

      {/* Cards List or Empty State */}
      {filtered.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-12 text-center shadow-2xl">
          <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
            <Inbox className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">
            {filterStatus === 'all' ? '등록된 상담 내역이 없습니다' : '해당 상태의 상담이 없습니다'}
          </h3>
          <p className="text-xs text-slate-400 mb-6 max-w-sm mx-auto leading-relaxed">
            궁금하신 사항이나 상담이 필요하신 내용을 작성해 주시면 전문가가 신속하게 확인 후 안내해 드립니다.
          </p>
          <button
            onClick={onNewRequest}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white font-semibold text-sm rounded-2xl shadow-lg shadow-blue-900/20 active:scale-[0.99] transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>지금 상담 신청하기</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => {
            const canEdit =
              item.authorId === currentUserId ||
              item.authorId.startsWith('guest_') ||
              (authUser && (item.authorId === authUser.id || item.authorEmail === `@${authUser.username}`));
            return (
              <ConsultationCard
                key={item.id}
                item={item}
                onSelect={onSelect}
                onEdit={onEdit}
                onDelete={onDelete}
                canEdit={canEdit}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
