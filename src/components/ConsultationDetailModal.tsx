import React, { useState } from 'react';
import {
  X,
  Clock,
  MessageSquare,
  Send,
  User,
  Calendar,
  Save,
} from 'lucide-react';
import { Consultation, ConsultationCategory, ConsultationStatus } from '../types';
import {
  updateConsultationContent,
  adminRespondConsultation,
  deleteConsultation,
} from '../services/consultationService';

interface ConsultationDetailModalProps {
  item: Consultation | null;
  onClose: () => void;
  currentUserId?: string;
  isAdmin?: boolean;
}

const CATEGORIES: { id: ConsultationCategory; label: string }[] = [
  { id: 'general', label: '일반 상담' },
  { id: 'service', label: '서비스 문의' },
  { id: 'pricing', label: '비용 / 견적' },
  { id: 'other', label: '기타 문의' },
];

export const ConsultationDetailModal: React.FC<ConsultationDetailModalProps> = ({
  item,
  onClose,
  currentUserId,
  isAdmin = false,
}) => {
  if (!item) return null;

  const isAuthor = currentUserId === item.authorId || (item.authorId.startsWith('guest_') && !isAdmin);
  const canEdit = isAuthor && item.status === 'pending';

  // Edit Mode state for author
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title);
  const [editContent, setEditContent] = useState(item.content);
  const [editCategory, setEditCategory] = useState<ConsultationCategory>(item.category);
  const [isSaving, setIsSaving] = useState(false);

  // Admin Reply / Status state
  const [adminStatus, setAdminStatus] = useState<ConsultationStatus>(item.status);
  const [adminReplyText, setAdminReplyText] = useState(item.adminReply || '');
  const [isSubmittingAdmin, setIsSubmittingAdmin] = useState(false);
  const [noticeMsg, setNoticeMsg] = useState<string | null>(null);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '확인 중';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return '일시 정보 없음';
    }
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim() || !editContent.trim()) {
      alert('제목과 내용을 모두 입력해 주세요.');
      return;
    }

    try {
      setIsSaving(true);
      await updateConsultationContent(item.id, {
        title: editTitle,
        content: editContent,
        category: editCategory,
      });
      setIsEditing(false);
      setNoticeMsg('상담 내용이 수정되었습니다.');
    } catch (err) {
      console.error(err);
      alert('수정 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAdminUpdate = async () => {
    try {
      setIsSubmittingAdmin(true);
      await adminRespondConsultation(item.id, {
        status: adminStatus,
        adminReply: adminReplyText,
      });
      setNoticeMsg('답변 및 상태 업데이트가 반영되었습니다.');
    } catch (err) {
      console.error(err);
      alert('답변 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSubmittingAdmin(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('이 상담 요청을 완전히 삭제하시겠습니까?')) return;
    try {
      await deleteConsultation(item.id);
      onClose();
    } catch (err) {
      console.error(err);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        id="consultation-detail-modal"
        className="bg-[#0f172a]/95 backdrop-blur-2xl border border-white/15 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col rounded-[32px] overflow-hidden text-white"
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-400/20">
              {item.category}
            </span>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${
                item.status === 'completed'
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : item.status === 'in_progress'
                  ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                  : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
              }`}
            >
              {item.status === 'completed'
                ? '답변 완료'
                : item.status === 'in_progress'
                ? '상담 진행중'
                : '접수 대기'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {canEdit && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
              >
                수정
              </button>
            )}
            {canEdit && !isEditing && (
              <button
                onClick={handleDelete}
                className="text-xs font-medium text-red-400 hover:text-red-300 px-3 py-1.5 rounded-xl border border-red-500/20 hover:bg-red-500/10 transition-colors"
              >
                삭제
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {noticeMsg && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-2xl text-xs flex items-center justify-between">
              <span>{noticeMsg}</span>
              <button
                onClick={() => setNoticeMsg(null)}
                className="text-emerald-400 hover:text-emerald-200 font-bold ml-2"
              >
                ×
              </button>
            </div>
          )}

          {isEditing ? (
            /* Edit Form */
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  상담 분류
                </label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value as ConsultationCategory)}
                  className="w-full px-4 py-3 rounded-2xl bg-[#0f172a] border border-white/15 text-sm text-white focus:outline-none focus:border-blue-500/50"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id} className="bg-[#0f172a]">
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  제목
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  maxLength={100}
                  className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  상담 요청 내용
                </label>
                <textarea
                  rows={6}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  maxLength={3000}
                  className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500/50 resize-y"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 text-xs font-medium text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-900/20 disabled:opacity-50 transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? '저장 중...' : '수정 완료'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* View Details */
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 leading-snug">
                {item.title}
              </h2>

              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-400 pb-4 border-b border-white/10 mb-5">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-400" />
                  <span>신청인: {item.authorName}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  <span>접수일: {formatDate(item.createdAt)}</span>
                </div>
                {item.updatedAt && (
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>최종 수정: {formatDate(item.updatedAt)}</span>
                  </div>
                )}
              </div>

              {/* Main Content Box with Frosted Glass look */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                  상담 요청 내용
                </h4>
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {item.content}
                </div>
              </div>
            </div>
          )}

          {/* Admin Official Reply Section with Frosted Glass look */}
          {item.adminReply && !isEditing && (
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>전문 상담사 공식 답변</span>
                </div>
                <span className="text-[11px] text-emerald-400/80 px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30">
                  답변 완료
                </span>
              </div>
              <div className="text-sm text-emerald-100 whitespace-pre-wrap leading-relaxed">
                {item.adminReply}
              </div>
            </div>
          )}

          {/* Admin Management Panel (if Admin) */}
          {isAdmin && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold text-blue-300 bg-blue-500/20 px-2.5 py-0.5 rounded-full border border-blue-400/20">
                  관리자 데스크 전용
                </span>
                <span className="text-xs text-slate-400">
                  상태 변경 및 상담 답변 작성
                </span>
              </div>

              <div className="space-y-3.5 bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-xl">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                    상담 처리 상태
                  </label>
                  <select
                    value={adminStatus}
                    onChange={(e) => setAdminStatus(e.target.value as ConsultationStatus)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0f172a] border border-white/15 text-xs text-white focus:outline-none focus:border-blue-500/50"
                  >
                    <option value="pending" className="bg-[#0f172a]">접수 대기 (Pending)</option>
                    <option value="in_progress" className="bg-[#0f172a]">상담 진행중 (In Progress)</option>
                    <option value="completed" className="bg-[#0f172a]">상담 완료 (Completed)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                    전문가 답변 내용
                  </label>
                  <textarea
                    rows={4}
                    value={adminReplyText}
                    onChange={(e) => setAdminReplyText(e.target.value)}
                    placeholder="신청자에게 전달할 상담 답변 내용을 작성하세요."
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 resize-y"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={handleAdminUpdate}
                    disabled={isSubmittingAdmin}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-md shadow-blue-900/20 disabled:opacity-50 transition-all active:scale-[0.99]"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmittingAdmin ? '저장 중...' : '답변 및 상태 저장'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white/[0.02] border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
