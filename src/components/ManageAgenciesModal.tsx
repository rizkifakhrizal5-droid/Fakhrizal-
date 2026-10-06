import React, { useState } from 'react';
import {
  X,
  Plus,
  Download,
  Upload,
  Edit2,
  Trash2,
  CheckCircle,
  FileSpreadsheet,
  FileJson,
  Check,
  Search,
  AlertCircle
} from 'lucide-react';
import { Agency } from '../types/survey';

interface ManageAgenciesModalProps {
  agencies: Agency[];
  isOpen: boolean;
  onClose: () => void;
  onSaveAgency: (agency: Agency) => Promise<void>;
  onDeleteAgency: (id: string) => Promise<void>;
  onImportAgencies: (agencies: Agency[], replace: boolean) => Promise<void>;
}

export const ManageAgenciesModal: React.FC<ManageAgenciesModalProps> = ({
  agencies,
  isOpen,
  onClose,
  onSaveAgency,
  onDeleteAgency,
  onImportAgencies,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'export' | 'import'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [agencyPage, setAgencyPage] = useState(1);
  const itemsPerPage = 5;

  // Editing / adding agency
  const [editingAgency, setEditingAgency] = useState<Agency | null>(null);
  const [isAddMode, setIsAddMode] = useState<boolean>(false);
  const [formName, setFormName] = useState('');
  const [formActive, setFormActive] = useState(true);

  // Import state
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [importStatusMessage, setImportStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredAgencies = agencies.filter((a) =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredAgencies.length / itemsPerPage) || 1;
  const paginatedAgencies = filteredAgencies.slice(
    (agencyPage - 1) * itemsPerPage,
    agencyPage * itemsPerPage
  );

  const handleStartAdd = () => {
    setIsAddMode(true);
    setEditingAgency(null);
    setFormName('');
    setFormActive(true);
  };

  const handleStartEdit = (agency: Agency) => {
    setIsAddMode(false);
    setEditingAgency(agency);
    setFormName(agency.name);
    setFormActive(agency.active);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (isAddMode) {
      const newAgency: Agency = {
        id: `agency-${Date.now()}`,
        name: formName.trim(),
        category: 'Pelayanan Publik',
        active: formActive,
        order: agencies.length + 1,
      };
      await onSaveAgency(newAgency);
    } else if (editingAgency) {
      const updated: Agency = {
        ...editingAgency,
        name: formName.trim(),
        active: formActive,
      };
      await onSaveAgency(updated);
    }

    setEditingAgency(null);
    setIsAddMode(false);
  };

  const handleToggleStatus = async (agency: Agency) => {
    await onSaveAgency({
      ...agency,
      active: !agency.active,
    });
  };

  // Export handlers
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(agencies, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Daftar_Instansi_MPP_Bojonegoro_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCSV = () => {
    const header = 'No,Nama Instansi Publik,Status\n';
    const rows = agencies.map((a, i) =>
      `"${i + 1}","${a.name.replace(/"/g, '""')}","${a.active ? 'Aktif' : 'Nonaktif'}"`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Daftar_Instansi_MPP_Bojonegoro_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleDownloadTemplate = () => {
    const content = 'No,Nama Instansi Publik,Status\n1,"Dinas Penanaman Modal Dan Pelayanan Terpadu Satu Pintu","Aktif"\n2,"Dinas Kependudukan Dan Pencatatan Sipil","Aktif"';
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Template_Impor_Instansi_MPP.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        let importedList: Agency[] = [];

        if (file.name.endsWith('.json')) {
          importedList = JSON.parse(text);
        } else {
          // Parse CSV
          const lines = text.split('\n').filter((l) => l.trim().length > 0);
          const startIndex = lines[0].toLowerCase().includes('instansi') ? 1 : 0;
          for (let i = startIndex; i < lines.length; i++) {
            const cols = lines[i].split(',').map((c) => c.replace(/^["']|["']$/g, '').trim());
            if (cols.length >= 2) {
              const name = cols[1] || cols[0];
              const category = cols[2] || 'Umum';
              const status = cols[3]?.toLowerCase() !== 'nonaktif';
              importedList.push({
                id: `agency-imp-${Date.now()}-${i}`,
                name,
                category,
                active: status,
                order: i,
              });
            }
          }
        }

        if (importedList.length > 0) {
          await onImportAgencies(importedList, importMode === 'replace');
          setImportStatusMessage(`Berhasil mengimpor ${importedList.length} instansi!`);
          setTimeout(() => {
            setActiveTab('list');
            setImportStatusMessage(null);
          }, 1500);
        } else {
          setImportStatusMessage('Format file tidak dikenali atau baris kosong.');
        }
      } catch (err) {
        setImportStatusMessage('Gagal membaca file impor. Pastikan format CSV atau JSON valid.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg sm:max-w-xl w-full max-h-[70vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden text-xs">
        {/* Modal Top Bar (Ukuran diperkecil ringkas) */}
        <div className="px-4 py-2.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div>
            <h2 className="text-sm sm:text-base font-black text-slate-900">
              Menu Kelola Instansi Publik MPP Bojonegoro
            </h2>
            <p className="text-[10px] text-slate-500">
              Pengaturan instansi publik, status keaktifan, dan impor / ekspor data
            </p>
          </div>
          {/* Tombol X disembunyikan sesuai permintaan */}
        </div>

        {/* Tab Sub-navigation (Ukuran Diperkecil Ramping) */}
        <div className="px-4 pt-1.5 border-b border-slate-200 bg-white flex items-center justify-between flex-wrap gap-2">
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('list')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-t-lg transition-colors border-b-2 cursor-pointer ${
                activeTab === 'list'
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Daftar Instansi
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('export')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-t-lg transition-colors border-b-2 flex items-center gap-1 cursor-pointer ${
                activeTab === 'export'
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Download className="w-3 h-3" />
              Ekspor Data
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('import')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-t-lg transition-colors border-b-2 flex items-center gap-1 cursor-pointer ${
                activeTab === 'import'
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-3 h-3" />
              Impor Data
            </button>
          </div>

          {activeTab === 'list' && !isAddMode && !editingAgency && (
            <button
              type="button"
              onClick={handleStartAdd}
              className="mb-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              Tambah Instansi
            </button>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-4">
          {/* TAB 1: LIST / EDIT */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              {/* Add / Edit Form Drawer */}
              {(isAddMode || editingAgency) && (
                <form
                  onSubmit={handleSaveForm}
                  className="bg-blue-50/60 p-4 sm:p-5 rounded-2xl border border-blue-200 space-y-4 mb-4"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-blue-900">
                      {isAddMode ? '+ Tambah Instansi Publik Baru' : 'Edit Instansi Publik'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddMode(false);
                        setEditingAgency(null);
                      }}
                      className="text-xs text-slate-500 hover:text-slate-800"
                    >
                      Batal
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Nama Instansi Publik *
                    </label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Contoh: Dinas Kesehatan"
                      required
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 shadow-xs"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formActive}
                        onChange={(e) => setFormActive(e.target.checked)}
                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                      />
                      <span>Instansi Aktif dalam Pilihan Formulir Survei Pemohon</span>
                    </label>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddMode(false);
                          setEditingAgency(null);
                        }}
                        className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-xl font-medium"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                      >
                        Simpan Instansi
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Search agency */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari nama instansi publik..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white shadow-xs"
                />
              </div>

              {/* Agency list matching screenshot 5 */}
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                <div className="px-3 py-2 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider flex justify-between items-center">
                  <span>DAFTAR INSTANSI PUBLIK TERDAFTAR</span>
                  <div className="flex items-center gap-1.5 lowercase">
                    <button
                      type="button"
                      onClick={() => setAgencyPage((p) => Math.max(p - 1, 1))}
                      disabled={agencyPage === 1}
                      className="px-2 py-0.5 bg-white border border-slate-300 rounded text-[11px] font-bold disabled:opacity-40"
                    >
                      Sebelumnya
                    </button>
                    <span className="font-mono text-[11px] font-bold px-1 uppercase">{agencyPage}/{totalPages}</span>
                    <button
                      type="button"
                      onClick={() => setAgencyPage((p) => Math.min(p + 1, totalPages))}
                      disabled={agencyPage === totalPages}
                      className="px-2 py-0.5 bg-white border border-slate-300 rounded text-[11px] font-bold disabled:opacity-40"
                    >
                      Selanjutnya
                    </button>
                  </div>
                </div>

                <div className="max-h-[250px] overflow-y-auto divide-y divide-slate-100">
                  {paginatedAgencies.map((agency, index) => {
                    const absIdx = (agencyPage - 1) * itemsPerPage + index + 1;
                    return (
                      <div
                        key={agency.id}
                        className="px-3 py-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors gap-2"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <span className="w-6 text-center text-[11px] font-mono font-bold text-slate-400 shrink-0">
                            {absIdx}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-800 break-words leading-snug">
                              {agency.name}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Status Toggle */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(agency)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                              agency.active
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            {agency.active ? 'Aktif' : 'Nonaktif'}
                          </button>

                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => handleStartEdit(agency)}
                            className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit nama"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Tombol X / Hapus disembunyikan sesuai permintaan */}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination Controls - tombol sebelumnya & selanjutnya di bagian bawah disembunyikan */}
                <div className="px-3 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600 font-semibold">
                  <span>Halaman {agencyPage} dari {totalPages} (5 instansi per halaman)</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EKSPOR DATA (Matches Screenshot 3) */}
          {activeTab === 'export' && (
            <div className="space-y-6">
              <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm text-blue-900">
                  <p className="font-bold">Ringkasan Data Siap Ekspor</p>
                  <p className="text-blue-700">
                    Tersedia instansi publik terdaftar di sistem. Anda dapat mengunduh seluruh data dalam format spreadsheet Excel resmi (.csv/.xlsx) untuk laporan dinas atau file cadangan JSON untuk arsip sistem.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Excel Option */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Ekspor ke Dokumen Excel (.csv / .xlsx)
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Dokumen spreadsheet lengkap dengan nomor urut, nama resmi, dan status keaktifan instansi publik MPP Bojonegoro.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Unduh File Excel (.csv)
                  </button>
                </div>

                {/* JSON Backup Option */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
                      <FileJson className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Ekspor ke Cadangan Data JSON (.json)
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Format terstruktur untuk backup cadangan database atau pemindahan ("migration") ke sistem lain sewaktu-waktu.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportJSON}
                    className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Unduh File Cadangan JSON
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: IMPOR DATA (Matches Screenshot 4) */}
          {activeTab === 'import' && (
            <div className="space-y-6">
              {/* Template guidance */}
              <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200 flex items-center justify-between flex-wrap gap-3">
                <div className="text-xs text-amber-900">
                  <p className="font-bold">Butuh Contoh Format File Impor?</p>
                  <p className="text-amber-700">
                    Unduh template resmi untuk memastikan format kolom sesuai dan terverifikasi otomatis.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Unduh Format Template
                </button>
              </div>

              {/* Import Mode Radio Choice */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Pilih Metode Impor Data:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      importMode === 'append'
                        ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="importMode"
                        checked={importMode === 'append'}
                        onChange={() => setImportMode('append')}
                        className="mt-1 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-slate-900">
                          Tambahkan ke Data yang Ada (Append)
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Menambahkan instansi baru dari file tanpa menghapus data instansi yang sudah ada saat ini.
                        </p>
                      </div>
                    </div>
                  </label>

                  <label
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      importMode === 'replace'
                        ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="importMode"
                        checked={importMode === 'replace'}
                        onChange={() => setImportMode('replace')}
                        className="mt-1 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-slate-900">
                          Gantikan Seluruh Data (Replace All)
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Menghapus seluruh instansi lama dan menggantinya dengan daftar instansi dari file impor.
                        </p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-slate-300 rounded-3xl p-8 text-center bg-slate-50/60 hover:bg-blue-50/30 hover:border-blue-400 transition-colors relative">
                <input
                  type="file"
                  accept=".csv,.json,.txt"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-xs">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      Pilih File Excel (.csv) atau JSON (.json)
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Klik di sini atau seret file Anda ke area ini
                    </p>
                  </div>
                </div>
              </div>

              {importStatusMessage && (
                <div className="p-3 bg-blue-50 text-blue-800 border border-blue-200 rounded-xl text-xs font-semibold text-center animate-in fade-in">
                  {importStatusMessage}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer (Ukuran ringkas) */}
        <div className="px-4 py-2 border-t border-slate-200 bg-slate-50/70 flex justify-between items-center text-[11px] text-slate-500">
          <span>Mal Pelayanan Publik Kabupaten Bojonegoro</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg transition-colors cursor-pointer text-xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
