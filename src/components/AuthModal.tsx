import React, { useState } from 'react';
import {
  X,
  LogIn,
  UserPlus,
  AlertCircle,
  CheckCircle,
  Shield,
  KeyRound,
  User,
} from 'lucide-react';
import { loginWithCredentials, signUpWithCredentials } from '../services/authService';
import { AuthUser } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'signup';
  onClose: () => void;
  onSuccess: (user: AuthUser) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFillAdmin = () => {
    setUsername('admin');
    setPassword('123');
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (mode === 'signup') {
      if (!username.trim() || !password.trim() || !displayName.trim()) {
        setErrorMsg('모든 필드를 입력해 주세요.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
        return;
      }
    } else {
      if (!username.trim() || !password.trim()) {
        setErrorMsg('아이디와 비밀번호를 모두 입력해 주세요.');
        return;
      }
    }

    try {
      setIsLoading(true);
      if (mode === 'login') {
        const user = await loginWithCredentials(username, password);
        setSuccessMsg(`${user.displayName}님 환영합니다!`);
        setTimeout(() => {
          onSuccess(user);
          onClose();
        }, 500);
      } else {
        const user = await signUpWithCredentials({
          username,
          password,
          displayName,
        });
        setSuccessMsg('회원가입이 완료되었습니다!');
        setTimeout(() => {
          onSuccess(user);
          onClose();
        }, 600);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || '인증 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        id="auth-modal"
        className="bg-[#0f172a]/95 backdrop-blur-2xl border border-white/15 shadow-2xl max-w-md w-full rounded-[32px] overflow-hidden text-white flex flex-col relative"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-900/30">
              {mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {mode === 'login' ? '로그인' : '회원가입'}
              </h3>
              <p className="text-xs text-slate-400">
                {mode === 'login'
                  ? '아이디와 비밀번호로 로그인하세요'
                  : '새로운 상담 계정을 등록하세요'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-white/10 bg-white/[0.02] p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
              mode === 'login'
                ? 'bg-white/15 text-white shadow-inner border border-white/15'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            로그인
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
              mode === 'signup'
                ? 'bg-white/15 text-white shadow-inner border border-white/15'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            회원가입
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Admin Hint for testing */}
          {mode === 'login' && (
            <div className="bg-gradient-to-r from-blue-600/15 to-indigo-600/15 border border-blue-500/30 rounded-2xl p-3.5 flex items-center justify-between text-xs text-blue-200 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400 shrink-0" />
                <div>
                  <div className="font-semibold text-blue-300">관리자(Admin) 전용 계정</div>
                  <div className="text-[11px] text-slate-300">
                    ID: <span className="font-mono text-white font-bold">admin</span> / PW:{' '}
                    <span className="font-mono text-white font-bold">123</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleFillAdmin}
                className="px-2.5 py-1 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-400/40 text-blue-200 hover:text-white rounded-lg text-[11px] font-semibold transition-colors shrink-0"
              >
                자동 입력
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-300 rounded-2xl text-xs flex items-start gap-2 backdrop-blur-md">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-2xl text-xs flex items-center gap-2 backdrop-blur-md shadow-[0_0_12px_rgba(34,197,94,0.15)]">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ID Input */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                아이디 (ID) <span className="text-blue-400">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={mode === 'login' ? '아이디 입력' : '영문/숫자 아이디 입력 (2~30자)'}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30"
                />
              </div>
            </div>

            {/* Display Name (Only in Signup) */}
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                  이름 / 닉네임 <span className="text-blue-400">*</span>
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="예: 홍길동"
                  maxLength={50}
                  className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30"
                />
              </div>
            )}

            {/* Password Input */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                비밀번호 <span className="text-blue-400">*</span>
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호 입력"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30"
                />
              </div>
            </div>

            {/* Password Confirm (Only in Signup) */}
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                  비밀번호 확인 <span className="text-blue-400">*</span>
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="비밀번호 다시 입력"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 rounded-2xl font-bold text-sm text-white shadow-lg shadow-blue-900/30 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>처리 중...</span>
                </>
              ) : mode === 'login' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>로그인하기</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>회원가입 완료</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
