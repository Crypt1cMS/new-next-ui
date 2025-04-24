"use client";

import CardGrid from "@/components/card-grid";
import { title, subtitle } from "@/components/primitives";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Form } from "@heroui/react";
import React from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [register, setRegister] = React.useState({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [login, setLogin] = React.useState({
    email: "",
    password: "",
  });
  const [loginError, setLoginError] = React.useState("");
  const [registerError, setRegisterError] = React.useState("");
  const [registerSuccess, setRegisterSuccess] = React.useState(false);
  const [loginSuccess, setLoginSuccess] = React.useState(false);

  const handleRegister = async () => {
    setRegisterSuccess(false);
    if (register.email === "" || register.password === "" || register.confirmPassword === "" || register.displayName === "") {
      setRegisterError("Please fill in all fields");
      return false;
    }

    if (register.displayName.length < 5) {
      setRegisterError("Display name must be at least 5 characters long");
      return false;
    }

    if (register.password.length < 8) {
      setRegisterError("Password must be at least 8 characters long");
      return false;
    }

    if (register.password !== register.confirmPassword) {
      setRegisterError("Passwords do not match");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(register.email)) {
      setRegisterError("Please enter a valid email address");
      return false;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: register.email,
        password: register.password,
        options: {
          data: {
            displayName: register.displayName
          },
          emailRedirectTo: window.location.origin
        }
      });

      if (error) {
        if (error.message.includes("invalid")) {
          setRegisterError("Please use a real email address. Supabase requires email verification.");
        } else {
          setRegisterError(error.message || "Failed to register user");
        }
        setRegisterSuccess(false);
        return false;
      }
      
      setRegisterError("");
      setRegisterSuccess(true);
      
      setRegister({
        displayName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      
      setRegisterError("Registration successful! Please check your email to verify your account.");
      return true;
    } catch (error) {
      setRegisterError("An unexpected error occurred");
      setRegisterSuccess(false);
      return false;
    }
  }

  const handleLogin = async () => {
    setLoginSuccess(false);
    if (login.email === "" || login.password === "") {
      setLoginError("Please fill in all fields");
      return false;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: login.email,
        password: login.password
      });

      if (error) {
        setLoginError(error.message || "Failed to login");
        setLoginSuccess(false);
        return false;
      }
      
      setLoginError("");
      setLoginSuccess(true);
      
      // Redirect to the deployed site
      window.location.href = "https://next-todo-app-deploy.vercel.app/todo-app";
      return true;
    } catch (error) {
      setLoginError("An unexpected error occurred");
      setLoginSuccess(false);
      return false;
    }
  }

  return (
    <section className="w-full flex flex-col items-center justify-center gap-4">
      <div className="w-full justify-center">

        <div className="w-full flex flex-col justify-center items-center text-center pb-6">
          <span className={title({ size: "lg" })}>Todo App</span>

          <p className={subtitle({ class: "mt-4" })}>
            A simple todo app built with Next.js and Tailwind CSS.
          </p>
        </div>

        <div className="w-full flex justify-center items-center">
          <div className="w-1/2 h-full justify-center items-center">
            <CardGrid />
          </div>

          <div className="w-1/2 h-full flex flex-col justify-center items-center gap-8">

            <div className="w-full flex flex-col justify-center items-center text-center gap-2">
              <h2 className={title({ size: "sm" })}>Register</h2>

              <Form
                className="flex flex-col gap-4 w-full p-4 border border-gray-600 rounded-lg text-left"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleRegister();
                }}
              >
                <Input type="text" onChange={(e) => setRegister({ ...register, displayName: e.target.value })} placeholder="Display name" />
                <Input type="email" onChange={(e) => setRegister({ ...register, email: e.target.value })} placeholder="Email" />
                <Input type="password" onChange={(e) => setRegister({ ...register, password: e.target.value })} placeholder="Password" />
                <Input type="password" onChange={(e) => setRegister({ ...register, confirmPassword: e.target.value })} placeholder="Confirm password" />
                {registerError && <span className={registerSuccess ? "text-green-500 text-sm" : "text-red-500 text-sm"}>{registerError}</span>}
                <Button color="primary" variant="ghost" type="submit">Register</Button>
              </Form>
            </div>

            <div className="w-full flex flex-col justify-center items-center text-center gap-2">
              <h2 className={title({ size: "sm" })}>Login</h2>

              <Form
                className="flex flex-col gap-4 w-full p-4 border border-gray-600 rounded-lg text-left"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleLogin();
                }}
              >
                <Input type="email" onChange={(e) => setLogin({ ...login, email: e.target.value })} placeholder="Please enter your email" />
                <Input type="password" onChange={(e) => setLogin({ ...login, password: e.target.value })} placeholder="Please enter your password" />
                {loginError && <span className={loginSuccess ? "text-green-500 text-sm" : "text-red-500 text-sm"}>{loginError}</span>}
                <Button color="primary" variant="ghost" type="submit">Login</Button>
              </Form>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
