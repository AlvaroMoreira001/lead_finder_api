"use client";

import { useState } from "react";
import {
  Search,
  CheckCircle,
  SkipForward,
  ClipboardList,
  Download,
  Rocket,
  Minus,
  Plus,
} from "lucide-react";
import { DashboardWrapper } from "@/components/layout/dashboard-wrapper";
import { PageHeader } from "@/components/layout/page-header";
import { MetricCard } from "@/components/ui/metric-card";
import { LeadsTable, LeadsCards } from "@/components/leads-table";
import { api } from "@/lib/api";
import type { Lead, SearchResponse } from "@/lib/types";
import { cn } from "@/lib/utils";

function SearchPageContent() {
  const [query, setQuery] = useState("");
  const [maxResults, setMaxResults] = useState(20);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<{
    leads: Lead[];
    newCount: number;
    skipped: number;
    total: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setResults(null);
    setError(null);

    try {
      const response = await api.fetch<SearchResponse>("/api/leads/search", {
        method: "POST",
        body: JSON.stringify({ query, max_results: maxResults }),
      });

      setResults({
        leads: response.new_leads,
        newCount: response.new_leads.length,
        skipped: response.skipped,
        total: response.total,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro na busca");
    } finally {
      setIsSearching(false);
    }
  };

  const handleExport = () => {
    if (!results?.leads.length) return;
    const params = new URLSearchParams({ query });
    window.open(`${api.baseUrl}/api/leads/export?${params}`, "_blank");
  };

  return (
    <div className="space-y-6">
      <PageHeader />

      <div className="bg-card border border-border rounded-xl p-6">
        <form onSubmit={handleSearch} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="query" className="text-sm font-medium text-foreground">
              Segmento / tipo de empresa
            </label>
            <input
              id="query"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ex: academia Sao Paulo"
              disabled={isSearching}
              className={cn(
                "w-full px-4 py-3 rounded-lg bg-input border border-border",
                "text-foreground placeholder:text-muted-foreground",
                "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
                "transition-all disabled:opacity-50"
              )}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="maxResults" className="text-sm font-medium text-foreground">
              Quantidade de leads (max. 60)
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMaxResults((p) => Math.max(1, p - 1))}
                disabled={isSearching || maxResults <= 1}
                className={cn(
                  "p-2.5 rounded-lg border border-border bg-input",
                  "hover:border-primary hover:text-primary transition-colors",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                id="maxResults"
                type="number"
                value={maxResults}
                onChange={(e) =>
                  setMaxResults(Math.min(60, Math.max(1, parseInt(e.target.value) || 1)))
                }
                min={1}
                max={60}
                disabled={isSearching}
                className={cn(
                  "w-20 px-3 py-2.5 rounded-lg bg-input border border-border text-center",
                  "text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
                  "transition-all disabled:opacity-50"
                )}
              />
              <button
                type="button"
                onClick={() => setMaxResults((p) => Math.min(60, p + 1))}
                disabled={isSearching || maxResults >= 60}
                className={cn(
                  "p-2.5 rounded-lg border border-border bg-input",
                  "hover:border-primary hover:text-primary transition-colors",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSearching || !query.trim()}
            className={cn(
              "w-full py-3.5 px-4 rounded-lg font-heading font-bold",
              "bg-gradient-to-r from-primary to-[#7c6cf7] text-primary-foreground",
              "hover:opacity-90 hover:-translate-y-0.5 transition-all",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
              "flex items-center justify-center gap-2"
            )}
          >
            <Rocket className="w-5 h-5" />
            {isSearching ? "Buscando..." : "Buscar Leads"}
          </button>
        </form>

        {isSearching && (
          <div className="mt-6 space-y-2">
            <div className="h-2 bg-input rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-accent animate-pulse w-full" />
            </div>
            <p className="text-sm text-primary text-center">
              Buscando e enriquecendo leads... isso pode levar alguns instantes.
            </p>
          </div>
        )}

        {error && (
          <p className="mt-4 text-sm text-destructive text-center">{error}</p>
        )}
      </div>

      {results && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard icon={CheckCircle} value={results.newCount} label="Novos leads" variant="primary" staggerIndex={0} />
            <MetricCard icon={SkipForward} value={results.skipped} label="Ja existentes" variant="secondary" staggerIndex={1} />
            <MetricCard icon={ClipboardList} value={results.total} label="Total buscados" variant="muted" staggerIndex={2} />
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border flex items-center gap-3">
              <Search className="w-5 h-5 text-primary" />
              <h2 className="font-heading font-bold text-lg">Resultados</h2>
              <div className="flex-1 h-px bg-border ml-2" />
            </div>

            <div className="hidden md:block">
              <LeadsTable leads={results.leads} />
            </div>
            <div className="md:hidden p-4">
              <LeadsCards leads={results.leads} />
            </div>

            <div className="p-4 border-t border-border">
              <button
                onClick={handleExport}
                disabled={!results.leads.length}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2.5 rounded-lg",
                  "border border-border text-muted-foreground",
                  "hover:border-primary hover:text-primary transition-colors",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                <Download className="w-4 h-4" />
                Baixar Excel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <DashboardWrapper>
      <SearchPageContent />
    </DashboardWrapper>
  );
}
