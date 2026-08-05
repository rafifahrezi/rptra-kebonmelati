export interface VisitDataFromAPI {
  id: string;
  date: string; // ISO date string
  balita: string | number;
  anak: string | number;
  remaja: string | number;
  dewasa: string | number;
  lansia: string | number;
  createdAt?: string;
  updatedAt?: string;
}

// Tambahkan definisi VisitFormData
export interface VisitFormData {
  date: string;
  time: string;
  balita: string;
  anak: string;
  remaja: string;
  dewasa: string;
  lansia: string;
}

export interface ProcessedVisit {
  id: string;
  date: string;
  balita: number;
  anak: number;
  remaja: number;
  dewasa: number;
  lansia: number;
  total: number;
}

export interface StatsPeriod {
  label: string;
  value: number;
  period: string;
  comparison?: {
    previous: number;
    change: number;
    changePercent: number;
  };
}

export interface RequestData {
  _id?: string;
  tanggalPelaksanaan: string;
  namaPeminjam: string;
  namaInstansi: string;
  alamat: string;
  noTelp: string;
  jumlahPeserta: number;
  waktuPenggunaan: string;
  penggunaanRuangan: string;
  tujuanPenggunaan: string;
  status?: 'pending' | 'scheduled' | 'completed' | 'cancelled';
  createdAt?: string;
  updatedAt?: string;
}
