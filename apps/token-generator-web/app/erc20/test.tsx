type ExtractForm<Form> = {
  [K in keyof Form]: Partial<Field<Form[K]>>;
};

type ExtractGenericForm<Form> = {
  [K in keyof Form]: Form[K];
};

type UpdateOrReplace<Data, R extends Boolean> = R extends true
  ? Data
  : Partial<Data>;

interface Field<D> {
  data: D | D[];
  isError: boolean;
  validate?: RegExp | ((data: D) => boolean);
}

export default class CustomForm<FormType extends ExtractGenericForm<FormType>> {
  /* -------------------------------------------------------------------------- */
  /*                                 Constructor                                */
  /* -------------------------------------------------------------------------- */
  constructor(form: ExtractForm<FormType>) {
    // Initial form state
    this.form = Object.entries(form).reduce((acc, [field, value]) => {
      const _field = field as keyof FormType;
      const _value = value as Field<any>;

      acc[_field] = {
        data: _value.data || null,
        isError: false,
        ...(_value.validate && { validate: _value.validate }),
      };
      return acc;
    }, {} as ExtractForm<FormType>);
  }

  /* -------------------------------------------------------------------------- */
  /*                                   States                                   */
  /* -------------------------------------------------------------------------- */
  public form: ExtractForm<FormType> = {} as ExtractForm<FormType>;

  /* -------------------------------------------------------------------------- */
  /*                                   Methods                                  */
  /* -------------------------------------------------------------------------- */
  /**
   * Updates the data of a specific field in the form.
   *
   * @param key - The field to update.
   * @param data - The data to update the field with.
   * @param replace - Optional. A boolean indicating whether to replace the existing data or merge it with the new data. Default is false.
   *
   * @returns The updated data of the field.
   */
  update<
    Field extends keyof ExtractForm<FormType>,
    Data extends UpdateOrReplace<ExtractGenericForm<FormType>[Field], Replace>,
    Replace extends boolean,
  >(key: Field, data: Data, replace?: Replace) {
    // is object
    if (data instanceof Object && !Array.isArray(data)) {
      return (this.form[key].data = replace
        ? (data as ExtractGenericForm<FormType>[Field])
        : { ...this.form[key].data, ...data });
    }

    // is array
    if (Array.isArray(data)) {
      return (this.form[key].data = replace
        ? data
        : [...this.form[key].data, ...data]);
    }

    // is others
    return (this.form[key].data = data as ExtractGenericForm<FormType>[Field]);
  }
}
