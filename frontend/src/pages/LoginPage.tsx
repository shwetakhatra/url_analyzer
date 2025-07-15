import React from "react";
import axios, { AxiosError } from "axios";
import { Form } from "../components/ui/form/Form";
import type { Field } from "../components/ui/form/Form";
import { Header } from "../components/layout/Header";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

const loginFields: Field[] = [
  { name: "email", label: "Email Address", type: "email", required: true },
  { name: "password", label: "Password", type: "password", required: true },
];

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = async (data: Record<string, string>) => {
    const { email, password } = data;

    if (!email || !password) {
      toast.error("Please fill in both email and password.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8080/auth/login", {
        email,
        password,
      });

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
      const err = error as AxiosError<{
        errors?: { error?: string };
        message?: string;
      }>;
      if (err.response) {
        const errorMsg =
          err.response.data?.errors?.error ||
          err.response.data?.message ||
          "Login failed";
        toast.error(`Login failed: ${errorMsg}`);
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }

      console.error("Login error:", error);
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
