import validator from "validator";

export interface ValidationResult {
    valid: boolean;
    errors: Record<string, string>;
}

// ─── Register ─────────────────────────────────────────────────────────────────

export interface RegisterInput {
    firstName?: unknown;
    lastName?:  unknown;
    email?:     unknown;
    password?:  unknown;
}

export function validateRegisterInput(input: RegisterInput): ValidationResult {
    const errors: Record<string, string> = {};

    if (!input.firstName || typeof input.firstName !== "string" || validator.isEmpty(input.firstName.trim())) {
        errors.firstName = "First name is required.";
    } else if (input.firstName.trim().length < 2) {
        errors.firstName = "First name must be at least 2 characters.";
    } else if (input.firstName.trim().length > 50) {
        errors.firstName = "First name cannot exceed 50 characters.";
    }

    if (!input.lastName || typeof input.lastName !== "string" || validator.isEmpty(input.lastName.trim())) {
        errors.lastName = "Last name is required.";
    } else if (input.lastName.trim().length < 2) {
        errors.lastName = "Last name must be at least 2 characters.";
    } else if (input.lastName.trim().length > 50) {
        errors.lastName = "Last name cannot exceed 50 characters.";
    }

    if (!input.email || typeof input.email !== "string" || validator.isEmpty(input.email.trim())) {
        errors.email = "Email address is required.";
    } else if (!validator.isEmail(input.email.trim())) {
        errors.email = "Please provide a valid email address.";
    }

    if (!input.password || typeof input.password !== "string" || validator.isEmpty(input.password)) {
        errors.password = "Password is required.";
    } else if (input.password.length < 8) {
        errors.password = "Password must be at least 8 characters.";
    } else if (input.password.length > 128) {
        errors.password = "Password cannot exceed 128 characters.";
    }

    return { valid: Object.keys(errors).length === 0, errors };
}

// ─── Login ────────────────────────────────────────────────────────────────────

export interface LoginInput {
    email?:    unknown;
    password?: unknown;
}

export function validateLoginInput(input: LoginInput): ValidationResult {
    const errors: Record<string, string> = {};

    if (!input.email || typeof input.email !== "string" || validator.isEmpty(input.email.trim())) {
        errors.email = "Email address is required.";
    } else if (!validator.isEmail(input.email.trim())) {
        errors.email = "Please provide a valid email address.";
    }

    if (!input.password || typeof input.password !== "string" || validator.isEmpty(input.password)) {
        errors.password = "Password is required.";
    }

    return { valid: Object.keys(errors).length === 0, errors };
}
