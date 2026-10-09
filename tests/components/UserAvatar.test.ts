import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import UserAvatar from "~/components/UserAvatar.vue";

describe("UserAvatar", () => {
  it("menampilkan foto bila tersedia", () => {
    const wrapper = mount(UserAvatar, { props: { name: "Feny", photo: "https://x.test/a.png" } });
    const img = wrapper.get("img");
    expect(img.attributes("src")).toBe("https://x.test/a.png");
    expect(img.attributes("alt")).toBe("Feny");
  });

  it("menampilkan inisial dua kata pertama bila tanpa foto", () => {
    const wrapper = mount(UserAvatar, { props: { name: "feny rika pasaribu", photo: null } });
    expect(wrapper.find("img").exists()).toBe(false);
    expect(wrapper.text()).toBe("FR");
  });

  it("menampilkan satu inisial untuk satu kata", () => {
    const wrapper = mount(UserAvatar, { props: { name: "Feny" } });
    expect(wrapper.text()).toBe("F");
  });
});