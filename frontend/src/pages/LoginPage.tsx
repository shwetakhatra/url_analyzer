import React from "react";
import type { AxiosError } from "axios";
import { Form } from "../components/ui/form/Form";
import type { Field } from "../components/ui/form/Form";
import { Header } from "../components/layout/Header";
import { loginApi } from "../api/auth";
import type { LoginFormData, LoginErrorResponse } from "../api/auth";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

const loginFields: Field[] = [
  { name: "email", label: "Email Address", type: "email" },
  { name: "password", label: "Password", type: "password" },
];

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = async (data: Record<string, string>) => {
    const { email, password } = data as LoginFormData;
    try {
      const response = await loginApi({ email, password });
      const token = response.data.token;
      if (token) {
        localStorage.setItem("token", token);
        toast.success("Login successful! Redirecting to dashboard...", {
          autoClose: 2000,
        });
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } else {
        toast.error("Login failed: No token received from server.");
      }
    } catch (error) {
      const err = error as AxiosError<LoginErrorResponse>;
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
          const errorMsg = err.response.data?.message || "Login failed";
          toast.error(`Login failed: ${errorMsg}`);
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
        title="Login to your account"
        fields={loginFields}
        onSubmit={handleSubmit}
        submitLabel="Login"
      />
    </>
  );
};
