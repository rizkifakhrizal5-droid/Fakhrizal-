import { Agency, SurveyResponse } from '../types/survey';

export const DEFAULT_AGENCIES: Agency[] = [
  { id: 'inst-1', name: 'Kejaksaan Negeri', category: 'Pelayanan Publik', active: true, order: 1 },
  { id: 'inst-2', name: 'Taspen', category: 'Pelayanan Publik', active: true, order: 2 },
  { id: 'inst-3', name: 'Dinas Perdagangan, Koperasi Dan Usaha Mikro', category: 'Pelayanan Publik', active: true, order: 3 },
  { id: 'inst-4', name: 'Dinas Perindustrian', category: 'Pelayanan Publik', active: true, order: 4 },
  { id: 'inst-5', name: 'Dinas Sosial', category: 'Pelayanan Publik', active: true, order: 5 },
  { id: 'inst-6', name: 'Kantor Pelayanan Pajak Pratama', category: 'Pelayanan Publik', active: true, order: 6 },
  { id: 'inst-7', name: 'Polres', category: 'Pelayanan Publik', active: true, order: 7 },
  { id: 'inst-8', name: 'Samsat', category: 'Pelayanan Publik', active: true, order: 8 },
  { id: 'inst-9', name: 'Bank Jatim', category: 'Pelayanan Publik', active: true, order: 9 },
  { id: 'inst-10', name: 'Bank Bri', category: 'Pelayanan Publik', active: true, order: 10 },
  { id: 'inst-11', name: 'Bank Perkreditan Rakyat', category: 'Pelayanan Publik', active: true, order: 11 },
  { id: 'inst-12', name: 'Perusahaan Daerah Air Minum', category: 'Pelayanan Publik', active: true, order: 12 },
  { id: 'inst-13', name: 'Perusahaan Listrik Negara', category: 'Pelayanan Publik', active: true, order: 13 },
  { id: 'inst-14', name: 'Kementerian Agraria Dan Tata Ruang Atau Badan Pertanahan Nasional', category: 'Pelayanan Publik', active: true, order: 14 },
  { id: 'inst-15', name: 'Kementerian Agama Republik Indonesia', category: 'Pelayanan Publik', active: true, order: 15 },
  { id: 'inst-16', name: 'Badan Penyelenggara Jaminan Sosial Ketenagakerjaan', category: 'Pelayanan Publik', active: true, order: 16 },
  { id: 'inst-17', name: 'Badan Penyelenggara Jaminan Sosial Kesehatan', category: 'Pelayanan Publik', active: true, order: 17 },
  { id: 'inst-18', name: 'Dinas Kebudayaan Dan Pariwisata', category: 'Pelayanan Publik', active: true, order: 18 },
  { id: 'inst-19', name: 'Dinas Lingkungan Hidup', category: 'Pelayanan Publik', active: true, order: 19 },
  { id: 'inst-20', name: 'Dinas Pekerjaan Umum Bina Marga', category: 'Pelayanan Publik', active: true, order: 20 },
  { id: 'inst-21', name: 'Dinas Perumahan, Kawasan Permukiman Dan Cipta Karya', category: 'Pelayanan Publik', active: true, order: 21 },
  { id: 'inst-22', name: 'Badan Pendapatan Daerah', category: 'Pelayanan Publik', active: true, order: 22 },
  { id: 'inst-23', name: 'Dinas Pendidikan Dan Kebudayaan', category: 'Pelayanan Publik', active: true, order: 23 },
  { id: 'inst-24', name: 'Pengadilan Negeri', category: 'Pelayanan Publik', active: true, order: 24 },
  { id: 'inst-25', name: 'Dinas Pekerjaan Umum Sumber Daya Air', category: 'Pelayanan Publik', active: true, order: 25 },
  { id: 'inst-26', name: 'Dinas Perhubungan', category: 'Pelayanan Publik', active: true, order: 26 },
  { id: 'inst-27', name: 'Dinas Peternakan Dan Perikanan', category: 'Pelayanan Publik', active: true, order: 27 },
  { id: 'inst-28', name: 'Pengadilan Agama', category: 'Pelayanan Publik', active: true, order: 28 },
  { id: 'inst-29', name: 'Dinas Kesehatan', category: 'Pelayanan Publik', active: true, order: 29 },
  { id: 'inst-30', name: 'Dewan Kerajinan Nasional Daerah', category: 'Pelayanan Publik', active: true, order: 30 },
  { id: 'inst-31', name: 'Dinas Kependudukan Dan Pencatatan Sipil', category: 'Pelayanan Publik', active: true, order: 31 },
  { id: 'inst-32', name: 'Dinas Penanaman Modal Dan Pelayanan Terpadu Satu Pintu', category: 'Pelayanan Publik', active: true, order: 32 }
];

