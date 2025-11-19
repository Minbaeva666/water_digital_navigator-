import React from "react";
import { Form, Input } from "antd";
import { Rule } from "antd/es/form";
import {nonEmptyTrimmedString} from "../../services/validator/validatorService.ts";


type ValidatedInputProps = {
    name: string;
    label: string;
    required?: boolean;
    placeholder?: string;
    rules?: Rule[];
};

const ValidatedInput: React.FC<ValidatedInputProps> = ({
                                                           name,
                                                           label,
                                                           required = false,
                                                           placeholder,
                                                           rules = [],
                                                       }) => {
    const baseRules: Rule[] = required
        ? [{ required: true, message: `${label} ist ein Pflichtfeld.` }]
        : [{ validator: nonEmptyTrimmedString }];

    return (
        <Form.Item
            name={name}
            label={label}
            rules={[...baseRules, ...rules]}
            normalize={(value: string) => {
                if (typeof value === 'string' && value.trim() === '') {
                    return undefined;
                }
                return value;
            }}
        >
            <Input placeholder={placeholder} />
        </Form.Item>
    );
};

export default ValidatedInput;