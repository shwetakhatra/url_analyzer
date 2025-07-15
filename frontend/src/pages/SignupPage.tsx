import React from "react";
import axios, { AxiosError } from "axios";
import { Form } from "../components/ui/form/Form";
import type { Field } from "../components/ui/form/Form";
import { Header } from "../components/layout/Header";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Toast } from "../components/ui/toast/Toast";

interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const signupFields: Field[] = [
  { name: "name", label: "Full Name", type: "text", required: true },
  { name: "email", label: "Email Address", type: "email", required: true },
  { name: "password", label: "Password", type: "password", required: true },
  {
    name: "confirmPassword",
    label: "Confirm Password",
    type: "password",
    required: true,
  },
];

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = async (data: Record<string, string>) => {
    const { name, email, password, confirmPassword } = data;

    if (!name || !email || !password || !confirmPassword) {
      toast.error("All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      const payload: Omit<SignupFormData, "confirmPassword"> = {
        name,
        email,
        password,
      };

      const response = await axios.post(
        "http://localhost:8080/auth/register",
        payload,
      );
      toast.success(
        response.data.message ||
          "User created successfully! Redirecting to login...",
        {
          autoClose: 2000,
        },
      );

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      if (err.response) {
        toast.error(
          `Signup failed: ${err.response.data?.message || err.response.statusText}`,
        );
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
      <Toast />
    </>
  );
};
