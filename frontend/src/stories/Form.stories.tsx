import type { Meta, StoryFn } from "@storybook/react-vite";
import { Form } from "../components/ui/form/Form";
import type { Field } from "../components/ui/form/Form";

const meta: Meta<typeof Form> = {
  title: "UI/Form",
  component: Form,
};

export default meta;

type Args = {
  title: string;
  fields: Field[];
  submitLabel: string;
};

const Template: StoryFn<Args> = ({ title, fields, submitLabel }) => {
  const handleSubmit = (data: Record<string, string>) => {
    alert(`Form submitted with data:\n${JSON.stringify(data, null, 2)}`);
  };

  return (
    <Form
      title={title}
      fields={fields}
      onSubmit={handleSubmit}
      submitLabel={submitLabel}
    />
  );
};

export const Login = Template.bind({});
Login.args = {
  title: "Login to Your Account",
  fields: [
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "Enter your email",
      required: true,
    },
    {
      name: "password",
      label: "Password",
      type: "password",
      placeholder: "Enter your password",
      required: true,
    },
  ],
  submitLabel: "Log In",
};

export const Signup = Template.bind({});
Signup.args = {
  title: "Create a New Account",
  fields: [
    {
      name: "name",
      label: "Full Name",
      type: "text",
      placeholder: "Enter your full name",
      required: true,
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "Enter your email",
      required: true,
    },
    {
      name: "password",
      label: "Password",
      type: "password",
      placeholder: "Create a password",
      required: true,
    },
    {
      name: "confirmPassword",
      label: "Confirm Password",
      type: "password",
      placeholder: "Confirm your password",
      required: true,
    },
  ],
  submitLabel: "Sign Up",
};
