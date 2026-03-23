import Link from "next/link";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "secondary";
  type?: "button" | "submit";
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  title?: string;
};

const base = "inline-flex cursor-pointer items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623] focus-visible:ring-offset-2";
const variants = {
  primary: "bg-[#F5A623] text-[#1a1a1a] shadow-sm hover:-translate-y-0.5 hover:bg-[#e39720] hover:shadow-md",
  secondary: "border border-zinc-300 bg-white text-zinc-700 hover:-translate-y-0.5 hover:border-zinc-400 hover:bg-zinc-50",
};

export default function Button({ children, href, variant = "primary", type = "button", onClick, className = "", disabled = false, title }: Props) {
  if (href) {
    return (
      <Link href={href} className={`${base} ${variants[variant]} ${className}`}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} title={title} className={`${base} ${variants[variant]} disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 ${className}`}>
      {children}
    </button>
  );
}
