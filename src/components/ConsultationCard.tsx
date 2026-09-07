import React from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Trash2,
  Edit3,
  ChevronRight,
} from 'lucide-react';
import { Consultation, ConsultationCategory, ConsultationStatus } from '../types';

interface ConsultationCardProps {
  item: Consultation;
  onSelect: (item: Consultation) => void;
  onEdit?: (item: Consultation) => void;
  onDelete?: (id: string) => void;
  canEdit?: boolean;
}

const CATEGORY_LABELS: Record<ConsultationCategory, { label: string; color: string }> = {
  general: { label: '일반 상담', color: 'bg-white/10 text-slate-300 border-white/15' },
  service: { label: '서비스 문의', color: 'bg-sky-500/15 text-sky-300 border-sky-500/20' },
  pricing: { label: '비용 / 견적', color: 'bg-violet-500/15 text-violet-300 border-violet-500/20' },
  other: { label: '기타 문의', color: 'bg-amber-500/15 text-amber-300 border-amber-500/20' },
};

const STATUS_CONFIG: Record<
  ConsultationStatus,
  { label: string; badge: string; icon: React.ReactNode }
> = {
  pending: {
    label: '접수 대기',
    badge: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    icon: <Clock className="w-3.5 h-3.5 text-amber-400" />,
  },
  in_progress: {
    label: '상담 진행중',
    badge: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
    icon: <AlertCircle className="w-3.5 h-3.5 text-blue-400" />,
  },
  completed: {
    label: '답변 완료',
    badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20 shadow-[0_0_8px_rgba(34,197,94,0.15)]',
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
  },
};

export const ConsultationCard: React.FC<ConsultationCardProps> = ({
  item,
  onSelect,
  onEdit,
  onDelete,
  canEdit = false,
}) => {
  const cat = CATEGORY_LABELS[item.category] || CATEGORY_LABELS.general;
  const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '방금 전';
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
      return '일시 확인 중';
    }
  };

  return (
    <div
      id={`consultation-card-${item.id}`}
      className="bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 hover:bg-white/[0.08] rounded-2xl p-5 shadow-lg flex flex-col justify-between group transition-all"
    >
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-medium px-2.5 py-0.5 rounded-lg border ${cat.color}`}
            >
              {cat.label}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-lg border ${status.badge}`}
            >
              {status.icon}
              {status.label}
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            {formatDate(item.createdAt)}
          </span>
        </div>

        {/* Title & Preview */}
        <h3
          onClick={() => onSelect(item)}
          className="font-semibold text-base text-slate-100 group-hover:text-blue-300 transition-colors cursor-pointer line-clamp-1 mb-1.5"
        >
          {item.title}
        </h3>
        <p
          onClick={() => onSelect(item)}
          className="text-xs text-slate-400 line-clamp-2 cursor-pointer leading-relaxed mb-3"
        >
          {item.content}
        </p>

        {/* Admin Reply Highlight preview */}
        {item.adminReply && (
          <div className="mt-2 mb-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2.5 backdrop-blur-xs">
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-200 line-clamp-1">
              <span className="font-semibold mr-1">전문가 답변:</span>
              {item.adminReply}
            </div>
          </div>
        )}
      </div>

      {/* Footer & Actions */}
      <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span>작성자: {item.authorName}</span>
        </div>

        <div className="flex items-center gap-1">
          {canEdit && item.status === 'pending' && onEdit && (
            <button
              onClick={() => onEdit(item)}
              title="상담 수정"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}
          {canEdit && item.status === 'pending' && onDelete && (
            <button
              onClick={() => {
                if (window.confirm('정말 이 상담 요청을 취소/삭제하시겠습니까?')) {
                  onDelete(item.id);
                }
              }}
              title="상담 삭제"
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => onSelect(item)}
            className="inline-flex items-center gap-0.5 px-3 py-1 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 font-semibold rounded-lg transition-colors"
          >
            <span>상세보기</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
