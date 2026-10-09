import { ref, type Ref } from "vue";

export interface UseInput<T extends string | number> {
  value: Ref<T>;
  /** Handler untuk `@input` pada elemen input/textarea/select. */
  onChange: (event: Event) => void;
  reset: () => void;
}

/**
 * Hook input form dengan two-way binding bertipe.
 * - `const name = useInput("")` -> `<input v-model="name.value.value">` atau `:value` + `@input="name.onChange"`
 * - `const nominal = useInput(0)` -> nilai otomatis dikonversi ke number
 */
export function useInput<T extends string | number = string>(initialValue: T): UseInput<T> {
  const value = ref(initialValue) as Ref<T>;

  const onChange = (event: Event): void => {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    value.value = (typeof initialValue === "number" ? Number(target.value) : target.value) as T;
  };

  const reset = (): void => {
    value.value = initialValue;
  };

  return { value, onChange, reset };
}
