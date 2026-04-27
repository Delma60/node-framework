type ValidationRules = Record<string, string | string[]>;
type ValidationErrors = Record<string, string[]>;

interface ValidationResult {
    passes(): boolean;
    fails(): boolean;
    errors(): ValidationErrors;
    validated(): Record<string, any>;
}

export class Validator {
    private data: Record<string, any>;
    private rules: ValidationRules;
    private errors: ValidationErrors;

    constructor(data: Record<string, any>, rules: ValidationRules) {
        this.data = data;
        this.rules = rules;
        this.errors = {};
        this.validate();
    }

    /**
     * Static method to validate data and return a result object with methods.
     */
    public static validate(data: Record<string, any>, rules: ValidationRules): ValidationResult {
        const validator = new Validator(data, rules);
        return {
            passes: () => validator.passes(),
            fails: () => validator.fails(),
            errors: () => validator.getErrors(),
            validated: () => validator.validated(),
        };
    }

    /**
     * Static method to create a validator instance.
     */
    public static make(data: Record<string, any>, rules: ValidationRules): ValidationErrors {
        const validator = new Validator(data, rules);
        return validator.errors;
    }

    /**
     * Static method to check if validation passes.
     */
    public static passes(data: Record<string, any>, rules: ValidationRules): boolean {
        return Object.keys(this.make(data, rules)).length === 0;
    }

    /**
     * Static method to check if validation fails.
     */
    public static fails(data: Record<string, any>, rules: ValidationRules): boolean {
        return !this.passes(data, rules);
    }

    /**
     * Static method to get validated data.
     */
    public static validated(data: Record<string, any>, rules: ValidationRules): Record<string, any> {
        const validator = new Validator(data, rules);
        if (validator.fails()) {
            throw new Error('Validation failed');
        }
        return validator.validated();
    }

    /**
     * Check if validation passes.
     */
    public passes(): boolean {
        return Object.keys(this.errors).length === 0;
    }

    /**
     * Check if validation fails.
     */
    public fails(): boolean {
        return !this.passes();
    }

    /**
     * Get the validation errors.
     */
    public getErrors(): ValidationErrors {
        return this.errors;
    }

    /**
     * Get the validated data (only fields that were defined in rules).
     */
    public validated(): Record<string, any> {
        const validatedData: Record<string, any> = {};
        for (const key in this.rules) {
            if (this.data[key] !== undefined) {
                validatedData[key] = this.data[key];
            }
        }
        return validatedData;
    }

    /**
     * Run the validation.
     */
    private validate(): void {
        this.errors = {};

        for (const field in this.rules) {
            const fieldRules = this.normalizeRules(this.rules[field]!);
            const value = this.data[field];

            for (const rule of fieldRules) {
                const [ruleName, ruleValue] = rule.split(':', 2).map(part => part.trim());

                if (ruleName === 'required') {
                    if (this.isEmpty(value)) {
                        this.addError(field, `The ${field} field is required.`);
                    }
                    continue;
                }

                if (this.isEmpty(value)) {
                    continue;
                }

                switch (ruleName) {
                    case 'string':
                        if (typeof value !== 'string') {
                            this.addError(field, `The ${field} must be a string.`);
                        }
                        break;

                    case 'email':
                        if (!this.isValidEmail(value)) {
                            this.addError(field, `The ${field} must be a valid email address.`);
                        }
                        break;

                    case 'min': {
                        const min = parseInt(ruleValue || '0', 10);
                        if (typeof value === 'string' && value.length < min) {
                            this.addError(field, `The ${field} must be at least ${min} characters.`);
                        } else if (this.isNumeric(value) && Number(value) < min) {
                            this.addError(field, `The ${field} must be at least ${min}.`);
                        }
                        break;
                    }

                    case 'max': {
                        const max = parseInt(ruleValue || '0', 10);
                        if (typeof value === 'string' && value.length > max) {
                            this.addError(field, `The ${field} may not be greater than ${max} characters.`);
                        } else if (this.isNumeric(value) && Number(value) > max) {
                            this.addError(field, `The ${field} may not be greater than ${max}.`);
                        }
                        break;
                    }

                    case 'numeric':
                        if (!this.isNumeric(value)) {
                            this.addError(field, `The ${field} must be a number.`);
                        }
                        break;

                    case 'integer':
                        if (!Number.isInteger(Number(value))) {
                            this.addError(field, `The ${field} must be an integer.`);
                        }
                        break;

                    case 'boolean':
                        if (typeof value !== 'boolean' && !['true', 'false', '0', '1'].includes(String(value).toLowerCase())) {
                            this.addError(field, `The ${field} field must be true or false.`);
                        }
                        break;

                    case 'confirmed': {
                        const confirmationValue = this.data[`${field}_confirmation`];
                        if (value !== confirmationValue) {
                            this.addError(field, `The ${field} confirmation does not match.`);
                        }
                        break;
                    }

                    case 'in': {
                        const allowed = (ruleValue || '').split(',').map(item => item.trim());
                        if (!allowed.includes(String(value))) {
                            this.addError(field, `The ${field} must be one of: ${allowed.join(', ')}.`);
                        }
                        break;
                    }

                    case 'url':
                        if (!this.isValidUrl(value)) {
                            this.addError(field, `The ${field} must be a valid URL.`);
                        }
                        break;

                    case 'regex':
                        if (!this.isValidRegex(value, ruleValue || '')) {
                            this.addError(field, `The ${field} format is invalid.`);
                        }
                        break;

                    case 'array':
                        if (!Array.isArray(value)) {
                            this.addError(field, `The ${field} must be an array.`);
                        }
                        break;

                    default:
                        break;
                }
            }
        }
    }

                   
    private normalizeRules(ruleSet: string | string[]): string[] {
        if (Array.isArray(ruleSet)) {
            return ruleSet.flatMap(rule => String(rule).split('|').map(part => part.trim())).filter(Boolean);
        }

        return String(ruleSet)
            .split('|')
            .map(rule => rule.trim())
            .filter(Boolean);
    }

    private isEmpty(value: unknown): boolean {
        return value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);
    }

    private isNumeric(value: unknown): boolean {
        return typeof value === 'number' || (/^-?\d+(?:\.\d+)?$/.test(String(value)));
    }

    private isValidEmail(value: unknown): boolean {
        return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    private isValidUrl(value: unknown): boolean {
        if (typeof value !== 'string') {
            return false;
        }

        try {
            new URL(value);
            return true;
        } catch {
            return false;
        }
    }

    private isValidRegex(value: unknown, pattern: string): boolean {
        if (typeof value !== 'string') {
            return false;
        }

        try {
            const regex = new RegExp(pattern);
            return regex.test(value);
        } catch {
            return false;
        }
    }

    private addError(field: string, message: string) {
        if (!this.errors[field]) {
            this.errors[field] = [];
        }

        if (!this.errors[field].includes(message)) {
            this.errors[field].push(message);
        }
    }
}
