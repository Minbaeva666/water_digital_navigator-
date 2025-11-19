import { RuleObject } from 'antd/es/form';
import { StoreValue } from 'antd/es/form/interface';

/**
 * Optionaler String-Validator:
 * Erlaubt leere Felder, aber verhindert reine Leerzeichen oder "" als Eingabe.
 */
export const nonEmptyTrimmedString = (_: RuleObject, value: StoreValue) => {
    if (value === undefined || value === null || value === '') {
        return Promise.resolve();
    }
    if (typeof value === 'string' && value.trim().length === 0) {
        return Promise.reject(new Error("Dieses Feld darf nicht nur aus Leerzeichen bestehen!"));
    }
    return Promise.resolve();
};