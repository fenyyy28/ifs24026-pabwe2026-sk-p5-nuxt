import { describe, expect, it } from "vitest";
import { flushPromises } from "@vue/test-utils";
import NavbarComponent from "~/features/cashflows/components/NavbarComponent.vue";
import { getAccessToken, putAccessToken } from "~/helpers/apiHelper";
import { renderWithProviders } from "~/test-utils";

const profile = { id: 1, name: "Feny Pasaribu", email: "feny@x.id", photo: null };

describe("NavbarComponent", () => {
  it("menampilkan nama, email, dan sesi aktif saat ada token", async () => {
    const { wrapper } = await renderWithProviders(NavbarComponent, {
      initialState: { auth: { token: "tok" }, users: { profile } },
    });
    expect(wrapper.get("header").element).toBeInTheDocument();
    expect(wrapper.text()).toContain("Feny Pasaribu");
    expect(wrapper.text()).toContain("feny@x.id");
    expect(wrapper.get("#session-status").element).toHaveTextContent("Sesi aktif");
  });

  it("menampilkan sesi tidak aktif tanpa token dan tanpa profil", async () => {
    const { wrapper } = await renderWithProviders(NavbarComponent);
    expect(wrapper.get("#session-status").element).toHaveTextContent("Sesi tidak aktif");
    expect(wrapper.text()).not.toContain("Feny");
  });

  it("tombol keluar menghapus sesi lalu mengarahkan ke login", async () => {
    putAccessToken("tok");
    const { wrapper, router } = await renderWithProviders(NavbarComponent, {
      initialState: { users: { profile } },
    });
    await wrapper.get("#logout-button").trigger("click");
    await flushPromises();

    expect(getAccessToken()).toBeNull();
    expect(router.currentRoute.value.path).toBe("/auth/login");
  });
});