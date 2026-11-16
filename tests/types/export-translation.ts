import type { TExportCSV, TExportTranslation } from '../../src/tables-framework/defines/api.types';

const labels = { true: 'Vero', false: 'Falso', yes: 'Si', no: 'No' };
const translate: TExportTranslation = key => labels[key];
declare const exportCSV: TExportCSV;
exportCSV(true, translate);
// Application translation functions need no dependency or branded i18next type.
exportCSV(true, (key: string) => key);
// @ts-expect-error Translation callbacks receive string keys.
exportCSV(true, (key: number) => String(key));
