import React, { useState } from "react";
import { Button } from "../button/Button";
import styles from "./Form.module.css";

export type Field = {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
};

type FormProps = {
  title: string;
  fields: Field[];
  onSubmit: (data: Record<string, string>) => void;
  submitLabel: string;
};

export const Form: React.FC<FormProps> = ({
  title,
  fields,
  onSubmit,
  submitLabel,
}) => {
  const [formData, setFormData] = useState<Record<string, string>>(() =>
    fields.reduce((acc, f) => ({ ...acc, [f.name]: "" }), {}),
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>{title}</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          {fields.map(({ name, label, type, required }) => {
            const hasValue = formData[name].length > 0;
            return (
              <div key={name} className={styles.fieldWrapper}>
                <input
                  id={name}
                  name={name}
                  type={type}
                  required={required}
                  value={formData[name]}
                  onChange={handleChange}
                  placeholder=" "
                  className={styles.input}
                />
                <label
                  htmlFor={name}
                  className={`${styles.label} ${hasValue ? styles.filled : ""}`}
                >
                  {label}
                </label>
              </div>
            );
          })}
          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full"
            style={{ color: "var(--button-text-color)" }}
          >
            {submitLabel}
          </Button>
        </form>
      </div>
    </div>
  );
};
