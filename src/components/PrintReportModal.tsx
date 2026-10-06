import React, { useState } from 'react';
import {
  Printer,
  X,
  FileText,
  SlidersHorizontal,
  RotateCcw,
  Edit3
} from 'lucide-react';
import { SurveyResponse, Agency, IKMStats, FilterState } from '../types/survey';
import { RekapReportDocument } from './RekapReportDocument';
import { DEFAULT_AGENCIES } from '../data/defaultAgencies';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  surveys: SurveyResponse[];
  agencies?: Agency[];
  stats: IKMStats;
  filters: FilterState;
  monthsList?: string[];
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  onClose,
  surveys,
  agencies = DEFAULT_AGENCIES,
  stats,
  filters,
}) => {
  // Toggle panel edit kop surat
  const [showEditPanel, setShowEditPanel] = useState<boolean>(false);
  const [editTab, setEditTab] = useState<'kop' | 'dokumen' | 'ttd' | 'ukuran'>('kop');

  // Pilihan Ukuran Kertas & Skala Laporan
  const [paperSize, setPaperSize] = useState<'a4' | 'f4' | 'letter'>('a4');
  const [docScale, setDocScale] = useState<number>(95);

  // State Isian Kop Surat Resmi
  const [kopPemda, setKopPemda] = useState('PEMERINTAH KABUPATEN BOJONEGORO');
  const [kopDinas, setKopDinas] = useState('DINAS PENANAMAN MODAL DAN PELAYANAN TERPADU SATU PINTU');
  const [kopUnit, setKopUnit] = useState('MAL PELAYANAN PUBLIK (MPP) GAMPIL');
  const [kopAlamat, setKopAlamat] = useState('Jl. Veteran No. 227 Bojonegoro, Jawa Timur 62119');
  const [kopKontak, setKopKontak] = useState('Telp: (0353) 887654 • Email: mpp@bojonegorokab.go.id • Website: mpp.bojonegorokab.go.id');

  // State Isian Judul & Nomor Dokumen
  const [documentTitle, setDocumentTitle] = useState('REKAPITULASI RESMI HASIL PENGUKURAN SURVEI KEPUASAN MASYARAKAT (SKM)');
  const [documentNumber, setDocumentNumber] = useState(
    `060 / ${stats.totalRespondents || surveys.length || 36} / SKM-MPP / ${filters.year > 0 ? filters.year : 2026}`
  );

  // State Penandatangan Resmi
  const [signerName, setSignerName] = useState('Ir. H. Rachmat Junaidi, M.M.');
  const [signerNip, setSignerNip] = useState('19740512 199903 1 004');
  const [signerTitle, setSignerTitle] = useState(
    'Kepala Dinas Penanaman Modal Dan Pelayanan Terpadu Satu Pintu\nKabupaten Bojonegoro'
  );
  const [signCity, setSignCity] = useState('Bojonegoro');
  const [printDate, setPrintDate] = useState(() => {
    return new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  });

  if (!isOpen) return null;

  // Cetak Laporan langsung tanpa bug atau pembatasan iframe tersembunyi
  const handlePrint = () => {
    window.focus();
    window.print();
  };

  const handleResetKopToDefault = () => {
    setKopPemda('PEMERINTAH KABUPATEN BOJONEGORO');
    setKopDinas('DINAS PENANAMAN MODAL DAN PELAYANAN TERPADU SATU PINTU');
    setKopUnit('MAL PELAYANAN PUBLIK (MPP) GAMPIL');
    setKopAlamat('Jl. Veteran No. 227 Bojonegoro, Jawa Timur 62119');
    setKopKontak('Telp: (0353) 887654 • Email: mpp@bojonegorokab.go.id • Website: mpp.bojonegorokab.go.id');
    setDocumentTitle('REKAPITULASI RESMI HASIL PENGUKURAN SURVEI KEPUASAN MASYARAKAT (SKM)');
    setDocumentNumber(`060 / ${stats.totalRespondents || surveys.length || 36} / SKM-MPP / ${filters.year > 0 ? filters.year : 2026}`);
    setSignerName('Ir. H. Rachmat Junaidi, M.M.');
    setSignerNip('19740512 199903 1 004');
    setSignerTitle('Kepala Dinas Penanaman Modal dan Pelayanan Terpadu Satu Pintu Kabupaten Bojonegoro');
    setSignCity('Bojonegoro');
    setDocScale(95);
    setPaperSize('a4');
  };

  return (
    <div className="print-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-200 print:static print:p-0 print:m-0 print:bg-white print:block print:overflow-visible">
      <div className="print-modal-container bg-white rounded-3xl max-w-6xl w-full h-[96vh] flex flex-col shadow-2xl border border-slate-300 overflow-hidden print:h-auto print:max-h-none print:overflow-visible print:border-none print:shadow-none print:rounded-none print:w-full print:max-w-none print:block">
        {/* Modal Top Control Bar (Hidden when printing!) */}
        <div className="px-5 sm:px-6 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/40 border border-blue-400/40 flex items-center justify-center text-blue-300">
              <Printer className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Rekapitulasi &amp; Cetak Laporan Resmi SKM
              </h2>
              <p className="text-[11px] text-blue-200/80">
                Memuat Penilaian Instansi, 9 Unsur Pelayanan Publik, Data Pemohon, dan Saran Masukan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            {/* Tombol Edit Kop Surat */}
            <button
              type="button"
              onClick={() => setShowEditPanel(!showEditPanel)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                showEditPanel
                  ? 'bg-amber-400 text-amber-950 shadow-md ring-2 ring-amber-300'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
              }`}
              title="Kustomisasi Kop Surat, Judul, dan Pejabat Penandatangan"
            >
              <Edit3 className="w-4 h-4 text-amber-300" />
              <span>{showEditPanel ? 'Tutup Edit Kop' : 'Edit Kop Surat'}</span>
            </button>

            {/* Tombol Cetak Laporan */}
            <button
              type="button"
              onClick={handlePrint}
              className="btn-3d-blue px-4 py-2 text-xs sm:text-sm font-extrabold flex items-center gap-2 cursor-pointer shadow-md text-white active:scale-95"
              title="Cetak langsung menggunakan printer fisik atau dialog cetak browser"
            >
              <Printer className="w-4 h-4 text-white" />
              <span>Cetak Laporan</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer border border-white/20"
              title="Tutup"
            >
              Tutup
            </button>
          </div>
        </div>

        {/* DRAWER: EDIT KOP SURAT & ISIAN LAPORAN FISIK (Print Hidden) */}
        {showEditPanel && (
          <div className="bg-slate-50 border-b-2 border-slate-300 p-5 sm:p-6 max-h-[60vh] min-h-[340px] overflow-y-auto print:hidden animate-in slide-in-from-top-3 duration-200 shadow-inner">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                  Panel Pengaturan Kop Surat &amp; Format Dokumen Laporan
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {/* Tab selector */}
                <div className="flex rounded-lg bg-slate-200 p-0.5 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setEditTab('kop')}
                    className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                      editTab === 'kop' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Kop Surat
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditTab('dokumen')}
                    className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                      editTab === 'dokumen' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Nomor &amp; Judul
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditTab('ttd')}
                    className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                      editTab === 'ttd' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Penandatangan
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditTab('ukuran')}
                    className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                      editTab === 'ukuran' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Ukuran Kertas
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleResetKopToDefault}
                  className="px-2.5 py-1 text-[11px] font-bold text-rose-700 hover:bg-rose-50 rounded-lg border border-rose-200 flex items-center gap-1 cursor-pointer"
                  title="Kembalikan semua isian ke standar baku"
                >
                  <RotateCcw className="w-3 h-3 text-rose-600" />
                  <span>Reset Baku</span>
                </button>
              </div>
            </div>

            {/* TAB KOP SURAT */}
            {editTab === 'kop' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Pemerintah Daerah:</label>
                  <input
                    type="text"
                    value={kopPemda}
                    onChange={(e) => setKopPemda(e.target.value)}
                    className="input-3d w-full px-3 py-2 text-xs font-semibold"
                    placeholder="Contoh: PEMERINTAH KABUPATEN BOJONEGORO"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Dinas / Badan Induk:</label>
                  <input
                    type="text"
                    value={kopDinas}
                    onChange={(e) => setKopDinas(e.target.value)}
                    className="input-3d w-full px-3 py-2 text-xs font-semibold"
                    placeholder="Contoh: DINAS PMPTSP"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Nama Unit Pelayanan / MPP:</label>
                  <input
                    type="text"
                    value={kopUnit}
                    onChange={(e) => setKopUnit(e.target.value)}
                    className="input-3d w-full px-3 py-2 text-xs font-semibold"
                    placeholder="Contoh: MAL PELAYANAN PUBLIK (MPP) GAMPIL"
                  />
                </div>

                <div className="space-y-1 sm:col-span-3">
                  <label className="font-bold text-slate-700">Alamat Kantor Lengkap:</label>
                  <input
                    type="text"
                    value={kopAlamat}
                    onChange={(e) => setKopAlamat(e.target.value)}
                    className="input-3d w-full px-3 py-2 text-xs font-semibold"
                    placeholder="Jl. Veteran No. 227 Bojonegoro, Jawa Timur 62119"
                  />
                </div>

                <div className="space-y-1 sm:col-span-3">
                  <label className="font-bold text-slate-700">Kontak, Telepon, Email &amp; Web:</label>
                  <input
                    type="text"
                    value={kopKontak}
                    onChange={(e) => setKopKontak(e.target.value)}
                    className="input-3d w-full px-3 py-2 text-xs font-semibold"
                    placeholder="Telp / Email / Website"
                  />
                </div>
              </div>
            )}

            {/* TAB NOMOR & JUDUL */}
            {editTab === 'dokumen' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-slate-700">Judul Dokumen Laporan:</label>
                  <input
                    type="text"
                    value={documentTitle}
                    onChange={(e) => setDocumentTitle(e.target.value)}
                    className="input-3d w-full px-3 py-2 text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Nomor Surat / Dokumen Laporan:</label>
                  <input
                    type="text"
                    value={documentNumber}
                    onChange={(e) => setDocumentNumber(e.target.value)}
                    className="input-3d w-full px-3 py-2 text-xs font-semibold font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Tanggal Resmi Cetak Dokumen:</label>
                  <input
                    type="text"
                    value={printDate}
                    onChange={(e) => setPrintDate(e.target.value)}
                    className="input-3d w-full px-3 py-2 text-xs font-semibold"
                  />
                </div>
              </div>
            )}

            {/* TAB PENANDATANGAN RESMI */}
            {editTab === 'ttd' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Nama Pejabat Penandatangan:</label>
                  <input
                    type="text"
                    value={signerName}
                    onChange={(e) => setSignerName(e.target.value)}
                    className="input-3d w-full px-3 py-2 text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">NIP Pejabat:</label>
                  <input
                    type="text"
                    value={signerNip}
                    onChange={(e) => setSignerNip(e.target.value)}
                    className="input-3d w-full px-3 py-2 text-xs font-semibold font-mono"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-slate-700">Jabatan Penandatangan (Dikemas Rapi):</label>
                  <input
                    type="text"
                    value={signerTitle}
                    onChange={(e) => setSignerTitle(e.target.value)}
                    className="input-3d w-full px-3 py-2 text-xs font-semibold"
                    placeholder="Kepala Dinas Penanaman Modal Dan Pelayanan Terpadu Satu Pintu Kabupaten Bojonegoro"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Kota Lokasi Pengesahan:</label>
                  <input
                    type="text"
                    value={signCity}
                    onChange={(e) => setSignCity(e.target.value)}
                    className="input-3d w-full px-3 py-2 text-xs font-semibold"
                  />
                </div>
              </div>
            )}

            {/* TAB UKURAN CETAK LAPORAN */}
            {editTab === 'ukuran' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-2 p-3 bg-white rounded-xl border border-slate-200">
                  <label className="font-bold text-slate-800 block">Pilihan Ukuran Kertas Dokumen Laporan:</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaperSize('a4')}
                      className={`py-2 px-2.5 rounded-lg font-bold text-xs text-center border transition-all cursor-pointer ${
                        paperSize === 'a4'
                          ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      A4 (Standar)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaperSize('f4')}
                      className={`py-2 px-2.5 rounded-lg font-bold text-xs text-center border transition-all cursor-pointer ${
                        paperSize === 'f4'
                          ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      F4 / Folio (Dinas)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaperSize('letter')}
                      className={`py-2 px-2.5 rounded-lg font-bold text-xs text-center border transition-all cursor-pointer ${
                        paperSize === 'letter'
                          ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      Letter
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-500 block">
                    Ukuran terpilih: <strong>{paperSize.toUpperCase()}</strong> ({paperSize === 'a4' ? '210 x 297 mm' : paperSize === 'f4' ? '215 x 330 mm' : '216 x 279 mm'})
                  </span>
                </div>

                <div className="space-y-2 p-3 bg-white rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-slate-800">Skala / Ukuran Tampilan Cetak:</label>
                    <span className="font-mono font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {docScale}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={75}
                    max={105}
                    step={1}
                    value={docScale}
                    onChange={(e) => setDocScale(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                    <span>80% (Penuh 1 Hal)</span>
                    <span>90% (Kompak)</span>
                    <span>95% (Ideal)</span>
                    <span>100% (Normal)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* NAVIGASI SEJAJAR & BERDAMPINGAN 6 BAB LAPORAN (Hidden when printing) */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-100 border-b border-slate-200 overflow-x-auto print:hidden shadow-2xs">
          <div className="flex items-center justify-start xl:justify-center gap-2 text-[11px] font-bold min-w-max">
            <button
              type="button"
              onClick={() => {
                document.getElementById('section-rekap-1')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-blue-50 text-slate-800 hover:text-blue-700 border border-slate-200 flex items-center gap-1.5 shrink-0 transition-colors shadow-2xs cursor-pointer"
              title="I. Ringkasan Capaian Indeks Kepuasan Masyarakat (IKM)"
            >
              <span className="px-1.5 py-0.5 rounded bg-slate-900 text-white text-[10px] font-mono">I</span>
              <span>Ringkasan Capaian Indeks Kepuasan Masyarakat (IKM)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                document.getElementById('section-rekap-2')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-blue-50 text-slate-800 hover:text-blue-700 border border-slate-200 flex items-center gap-1.5 shrink-0 transition-colors shadow-2xs cursor-pointer"
              title="II. Penilaian & Capaian Kinerja Instansi Pelayanan Publik"
            >
              <span className="px-1.5 py-0.5 rounded bg-slate-900 text-white text-[10px] font-mono">II</span>
              <span>Penilaian &amp; Capaian Kinerja Instansi Pelayanan Publik</span>
            </button>
            <button
              type="button"
              onClick={() => {
                document.getElementById('section-rekap-3')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-blue-50 text-slate-800 hover:text-blue-700 border border-slate-200 flex items-center gap-1.5 shrink-0 transition-colors shadow-2xs cursor-pointer"
              title="III. Rekapitulasi Rincian 9 Unsur Pelayanan Publik"
            >
              <span className="px-1.5 py-0.5 rounded bg-slate-900 text-white text-[10px] font-mono">III</span>
              <span>Rekapitulasi Rincian 9 Unsur Pelayanan Publik</span>
            </button>
            <button
              type="button"
              onClick={() => {
                document.getElementById('section-rekap-4')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-blue-50 text-slate-800 hover:text-blue-700 border border-slate-200 flex items-center gap-1.5 shrink-0 transition-colors shadow-2xs cursor-pointer"
              title="IV. Data Rincian Seluruh Responden Pemohon Pelayanan"
            >
              <span className="px-1.5 py-0.5 rounded bg-slate-900 text-white text-[10px] font-mono">IV</span>
              <span>Data Rincian Seluruh Responden Pemohon Pelayanan</span>
            </button>
            <button
              type="button"
              onClick={() => {
                document.getElementById('section-rekap-5')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-blue-50 text-slate-800 hover:text-blue-700 border border-slate-200 flex items-center gap-1.5 shrink-0 transition-colors shadow-2xs cursor-pointer"
              title="V. Saran, Masukan & Aspirasi Masyarakat"
            >
              <span className="px-1.5 py-0.5 rounded bg-slate-900 text-white text-[10px] font-mono">V</span>
              <span>Saran, Masukan &amp; Aspirasi Masyarakat</span>
            </button>
            <button
              type="button"
              onClick={() => {
                document.getElementById('section-rekap-6')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-blue-50 text-slate-800 hover:text-blue-700 border border-slate-200 flex items-center gap-1.5 shrink-0 transition-colors shadow-2xs cursor-pointer"
              title="VI. Profil Demografi Responden Pemohon"
            >
              <span className="px-1.5 py-0.5 rounded bg-slate-900 text-white text-[10px] font-mono">VI</span>
              <span>Profil Demografi Responden Pemohon</span>
            </button>
          </div>
        </div>

        {/* PRINTABLE DOCUMENT BODY (Official RekapReportDocument with all sections) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 text-slate-900 print:p-0 print:overflow-visible printable-area">
          <RekapReportDocument
            id="report-document-to-download"
            surveys={surveys}
            agencies={agencies}
            stats={stats}
            filters={filters}
            kopPemda={kopPemda}
            kopDinas={kopDinas}
            kopUnit={kopUnit}
            kopAlamat={kopAlamat}
            kopKontak={kopKontak}
            documentTitle={documentTitle}
            documentNumber={documentNumber}
            signerName={signerName}
            signerNip={signerNip}
            signerTitle={signerTitle}
            signCity={signCity}
            printDate={printDate}
            docScale={docScale}
          />
        </div>

        {/* Modal Footer Controls (Hidden when printing) */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500 print:hidden">
          <div className="flex items-center gap-2">
            <span>Dokumen rekap memuat <strong>Penilaian Instansi</strong>, <strong>9 Unsur Pelayanan</strong>, <strong>Data Pemohon</strong>, dan <strong>Saran Masukan</strong>.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
