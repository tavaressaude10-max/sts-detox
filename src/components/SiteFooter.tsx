import { Facebook, Instagram, Youtube } from "lucide-react";

const redesSociais = [
  {
    href: "https://www.instagram.com/stsdetox?stkn=MTkwMGJleHJvMTZjMA==",
    label: "Instagram",
    icon: Instagram,
  },
  {
    href: "https://www.facebook.com/share/1GJHfrrabB/?mibextid=wwXIfr",
    label: "Facebook",
    icon: Facebook,
  },
  {
    href: "https://www.youtube.com/@severinotavaresdasilva6514",
    label: "YouTube",
    icon: Youtube,
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-14 flex flex-col items-start justify-between gap-6 border-t border-border pt-8 pb-24 md:flex-row md:items-center md:pb-10">
      <div className="flex items-center gap-3">
        <span className="grid size-7 place-items-center rounded-lg bg-deep font-display text-xs font-extrabold text-aqua-soft">
          STS
        </span>
        <span className="font-display text-sm font-bold tracking-tight">
          Detox BioEquilíbrio
        </span>
      </div>
      <nav aria-label="Redes sociais" className="flex flex-wrap items-center gap-2">
        {redesSociais.map(({ href, label, icon: Icon }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Acessar ${label} do STS`}
            className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground ring-1 ring-border transition-colors hover:text-foreground hover:ring-aqua/40"
          >
            <Icon className="size-4" aria-hidden="true" />
            {label}
          </a>
        ))}
      </nav>
      <p className="font-mono text-xs text-muted-foreground">
        © {new Date().getFullYear()} STS Detox BioEquilíbrio — conteúdo informativo, sem
        alegações médicas.
      </p>
    </footer>
  );
}
