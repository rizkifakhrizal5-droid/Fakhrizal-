import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { SurveyResponse, Agency, IKMStats, FilterState } from '../types/survey';

export interface PDFExportOptions {
  element: HTMLElement;
  fileName: string;
  paperSize?: 'a4' | 'f4' | 'letter';
  scale?: number;
}

export async function exportElementToPDF({
  element,
  fileName,
  paperSize = 'a4',
  scale = 2,
}: PDFExportOptions): Promise<void> {
  const parent = element.parentElement;
  const originalParentStyle = parent
    ? {
        position: parent.style.position,
        left: parent.style.left,
        top: parent.style.top,
        zIndex: parent.style.zIndex,
        opacity: parent.style.opacity,
        display: parent.style.display,
      }
    : null;

  // Bring container into a valid coordinate (0, 0) behind the screen so html2canvas renders cleanly
  if (parent) {
    parent.style.position = 'fixed';
    parent.style.left = '0px';
    parent.style.top = '0px';
    parent.style.zIndex = '-9999';
    parent.style.opacity = '1';
    parent.style.display = 'block';
  }

  try {
    // Wait a brief moment for layout to settle
    await new Promise((resolve) => setTimeout(resolve, 80));

    const canvas = await html2canvas(element, {
      scale: Math.min(scale, 2),
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      scrollX: 0,
      scrollY: 0,
      windowWidth: 1000,
    });

    const imgData = canvas.toDataURL('image/png');

    let format: [number, number] | string = 'a4';
    if (paperSize === 'f4') {
      format = [215, 330];
    } else if (paperSize === 'letter') {
      format = 'letter';
    }

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format,
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const margin = 8;
    const contentWidth = pageWidth - margin * 2;
    const contentHeight = (canvas.height * contentWidth) / canvas.width;

    const usableHeightPerPage = pageHeight - margin * 2;
    let heightLeft = contentHeight;
    let position = margin;
    let page = 1;

    // First page
    pdf.addImage(imgData, 'PNG', margin, position, contentWidth, contentHeight, undefined, 'FAST');
    heightLeft -= usableHeightPerPage;

    // Additional pages
    while (heightLeft > 2) {
      position = -(usableHeightPerPage * page) + margin;
      pdf.addPage();
      page++;
      pdf.addImage(imgData, 'PNG', margin, position, contentWidth, contentHeight, undefined, 'FAST');
      heightLeft -= usableHeightPerPage;
    }

    pdf.save(fileName);
  } finally {
    if (parent && originalParentStyle) {
      parent.style.position = originalParentStyle.position;
      parent.style.left = originalParentStyle.left;
      parent.style.top = originalParentStyle.top;
      parent.style.zIndex = originalParentStyle.zIndex;
      parent.style.opacity = originalParentStyle.opacity;
      parent.style.display = originalParentStyle.display;
    }
  }
}

export interface DirectPDFOptions {
  surveys: SurveyResponse[];
  agencies: Agency[];
  stats: IKMStats;
  filters: FilterState;
  fileName: string;
}

/**
 * Fallback langsung menggunakan native jsPDF untuk mengunduh rekap PDF resmi tanpa gagal
 */
