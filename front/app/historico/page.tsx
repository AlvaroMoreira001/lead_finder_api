'use client';

import { useState, useEffect, useCallback } from 'react';
import { FolderOpen, Filter, Download, ClipboardList, Layers, MapPin, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { DashboardWrapper } from '@/components/layout/dashboard-wrapper';
import { PageHeader } from '@/components/layout/page-header';
import { MetricCard } from '@/components/ui/metric-card';
import { LeadsTable, LeadsCards } from '@/components/leads-table';
import { api } from '@/lib/api';
import type { Lead, HistoryResponse } from '@/lib/types';
import { cn } from '@/lib/utils';

const ITEMS_PER_PAGE = 20;

function HistoryPageContent() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [segments, setSegments] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedSegment, setSelectedSegment] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedSegment !== 'all') params.append('segment', selectedSegment);
      if (selectedCity !== 'all') params.append('city', selectedCity);
      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);

      const response = await api.fetch<HistoryResponse>(`/api/leads?${params}`);
      setLeads(response.leads);
      setSegments(response.segments);
      setCities(response.cities);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedSegment, selectedCity, dateFrom, dateTo]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchLeads();
    }, 400);
    return () => clearTimeout(timer);
  }, [selectedSegment, selectedCity, dateFrom, dateTo, fetchLeads]);

  const clearFilters = () => {
    setSelectedSegment('all');
    setSelectedCity('all');
    setDateFrom('');
    setDateTo('');
  };

  const handleExport = async () => {
    const params = new URLSearchParams();
    if (selectedSegment !== "all") params.append("segment", selectedSegment);
    if (selectedCity !== "all") params.append("city", selectedCity);
    if (dateFrom) params.append("date_from", dateFrom);
    if (dateTo) params.append("date_to", dateTo);
    const response = await fetch(`${api.baseUrl}/api/leads/export?${params}`, {
      headers: api.getHeaders(),
    });
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-filtrados.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalPages = Math.ceil(leads.length / ITEMS_PER_PAGE);
  const paginatedLeads = leads.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const uniqueSegments = [...new Set(leads.map(l => l.segment).filter(Boolean))].length;
  const uniqueCities = [...new Set(leads.map(l => l.city).filter(Boolean))].length;
  const hasActiveFilters = selectedSegment !== 'all' || selectedCity !== 'all' || dateFrom || dateTo;

  return (
    <div className="space-y-6">
      <PageHeader />

      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filtros</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Segmento</label>
            <select
              value={selectedSegment}
              onChange={(e) => setSelectedSegment(e.target.value)}
              className={cn(
                "w-full px-4 py-2.5 rounded-lg bg-input border border-border",
                "text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
                "transition-all appearance-none cursor-pointer"
              )}
            >
              <option value="all">Todos</option>
              {segments.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Cidade</label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className={cn(
                "w-full px-4 py-2.5 rounded-lg bg-input border border-border",
                "text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
                "transition-all appearance-none cursor-pointer"
              )}
            >
              <option value="all">Todas</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">De</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className={cn(
                "w-full px-4 py-2.5 rounded-lg bg-input border border-border",
                "text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
                "transition-all"
              )}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Até</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className={cn(
                "w-full px-4 py-2.5 rounded-lg bg-input border border-border",
                "text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
                "transition-all"
              )}
            />
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={clearFilters}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-lg",
                "border border-border text-muted-foreground",
                "hover:border-destructive hover:text-destructive transition-colors"
              )}
            >
              <X className="w-4 h-4" />
              Limpar filtros
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard icon={ClipboardList} value={leads.length} label="Total filtrado" variant="primary" staggerIndex={0} />
        <MetricCard icon={Layers} value={uniqueSegments} label="Segmentos únicos" variant="secondary" staggerIndex={1} />
        <MetricCard icon={MapPin} value={uniqueCities} label="Cidades únicas" variant="muted" staggerIndex={2} />
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-3">
          <FolderOpen className="w-5 h-5 text-primary" />
          <h2 className="font-heading font-bold text-lg">Histórico de Leads</h2>
          <div className="flex-1 h-px bg-border ml-2" />
        </div>

        <div className="hidden md:block">
          <LeadsTable leads={paginatedLeads} showSegment showDate isLoading={isLoading} />
        </div>
        <div className="md:hidden p-4">
          <LeadsCards leads={paginatedLeads} showSegment showDate isLoading={isLoading} />
        </div>

        <div className="p-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={handleExport}
            disabled={leads.length === 0}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2.5 rounded-lg",
              "border border-border text-muted-foreground",
              "hover:border-primary hover:text-primary transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <Download className="w-4 h-4" />
            Baixar Excel filtrado
          </button>

          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={cn(
                  "p-2 rounded-lg border border-border",
                  "hover:border-primary hover:text-primary transition-colors",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-muted-foreground px-3">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={cn(
                  "p-2 rounded-lg border border-border",
                  "hover:border-primary hover:text-primary transition-colors",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  return (
    <DashboardWrapper>
      <HistoryPageContent />
    </DashboardWrapper>
  );
}
