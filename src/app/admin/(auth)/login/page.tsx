import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LogoMark } from "@/components/brand/logo-mark";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  return (
    <main className="grid min-h-dvh place-items-center px-4 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" aria-label="Back to the homepage" className="group inline-block">
          <LogoMark className="size-12 text-accent-ink transition-transform duration-500 ease-out-expo group-hover:scale-105" />
        </Link>
        <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight text-fg">Dashboard</h1>
        <p className="mt-2 text-muted">Sign in to see enquiries, subscribers and site analytics.</p>
        <Suspense fallback={<div className="mt-8 h-64" />}>
          {searchParams.then(({ next }) => (
            <LoginForm next={typeof next === "string" ? next : ""} />
          ))}
        </Suspense>
      </div>
    </main>
  );
}