export async function generateDirectRekapPDF({
  surveys,
  stats,
  filters,
  fileName,
}: DirectPDFOptions): Promise<void> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  let y = 14;

  // Header / Kop
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text('PEMERINTAH KABUPATEN BOJONEGORO', pageWidth / 2, y, { align: 'center' });
  y += 5;
  pdf.setFontSize(11);
  pdf.text('DINAS PENANAMAN MODAL DAN PELAYANAN TERPADU SATU PINTU', pageWidth / 2, y, { align: 'center' });
  y += 5;
  pdf.setFontSize(10);
  pdf.text('MAL PELAYANAN PUBLIK (MPP) GAMPIL', pageWidth / 2, y, { align: 'center' });
  y += 4;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.text('Jl. Veteran No. 227 Bojonegoro, Jawa Timur 62119', pageWidth / 2, y, { align: 'center' });
  y += 3;

  // Garis ganda
  pdf.setLineWidth(0.6);
  pdf.line(12, y, pageWidth - 12, y);
  y += 1;
  pdf.setLineWidth(0.2);
  pdf.line(12, y, pageWidth - 12, y);
  y += 6;

  // Judul Dokumen
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.text('REKAPITULASI RESMI HASIL PENGUKURAN SKM', pageWidth / 2, y, { align: 'center' });
  y += 5;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.text(`Berdasarkan UU No. 25/2009 & PermenPAN-RB No. 14/2017 • Filter: ${filters.agencyName}`, pageWidth / 2, y, { align: 'center' });
  y += 7;

  // Ringkasan Statistik
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.text('I. RINGKASAN CAPAIAN IKM', 12, y);
  y += 5;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.text(`• Nilai Indeks (IKM): ${stats.ikmScore.toFixed(2)} (Mutu: ${stats.mutu})`, 14, y);
  y += 4;
  pdf.text(`• Rata-rata Skor Bintang: ${stats.averageRating.toFixed(2)} dari 5.00`, 14, y);
  y += 4;
  pdf.text(`• Total Responden Terlayani: ${surveys.length} Pemohon (${stats.satisfiedPercentage.toFixed(1)}% Puas)`, 14, y);
  y += 6;

  // 9 Unsur Pelayanan Publik
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.text('II. EVALUASI 9 UNSUR PELAYANAN PUBLIK', 12, y);
  y += 5;

  const unsurItems = [
    { no: '1', name: 'Persyaratan Pelayanan', val: stats.unsurAverages?.persyaratan || stats.averageRating },
    { no: '2', name: 'Sistem, Mekanisme & Prosedur', val: stats.unsurAverages?.prosedur || stats.averageRating },
    { no: '3', name: 'Waktu Penyelesaian Layanan', val: stats.unsurAverages?.waktu || stats.averageRating },
    { no: '4', name: 'Biaya / Tarif Pelayanan', val: stats.unsurAverages?.biaya || stats.averageRating },
    { no: '5', name: 'Produk Spesifikasi Layanan', val: stats.unsurAverages?.produk || stats.averageRating },
    { no: '6', name: 'Kompetensi Pelaksana / Petugas', val: stats.unsurAverages?.kompetensi || stats.averageRating },
    { no: '7', name: 'Perilaku & Disiplin Petugas', val: stats.unsurAverages?.perilaku || stats.averageRating },
    { no: '8', name: 'Penanganan Pengaduan & Aspirasi', val: stats.unsurAverages?.pengaduan || stats.averageRating },
    { no: '9', name: 'Kesopanan & Kerapian Petugas', val: stats.unsurAverages?.kesopanan || stats.averageRating },
  ];

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  unsurItems.forEach((item) => {
    pdf.text(`${item.no}. ${item.name}: ${item.val.toFixed(2)} / 5.00`, 14, y);
    y += 3.8;
  });
  y += 3;

  // Data Pemohon (Sampel Terbaru)
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.text('III. DATA PEMOHON TERLAYANI (SAMPEL)', 12, y);
  y += 5;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  const sampleSurveys = surveys.slice(0, 8);
  sampleSurveys.forEach((s, idx) => {
    const name = s.isAnonymous ? 'Anonim' : s.respondentName;
    pdf.text(`${idx + 1}. [${s.surveyDate || s.createdAt.slice(0, 10)}] ${name} - ${s.gender}, ${s.ageGroup} | ${s.agencyName} (Bintang ${s.rating})`, 14, y);
    y += 3.8;
  });
  y += 3;

  // Saran & Masukan
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.text('IV. ASPIRASI, SARAN & MASUKAN MASYARAKAT', 12, y);
  y += 5;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  const feedbackSamples = surveys.filter((s) => s.feedback && s.feedback.trim().length > 0).slice(0, 5);
  if (feedbackSamples.length === 0) {
    pdf.text('Belum ada saran dan masukan tertulis pada periode ini.', 14, y);
    y += 4;
  } else {
    feedbackSamples.forEach((f, idx) => {
      const truncated = f.feedback.length > 95 ? f.feedback.slice(0, 95) + '...' : f.feedback;
      pdf.text(`${idx + 1}. "${truncated}" - (${f.agencyName})`, 14, y);
      y += 3.8;
    });
  }

  y += 6;
  // Pengesahan
  const printDateStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const signX = pageWidth - 70;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.text(`Bojonegoro, ${printDateStr}`, signX, y);
  y += 4;
  pdf.text('Kepala Dinas PMPTSP Bojonegoro', signX, y);
  y += 18;
  pdf.setFont('helvetica', 'bold');
  pdf.text('Ir. H. Rachmat Junaidi, M.M.', signX, y);
  y += 4;
  pdf.setFont('helvetica', 'normal');
  pdf.text('NIP. 19740512 199903 1 004', signX, y);

  pdf.save(fileName);
}
