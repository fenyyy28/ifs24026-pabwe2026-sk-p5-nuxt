const PRIMARY_COLOR = "#4f46e5";
const DANGER_COLOR = "#e11d48";

/* ---------- SweetAlert2 dimuat saat pertama kali dibutuhkan ---------- */

type SweetAlert = typeof import("sweetalert2").default;
let swalPromise: Promise<SweetAlert> | undefined;

function loadSwal(): Promise<SweetAlert> {
  if (!swalPromise) {
    swalPromise = import("sweetalert2").then((module) => module.default);
  }
  return swalPromise;
}

/** Memuat SweetAlert2 lebih awal (dipakai test agar dialog langsung siap). */
export async function preloadDialogs(): Promise<void> {
  await loadSwal();
}

/* ---------- Dialog SweetAlert2 ---------- */

export async function showSuccessDialog(message: string, title = "Berhasil") {
  const Swal = await loadSwal();
  return Swal.fire({
    icon: "success",
    title,
    text: message,
    confirmButtonColor: PRIMARY_COLOR,
  });
}

export async function showErrorDialog(message: string, title = "Terjadi Kesalahan") {
  const Swal = await loadSwal();
  return Swal.fire({
    icon: "error",
    title,
    text: message,
    confirmButtonColor: PRIMARY_COLOR,
  });
}

/** Mengembalikan true jika pengguna menekan tombol konfirmasi. */
export async function showConfirmDialog(
  message: string,
  title = "Apakah Anda yakin?",
  confirmText = "Ya",
  cancelText = "Batal",
): Promise<boolean> {
  const Swal = await loadSwal();
  const result = await Swal.fire({
    icon: "warning",
    title,
    text: message,
    showCancelButton: true,
    reverseButtons: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: DANGER_COLOR,
  });
  return result.isConfirmed;
}

/* ---------- Format mata uang ---------- */

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** 2500000 -> "Rp 2.500.000" */
export function formatRupiah(value: number): string {
  return rupiahFormatter.format(value).replace(/\u00a0/g, " ");
}

/* ---------- Format tanggal & waktu ---------- */

type DateInput = string | Date | null | undefined;

function toDate(value: DateInput): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** "2024-10-05T12:09:16.000000Z" -> "5 Oktober 2024" (zona WIB) */
export function formatDate(value: DateInput): string {
  const date = toDate(value);
  if (!date) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

/** "2024-10-05T12:09:16.000000Z" -> "5 Okt 2024, 19.09" (zona WIB) */
export function formatDateTime(value: DateInput): string {
  const date = toDate(value);
  if (!date) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(date);
}