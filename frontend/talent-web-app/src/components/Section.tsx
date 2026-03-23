import { ReactNode } from "react";

type Props = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
};

export default function Section({ title, subtitle, children, className = "" }: Props) {
  return (
    <section className={`container-app space-y-6 ${className}`}>
      {(title || subtitle) && (
        <div className="space-y-2">
          {title && <h2 className="text-3xl font-semibold text-[#1a1a1a]">{title}</h2>}
          {subtitle && <p className="max-w-3xl text-base text-[#666]">{subtitle}</p>}
        </div>
      )}
      {children}
    </section>
  );
}
