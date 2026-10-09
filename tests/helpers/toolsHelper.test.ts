import { beforeEach, describe, expect, it, vi } from "vitest";
import Swal from "sweetalert2";
import {
  formatDate,
  formatDateTime,
  formatRupiah,
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
} from "~/helpers/toolsHelper";

vi.mock("sweetalert2", () => ({ default: { fire: vi.fn() } }));

const fire = Swal.fire as unknown as ReturnType<typeof vi.fn>;

beforeEach(() => {
  fire.mockReset();
  fire.mockResolvedValue({ isConfirmed: true });
});

describe("dialog", () => {
  it("showSuccessDialog dengan judul default dan kustom", async () => {
    await showSuccessDialog("Tersimpan");
    expect(fire.mock.calls[0]![0]).toMatchObject({
      icon: "success",
      title: "Berhasil",
      text: "Tersimpan",
    });
    await showSuccessDialog("Tersimpan", "Sukses");
    expect(fire.mock.calls[1]![0].title).toBe("Sukses");
  });

  it("showErrorDialog dengan judul default dan kustom", async () => {
    await showErrorDialog("Gagal");
    expect(fire.mock.calls[0]![0]).toMatchObject({
      icon: "error",
      title: "Terjadi Kesalahan",
      text: "Gagal",
    });
    await showErrorDialog("Gagal", "Oops");
    expect(fire.mock.calls[1]![0].title).toBe("Oops");
  });

  it("showConfirmDialog mengembalikan true saat dikonfirmasi", async () => {
    expect(await showConfirmDialog("Hapus data?")).toBe(true);
    expect(fire.mock.calls[0]![0]).toMatchObject({
      icon: "warning",
      title: "Apakah Anda yakin?",
      confirmButtonText: "Ya",
      cancelButtonText: "Batal",
      showCancelButton: true,
    });
  });

  it("showConfirmDialog mengembalikan false saat dibatalkan dan menerima teks kustom", async () => {
    fire.mockResolvedValue({ isConfirmed: false });
    expect(await showConfirmDialog("Hapus?", "Hapus Data", "Hapus", "Tidak")).toBe(false);
    expect(fire.mock.calls[0]![0]).toMatchObject({
      title: "Hapus Data",
      confirmButtonText: "Hapus",
      cancelButtonText: "Tidak",
    });
  });
});

describe("formatRupiah", () => {
  it("memformat angka menjadi rupiah", () => {
    expect(formatRupiah(2500000)).toBe("Rp 2.500.000");
    expect(formatRupiah(0)).toBe("Rp 0");
  });
});

describe("formatDate", () => {
  it("memformat string ISO dan objek Date", () => {
    expect(formatDate("2024-10-05T12:09:16.000000Z")).toBe("5 Oktober 2024");
    expect(formatDate(new Date("2024-10-05T12:09:16Z"))).toBe("5 Oktober 2024");
  });

  it("mengembalikan '-' untuk nilai kosong atau tidak valid", () => {
    expect(formatDate(null)).toBe("-");
    expect(formatDate(undefined)).toBe("-");
    expect(formatDate("")).toBe("-");
    expect(formatDate("bukan tanggal")).toBe("-");
  });
});

describe("formatDateTime", () => {
  it("memakai zona WIB", () => {
    expect(formatDateTime("2024-10-05T12:09:16.000000Z")).toMatch(/5 Okt 2024.*19[.:]09/);
  });

  it("mengembalikan '-' untuk nilai tidak valid", () => {
    expect(formatDateTime(null)).toBe("-");
    expect(formatDateTime("xyz")).toBe("-");
  });
});