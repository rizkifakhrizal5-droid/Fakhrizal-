import React, { useState } from 'react';
import {
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
  AlertCircle,
  Building2,
  Sparkles,
  CheckCircle2
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

  // Fitur Hapus 3 Dimensi State
  const [agencyToDelete, setAgencyToDelete] = useState<Agency | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Status Notifikasi Aksi Permanen
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'delete' | 'error';
  } | null>(null);

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

    try {
      if (isAddMode) {
        // ID unik permanen Firestore
        const newAgency: Agency = {
          id: `agency-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: formName.trim(),
          category: 'Pelayanan Publik',
          active: formActive,
          order: agencies.length + 1,
        };
        await onSaveAgency(newAgency);
        setNotification({
          message: `Instansi "${newAgency.name}" berhasil ditambahkan & tersimpan permanen di cloud database!`,
          type: 'success',
        });
      } else if (editingAgency) {
        const updated: Agency = {
          ...editingAgency,
          name: formName.trim(),
          active: formActive,
        };
        await onSaveAgency(updated);
        setNotification({
          message: `Perubahan instansi "${updated.name}" berhasil disimpan permanen!`,
          type: 'success',
        });
      }
      setTimeout(() => setNotification(null), 3500);
      setEditingAgency(null);
      setIsAddMode(false);
    } catch (err) {
      console.error('Save agency error:', err);
      setNotification({
        message: 'Gagal menyimpan instansi ke database. Silakan coba lagi.',
        type: 'error',
      });
      setTimeout(() => setNotification(null), 3500);
    }
  };

  const handleConfirmDelete = async () => {
    if (!agencyToDelete) return;
    setIsDeleting(true);
    try {
      await onDeleteAgency(agencyToDelete.id);
      setNotification({
        message: `Instansi "${agencyToDelete.name}" berhasil dihapus secara permanen dari sistem.`,
        type: 'delete',
      });
      setTimeout(() => setNotification(null), 3500);
      setAgencyToDelete(null);
    } catch (err) {
      console.error('Delete error:', err);
      setNotification({
        message: 'Gagal menghapus instansi dari database. Silakan coba lagi.',
        type: 'error',
      });
      setTimeout(() => setNotification(null), 3500);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (agency: Agency) => {
    const updated = {
      ...agency,
      active: !agency.active,
    };
    await onSaveAgency(updated);
    setNotification({
      message: `Status instansi "${agency.name}" diubah menjadi ${updated.active ? 'Aktif' : 'Nonaktif'} (Tersimpan Permanen).`,
      type: 'success',
    });
    setTimeout(() => setNotification(null), 3000);
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
    <div className="fixed inset-0 z-50 overflow-y-auto overscroll-y-contain bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200 touch-pan-y">
      <div className="min-h-full flex items-center justify-center p-2.5 sm:p-4 py-6">
        <div className="card-3d bg-white rounded-3xl max-w-xl sm:max-w-2xl w-full max-h-[85vh] flex flex-col shadow-[0_25px_60px_-15px_rgba(15,23,42,0.45)] border-2 border-slate-200/90 overflow-hidden text-xs transform-gpu transition-all my-auto">
        {/* Modal Top Bar 3D Accent & Header */}
        <div className="px-5 py-3.5 border-b border-blue-900/40 flex items-center justify-between bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-950 text-white shadow-md relative overflow-hidden shrink-0">
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-3 min-w-0 z-10">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg border border-blue-300/30 shrink-0 transform-gpu hover:rotate-6 transition-transform">
              <Building2 className="w-5 h-5 text-white drop-shadow-md" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-white tracking-tight truncate">
                  Menu Kelola Penambahan Instansi Publik MPP Bojonegoro
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[9px] font-bold uppercase tracking-wider shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Cloud Sync
                </span>
              </div>
              <p className="text-[10.5px] text-blue-200/80 truncate">
                Tambah, edit, hapus instansi publik &amp; sinkron otomatis permanen lintas perangkat
              </p>
            </div>
          </div>

          {/* Tombol X sengaja disembunyikan sesuai permintaan (penutupan modal menggunakan tombol Tutup di bawah) */}
        </div>

        {/* Tab Sub-navigation 3D */}
        <div className="px-5 pt-2 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between flex-wrap gap-2 shrink-0">
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('list')}
              className={`px-3 py-1.5 text-xs font-bold rounded-t-xl transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'list'
                  ? 'border-blue-600 text-blue-700 bg-white shadow-2xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Daftar Instansi</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-800 font-mono font-bold">
                {agencies.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('export')}
              className={`px-3 py-1.5 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'export'
                  ? 'border-blue-600 text-blue-700 bg-white shadow-2xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Ekspor Data</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('import')}
              className={`px-3 py-1.5 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'import'
                  ? 'border-blue-600 text-blue-700 bg-white shadow-2xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5 text-indigo-600" />
              <span>Impor Data</span>
            </button>
          </div>

          {activeTab === 'list' && !isAddMode && !editingAgency && (
            <button
              type="button"
              onClick={handleStartAdd}
              className="mb-1.5 btn-3d-blue px-3 py-1.5 text-xs font-black flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
              title="Tambah Instansi Publik Baru"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Tambah Instansi</span>
            </button>
          )}
        </div>

        {/* Notifikasi Aksi Banner */}
        {notification && (
          <div className="px-5 pt-3 shrink-0">
            <div
              className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2.5 shadow-md border animate-in fade-in slide-in-from-top-2 duration-200 ${
                notification.type === 'delete'
                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                  : notification.type === 'error'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 shrink-0 ${notification.type === 'delete' ? 'text-rose-600' : 'text-emerald-600'}`} />
              <span className="flex-1">{notification.message}</span>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {/* TAB 1: LIST / EDIT */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              {/* Add / Edit Form Drawer dengan Desain 3D Bergradasi */}
              {(isAddMode || editingAgency) && (
                <form
                  onSubmit={handleSaveForm}
                  className="card-3d bg-gradient-to-br from-blue-50/95 via-indigo-50/70 to-white p-4 sm:p-5 rounded-2xl border-2 border-blue-200/90 shadow-xl space-y-4 mb-4 animate-in fade-in zoom-in-95 duration-200 transform-gpu"
                >
                  <div className="flex justify-between items-center pb-2 border-b border-blue-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
                        {isAddMode ? <Plus className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-blue-950">
                          {isAddMode ? '+ Tambah Instansi Publik Baru' : 'Edit Instansi Publik'}
                        </h3>
                        <p className="text-[10px] text-blue-700 font-semibold">
                          Tersimpan permanen di cloud Firestore &amp; sinkron di seluruh perangkat
                        </p>
                      </div>
                    </div>
                    {/* Tombol Batal di samping teks judul disembunyikan sesuai permintaan */}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>Nama Instansi Publik *</span>
                    </label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Contoh: Kejaksaan Negeri, Dinas Kesehatan, Kantor Imigrasi..."
                      required
                      className="input-3d w-full px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/20 shadow-xs"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <label className="flex items-center gap-2.5 text-xs font-bold text-slate-800 cursor-pointer p-2 rounded-xl bg-white/90 border border-slate-200 shadow-2xs hover:bg-white transition-all">
                      <input
                        type="checkbox"
                        checked={formActive}
                        onChange={(e) => setFormActive(e.target.checked)}
                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                      />
                      <span>Instansi Aktif dalam Pilihan Formulir Survei Pemohon</span>
                    </label>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddMode(false);
                          setEditingAgency(null);
                        }}
                        className="btn-3d-slate px-3.5 py-2 text-xs text-slate-700 font-bold"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="btn-3d-blue px-4.5 py-2 text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95"
                      >
                        <Check className="w-4 h-4" />
                        <span>Simpan</span>
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Search agency */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari nama instansi publik..."
                  className="input-3d w-full pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 shadow-xs font-bold"
                />
              </div>

              {/* Agency list matching screenshot 5 */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 shadow-xs bg-white">
                <div className="px-3.5 py-2.5 bg-slate-50 text-[11px] font-black text-slate-700 uppercase tracking-wider flex justify-between items-center border-b border-slate-200">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                    DAFTAR INSTANSI PUBLIK TERDAFTAR
                  </span>
                  <div className="flex items-center gap-1.5 lowercase">
                    <button
                      type="button"
                      onClick={() => setAgencyPage((p) => Math.max(p - 1, 1))}
                      disabled={agencyPage === 1}
                      className="btn-3d-slate px-2 py-0.5 text-[11px] font-bold disabled:opacity-40"
                    >
                      Sebelumnya
                    </button>
                    <span className="font-mono text-[11px] font-bold px-1 uppercase">{agencyPage}/{totalPages}</span>
                    <button
                      type="button"
                      onClick={() => setAgencyPage((p) => Math.min(p + 1, totalPages))}
                      disabled={agencyPage === totalPages}
                      className="btn-3d-slate px-2 py-0.5 text-[11px] font-bold disabled:opacity-40"
                    >
                      Selanjutnya
                    </button>
                  </div>
                </div>

                <div className="max-h-[290px] overflow-y-auto divide-y divide-slate-100">
                  {paginatedAgencies.map((agency, index) => {
                    const absIdx = (agencyPage - 1) * itemsPerPage + index + 1;
                    return (
                      <div
                        key={agency.id}
                        className="px-3.5 py-2.5 flex items-center justify-between hover:bg-blue-50/40 transition-all gap-2 group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <span className="w-6 text-center text-[11px] font-mono font-bold text-slate-400 shrink-0">
                            {absIdx}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-900 break-words leading-snug">
                              {agency.name}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Status Toggle */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(agency)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black border transition-all cursor-pointer active:scale-95 shadow-2xs ${
                              agency.active
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200'
                            }`}
                            title="Klik untuk mengubah status aktif / nonaktif"
                          >
                            {agency.active ? 'Aktif' : 'Nonaktif'}
                          </button>

                          {/* Edit Button 3D */}
                          <button
                            type="button"
                            onClick={() => handleStartEdit(agency)}
                            className="btn-3d-slate p-1.5 text-slate-600 hover:text-blue-700 rounded-xl transition-all active:scale-90 cursor-pointer"
                            title={`Edit nama instansi ${agency.name}`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Tombol Hapus 3 Dimensi */}
                          <button
                            type="button"
                            onClick={() => setAgencyToDelete(agency)}
                            className="btn-3d-rose p-1.5 sm:px-2.5 sm:py-1 rounded-xl flex items-center gap-1 text-[11px] font-bold shadow-xs active:scale-90 transition-all cursor-pointer"
                            title={`Hapus instansi ${agency.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Hapus</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination Controls */}
                <div className="px-3.5 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600 font-semibold">
                  <span>Halaman {agencyPage} dari {totalPages} ({filteredAgencies.length} instansi terfilter)</span>
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

        {/* Modal Footer 3D */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex justify-between items-center text-[11px] text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5 font-bold text-slate-600">
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Mal Pelayanan Publik Kabupaten Bojonegoro</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-3d-slate px-4 py-1.5 text-slate-800 font-bold text-xs"
          >
            Tutup
          </button>
        </div>
      </div>
      </div>

      {/* 3D Delete Confirmation Dialog Modal */}
      {agencyToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="card-3d bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 border-2 border-rose-200 shadow-2xl space-y-4 text-center transform-gpu animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 text-white flex items-center justify-center mx-auto shadow-lg border border-rose-300/40 animate-pulse">
              <Trash2 className="w-7 h-7 drop-shadow-md" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                Hapus Instansi Publik?
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Apakah Anda yakin ingin menghapus instansi publik ini:
              </p>
              <div className="mt-2.5 p-3 bg-rose-50 border border-rose-200 rounded-2xl font-black text-rose-950 text-xs break-words">
                {agencyToDelete.name}
              </div>
              <p className="text-[10px] text-slate-500 mt-2 font-medium">
                Penghapusan ini permanen di cloud Firestore dan akan disinkronkan ke seluruh perangkat secara otomatis.
              </p>
            </div>
            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setAgencyToDelete(null)}
                disabled={isDeleting}
                className="btn-3d-slate flex-1 py-2.5 text-xs font-bold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="btn-3d-rose flex-1 py-2.5 text-xs font-black flex items-center justify-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
              >
                {isDeleting ? (
                  <span>Menghapus...</span>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Ya, Hapus Permanen</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
