import "@testing-library/jest-dom/vitest";
import { enableAutoUnmount } from "@vue/test-utils";
import { afterEach } from "vitest";

// Bongkar komponen yang di-mount dan kosongkan penyimpanan browser setelah tiap test
enableAutoUnmount(afterEach);
afterEach(() => {
  localStorage.clear();
});