import React from "react";
import type { AxiosError } from "axios";
import { signupApi } from "../api/signup";
import type { SignupErrorResponse } from "../api/signup";
import { Form } from "../components/ui/form/Form";
import type { Field } from "../components/ui/form/Form";
import { Header } from "../components/layout/Header";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

interface LocalSignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const signupFields: Field[] = [
  { name: "name", label: "Full Name", type: "text" },
  { name: "email", label: "Email Address", type: "email" },
  { name: "password", label: "Password", type: "password" },
  { name: "confirmPassword", label: "Confirm Password", type: "password" },
];

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (data: Record<string, string>) => {
    const { name, email, password, confirmPassword } =
      data as unknown as LocalSignupFormData;
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    try {
      const payload = { name, email, password };
      const response = await signupApi(payload);
      toast.success(
        response.data.message ||
          "User created successfully! Redirecting to login...",
        { autoClose: 2000 },
      );
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      const err = error as AxiosError<SignupErrorResponse>;
      if (err.response) {
        const errorsObj = err.response.data?.errors;
        let shown = false;
        if (errorsObj && typeof errorsObj === "object") {
          Object.entries(errorsObj).forEach(([field, msg]) => {
            if (typeof msg === "string" && msg.trim()) {
              toast.error(
                field === "error"
                  ? msg
                  : `${field.charAt(0).toUpperCase() + field.slice(1)}: ${msg}`,
              );
              shown = true;
            }
          });
        }
        if (!shown) {
          const errorMsg = err.response.data?.message || "Signup failed";
          toast.error(`Signup failed: ${errorMsg}`);
        }
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <>
      <Header />
      <Form
        title="Create your account"
        fields={signupFields}
        onSubmit={handleSubmit}
        submitLabel="Sign Up"
      />
    </>
  );
};
