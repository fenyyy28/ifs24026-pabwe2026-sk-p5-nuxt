import { describe, expect, it } from "vitest";
import { useInput } from "~/hooks/useInput";

const fakeEvent = (value: string) => ({ target: { value } }) as unknown as Event;

describe("useInput", () => {
  it("mengelola input string", () => {
    const input = useInput("");
    expect(input.value.value).toBe("");
    input.onChange(fakeEvent("halo"));
    expect(input.value.value).toBe("halo");
    input.reset();
    expect(input.value.value).toBe("");
  });

  it("mengonversi input ke number bila nilai awal number", () => {
    const input = useInput(0);
    input.onChange(fakeEvent("42"));
    expect(input.value.value).toBe(42);
    input.reset();
    expect(input.value.value).toBe(0);
  });
});