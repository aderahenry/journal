import { useState, useEffect } from 'react';

interface ValidationRules {
  [key: string]: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: string | number) => boolean;
  };
}

interface ValidationErrors {
  [key: string]: string;
}

interface FormValues {
  [key: string]: string | number;
}

export const useFormValidation = (initialValues: FormValues, validationRules: ValidationRules) => {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isValid, setIsValid] = useState(false);

  const validateField = (name: string, value: string | number): string => {
    const rules = validationRules[name];
    if (!rules) return '';

    if (rules.required && !value) {
      return `${name} is required`;
    }

    if (typeof value === 'string') {
      if (rules.minLength && value.length < rules.minLength) {
        return `${name} must be at least ${rules.minLength} characters`;
      }

      if (rules.maxLength && value.length > rules.maxLength) {
        return `${name} must be at most ${rules.maxLength} characters`;
      }

      if (rules.pattern && !rules.pattern.test(value)) {
        return `${name} is invalid`;
      }
    }

    if (rules.custom && !rules.custom(value)) {
      return `${name} is invalid`;
    }

    return '';
  };

  const validateForm = () => {
    const newErrors: ValidationErrors = {};
    let hasErrors = false;

    Object.keys(validationRules).forEach((field) => {
      const error = validateField(field, values[field]);
      if (error) {
        newErrors[field] = error;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    setIsValid(!hasErrors);
  };

  useEffect(() => {
    validateForm();
  }, [values]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setIsValid(false);
  };

  return {
    values,
    errors,
    isValid,
    handleChange,
    resetForm,
    setValues,
  };
}; 