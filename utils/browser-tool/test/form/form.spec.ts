import { FormControl } from '../../src/form';

interface IForm {
  name: string;
  age: number;
  friends: string[];
  workHistory: Record<string, number>[];
  profile: { short: string; long: string };
  skill: { hard: string[]; soft: string[] };
}

describe('Form', () => {
  let formControl: FormControl<IForm>;

  beforeEach(() => {
    formControl = new FormControl<IForm>({
      name: { validate: /^[a-zA-Z][A-Za-z0-9_]*$/g }, // string
      age: {}, // number
      friends: {}, // array
      workHistory: {}, // object of arrays
      profile: {}, // object
      skill: {}, // array of objects
    });
  });

  /* ------------------------------- Constructor ------------------------------ */
  describe('constructor', () => {
    it('Should initialize the form state correctly', () => {
      expect(formControl.form).toEqual({
        name: {
          data: null,
          isError: false,
          validate: /^[a-zA-Z][A-Za-z0-9_]*$/g,
        },
        age: { data: null, isError: false },
        friends: { data: null, isError: false },
        workHistory: { data: null, isError: false },
        profile: { data: null, isError: false },
        skill: { data: null, isError: false },
      });
    });
  });

  /* --------------------------------- Update --------------------------------- */
  describe('update', () => {
    it('Should update `string` data', () => {
      const field: keyof IForm = 'name';
      const expectResult = 'peach';
      formControl.update(field, expectResult);
      expect(formControl.form[field].data).toEqual(expectResult);
    });

    it('Should update `number` data', () => {
      const field: keyof IForm = 'age';
      const expectResult = 25;
      formControl.update(field, expectResult);
      expect(formControl.form[field].data).toEqual(expectResult);
    });

    it('Should replace `string` and `number` data', () => {
      const field1: keyof IForm = 'name';
      const field2: keyof IForm = 'age';
      const expectResult1 = 'peach';
      const expectResult2 = 25;
      formControl.update(field1, expectResult1, true);
      formControl.update(field2, expectResult2, true);
      expect(formControl.form[field1].data).toEqual(expectResult1);
      expect(formControl.form[field2].data).toEqual(expectResult2);
    });

    it('Should replace `string[]` data', () => {
      const field: keyof IForm = 'friends';
      const firstData = ['mr.O'];
      const secondData = ['mr.A', 'mr.b'];
      const expectData = secondData;
      formControl.update(field, firstData, true);
      formControl.update(field, secondData, true);
      expect(formControl.form[field].data).toEqual(expectData);
    });

    it('Should update `string[]` data', () => {
      const field: keyof IForm = 'friends';
      const firstData = ['mr.O'];
      const secondData = ['mr.A', 'mr.b'];
      const expectData = [...firstData, ...secondData];
      formControl.update(field, firstData);
      formControl.update(field, secondData);
      expect(formControl.form[field].data).toEqual(expectData);
    });

    it('Should replace `Record<string, string>[]` data', () => {
      const field: keyof IForm = 'workHistory';
      const firstData = [{ companyA: 9 }];
      const secondData = [{ companyB: 7 }, { companyC: 4 }];
      const expectData = secondData;
      formControl.update(field, firstData, true);
      formControl.update(field, secondData, true);
      expect(formControl.form[field].data).toEqual(expectData);
    });

    it('Should update `Record<string, string>[]` data', () => {
      const field: keyof IForm = 'workHistory';
      const firstData = [{ companyA: 9 }];
      const secondData = [{ companyB: 7 }, { companyC: 4 }];
      const expectData = [...firstData, ...secondData];
      formControl.update(field, firstData);
      formControl.update(field, secondData);
      expect(formControl.form[field].data).toEqual(expectData);
    });

    it('Should replace `{ short: string; long: string }` data', () => {
      const field: keyof IForm = 'profile';
      const firstData = { short: '', long: '' };
      const secondData = { short: 'short', long: 'very long text' };
      const expectData = secondData;
      formControl.update(field, firstData, true);
      formControl.update(field, secondData, true); // when replace object, all property are required
      expect(formControl.form[field].data).toEqual(expectData);
    });

    it('Should update `{ short: string; long: string }` data', () => {
      const field: keyof IForm = 'profile';
      const firstData = { short: 'short', long: '' };
      const secondData = { long: 'very long text' }; // when update object, property can be optional
      const expectData = { ...firstData, ...secondData };
      formControl.update(field, firstData);
      formControl.update(field, secondData);
      expect(formControl.form[field].data).toEqual(expectData);
    });

    it('Should replace `{ hard: string[]; soft: string[] }` data', () => {
      const field: keyof IForm = 'skill';
      const firstData = { hard: ['js'], soft: ['thinking'] };
      const secondData = { hard: ['css', 'html'], soft: ['communicate'] }; // when update object, property can be optional
      const expectData = secondData;
      formControl.update(field, firstData, true);
      formControl.update(field, secondData, true); // when replace object, all property are required
      expect(formControl.form[field].data).toEqual(expectData);
    });

    it('Should update `{ hard: string[]; soft: string[] }` data', () => {
      const field: keyof IForm = 'skill';
      const firstData = { hard: ['js'], soft: ['thinking'] };
      const secondData = { hard: ['css', 'html'], soft: ['communicate'] }; // when update object, property can be optional
      const expectData = { ...firstData, ...secondData };
      formControl.update(field, firstData);
      formControl.update(field, secondData);
      expect(formControl.form[field].data).toEqual(expectData);
    });
  });

  describe('validate', () => {
    it('Should validate `string` data with `RegExp`', async () => {
      const field: keyof IForm = 'name';
      const data = 'something_cool';
      formControl.update(field, data);
      expect(formControl.validate(field)).toBe(false);
    });

    it('Should validate `string` data with `RegExp`', async () => {
      const field: keyof IForm = 'name';
      const data = 'something cool';
      formControl.update(field, data);
      expect(formControl.validate(field)).toBe(true);
    });

    it('Should validate incorrect `string` data with `RegExp`', async () => {
      const field: keyof IForm = 'name';
      const data = '12345';
      formControl.update(field, data);
      expect(formControl.validate(field)).toBe(true);
    });
  });
});
