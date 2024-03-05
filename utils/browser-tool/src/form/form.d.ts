export type ExtractForm<Form> = {
  [K in keyof Form]: Partial<Field<Form[K]>>;
};

export type ExtractGenericForm<Form> = {
  [K in keyof Form]: Form[K];
};

export type ExtractFormKey<Form> = keyof Form;

export type KeyOfForm<Form extends ExtractForm<Form>> = keyof Form['data'];

export type UpdateOrReplace<Data, R extends boolean> = R extends true
  ? Data
  : Partial<Data>;

export interface Field<D> {
  data: D | D[];
  isError: boolean;
  validate?: RegExp | ((data: D) => boolean);
}
