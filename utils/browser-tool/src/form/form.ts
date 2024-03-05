import {
  ExtractForm,
  ExtractFormKey,
  ExtractGenericForm,
  Field,
  UpdateOrReplace,
} from './form.d';

export class FormControl<FormType extends ExtractGenericForm<FormType>> {
  /* -------------------------------------------------------------------------- */
  /*                                 Constructor                                */
  /* -------------------------------------------------------------------------- */
  constructor(form: ExtractForm<FormType>) {
    // Initial form state
    this.form = Object.entries(form).reduce((acc, [field, value]) => {
      const _field = field as keyof FormType;
      const _value = value as Field<never>;

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
  public form: ExtractForm<FormType> = {} as never;

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
    Field extends ExtractFormKey<FormType>,
    Data extends UpdateOrReplace<ExtractGenericForm<FormType>[Field], Replace>,
    Replace extends boolean,
  >(key: Field, data: Data, replace?: Replace) {
    // is array
    if (Array.isArray(data)) {
      return (this.form[key].data = replace
        ? data
        : [...(this.form[key].data || []), ...data]);
    }

    // is object
    if (data instanceof Object) {
      return (this.form[key].data = replace
        ? (data as ExtractGenericForm<FormType>[Field])
        : { ...this.form[key].data, ...data });
    }

    // is others
    return (this.form[key].data = data as ExtractGenericForm<FormType>[Field]);

    // TODO: update nested object of arrays
  }

  /**
   * Validates the form or a specific field.
   *
   * @param {Field} [key] - The key of the field to validate. If not provided, the entire form will be validated.
   * @param {boolean} [update=true] - Indicates whether to update the field validation state after validation.
   *
   * @returns {boolean} - Returns true if the form or field is invalid, otherwise returns false.
   */
  validate<Field extends ExtractFormKey<FormType>>(key?: Field, update = true) {
    // validate specific field
    if (key) {
      const isError = !this.validateField(key);
      if (update) this.form[key].isError = isError;
      return isError;
    }

    // validate entire form
    return Object.entries(this.form).some(([key]) => {
      const isError = !this.validateField(key as Field);
      if (update) this.form[key as Field].isError = isError;
      return isError;
    }, {});
  }

  private validateField<Field extends ExtractFormKey<FormType>>(key: Field) {
    const data = this.form[key]?.data;
    const validator = this.form[key]?.validate;

    // is array or object
    if (data instanceof Object) {
      if (typeof validator !== 'function') return false;
      return validator(data as FormType[Field]);
    }

    // is other
    return typeof validator === 'function'
      ? validator(data)
      : validator.test(data);
  }
}
