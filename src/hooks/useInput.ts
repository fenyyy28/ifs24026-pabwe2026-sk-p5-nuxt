import { ref, type Ref } from "vue";

/** Melebarkan tipe literal: "" menjadi string, 0 menjadi number. */
type Widen<T extends string | number> = T extends string ? string : number;

export interface UseInput<T extends string | number> {
  value: Ref<T>;
  /** Handler untuk `@input` pada elemen input/textarea/select. */
  onChange: (event: Event) => void;
  reset: () => void;
}

/**
 * Hook input form dengan two-way binding bertipe.
 * - `const name = useInput("")` -> nilai bertipe string
 * - `const nominal = useInput(0)` -> nilai bertipe number, input otomatis dikonversi
 */
export function useInput<T extends string | number = string>(
  initialValue: T,
): UseInput<Widen<T>> {
  const value = ref(initialValue) as unknown as Ref<Widen<T>>;

  const onChange = (event: Event): void => {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    value.value = (typeof initialValue === "number" ? Number(target.value) : target.value) as Widen<T>;
  };

  const reset = (): void => {
    value.value = initialValue as Widen<T>;
  };

  return { value, onChange, reset };
}