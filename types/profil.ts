export interface GambaranUmum {
  _id: string;
  deskripsi: string;
  gambar: string; // ID GridFS, "" jika kosong
  createdAt: string;
  updatedAt: string;
}

export interface Pegawai {
  _id: string;
  nama: string;
  jabatan: string;
  foto: string; // ID GridFS, "" jika kosong
  urutan: number;
  createdAt: string;
  updatedAt: string;
}

// payload form admin (POST/PUT)
export type GambaranUmumInput = Pick<GambaranUmum, "deskripsi" | "gambar">;
export type PegawaiInput = Pick<
  Pegawai,
  "nama" | "jabatan" | "foto" | "urutan"
>;
