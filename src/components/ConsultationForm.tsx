import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { Send, AlertCircle, CheckCircle, LogIn, UserCheck, Sparkles } from 'lucide-react';
import { ConsultationCategory, AuthUser } from '../types';
import { createConsultation } from '../services/consultationService';

interface ConsultationFormProps {
  user: User | null;
  authUser: AuthUser | null;
  onSuccess: () => void;
  onOpenAuth?: (mode: 'login' | 'signup') => void;
}

const CATEGORIES: { id: ConsultationCategory; label: string; desc: string }[] = [
  { id: 'general', label: '일반 상담', desc: '전반적인 궁금증 및 기본 안내' },
  { id: 'service', label: '서비스 문의', desc: '기능 및 서비스 이용 관련' },
  { id: 'pricing', label: '비용 / 견적', desc: '이용 요금 및 맞춤 견적' },
  { id: 'other', label: '기타 문의', desc: '제휴 및 기타 상담' },
];

export const ConsultationForm: React.FC<ConsultationFormProps> = ({
  user,
  authUser,
  onSuccess,
  onOpenAuth,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<ConsultationCategory>('general');
  const [guestName, setGuestName] = useState('');
  const [guestContact, setGuestContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isLoggedIn = !!authUser || !!user;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!title.trim()) {
      setErrorMsg('상담 제목을 입력해주세요.');
      return;
    }

    if (title.trim().length > 100) {
      setErrorMsg('제목은 최대 100자까지 입력 가능합니다.');
      return;
    }

    if (!content.trim()) {
      setErrorMsg('상담 요청 내용을 입력해주세요.');
      return;
    }

    if (content.trim().length > 3000) {
      setErrorMsg('요청 내용은 최대 3,000자까지 입력 가능합니다.');
      return;
    }

    try {
      setIsSubmitting(true);
      const authorId = authUser ? authUser.id : user ? user.uid : undefined;
      const authorName = authUser
        ? authUser.displayName
        : user
        ? (user.displayName || user.email?.split('@')[0] || '회원')
        : (guestName.trim() || '익명 신청자');
      const authorEmail = authUser
        ? (authUser.email || `@${authUser.username}`)
        : user
        ? (user.email || '')
        : (guestContact.trim() || '');

      await createConsultation({
        title,
        content,
        category,
        authorId,
        authorName,
        authorEmail,
      });

      setTitle('');
      setContent('');
      setCategory('general');
      setGuestName('');
      setGuestContact('');
      setSuccessMsg('상담 요청이 Firebase DB에 성공적으로 등록되었습니다. "내 상담 내역" 탭에서 확인하실 수 있습니다.');
      onSuccess();
    } catch (err) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : '상담 접수 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-6 sm:p-8 shadow-2xl flex flex-col">
      <div className="mb-6 pb-6 border-b border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            상담 요청 작성
          </h2>
          <span className="text-xs font-medium text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.15)] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>비회원 즉시 접수 가능</span>
          </span>
        </div>
        <p className="text-sm text-slate-400">
          로그인 없이도 바로 상담을 요청하실 수 있습니다. 입력하신 내용은 Firebase 데이터베이스에 안전하게 보관됩니다.
        </p>
      </div>

      {/* Guest Mode Helpful Notice */}
      {!isLoggedIn && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-white">비회원 모드로 이용 중입니다</div>
              <div className="text-slate-400 text-[11px]">로그인하시면 언제 어디서나 상담 내역을 조회하고 관리할 수 있습니다.</div>
            </div>
          </div>
          {onOpenAuth && (
            <button
              type="button"
              onClick={() => onOpenAuth('login')}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-blue-600/30 hover:bg-blue-600/40 border border-blue-400/30 text-blue-200 hover:text-white rounded-xl text-xs font-semibold transition-colors shrink-0"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>로그인하기</span>
            </button>
          )}
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex items-start gap-2.5 backdrop-blur-md">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-400" />
          <div>{errorMsg}</div>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-start gap-2.5 backdrop-blur-md shadow-[0_0_12px_rgba(34,197,94,0.15)]">
          <CheckCircle className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400" />
          <div>{successMsg}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col">
        {/* Category Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
            상담 분야 선택
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {CATEGORIES.map((cat) => {
              const selected = category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`p-3.5 text-left rounded-2xl border transition-all ${
                    selected
                      ? 'border-blue-500/50 bg-blue-600/25 text-white ring-1 ring-blue-500/40 shadow-md shadow-blue-900/20'
                      : 'border-white/10 hover:border-white/20 bg-white/5 text-slate-300 hover:bg-white/[0.08]'
                  }`}
                >
                  <div className="font-semibold text-sm">{cat.label}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 leading-tight line-clamp-1">
                    {cat.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Guest Optional Contact Info if not logged in */}
        {!isLoggedIn && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-white/[0.03] border border-white/10 rounded-2xl p-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                신청자 성명 / 닉네임 <span className="text-slate-500 font-normal">(선택)</span>
              </label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                maxLength={50}
                placeholder="예: 홍길동 (미입력 시 익명)"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                연락처 / 이메일 <span className="text-slate-500 font-normal">(선택)</span>
              </label>
              <input
                type="text"
                value={guestContact}
                onChange={(e) => setGuestContact(e.target.value)}
                maxLength={100}
                placeholder="답변 회신용 이메일이나 연락처"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50"
              />
            </div>
          </div>
        )}

        {/* Title Input */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between ml-1">
            <label htmlFor="consultation-title" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              상담 제목 <span className="text-blue-400">*</span>
            </label>
            <span className="text-[11px] text-slate-500">
              {title.length} / 100자
            </span>
          </div>
          <input
            id="consultation-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            placeholder="상담받고 싶은 주제나 요약 제목을 입력해주세요"
            disabled={isSubmitting}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 placeholder:text-slate-500 text-white text-base transition-all disabled:opacity-40"
          />
        </div>

        {/* Content Textarea */}
        <div className="flex flex-col gap-1.5 flex-1">
          <div className="flex items-center justify-between ml-1">
            <label htmlFor="consultation-content" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              요청 내용 <span className="text-blue-400">*</span>
            </label>
            <span className="text-[11px] text-slate-500">
              {content.length} / 3,000자
            </span>
          </div>
          <textarea
            id="consultation-content"
            rows={7}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={3000}
            placeholder="고민이나 궁금한 점을 상세히 적어주세요..."
            disabled={isSubmitting}
            className="w-full flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 placeholder:text-slate-500 text-white text-base leading-relaxed transition-all resize-y min-h-[160px] disabled:opacity-40"
          />
        </div>

        {/* Logged-in User Info Preview */}
        {isLoggedIn && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-400" />
              <span className="font-semibold text-slate-200">신청인:</span>
              <span>
                {authUser
                  ? `${authUser.displayName} (@${authUser.username})`
                  : `${user?.displayName || '이름 없음'} (${user?.email})`}
              </span>
            </div>
            <span className="text-emerald-400 hidden sm:inline-block text-[11px]">계정 연동됨</span>
          </div>
        )}

        {/* Submit Action */}
        <button
          id="btn-submit-consultation"
          type="submit"
          disabled={isSubmitting || !title.trim() || !content.trim()}
          className="w-full mt-2 py-4.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl font-bold text-lg text-white hover:opacity-90 shadow-lg shadow-blue-900/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>데이터베이스에 저장 중...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>상담 저장하기</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
