type ValidationRules = Record<string, string | string[]>;
type ValidationErrors = Record<string, string[]>;
interface ValidationResult {
    passes(): boolean;
    fails(): boolean;
    errors(): ValidationErrors;
    validated(): Record<string, any>;
}
export declare class Validator {
    private data;
    private rules;
    private errors;
    constructor(data: Record<string, any>, rules: ValidationRules);
    /**
     * Static method to validate data and return a result object with methods.
     */
    static validate(data: Record<string, any>, rules: ValidationRules): ValidationResult;
    /**
     * Static method to create a validator instance.
     */
    static make(data: Record<string, any>, rules: ValidationRules): ValidationErrors;
    /**
     * Static method to check if validation passes.
     */
    static passes(data: Record<string, any>, rules: ValidationRules): boolean;
    /**
     * Static method to check if validation fails.
     */
    static fails(data: Record<string, any>, rules: ValidationRules): boolean;
    /**
     * Static method to get validated data.
     */
    static validated(data: Record<string, any>, rules: ValidationRules): Record<string, any>;
    /**
     * Check if validation passes.
     */
    passes(): boolean;
    /**
     * Check if validation fails.
     */
    fails(): boolean;
    /**
     * Get the validation errors.
     */
    getErrors(): ValidationErrors;
    /**
     * Get the validated data (only fields that were defined in rules).
     */
    validated(): Record<string, any>;
    /**
     * Run the validation.
     */
    private validate;
    private normalizeRules;
    private isEmpty;
    private isNumeric;
    private isValidEmail;
    private isValidUrl;
    private isValidRegex;
    private addError;
}
export {};
//# sourceMappingURL=Validator.d.ts.map