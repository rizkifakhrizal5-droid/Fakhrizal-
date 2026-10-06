import React, { useMemo } from 'react';
import { SurveyResponse, Agency, IKMStats, FilterState } from '../types/survey';

interface RekapReportDocumentProps {
  id?: string;
  surveys: SurveyResponse[];
  agencies: Agency[];
  stats: IKMStats;
  filters: FilterState;
  kopPemda?: string;
  kopDinas?: string;
  kopUnit?: string;
  kopAlamat?: string;
  kopKontak?: string;
  documentTitle?: string;
  documentNumber?: string;
  signerName?: string;
  signerNip?: string;
  signerTitle?: string;
  signCity?: string;
  printDate?: string;
  docScale?: number;
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const RekapReportDocument: React.FC<RekapReportDocumentProps> = ({
  id = 'report-document-to-download',
  surveys,
  agencies,
  stats,
  filters,
  kopPemda = 'PEMERINTAH KABUPATEN BOJONEGORO',
  kopDinas = 'DINAS PENANAMAN MODAL DAN PELAYANAN TERPADU SATU PINTU',
  kopUnit = 'MAL PELAYANAN PUBLIK (MPP) GAMPIL',
  kopAlamat = 'Jl. Veteran No. 227 Bojonegoro, Jawa Timur 62119',
  kopKontak = 'Telp: (0353) 887654 • Email: mpp@bojonegorokab.go.id • Website: mpp.bojonegorokab.go.id',
  documentTitle = 'REKAPITULASI RESMI HASIL PENGUKURAN SURVEI KEPUASAN MASYARAKAT (SKM)',
  documentNumber,
  signerName = 'Ir. H. Rachmat Junaidi, M.M.',
  signerNip = '19740512 199903 1 004',
  signerTitle = 'Kepala Dinas PMPTSP / Penanggung Jawab MPP',
  signCity = 'Bojonegoro',
  printDate,
  docScale = 100,
}) => {
  const currentYear = filters.year > 0 ? filters.year : 2026;
  const docNumber =
    documentNumber || `060 / ${stats.totalRespondents || surveys.length || 36} / SKM-MPP / ${currentYear}`;
  const displayPrintDate =
    printDate ||
    new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  const periodLabel = useMemo(() => {
    const yearLabel = filters.year === -1 ? 'Semua Tahun' : String(filters.year);
    const monthLabel =
      filters.month === -1 ? 'Semua Bulan' : MONTH_NAMES[filters.month] || 'Semua Bulan';
    const dayRangeLabel =
      filters.month === -1
        ? 'Semua Tanggal'
        : `Tgl ${Math.min(filters.startDay, filters.endDay)} s/d ${Math.max(filters.startDay, filters.endDay)}`;
    return `${dayRangeLabel} ${monthLabel} ${yearLabel}`;
  }, [filters]);

  // 1. Penilaian Instansi (Agency performance metrics)
  const agencyEvaluations = useMemo(() => {
    const map = new Map<
      string,
      { name: string; category: string; count: number; sumRating: number; satisfied: number }
    >();

    // Seed map with known agencies
    agencies.forEach((a) => {
      map.set(a.name, {
        name: a.name,
        category: a.category || 'Pelayanan Publik',
        count: 0,
        sumRating: 0,
        satisfied: 0,
      });
    });

    // Populate with actual survey data
    surveys.forEach((s) => {
      const existing = map.get(s.agencyName) || {
        name: s.agencyName,
        category: 'Pelayanan Publik',
        count: 0,
        sumRating: 0,
        satisfied: 0,
      };
      existing.count += 1;
      existing.sumRating += s.rating;
      if (s.rating >= 4) {
        existing.satisfied += 1;
      }
      map.set(s.agencyName, existing);
    });

    // Populate in the exact official agency sequence (1..32)
    const list = agencies.map((agency) => {
      const item = map.get(agency.name) || {
        name: agency.name,
        category: agency.category || 'Pelayanan Publik',
        count: 0,
        sumRating: 0,
        satisfied: 0,
      };
      const avg = item.count > 0 ? Math.round((item.sumRating / item.count) * 100) / 100 : 0;
      const ikm = item.count > 0 ? Math.round((avg / 5) * 100 * 10) / 10 : 0;
      const satisfiedPct = item.count > 0 ? Math.round((item.satisfied / item.count) * 100) : 0;
      let mutu = 'Belum Ada Survei';
      if (item.count > 0) {
        if (ikm >= 88.31) mutu = 'A (Sangat Baik)';
        else if (ikm >= 76.61) mutu = 'B (Baik)';
        else if (ikm >= 65) mutu = 'C (Kurang Baik)';
        else mutu = 'D (Tidak Baik)';
      }
      return {
        name: agency.name,
        category: agency.category || 'Pelayanan Publik',
        totalRespondents: item.count,
        averageRating: avg,
        ikmScore: ikm,
        mutu,
        satisfiedPercentage: satisfiedPct,
      };
    });

    // Filter if specific agency is selected
    if (filters.agencyName && filters.agencyName !== 'Semua Instansi (32)') {
      return list.filter((a) => a.name === filters.agencyName);
    }

    return list;
  }, [agencies, surveys, filters.agencyName]);

  // Helper date-time formatter
  const formatDateTime = (item: SurveyResponse) => {
    if (item.surveyDate && item.surveyDate.includes('-')) {
      const parts = item.surveyDate.split('-').map(Number);
      const day = String(parts[2]).padStart(2, '0');
      const month = MONTH_NAMES[parts[1] - 1]?.slice(0, 3) || 'Okt';
      const year = parts[0];
      return `${day} ${month} ${year}`;
    }
    const d = new Date(item.timestamp || item.createdAt);
    const day = String(d.getDate()).padStart(2, '0');
    const month = MONTH_NAMES[d.getMonth()]?.slice(0, 3) || 'Okt';
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // 9 Unsur Pelayanan Publik (PermenPAN-RB No. 14 / 2017 & UU 25 / 2009)
  const unsurList = [
    { no: 1, kode: 'U1', name: 'Persyaratan Pelayanan', val: stats.unsurAverages?.persyaratan || stats.averageRating },
    { no: 2, kode: 'U2', name: 'Sistem, Mekanisme, dan Prosedur', val: stats.unsurAverages?.prosedur || stats.averageRating },
    { no: 3, kode: 'U3', name: 'Waktu Penyelesaian Pelayanan', val: stats.unsurAverages?.waktu || stats.averageRating },
    { no: 4, kode: 'U4', name: 'Biaya / Tarif Pelayanan', val: stats.unsurAverages?.biaya || stats.averageRating },
    { no: 5, kode: 'U5', name: 'Produk Spesifikasi Jenis Pelayanan', val: stats.unsurAverages?.produk || stats.averageRating },
    { no: 6, kode: 'U6', name: 'Kompetensi Pelaksana / Petugas', val: stats.unsurAverages?.kompetensi || stats.averageRating },
    { no: 7, kode: 'U7', name: 'Perilaku Pelaksana / Sikap Petugas', val: stats.unsurAverages?.perilaku || stats.averageRating },
    { no: 8, kode: 'U8', name: 'Penanganan Pengaduan, Saran & Masukan', val: stats.unsurAverages?.pengaduan || stats.averageRating },
    { no: 9, kode: 'U9', name: 'Kesopanan dan Kerapian Petugas', val: stats.unsurAverages?.kesopanan || stats.averageRating },
  ];

  // Demographics breakdown
  const genderBreakdown: { [key: string]: number } = { 'Laki-laki': 0, Perempuan: 0, 'Tidak Ingin Memberitahu': 0 };
  const ageBreakdown: { [key: string]: number } = {};
  const eduBreakdown: { [key: string]: number } = {};

  surveys.forEach((s) => {
    genderBreakdown[s.gender] = (genderBreakdown[s.gender] || 0) + 1;
    ageBreakdown[s.ageGroup] = (ageBreakdown[s.ageGroup] || 0) + 1;
    eduBreakdown[s.education] = (eduBreakdown[s.education] || 0) + 1;
  });

  // Urutkan seluruh data pemohon sesuai tanggal pertama dan seterusnya (kronologis ascending)
  const sortedSurveys = useMemo(() => {
    return [...surveys].sort((a, b) => {
      const dateA = a.surveyDate || (a.createdAt ? a.createdAt.split('T')[0] : '');
      const dateB = b.surveyDate || (b.createdAt ? b.createdAt.split('T')[0] : '');
      if (dateA && dateB && dateA !== dateB) return dateA.localeCompare(dateB);
      return (a.timestamp || 0) - (b.timestamp || 0);
    });
  }, [surveys]);

  return (
    <div
      id={id}
      style={{
        zoom: `${docScale}%`,
        transformOrigin: 'top center',
      }}
      className="print-document bg-white p-6 sm:p-8 text-slate-900 font-sans max-w-4xl mx-auto border border-slate-200 shadow-xs print:p-0 print:border-none print:shadow-none print:max-w-none print:w-full"
    >
      {/* KOP SURAT RESMI */}
      <div className="print-avoid-break border-b-4 border-double border-slate-900 pb-3 mb-5 text-center">
        <div className="max-w-3xl mx-auto space-y-0.5">
          <h3 className="text-sm sm:text-base font-bold tracking-wider uppercase text-slate-900 leading-tight">
            {kopPemda}
          </h3>
          <h2 className="text-sm sm:text-base font-extrabold tracking-tight uppercase text-slate-900 leading-snug">
            {kopDinas}
          </h2>
          <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-950 uppercase font-serif">
            {kopUnit}
          </h1>
          <p className="text-[11px] text-slate-700 mt-1 font-medium">
            {kopAlamat}
          </p>
          <p className="text-[10px] text-slate-600 font-mono">
            {kopKontak}
          </p>
        </div>
      </div>

      {/* JUDUL DOKUMEN & NOMOR */}
      <div className="text-center mb-6 space-y-1">
        <h2 className="text-base sm:text-lg font-bold underline uppercase tracking-wide text-slate-900">
          {documentTitle}
        </h2>
        <p className="text-xs font-semibold text-slate-700 font-mono">
          Nomor: {docNumber}
        </p>
        <p className="text-[11px] text-slate-600 font-medium">
          Periode: <strong>{periodLabel}</strong> | Instansi: <strong>{filters.agencyName}</strong>
        </p>
      </div>

      {/* BAGIAN 1: RINGKASAN CAPAIAN IKM */}
      <div id="section-rekap-1" className="mb-6 space-y-3.5 scroll-mt-20">
        <div className="flex items-center justify-between border-b-2 border-slate-800 pb-1.5 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-slate-900 text-white font-extrabold text-xs px-2.5 py-0.5 rounded shrink-0">I</span>
            <h3 className="text-xs sm:text-sm font-bold uppercase text-slate-900 tracking-wide">
              Ringkasan Capaian Indeks Kepuasan Masyarakat (IKM)
            </h3>
          </div>
          <span className="text-[10px] text-slate-600 font-semibold font-mono">
            Tabel I • Rekapitulasi Indikator Pokok
          </span>
        </div>

        {/* 4 Kartu Metrik Ringkasan Utama */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
          <div className="p-2.5 border border-slate-300 rounded-xl bg-slate-50/80 shadow-2xs">
            <p className="text-[10px] font-bold text-slate-500 uppercase">Rata-Rata Rating</p>
            <p className="text-xl font-black text-slate-900 mt-0.5">
              {stats.averageRating} <span className="text-[11px] font-normal text-slate-500">/ 5.00</span>
            </p>
          </div>

          <div className="p-2.5 border border-blue-400 rounded-xl bg-blue-50/70 shadow-2xs">
            <p className="text-[10px] font-bold text-blue-900 uppercase">Nilai IKM Konversi</p>
            <p className="text-2xl font-black text-blue-950 mt-0.5">
              {stats.ikmScore} <span className="text-[11px] font-normal text-slate-500">/ 100</span>
            </p>
          </div>

          <div className="p-2.5 border border-emerald-400 rounded-xl bg-emerald-50/70 shadow-2xs">
            <p className="text-[10px] font-bold text-emerald-900 uppercase">Mutu Pelayanan</p>
            <p className="text-sm sm:text-base font-black text-emerald-950 mt-1">
              {stats.mutu}
            </p>
          </div>

          <div className="p-2.5 border border-slate-300 rounded-xl bg-slate-50/80 shadow-2xs">
            <p className="text-[10px] font-bold text-slate-500 uppercase">Total Responden</p>
            <p className="text-xl font-black text-slate-900 mt-0.5">
              {stats.totalRespondents} <span className="text-[11px] font-normal text-slate-500">Pemohon</span>
            </p>
          </div>
        </div>

        {/* Tabel I: Ringkasan Resmi Capaian IKM */}
        <div className="overflow-x-auto pt-1">
          <table className="w-full text-[11px] border-collapse border border-slate-400">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-400">
                <th className="border border-slate-300 p-1.5 text-center w-10">No</th>
                <th className="border border-slate-300 p-1.5 text-left">Indikator Pengukuran SKM</th>
                <th className="border border-slate-300 p-1.5 text-center w-32">Nilai Capaian</th>
                <th className="border border-slate-300 p-1.5 text-center w-36">Kategori Mutu</th>
                <th className="border border-slate-300 p-1.5 text-left">Keterangan Standar Evaluasi</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-slate-50">
                <td className="border border-slate-300 p-1.5 text-center font-mono">1</td>
                <td className="border border-slate-300 p-1.5 font-semibold text-slate-800">Total Responden Pemohon Terdata</td>
                <td className="border border-slate-300 p-1.5 text-center font-bold text-slate-900">{stats.totalRespondents} Pemohon</td>
                <td className="border border-slate-300 p-1.5 text-center font-semibold text-blue-900">Sah &amp; Terverifikasi</td>
                <td className="border border-slate-300 p-1.5 text-slate-600 text-[10.5px]">Mencakup partisipasi aktif pada loket 32 instansi pelayanan publik</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="border border-slate-300 p-1.5 text-center font-mono">2</td>
                <td className="border border-slate-300 p-1.5 font-semibold text-slate-800">Nilai Rata-Rata Rating Pelayanan</td>
                <td className="border border-slate-300 p-1.5 text-center font-bold text-amber-900">{stats.averageRating} / 5.00</td>
                <td className="border border-slate-300 p-1.5 text-center font-semibold text-amber-900">Sangat Puas</td>
                <td className="border border-slate-300 p-1.5 text-slate-600 text-[10.5px]">Skala penilaian 1.00 s/d 5.00</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="border border-slate-300 p-1.5 text-center font-mono">3</td>
                <td className="border border-slate-300 p-1.5 font-semibold text-slate-800">Nilai Indeks Kepuasan Masyarakat (IKM)</td>
                <td className="border border-slate-300 p-1.5 text-center font-black text-blue-950 text-xs">{stats.ikmScore} / 100</td>
                <td className="border border-slate-300 p-1.5 text-center font-black text-emerald-900 text-xs">{stats.mutu}</td>
                <td className="border border-slate-300 p-1.5 text-slate-600 text-[10.5px]">Konversi PermenPAN-RB No. 14 Tahun 2017 (Skala 25 - 100)</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="border border-slate-300 p-1.5 text-center font-mono">4</td>
                <td className="border border-slate-300 p-1.5 font-semibold text-slate-800">Persentase Kepuasan Pemohon (% Puas)</td>
                <td className="border border-slate-300 p-1.5 text-center font-bold text-emerald-800 font-mono">{stats.satisfiedPercentage}%</td>
                <td className="border border-slate-300 p-1.5 text-center font-semibold text-emerald-900">Kinerja Prima</td>
                <td className="border border-slate-300 p-1.5 text-slate-600 text-[10.5px]">Persentase pemohon yang memberikan nilai rating 4 &amp; 5</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Keterangan Resmi di Bawah Tabel I */}
        <div className="pt-2 text-[10.5px] text-slate-600">
          <p className="font-semibold text-slate-700 italic">
            * Catatan Penetapan Nilai IKM: Dihitung secara objektif dari data agregat responden pemohon yang terkonversi sesuai pedoman PermenPAN-RB No. 14 Tahun 2017 tentang Pedoman Penyusunan Survei Kepuasan Masyarakat Unit Penyelenggara Pelayanan Publik.
          </p>
        </div>
      </div>

      {/* Jarak Pemisah Rapi & Berjarak Antara Tabel I dan Tabel II */}
      <div className="my-6 sm:my-8 border-b-2 border-slate-300 print:my-6 print:border-b-2 print:border-slate-300" />

      {/* BAGIAN 2: PENILAIAN INSTANSI PELAYANAN PUBLIK */}
      <div id="section-rekap-2" className="mt-4 sm:mt-6 mb-6 space-y-3.5 scroll-mt-6 print:mt-4 print:mb-6">
        <div className="flex items-center justify-between border-b-2 border-slate-800 pb-1.5 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-slate-900 text-white font-extrabold text-xs px-2.5 py-0.5 rounded shrink-0">II</span>
            <h3 className="text-xs sm:text-sm font-bold uppercase text-slate-900 tracking-wide">
              Penilaian &amp; Capaian Kinerja Instansi Pelayanan Publik
            </h3>
          </div>
          <span className="text-[10px] text-slate-600 font-semibold font-mono">
            Tabel II • Total {agencyEvaluations.length} Instansi Terdata
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[11px] border-collapse border border-slate-400">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-400">
                <th className="border border-slate-300 p-1.5 w-8 text-center">No</th>
                <th className="border border-slate-300 p-1.5 text-left">Nama Instansi Pelayanan</th>
                <th className="border border-slate-300 p-1.5 w-16 text-center">Responden</th>
                <th className="border border-slate-300 p-1.5 w-16 text-center">Rating (1-5)</th>
                <th className="border border-slate-300 p-1.5 w-16 text-center">IKM (100)</th>
                <th className="border border-slate-300 p-1.5 w-24 text-center">Mutu</th>
                <th className="border border-slate-300 p-1.5 w-16 text-center">% Puas</th>
              </tr>
            </thead>
            <tbody>
              {agencyEvaluations.slice(0, 32).map((item, idx) => (
                <tr
                  key={item.name}
                  className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}
                >
                  <td className="border border-slate-300 p-1.5 text-center font-mono font-medium">{idx + 1}</td>
                  <td className="border border-slate-300 p-1.5 font-bold text-slate-900 leading-snug break-words">{item.name}</td>
                  <td className="border border-slate-300 p-1.5 text-center font-semibold font-mono">
                    {item.totalRespondents > 0 ? (
                      <span className="font-bold text-blue-900">{item.totalRespondents}</span>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
                  </td>
                  <td className="border border-slate-300 p-1.5 text-center font-bold text-amber-900">
                    {item.totalRespondents > 0 ? item.averageRating : '-'}
                  </td>
                  <td className="border border-slate-300 p-1.5 text-center font-extrabold text-blue-900">
                    {item.totalRespondents > 0 ? item.ikmScore : '-'}
                  </td>
                  <td className="border border-slate-300 p-1.5 text-center font-bold text-[10px]">
                    {item.totalRespondents > 0 ? (
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded ${
                          item.ikmScore >= 88.31
                            ? 'bg-emerald-100 text-emerald-900'
                            : item.ikmScore >= 76.61
                            ? 'bg-blue-100 text-blue-900'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {item.mutu}
                      </span>
                    ) : (
                      <span className="text-slate-400 font-normal">Belum ada</span>
                    )}
                  </td>
                  <td className="border border-slate-300 p-1.5 text-center font-bold text-emerald-800 font-mono">
                    {item.totalRespondents > 0 ? `${item.satisfiedPercentage}%` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Jarak Pemisah Rapi & Berjarak Antara Tabel II dan Tabel III */}
      <div className="my-6 sm:my-8 border-b-2 border-slate-300 print:my-6 print:border-b-2 print:border-slate-300" />

      {/* BAGIAN 3: 9 UNSUR PELAYANAN PUBLIK */}
      <div id="section-rekap-3" className="mt-4 sm:mt-6 mb-6 space-y-3.5 scroll-mt-6 print:mt-4 print:mb-6">
        <div className="flex items-center justify-between border-b-2 border-slate-800 pb-1.5 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-slate-900 text-white font-extrabold text-xs px-2.5 py-0.5 rounded shrink-0">III</span>
            <h3 className="text-xs sm:text-sm font-bold uppercase text-slate-900 tracking-wide">
              Rekapitulasi Rincian 9 Unsur Pelayanan Publik
            </h3>
          </div>
          <span className="text-[10px] text-slate-600 font-semibold font-mono">
            Tabel III • UU No. 25/2009
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[11px] border-collapse border border-slate-400">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-400">
                <th className="border border-slate-300 p-1.5 w-8 text-center">No</th>
                <th className="border border-slate-300 p-1.5 w-12 text-center">Kode</th>
                <th className="border border-slate-300 p-1.5 text-left">Unsur Pelayanan Publik</th>
                <th className="border border-slate-300 p-1.5 w-24 text-center">Nilai Rata-Rata (NRR)</th>
                <th className="border border-slate-300 p-1.5 w-28 text-center">NRR Tertimbang (x 0.111)</th>
                <th className="border border-slate-300 p-1.5 w-24 text-center">Kategori Kinerja</th>
              </tr>
            </thead>
            <tbody>
              {unsurList.map((unsur) => (
                <tr key={unsur.kode} className="hover:bg-slate-50">
                  <td className="border border-slate-300 p-1.5 text-center font-mono">{unsur.no}</td>
                  <td className="border border-slate-300 p-1.5 text-center font-bold text-blue-900">{unsur.kode}</td>
                  <td className="border border-slate-300 p-1.5 font-semibold text-slate-800">{unsur.name}</td>
                  <td className="border border-slate-300 p-1.5 text-center font-bold text-slate-900">{unsur.val}</td>
                  <td className="border border-slate-300 p-1.5 text-center font-mono">{(unsur.val * 0.111).toFixed(3)}</td>
                  <td className="border border-slate-300 p-1.5 text-center font-semibold text-emerald-800 text-[10px]">
                    {unsur.val >= 4.4 ? 'Sangat Baik' : unsur.val >= 3.8 ? 'Baik' : 'Cukup'}
                  </td>
                </tr>
              ))}
              <tr className="bg-slate-100 font-bold">
                <td colSpan={3} className="border border-slate-300 p-1.5 text-right font-bold text-slate-900">
                  Total Nilai IKM Konversi (Skala 25 - 100):
                </td>
                <td colSpan={2} className="border border-slate-300 p-1.5 text-center font-black text-blue-950 text-xs">
                  {stats.ikmScore}
                </td>
                <td className="border border-slate-300 p-1.5 text-center font-black text-emerald-900 text-xs">
                  {stats.mutu}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Jarak Pemisah Rapi & Berjarak Antara Tabel III dan Tabel IV */}
      <div className="my-6 sm:my-8 border-b-2 border-slate-300 print:my-6 print:border-b-2 print:border-slate-300" />

      {/* BAGIAN 4: DATA PEMOHON */}
      <div id="section-rekap-4" className="mt-4 sm:mt-6 mb-6 space-y-3.5 scroll-mt-6 print:mt-4 print:mb-6">
        <div className="flex items-center justify-between border-b-2 border-slate-800 pb-1.5 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-slate-900 text-white font-extrabold text-xs px-2.5 py-0.5 rounded shrink-0">IV</span>
            <h3 className="text-xs sm:text-sm font-bold uppercase text-slate-900 tracking-wide">
              Data Rincian Seluruh Responden Pemohon Pelayanan
            </h3>
          </div>
          <span className="text-[10px] text-slate-600 font-semibold font-mono">
            Tabel IV • Total {sortedSurveys.length} Responden
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[10.5px] border-collapse border border-slate-400">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-400">
                <th className="border border-slate-300 p-1.5 w-8 text-center">No</th>
                <th className="border border-slate-300 p-1.5 w-20 text-center">Tanggal</th>
                <th className="border border-slate-300 p-1.5 text-left">Instansi Pelayanan</th>
                <th className="border border-slate-300 p-1.5 text-left w-32">Nama Pemohon</th>
                <th className="border border-slate-300 p-1.5 w-20 text-center">Gender</th>
                <th className="border border-slate-300 p-1.5 w-24 text-center">Usia</th>
                <th className="border border-slate-300 p-1.5 w-24 text-center">Pendidikan</th>
                <th className="border border-slate-300 p-1.5 w-14 text-center">Rating</th>
              </tr>
            </thead>
            <tbody>
              {sortedSurveys.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-4 text-center text-slate-500 italic">
                    Belum ada data pemohon yang terdaftar untuk filter ini.
                  </td>
                </tr>
              ) : (
                sortedSurveys.map((item, idx) => (
                  <tr
                    key={item.id}
                    className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}
                  >
                    <td className="border border-slate-300 p-1 text-center font-mono text-[10px]">{idx + 1}</td>
                    <td className="border border-slate-300 p-1 text-center font-mono text-[10px] whitespace-nowrap">
                      {formatDateTime(item)}
                    </td>
                    <td className="border border-slate-300 p-1 font-semibold text-slate-800 text-[10px]">
                      {item.agencyName}
                    </td>
                    <td className="border border-slate-300 p-1 font-bold text-slate-900 text-[10px]">
                      {item.isAnonymous ? 'Anonim (Pemohon)' : item.respondentName}
                    </td>
                    <td className="border border-slate-300 p-1 text-center text-[10px] text-slate-600">
                      {item.gender === 'Tidak Ingin Memberitahu' ? 'Anonim' : item.gender}
                    </td>
                    <td className="border border-slate-300 p-1 text-center text-[10px] text-slate-600 whitespace-nowrap">
                      {item.ageGroup === 'Tidak Ingin Memberitahu' ? '-' : item.ageGroup}
                    </td>
                    <td className="border border-slate-300 p-1 text-center text-[10px] text-slate-600">
                      {item.education === 'Tidak Ingin Memberitahu' ? '-' : item.education}
                    </td>
                    <td className="border border-slate-300 p-1 text-center font-bold text-amber-900 text-[10px]">
                      ⭐ {item.rating}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Jarak Pemisah Rapi & Berjarak Antara Tabel IV dan Tabel V */}
      <div className="my-6 sm:my-8 border-b-2 border-slate-300 print:my-6 print:border-b-2 print:border-slate-300" />

      {/* BAGIAN 5: SARAN DAN MASUKAN MASYARAKAT */}
      <div id="section-rekap-5" className="mt-4 sm:mt-6 mb-6 space-y-3.5 scroll-mt-6 print:mt-4 print:mb-6">
        <div className="flex items-center justify-between border-b-2 border-slate-800 pb-1.5 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-slate-900 text-white font-extrabold text-xs px-2.5 py-0.5 rounded shrink-0">V</span>
            <h3 className="text-xs sm:text-sm font-bold uppercase text-slate-900 tracking-wide">
              Saran, Masukan &amp; Aspirasi Masyarakat
            </h3>
          </div>
          <span className="text-[10px] text-slate-600 font-semibold font-mono">
            Tabel V • Total {sortedSurveys.filter((s) => s.feedback && s.feedback.trim().length > 0).length} Masukan
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[10.5px] border-collapse border border-slate-400">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-400">
                <th className="border border-slate-300 p-1.5 w-8 text-center">No</th>
                <th className="border border-slate-300 p-1.5 w-20 text-center">Tanggal</th>
                <th className="border border-slate-300 p-1.5 text-left w-48">Instansi Pelayanan</th>
                <th className="border border-slate-300 p-1.5 text-left w-32">Nama Pemohon</th>
                <th className="border border-slate-300 p-1.5 w-14 text-center">Rating</th>
                <th className="border border-slate-300 p-1.5 text-left">Saran &amp; Masukan Masyarakat</th>
              </tr>
            </thead>
            <tbody>
              {sortedSurveys.filter((s) => s.feedback && s.feedback.trim().length > 0).length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-slate-500 italic">
                    Belum ada catatan saran atau masukan untuk filter ini.
                  </td>
                </tr>
              ) : (
                sortedSurveys
                  .filter((s) => s.feedback && s.feedback.trim().length > 0)
                  .map((item, idx) => (
                    <tr
                      key={item.id}
                      className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}
                    >
                      <td className="border border-slate-300 p-1 text-center font-mono text-[10px]">{idx + 1}</td>
                      <td className="border border-slate-300 p-1 text-center font-mono text-[10px] whitespace-nowrap">
                        {formatDateTime(item)}
                      </td>
                      <td className="border border-slate-300 p-1 font-semibold text-slate-800 text-[10px]">
                        {item.agencyName}
                      </td>
                      <td className="border border-slate-300 p-1 font-bold text-slate-900 text-[10px]">
                        {item.isAnonymous ? 'Anonim' : item.respondentName}
                      </td>
                      <td className="border border-slate-300 p-1 text-center font-bold text-amber-900 text-[10px]">
                        ⭐ {item.rating}
                      </td>
                      <td className="border border-slate-300 p-1.5 text-slate-800 italic leading-relaxed">
                        "{item.feedback}"
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Jarak Pemisah Rapi & Berjarak Antara Tabel V dan Tabel VI */}
      <div className="my-6 sm:my-8 border-b-2 border-slate-300 print:my-6 print:border-b-2 print:border-slate-300" />

      {/* BAGIAN 6: PROFIL DEMOGRAFI RESPONDEN */}
      <div id="section-rekap-6" className="mt-4 sm:mt-6 mb-6 space-y-3.5 scroll-mt-6 print:mt-4 print:mb-6">
        <div className="flex items-center justify-between border-b-2 border-slate-800 pb-1.5 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-slate-900 text-white font-extrabold text-xs px-2.5 py-0.5 rounded shrink-0">VI</span>
            <h3 className="text-xs sm:text-sm font-bold uppercase text-slate-900 tracking-wide">
              Profil Demografi Responden Pemohon
            </h3>
          </div>
          <span className="text-[10px] text-slate-600 font-semibold font-mono">
            Tabel VI • Analisis Karakteristik Responden
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
          {/* Gender */}
          <div className="border border-slate-300 rounded-xl p-2.5 bg-slate-50/50">
            <p className="font-bold text-slate-800 mb-1.5 border-b border-slate-200 pb-1">Berdasarkan Gender</p>
            <ul className="space-y-1">
              <li className="flex justify-between">
                <span>Laki-laki:</span>
                <strong className="font-mono">{genderBreakdown['Laki-laki'] || 0} orang</strong>
              </li>
              <li className="flex justify-between">
                <span>Perempuan:</span>
                <strong className="font-mono">{genderBreakdown['Perempuan'] || 0} orang</strong>
              </li>
              <li className="flex justify-between text-slate-500">
                <span>Anonim/Lainnya:</span>
                <strong className="font-mono">{genderBreakdown['Tidak Ingin Memberitahu'] || 0} orang</strong>
              </li>
            </ul>
          </div>

          {/* Usia */}
          <div className="border border-slate-300 rounded-xl p-2.5 bg-slate-50/50">
            <p className="font-bold text-slate-800 mb-1.5 border-b border-slate-200 pb-1">Berdasarkan Usia</p>
            <ul className="space-y-1">
              {Object.entries(ageBreakdown).map(([age, count]) => (
                <li key={age} className="flex justify-between">
                  <span className="truncate pr-1">{age}:</span>
                  <strong className="font-mono shrink-0">{count} orang</strong>
                </li>
              ))}
            </ul>
          </div>

          {/* Pendidikan */}
          <div className="border border-slate-300 rounded-xl p-2.5 bg-slate-50/50">
            <p className="font-bold text-slate-800 mb-1.5 border-b border-slate-200 pb-1">Berdasarkan Pendidikan</p>
            <ul className="space-y-1">
              {Object.entries(eduBreakdown).map(([edu, count]) => (
                <li key={edu} className="flex justify-between">
                  <span className="truncate pr-1">{edu}:</span>
                  <strong className="font-mono shrink-0">{count} orang</strong>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Jarak Pemisah Rapi & Berjarak Antara Tabel VI dan Lembar Pengesahan */}
      <div className="my-6 sm:my-8 border-b-2 border-slate-300 print:my-6 print:border-b-2 print:border-slate-300" />

      {/* BAGIAN 7: LEMBAR PENGESAHAN TANDA TANGAN RESMI */}
      <div className="print-avoid-break mt-6 pt-4 border-t-2 border-slate-800 flex justify-end text-xs">
        <div className="text-center space-y-1.5 w-80 max-w-sm">
          <p className="text-slate-800 font-medium">{signCity}, {displayPrintDate}</p>
          <div className="min-h-[44px] flex items-center justify-center">
            <p className="font-bold text-slate-900 text-xs leading-snug px-1 text-center whitespace-pre-line max-w-[280px] mx-auto">
              {signerTitle}
            </p>
          </div>
          <div className="h-16 flex items-center justify-center">
            <span className="text-[10px] text-slate-300 font-mono tracking-widest">[Tanda Tangan &amp; Cap Resmi]</span>
          </div>
          <p className="font-black underline text-slate-950 text-sm tracking-tight">{signerName}</p>
          <p className="text-slate-700 font-mono text-[11px]">NIP. {signerNip}</p>
        </div>
      </div>
    </div>
  );
};
