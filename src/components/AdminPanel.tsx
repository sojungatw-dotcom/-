import React, { useState } from 'react';
import {
  ShieldAlert,
  Search,
  MessageSquare,
  ExternalLink,
  Download,
  CheckCircle2,
  Clock,
  AlertTriangle,
  BarChart3,
  LayoutGrid,
  List,
  Eye,
  Trash2,
  Calendar,
  User,
  ArrowUpDown,
} from 'lucide-react';
import { Consultation } from '../types';
import { ConsultationCard } from './ConsultationCard';

interface AdminPanelProps {
  consultations: Consultation[];
  onSelect: (item: Consultation) => void;
  onEdit?: (item: Consultation) => void;
  onDelete?: (id: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  consultations,
  onSelect,
  onEdit,
  onDelete,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const totalCount = consultations.length;
  const pendingCount = consultations.filter((c) => c.status === 'pending').length;
  const inProgressCount = consultations.filter((c) => c.status === 'in_progress').length;
  const completedCount = consultations.filter((c) => c.status === 'completed').length;
  const responseRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Category counts
  const generalCount = consultations.filter((c) => c.category === 'general').length;
  const serviceCount = consultations.filter((c) => c.category === 'service').length;
  const pricingCount = consultations.filter((c) => c.category === 'pricing').length;
  const otherCount = consultations.filter((c) => c.category === 'other').length;

  const filtered = consultations.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.authorEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || c.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const sortedList = [...filtered].sort((a, b) => {
    const timeA = a.createdAt?.toMillis?.() || (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
    const timeB = b.createdAt?.toMillis?.() || (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
    return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
  });

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '-';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return new Intl.DateTimeFormat('ko-KR', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return '-';
    }
  };

  const exportCSV = () => {
    if (consultations.length === 0) {
      alert('내보낼 상담 데이터가 없습니다.');
      return;
    }

    const headers = ['ID', '상태', '분류', '제목', '요청내용', '신청인', '이메일', '접수일시', '답변내용'];
    const rows = consultations.map((c) => {
      const dateStr = c.createdAt?.toDate ? c.createdAt.toDate().toISOString() : '';
      return [
        `"${c.id}"`,
        `"${c.status}"`,
        `"${c.category}"`,
        `"${(c.title || '').replace(/"/g, '""')}"`,
        `"${(c.content || '').replace(/"/g, '""')}"`,
        `"${(c.authorName || '').replace(/"/g, '""')}"`,
        `"${(c.authorEmail || '').replace(/"/g, '""')}"`,
        `"${dateStr}"`,
        `"${(c.adminReply || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `상담데이터_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Dashboard Top Header & Global Actions */}
      <div className="bg-white/5 backdrop-blur-2xl border border-white/10 text-white rounded-[32px] p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-900/40">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    상담 데이터 통합 관리 대시보드
                  </h2>
                  <span className="text-[11px] font-bold text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    실시간 DB 연동
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  실제 사용자들이 제출한 상담 데이터를 실시간으로 모니터링하고 분석 및 답변을 처리합니다.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white/10 hover:bg-white/15 border border-white/15 text-slate-200 hover:text-white rounded-xl text-xs font-semibold transition-all shadow-sm active:scale-95"
            >
              <Download className="w-4 h-4 text-slate-300" />
              <span>CSV 내보내기</span>
            </button>
            <a
              href="https://console.firebase.google.com/project/basic-throne-kcbh2/firestore/databases/ai-studio-99a9bb77-5a83-4c4c-ba9d-6f60345fae1d/data"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 hover:text-white rounded-xl text-xs font-semibold transition-all shadow-sm active:scale-95"
            >
              <ExternalLink className="w-4 h-4 text-blue-400" />
              <span>Firebase 원본 DB</span>
            </a>
          </div>
        </div>

        {/* 4 Main KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>총 누적 상담</span>
              <BarChart3 className="w-4 h-4 text-slate-400" />
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {totalCount}
              <span className="text-xs font-normal text-slate-400 ml-1">건</span>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-amber-300 text-xs font-medium">
              <span>미처리 접수 대기</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-bold text-amber-300 tracking-tight">
              {pendingCount}
              <span className="text-xs font-normal text-amber-400/80 ml-1">건</span>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-blue-300 text-xs font-medium">
              <span>상담 진행중</span>
              <AlertTriangle className="w-4 h-4 text-blue-400" />
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-bold text-blue-300 tracking-tight">
              {inProgressCount}
              <span className="text-xs font-normal text-blue-400/80 ml-1">건</span>
            </div>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-emerald-300 text-xs font-medium">
              <span>답변 완료율</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-emerald-300 tracking-tight">
                {responseRate}%
              </span>
              <span className="text-xs text-emerald-400/80 font-normal">
                ({completedCount}건 완료)
              </span>
            </div>
          </div>
        </div>

        {/* Category Breakdown Progress Bar */}
        <div className="mt-6 pt-5 border-t border-white/10">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold text-slate-300">상담 분야별 접수 현황</span>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> 일반 ({generalCount})
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-indigo-500" /> 서비스 ({serviceCount})
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> 비용 ({pricingCount})
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-500" /> 기타 ({otherCount})
              </span>
            </div>
          </div>

          <div className="w-full h-2.5 rounded-full bg-white/5 overflow-hidden flex">
            {totalCount > 0 ? (
              <>
                <div style={{ width: `${(generalCount / totalCount) * 100}%` }} className="bg-blue-500 h-full transition-all" />
                <div style={{ width: `${(serviceCount / totalCount) * 100}%` }} className="bg-indigo-500 h-full transition-all" />
                <div style={{ width: `${(pricingCount / totalCount) * 100}%` }} className="bg-amber-500 h-full transition-all" />
                <div style={{ width: `${(otherCount / totalCount) * 100}%` }} className="bg-slate-500 h-full transition-all" />
              </>
            ) : (
              <div className="w-full bg-white/5 h-full" />
            )}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col lg:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="상담 제목, 질문 내용, 신청인 성명, 이메일 검색..."
            className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[#0f172a] border border-white/15 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500/50 cursor-pointer"
          >
            <option value="all" className="bg-[#0f172a]">전체 상태 ({totalCount})</option>
            <option value="pending" className="bg-[#0f172a]">접수 대기 ({pendingCount})</option>
            <option value="in_progress" className="bg-[#0f172a]">상담 진행중 ({inProgressCount})</option>
            <option value="completed" className="bg-[#0f172a]">답변 완료 ({completedCount})</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-[#0f172a] border border-white/15 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500/50 cursor-pointer"
          >
            <option value="all" className="bg-[#0f172a]">전체 분야</option>
            <option value="general" className="bg-[#0f172a]">일반 상담</option>
            <option value="service" className="bg-[#0f172a]">서비스 문의</option>
            <option value="pricing" className="bg-[#0f172a]">비용 / 견적</option>
            <option value="other" className="bg-[#0f172a]">기타 문의</option>
          </select>

          <button
            onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
            className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>{sortOrder === 'desc' ? '최신순' : '과거순'}</span>
          </button>

          {/* View Mode Switch */}
          <div className="flex items-center bg-white/5 border border-white/10 p-0.5 rounded-xl">
            <button
              onClick={() => setViewMode('table')}
              title="테이블 뷰"
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              title="카드 뷰"
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Display: Table or Grid */}
      {sortedList.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-12 text-center">
          <MessageSquare className="w-10 h-10 text-slate-500 mx-auto mb-2" />
          <h3 className="text-base font-semibold text-slate-300">해당 조건의 상담 내역이 없습니다</h3>
          <p className="text-xs text-slate-500 mt-1">검색어나 필터 조건을 변경해 보세요.</p>
        </div>
      ) : viewMode === 'table' ? (
        /* Data Table View */
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[28px] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-white/5 border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-4 px-4 sm:px-6">접수일시</th>
                  <th className="py-4 px-4">신청인</th>
                  <th className="py-4 px-3">분류</th>
                  <th className="py-4 px-4 min-w-[200px]">상담 제목 및 내용 요약</th>
                  <th className="py-4 px-3">상태</th>
                  <th className="py-4 px-4 text-right">관리 작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {sortedList.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-white/[0.04] transition-colors cursor-pointer group"
                    onClick={() => onSelect(item)}
                  >
                    <td className="py-4 px-4 sm:px-6 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>{formatDate(item.createdAt)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-medium text-white">
                        <User className="w-3.5 h-3.5 text-blue-400" />
                        <span>{item.authorName || '익명'}</span>
                      </div>
                      {item.authorEmail && (
                        <div className="text-[11px] text-slate-500 truncate max-w-[140px]">
                          {item.authorEmail}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-3 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-lg bg-white/5 text-blue-300 border border-white/10 text-[11px] font-medium">
                        {item.category === 'general'
                          ? '일반 상담'
                          : item.category === 'service'
                          ? '서비스 문의'
                          : item.category === 'pricing'
                          ? '비용/견적'
                          : '기타 문의'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-white group-hover:text-blue-300 transition-colors line-clamp-1">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {item.content}
                      </div>
                      {item.adminReply && (
                        <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span className="truncate max-w-[240px]">답변: {item.adminReply}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${
                          item.status === 'completed'
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : item.status === 'in_progress'
                            ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                            : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.status === 'completed'
                              ? 'bg-emerald-400'
                              : item.status === 'in_progress'
                              ? 'bg-blue-400'
                              : 'bg-amber-400'
                          }`}
                        />
                        <span>
                          {item.status === 'completed'
                            ? '답변 완료'
                            : item.status === 'in_progress'
                            ? '상담 진행중'
                            : '접수 대기'}
                        </span>
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => onSelect(item)}
                          className="p-1.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 hover:text-white rounded-lg border border-blue-500/30 transition-colors"
                          title="상세보기 및 답변 작성"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {onDelete && (
                          <button
                            onClick={() => onDelete(item.id)}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500/30 text-red-400 hover:text-red-200 rounded-lg border border-red-500/20 transition-colors"
                            title="상담 삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedList.map((item) => (
            <ConsultationCard
              key={item.id}
              item={item}
              onSelect={onSelect}
              onEdit={onEdit}
              onDelete={onDelete}
              canEdit={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};