export const QUICK_SUGGESTIONS = [
  '+ Inovasi pelayanan di loket sangat terasa, proses serba cepat dan ramah.',
  '+ Petugas sangat ramah, sopan, dan sigap membantu asistensi pengisian.',
  '+ Proses pelayanan di MPP Bojonegoro sangat cepat dan tepat waktu.',
  '+ Gedung dan ruang tunggu sangat nyaman, bersih, sejuk dan ber-AC.',
  '+ Informasi persyaratan dan alur layanan terpadu sangat jelas dan transparan.',
  '+ Mohon waktu antrean verifikasi di loket tetap dipertahankan kecepatannya saat jam padat.',
  '+ Layanan luar biasa mempermudah pengurusan perizinan dan dokumen pemohon!',
  '+ Ruang laktasi, pojok baca, dan fasilitas disabilitas sangat representatif.',
  '+ Loket terpadu sangat menghemat waktu, tidak perlu keliling kantor dinas.',
  '+ Sangat puas dengan transparansi biaya tanpa ada pungli sepeser pun.',
  '+ Petugas memberikan penjelasan dengan sabar dan komunikatif.',
  '+ Sistem antrean digital tertib dan teratur memudahkan pemohon.',
  '+ Fasilitas parkir luas dan petugas keamanan sangat membantu.',
  '+ Integrasi loket lintas instansi sangat efektif dan efisien.',
  '+ Pelayanan publik prima yang patut dicontoh dan terus dipertahankan.',
  '+ Prosedur sangat ringkas, berkas selesai lebih awal dari estimasi waktu.'
];

export const SAMPLE_NAMES = [
  'Lilik Indrawati',
  'Ika Yuliana',
  'Lukman Hakim',
  'Yoga Prasetya',
  'Budi Santoso',
  'Siti Nurhaliza',
  'Ahmad Fauzi',
  'Dewi Lestari',
  'Rian Kurniawan',
  'Eko Purwanto',
  'Wahyu Hidayat',
  'Rina Marlina',
  'Bambang Susilo',
  'Tri Wahyuni',
  'Agus Setiawan'
];

