import { describe, expect, it } from "vitest";
import SidebarComponent from "~/features/cashflows/components/SidebarComponent.vue";
import { renderWithProviders } from "~/test-utils";

describe("SidebarComponent", () => {
  it("menampilkan tiga menu dengan tujuan yang benar", async () => {
    const { wrapper } = await renderWithProviders(SidebarComponent);
    const links = wrapper.findAll("a");

    expect(links).toHaveLength(3);
    expect(links[0]!.element).toHaveTextContent("Ringkasan Arus Kas");
    expect(links[0]!.element).toHaveAttribute("href", "/");
    expect(links[1]!.element).toHaveTextContent("Direktori Pengguna");
    expect(links[1]!.element).toHaveAttribute("href", "/users");
    expect(links[2]!.element).toHaveTextContent("Profil Saya");
    expect(links[2]!.element).toHaveAttribute("href", "/profile");
  });
});