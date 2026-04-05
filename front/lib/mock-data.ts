import type { Lead, SearchResponse, HistoryResponse } from './types';

export const mockLeads: Lead[] = [
  {
    id: 1,
    place_id: "abc123",
    name: "Academia FitLife",
    phone: "(11) 98765-4321",
    email: "contato@fitlife.com.br",
    instagram: "https://instagram.com/fitlife",
    website: "https://fitlife.com.br",
    address: "Rua das Flores, 123 - Centro, São Paulo - SP",
    city: "São Paulo",
    rating: 4.5,
    segment: "academia sao paulo",
    created_at: "2024-03-15T10:30:00"
  },
  {
    id: 2,
    place_id: "def456",
    name: "Studio Corpo em Movimento",
    phone: "(11) 91234-5678",
    email: null,
    instagram: "https://instagram.com/corpoemovimento",
    website: "https://corpoemovimento.com.br",
    address: "Av. Paulista, 900 - Bela Vista, São Paulo - SP",
    city: "São Paulo",
    rating: 4.8,
    segment: "academia sao paulo",
    created_at: "2024-03-15T11:00:00"
  },
  {
    id: 3,
    place_id: "ghi789",
    name: "Restaurante Bom Sabor",
    phone: "(12) 3456-7890",
    email: "reservas@bomsabor.com.br",
    instagram: null,
    website: null,
    address: "Rua XV de Novembro, 45 - Centro, Jacareí - SP",
    city: "Jacareí",
    rating: 4.2,
    segment: "restaurante jacarei",
    created_at: "2024-03-16T09:00:00"
  },
  {
    id: 4,
    place_id: "jkl012",
    name: "Padaria Pão Quente",
    phone: "(11) 3333-4444",
    email: "contato@paoquente.com.br",
    instagram: "https://instagram.com/paoquente",
    website: "https://paoquente.com.br",
    address: "Rua Augusta, 500 - Consolação, São Paulo - SP",
    city: "São Paulo",
    rating: 4.7,
    segment: "padaria sao paulo",
    created_at: "2024-03-17T08:00:00"
  },
  {
    id: 5,
    place_id: "mno345",
    name: "Clínica Saúde Total",
    phone: "(12) 2222-3333",
    email: "agendamento@saudetotal.com.br",
    instagram: "https://instagram.com/saudetotal",
    website: "https://saudetotal.com.br",
    address: "Av. Brasil, 200 - Centro, Jacareí - SP",
    city: "Jacareí",
    rating: 4.9,
    segment: "clinica jacarei",
    created_at: "2024-03-18T14:00:00"
  },
  {
    id: 6,
    place_id: "pqr678",
    name: "Pet Shop Amigo Fiel",
    phone: "(11) 5555-6666",
    email: null,
    instagram: "https://instagram.com/amigofiel",
    website: null,
    address: "Rua Oscar Freire, 300 - Jardins, São Paulo - SP",
    city: "São Paulo",
    rating: 4.3,
    segment: "pet shop sao paulo",
    created_at: "2024-03-19T10:30:00"
  },
  {
    id: 7,
    place_id: "stu901",
    name: "Oficina Mecânica Irmãos Silva",
    phone: "(12) 7777-8888",
    email: "orcamento@irmaossilva.com.br",
    instagram: null,
    website: "https://irmaossilva.com.br",
    address: "Av. Industrial, 1500 - Distrito Industrial, Jacareí - SP",
    city: "Jacareí",
    rating: 4.1,
    segment: "oficina mecanica jacarei",
    created_at: "2024-03-20T09:00:00"
  },
  {
    id: 8,
    place_id: "vwx234",
    name: "Salão de Beleza Glamour",
    phone: "(11) 9999-0000",
    email: "agendamento@glamour.com.br",
    instagram: "https://instagram.com/glamoursalao",
    website: "https://glamour.com.br",
    address: "Rua Haddock Lobo, 800 - Cerqueira César, São Paulo - SP",
    city: "São Paulo",
    rating: 4.6,
    segment: "salao de beleza sao paulo",
    created_at: "2024-03-21T11:00:00"
  }
];

// Simula delay de rede
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
  async login(email: string, password: string): Promise<{ access_token: string; token_type: string }> {
    await delay(800);
    if (email && password.length >= 4) {
      return {
        access_token: 'mock_jwt_token_' + Date.now(),
        token_type: 'bearer'
      };
    }
    throw new Error('Credenciais inválidas');
  },
  
  async register(email: string, password: string): Promise<{ message: string }> {
    await delay(800);
    if (email && password.length >= 4) {
      return { message: 'Conta criada com sucesso!' };
    }
    throw new Error('Dados inválidos');
  },
  
  async searchLeads(query: string, maxResults: number, onProgress?: (current: number, total: number) => void): Promise<SearchResponse> {
    const total = Math.min(maxResults, mockLeads.length);
    
    // Simula progresso
    for (let i = 0; i <= total; i++) {
      await delay(200);
      onProgress?.(i, total);
    }
    
    const filteredLeads = mockLeads.slice(0, total);
    const skipped = Math.floor(Math.random() * 3);
    
    return {
      new_leads: filteredLeads,
      skipped,
      total
    };
  },
  
  async getHistory(filters: {
    segment?: string;
    city?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<HistoryResponse> {
    await delay(500);
    
    let filteredLeads = [...mockLeads];
    
    if (filters.segment && filters.segment !== 'all') {
      filteredLeads = filteredLeads.filter(lead => 
        lead.segment?.toLowerCase().includes(filters.segment!.toLowerCase())
      );
    }
    
    if (filters.city && filters.city !== 'all') {
      filteredLeads = filteredLeads.filter(lead => 
        lead.city?.toLowerCase() === filters.city!.toLowerCase()
      );
    }
    
    if (filters.date_from) {
      const fromDate = new Date(filters.date_from);
      filteredLeads = filteredLeads.filter(lead => 
        lead.created_at && new Date(lead.created_at) >= fromDate
      );
    }
    
    if (filters.date_to) {
      const toDate = new Date(filters.date_to);
      toDate.setHours(23, 59, 59);
      filteredLeads = filteredLeads.filter(lead => 
        lead.created_at && new Date(lead.created_at) <= toDate
      );
    }
    
    const segments = [...new Set(mockLeads.map(l => l.segment).filter(Boolean))] as string[];
    const cities = [...new Set(mockLeads.map(l => l.city).filter(Boolean))] as string[];
    
    return {
      leads: filteredLeads,
      total: filteredLeads.length,
      segments,
      cities
    };
  },
  
  exportToExcel(leads: Lead[], filename: string): void {
    // Simula download criando um CSV
    const headers = ['Nome', 'Telefone', 'E-mail', 'Instagram', 'Website', 'Endereço', 'Cidade', 'Avaliação', 'Segmento', 'Data de Captação'];
    const rows = leads.map(lead => [
      lead.name || '',
      lead.phone || '',
      lead.email || '',
      lead.instagram || '',
      lead.website || '',
      lead.address || '',
      lead.city || '',
      lead.rating?.toString() || '',
      lead.segment || '',
      lead.created_at ? new Date(lead.created_at).toLocaleDateString('pt-BR') : ''
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  }
};
