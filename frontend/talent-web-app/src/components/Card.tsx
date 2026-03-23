import { HTMLAttributes, ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
} & HTMLAttributes<HTMLElement>;

export default function Card({ children, className = "", ...props }: Props) {
  return (
    <article
      className={`rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200/80 transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${className}`}
      {...props}
    >
      {children}
    </article>
  );
}
