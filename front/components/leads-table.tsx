'use client';

import { ExternalLink, Instagram, Mail, Star } from 'lucide-react';
import type { Lead } from '@/lib/types';
import { cn } from '@/lib/utils';

interface LeadsTableProps {
  leads: Lead[];
  showSegment?: boolean;
  showDate?: boolean;
  isLoading?: boolean;
}

function StarRating({ rating }: { rating: number | null }) {
  if (rating === null) return <span className="text-muted-foreground">-</span>;
  
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={cn(
            "w-3.5 h-3.5",
            i < fullStars
              ? "fill-yellow-400 text-yellow-400"
              : i === fullStars && hasHalfStar
              ? "fill-yellow-400/50 text-yellow-400"
              : "text-muted-foreground/30"
          )}
        />
      ))}
      <span className="text-xs text-muted-foreground ml-1">({rating.toFixed(1)})</span>
    </div>
  );
}

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <>
      {[...Array(rows)].map((_, i) => (
        <tr key={i}>
          {[...Array(7)].map((_, j) => (
            <td key={j} className="px-4 py-3">
              <div className="h-4 rounded animate-shimmer" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function extractDomain(url: string | null): string {
  if (!url) return '-';
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    return domain.length > 20 ? domain.substring(0, 17) + '...' : domain;
  } catch {
    return url;
  }
}

export function LeadsTable({ leads, showSegment = false, showDate = false, isLoading = false }: LeadsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Nome</th>
            <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Telefone</th>
            <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">E-mail</th>
            <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Instagram</th>
            <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Website</th>
            <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Endereço</th>
            <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Avaliação</th>
            {showSegment && (
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Segmento</th>
            )}
            {showDate && (
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Captado em</th>
            )}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <TableSkeleton rows={5} />
          ) : leads.length === 0 ? (
            <tr>
              <td colSpan={showSegment && showDate ? 9 : showSegment || showDate ? 8 : 7} className="text-center py-8 text-muted-foreground">
                Nenhum lead encontrado
              </td>
            </tr>
          ) : (
            leads.map((lead, index) => (
              <tr 
                key={lead.place_id} 
                className={cn(
                  "border-b border-border/50 transition-colors hover:bg-primary/5",
                  index % 2 === 0 ? "bg-card" : "bg-[#111626]"
                )}
              >
                <td className="px-4 py-3 text-sm font-medium">{lead.name || '-'}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{lead.phone || '-'}</td>
                <td className="px-4 py-3 text-sm">
                  {lead.email ? (
                    <a
                      href={`mailto:${lead.email}`}
                      className="flex items-center gap-1.5 text-primary hover:underline"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[150px]">{lead.email}</span>
                    </a>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  {lead.instagram ? (
                    <a
                      href={lead.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-accent hover:underline"
                    >
                      <Instagram className="w-3.5 h-3.5" />
                      <span>Perfil</span>
                    </a>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  {lead.website ? (
                    <a
                      href={lead.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-primary hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>{extractDomain(lead.website)}</span>
                    </a>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground max-w-[200px] truncate">
                  {lead.address || '-'}
                </td>
                <td className="px-4 py-3 text-sm">
                  <StarRating rating={lead.rating} />
                </td>
                {showSegment && (
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {lead.segment || '-'}
                  </td>
                )}
                {showDate && (
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {lead.created_at 
                      ? new Date(lead.created_at).toLocaleDateString('pt-BR')
                      : '-'
                    }
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// Mobile card view
export function LeadsCards({ leads, showSegment = false, showDate = false, isLoading = false }: LeadsTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4 space-y-3">
            <div className="h-5 w-32 rounded animate-shimmer" />
            <div className="h-4 w-48 rounded animate-shimmer" />
            <div className="h-4 w-24 rounded animate-shimmer" />
          </div>
        ))}
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum lead encontrado
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {leads.map((lead) => (
        <div key={lead.place_id} className="bg-card border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-start justify-between">
            <h3 className="font-medium">{lead.name || 'Sem nome'}</h3>
            <StarRating rating={lead.rating} />
          </div>
          
          {lead.phone && (
            <p className="text-sm text-muted-foreground">{lead.phone}</p>
          )}
          
          <div className="flex flex-wrap gap-2">
            {lead.email && (
              <a
                href={`mailto:${lead.email}`}
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 text-primary text-xs"
              >
                <Mail className="w-3 h-3" />
                E-mail
              </a>
            )}
            {lead.instagram && (
              <a
                href={lead.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-accent/10 text-accent text-xs"
              >
                <Instagram className="w-3 h-3" />
                Instagram
              </a>
            )}
            {lead.website && (
              <a
                href={lead.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 text-primary text-xs"
              >
                <ExternalLink className="w-3 h-3" />
                Website
              </a>
            )}
          </div>
          
          {lead.address && (
            <p className="text-xs text-muted-foreground">{lead.address}</p>
          )}
          
          {(showSegment || showDate) && (
            <div className="flex flex-wrap gap-3 pt-2 border-t border-border text-xs text-muted-foreground">
              {showSegment && lead.segment && (
                <span>Segmento: {lead.segment}</span>
              )}
              {showDate && lead.created_at && (
                <span>Captado: {new Date(lead.created_at).toLocaleDateString('pt-BR')}</span>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