export function generateSeedSurveys(): SurveyResponse[] {
  const currentYear = 2026;
  const currentMonth = 9; // October (0-indexed)
  
  const mockCitizens = [
    { name: 'Lilik Indrawati', gender: 'Perempuan', age: '36 - 45 Tahun', edu: 'Sarjana (S1)', rating: 5, agency: 'Dinas Penanaman Modal Dan Pelayanan Terpadu Satu Pintu', text: 'Inovasi pelayanan di loket sangat terasa, proses serba cepat dan ramah.', day: 2, hour: 16, min: 4 },
    { name: 'Ika Yuliana', gender: 'Perempuan', age: '36 - 45 Tahun', edu: 'SMA/SMK Sederajat', rating: 4, agency: 'Dinas Kependudukan Dan Pencatatan Sipil', text: 'Sangat terbantu dengan keberadaan loket terpadu ini, birokrasi terpangkas rapi.', day: 2, hour: 14, min: 30 },
    { name: 'Lukman Hakim', gender: 'Laki-laki', age: '20 - 35 Tahun', edu: 'Sarjana (S1)', rating: 4, agency: 'Dinas Kependudukan Dan Pencatatan Sipil', text: 'Petugas memberikan asistensi pengisian formulir dengan penuh kesabaran.', day: 2, hour: 14, min: 30 },
    { name: 'Yoga Prasetya', gender: 'Laki-laki', age: '20 - 35 Tahun', edu: 'Diploma (D1-D4)', rating: 5, agency: 'Dinas Penanaman Modal Dan Pelayanan Terpadu Satu Pintu', text: 'Petugas melayani dengan senyum dan memberikan penjelasan syarat yang tuntas.', day: 2, hour: 11, min: 15 },
    { name: 'Budi Santoso', gender: 'Laki-laki', age: '46 - 60 Tahun', edu: 'SMA/SMK Sederajat', rating: 5, agency: 'Samsat', text: 'Bayar pajak tahunan 5 menit langsung selesai di loket Samsat MPP.', day: 2, hour: 10, min: 45 },
    { name: 'Siti Rahmawati', gender: 'Perempuan', age: '20 - 35 Tahun', edu: 'Sarjana (S1)', rating: 5, agency: 'Badan Penyelenggara Jaminan Sosial Kesehatan', text: 'Pelayanan mutasi faskes BPJS sangat sigap dan ramah.', day: 2, hour: 9, min: 20 },
    { name: 'Anonim', gender: 'Tidak Ingin Memberitahu', age: 'Tidak Ingin Memberitahu', edu: 'Tidak Ingin Memberitahu', rating: 5, agency: 'Polres', text: 'Perpanjangan SIM cepat tanpa kendala, tempat tunggu sejuk dan nyaman.', day: 2, hour: 8, min: 55, isAnon: true },
    { name: 'Ahmad Fauzi', gender: 'Laki-laki', age: '36 - 45 Tahun', edu: 'Sarjana (S1)', rating: 5, agency: 'Kementerian Agraria Dan Tata Ruang Atau Badan Pertanahan Nasional', text: 'Konsultasi sertifikat tanah dilayani dengan transparan dan jelas.', day: 1, hour: 15, min: 10 },
    { name: 'Dewi Lestari', gender: 'Perempuan', age: '20 - 35 Tahun', edu: 'Sarjana (S1)', rating: 5, agency: 'Dinas Sosial', text: 'Cek data bantuan sosial sangat informatif dan dibantu petugas front-office.', day: 1, hour: 13, min: 40 },
    { name: 'Rian Pratama', gender: 'Laki-laki', age: '20 - 35 Tahun', edu: 'SMA/SMK Sederajat', rating: 4, agency: 'Dinas Perindustrian', text: 'Konsultasi izin industri selesai dalam hitungan menit.', day: 1, hour: 11, min: 5 },
    { name: 'Hartono', gender: 'Laki-laki', age: '46 - 60 Tahun', edu: 'Sarjana (S1)', rating: 5, agency: 'Kantor Pelayanan Pajak Pratama', text: 'Aktivasi EFIN dan konsultasi SPT lancar dan ramah.', day: 1, hour: 10, min: 22 },
    { name: 'Nurul Hidayah', gender: 'Perempuan', age: '20 - 35 Tahun', edu: 'Diploma (D1-D4)', rating: 5, agency: 'Kejaksaan Negeri', text: 'Pengambilan barang bukti dan bayar denda tilang sangat tertib.', day: 1, hour: 9, min: 15 },
    { name: 'Agus Wibowo', gender: 'Laki-laki', age: '36 - 45 Tahun', edu: 'Sarjana (S1)', rating: 4, agency: 'Taspen', text: 'Pengurusan berkas pensiun orang tua dilayani dengan hormat dan ramah.', day: 1, hour: 8, min: 40 }
  ];

  // Total Responden = 40+ Pemohon mencakup seluruh 32 instansi pelayanan publik
  const additionalRespondents = [
    { name: 'Endang Sulastri', gender: 'Perempuan', age: '46 - 60 Tahun', edu: 'SMA/SMK Sederajat', rating: 5, agency: 'Badan Penyelenggara Jaminan Sosial Ketenagakerjaan', text: 'Klaim JHT berjalan lancar dan terarah.', day: 2, hour: 15 },
    { name: 'Fajar Nugroho', gender: 'Laki-laki', age: '20 - 35 Tahun', edu: 'Sarjana (S1)', rating: 5, agency: 'Bank Jatim', text: 'Pembayaran retribusi daerah sangat praktis.', day: 2, hour: 13 },
    { name: 'Tri Wahyuni', gender: 'Perempuan', age: '36 - 45 Tahun', edu: 'SMA/SMK Sederajat', rating: 5, agency: 'Dinas Kependudukan Dan Pencatatan Sipil', text: 'Cetak KTP elektronik cepat dan gratis.', day: 2, hour: 12 },
    { name: 'Bambang Sudarsono', gender: 'Laki-laki', age: '46 - 60 Tahun', edu: 'Sarjana (S1)', rating: 4, agency: 'Dinas Penanaman Modal Dan Pelayanan Terpadu Satu Pintu', text: 'Penerbitan NIB berbasis risiko dipandu sampai tuntas.', day: 2, hour: 11 },
    { name: 'Sri Utami', gender: 'Perempuan', age: '20 - 35 Tahun', edu: 'Sarjana (S1)', rating: 5, agency: 'Kementerian Agama Republik Indonesia', text: 'Pendaftaran nikah dan rekomendasi haji jelas.', day: 2, hour: 10 },
    { name: 'Hadi Sucipto', gender: 'Laki-laki', age: '36 - 45 Tahun', edu: 'Diploma (D1-D4)', rating: 5, agency: 'Perusahaan Listrik Negara', text: 'Tambah daya listrik langsung terproses online.', day: 2, hour: 9 },
    { name: 'Kusuma Dewi', gender: 'Perempuan', age: '20 - 35 Tahun', edu: 'Sarjana (S1)', rating: 5, agency: 'Kejaksaan Negeri', text: 'Pelayanan prima dan antrean rapi.', day: 1, hour: 14 },
    { name: 'Gunawan', gender: 'Laki-laki', age: '46 - 60 Tahun', edu: 'SMA/SMK Sederajat', rating: 4, agency: 'Dinas Perhubungan', text: 'Uji berkala kendaraan bermotor cepat.', day: 1, hour: 13 },
    { name: 'Marlina', gender: 'Perempuan', age: '36 - 45 Tahun', edu: 'Sarjana (S1)', rating: 5, agency: 'Badan Pendapatan Daerah', text: 'Pelunasan PBB lunas dan cetak bukti sah.', day: 1, hour: 12 },
    { name: 'Rudy Hartono', gender: 'Laki-laki', age: '20 - 35 Tahun', edu: 'SMA/SMK Sederajat', rating: 5, agency: 'Bank Bri', text: 'Layanan perbankan cepat dan ramah.', day: 1, hour: 11 },
    { name: 'Indah Permata', gender: 'Perempuan', age: '< 20 Tahun', edu: 'SMA/SMK Sederajat', rating: 5, agency: 'Dinas Pendidikan Dan Kebudayaan', text: 'Legalisir ijazah pelayanan ramah.', day: 1, hour: 10 },
    { name: 'Aris Munandar', gender: 'Laki-laki', age: '20 - 35 Tahun', edu: 'Sarjana (S1)', rating: 5, agency: 'Dinas Penanaman Modal Dan Pelayanan Terpadu Satu Pintu', text: 'Loket perizinan sangat representatif.', day: 1, hour: 9 },
    { name: 'Wulan Sari', gender: 'Perempuan', age: '20 - 35 Tahun', edu: 'Sarjana (S1)', rating: 4, agency: 'Dinas Kesehatan', text: 'SIP dokter dan tenaga medis jelas persyaratannya.', day: 1, hour: 8 },
    { name: 'Herman Prasetyo', gender: 'Laki-laki', age: '36 - 45 Tahun', edu: 'Sarjana (S1)', rating: 5, agency: 'Perusahaan Daerah Air Minum', text: 'Lapor meter dan balik nama pelanggan cepat.', day: 1, hour: 15 },
    { name: 'Dian Anggraini', gender: 'Perempuan', age: '20 - 35 Tahun', edu: 'Sarjana (S1)', rating: 5, agency: 'Pengadilan Agama', text: 'Layanan informasi gugatan dan akta cerai sopan.', day: 1, hour: 14 },
    { name: 'Slamet Riyadi', gender: 'Laki-laki', age: '> 60 Tahun', edu: 'SMA/SMK Sederajat', rating: 5, agency: 'Taspen', text: 'Petugas ramah sekali membantu lansia.', day: 1, hour: 13 },
    { name: 'Eka Kurniasih', gender: 'Perempuan', age: '36 - 45 Tahun', edu: 'Diploma (D1-D4)', rating: 4, agency: 'Dinas Perdagangan, Koperasi Dan Usaha Mikro', text: 'Bimbingan sertifikasi halal dan izin usaha mikro.', day: 1, hour: 11 },
    { name: 'Didik Setiawan', gender: 'Laki-laki', age: '20 - 35 Tahun', edu: 'Sarjana (S1)', rating: 5, agency: 'Polres', text: 'Cetak SKCK tidak sampai 15 menit selesai.', day: 1, hour: 10 },
    { name: 'Maya Safitri', gender: 'Perempuan', age: '20 - 35 Tahun', edu: 'Sarjana (S1)', rating: 5, agency: 'Badan Penyelenggara Jaminan Sosial Kesehatan', text: 'Informasi JKN-KIS lengkap.', day: 1, hour: 9 },
    { name: 'Totok Wibisono', gender: 'Laki-laki', age: '46 - 60 Tahun', edu: 'SMA/SMK Sederajat', rating: 5, agency: 'Samsat', text: 'Bebas calo dan teratur sekali antreannya.', day: 2, hour: 8 },
    { name: 'Dina Kusuma', gender: 'Perempuan', age: '20 - 35 Tahun', edu: 'Sarjana (S1)', rating: 5, agency: 'Dinas Penanaman Modal Dan Pelayanan Terpadu Satu Pintu', text: 'Pelayanan bintang lima untuk pemohon di MPP Bojonegoro.', day: 2, hour: 15 },
    { name: 'Suwandi', gender: 'Laki-laki', age: '46 - 60 Tahun', edu: 'SMA/SMK Sederajat', rating: 4, agency: 'Dinas Kependudukan Dan Pencatatan Sipil', text: 'Perekaman biometrik tertib dan sejuk.', day: 2, hour: 12 },
    { name: 'Ratna Juwita', gender: 'Perempuan', age: '20 - 35 Tahun', edu: 'Sarjana (S1)', rating: 5, agency: 'Kejaksaan Negeri', text: 'Layanan tilang dan konsultasi hukum gratis.', day: 2, hour: 11 },
    // Responden untuk melengkapi seluruh 32 instansi pelayanan publik
    { name: 'Bayu Wicaksono', gender: 'Laki-laki', age: '36 - 45 Tahun', edu: 'Sarjana (S1)', rating: 5, agency: 'Bank Perkreditan Rakyat', text: 'Konsultasi kredit usaha mikro bunga terjangkau sangat ramah dan transparan.', day: 2, hour: 13, min: 25 },
    { name: 'Novita Anggraini', gender: 'Perempuan', age: '20 - 35 Tahun', edu: 'Sarjana (S1)', rating: 5, agency: 'Dinas Kebudayaan Dan Pariwisata', text: 'Informasi izin sanggar seni dan rekomendasi cagar budaya dijelaskan runtut.', day: 1, hour: 10, min: 40 },
    { name: 'Bagus Priyambodo', gender: 'Laki-laki', age: '36 - 45 Tahun', edu: 'Sarjana (S1)', rating: 5, agency: 'Dinas Lingkungan Hidup', text: 'Pengurusan rekomendasi SPPL dan izin lingkungan cepat tanpa hambatan.', day: 1, hour: 14, min: 15 },
    { name: 'Hendro Siswanto', gender: 'Laki-laki', age: '46 - 60 Tahun', edu: 'Diploma (D1-D4)', rating: 4, agency: 'Dinas Pekerjaan Umum Bina Marga', text: 'Rekomtek pemanfaatan ruang milik jalan direspons baik oleh petugas teknis.', day: 2, hour: 9, min: 50 },
    { name: 'Anisa Fitriani', gender: 'Perempuan', age: '20 - 35 Tahun', edu: 'Sarjana (S1)', rating: 5, agency: 'Dinas Perumahan, Kawasan Permukiman Dan Cipta Karya', text: 'Konsultasi persetujuan bangunan gedung (PBG) sangat informatif dan memuaskan.', day: 2, hour: 10, min: 35 },
    { name: 'Danang Saputra', gender: 'Laki-laki', age: '20 - 35 Tahun', edu: 'Sarjana (S1)', rating: 5, agency: 'Pengadilan Negeri', text: 'Layanan surat keterangan bebas pidana (Eraterang) cepat selesai dalam 15 menit.', day: 1, hour: 11, min: 20 },
    { name: 'Supriyanto', gender: 'Laki-laki', age: '46 - 60 Tahun', edu: 'SMA/SMK Sederajat', rating: 4, agency: 'Dinas Pekerjaan Umum Sumber Daya Air', text: 'Informasi permohonan izin saluran irigasi pertanian sangat komunikatif.', day: 2, hour: 11, min: 45 },
    { name: 'Yulistiyono', gender: 'Laki-laki', age: '36 - 45 Tahun', edu: 'Sarjana (S1)', rating: 5, agency: 'Dinas Peternakan Dan Perikanan', text: 'Penerbitan surat keterangan kesehatan hewan (SKKH) cepat dan bebas biaya tambahan.', day: 1, hour: 13, min: 10 },
    { name: 'Retno Wulandari', gender: 'Perempuan', age: '36 - 45 Tahun', edu: 'Sarjana (S1)', rating: 5, agency: 'Dewan Kerajinan Nasional Daerah', text: 'Kurasi produk kriya dan batik lokal Bojonegoro sangat mendukung promosi perajin.', day: 2, hour: 14, min: 15 }
  ];

  const allItems = [...mockCitizens, ...additionalRespondents];

  return allItems.map((rawItem, idx) => {
    const item = rawItem as { name: string; gender: string; age: string; edu: string; rating: number; agency: string; text: string; day: number; hour?: number; min?: number; isAnon?: boolean };
    const date = new Date(currentYear, currentMonth, item.day, item.hour || 10, item.min || (idx * 3) % 60);
    const agencyObj = DEFAULT_AGENCIES.find(a => a.name === item.agency) || DEFAULT_AGENCIES[0];
    const isAnon = Boolean(item.isAnon);

    const pad = (n: number) => String(n).padStart(2, '0');
    const dayStr = pad(item.day);
    const monthStr = pad(currentMonth + 1);
    const hourStr = pad(item.hour || 10);
    const minStr = pad(item.min || ((idx * 3) % 60));
    const localIso = `${currentYear}-${monthStr}-${dayStr}T${hourStr}:${minStr}:00`;
    const localDateStr = `${currentYear}-${monthStr}-${dayStr}`;

    return {
      id: `seed-survey-${idx + 1}`,
      agencyId: agencyObj.id,
      agencyName: item.agency,
      rating: item.rating,
      aspectSpeed: item.rating,
      aspectFriendliness: item.rating,
      aspectClarity: item.rating,
      aspectFacility: item.rating,
      unsurPersyaratan: item.rating,
      unsurProsedur: item.rating,
      unsurWaktu: item.rating,
      unsurBiaya: item.rating,
      unsurProduk: item.rating,
      unsurKompetensi: item.rating,
      unsurPerilaku: item.rating,
      unsurPengaduan: item.rating,
      unsurKesopanan: item.rating,
      feedback: item.text,
      isAnonymous: isAnon,
      respondentName: isAnon ? 'Anonim (Pemohon)' : item.name,
      gender: (isAnon ? 'Tidak Ingin Memberitahu' : item.gender) as SurveyResponse['gender'],
      ageGroup: (isAnon ? 'Tidak Ingin Memberitahu' : item.age) as SurveyResponse['ageGroup'],
      education: (isAnon ? 'Tidak Ingin Memberitahu' : item.edu) as SurveyResponse['education'],
      createdAt: localIso,
      timestamp: date.getTime(),
      surveyDate: localDateStr
    };
  });
}
