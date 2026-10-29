import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, Menu, X } from "lucide-react";

const ancoras = [
  { href: "#o-que-e", label: "O que é" },
  { href: "#uso-pessoal", label: "Uso pessoal" },
  { href: "#uso-profissional", label: "Uso profissional" },
  { href: "#formacao", label: "Formação" },
  { href: "#videos", label: "Vídeos" },
  { href: "#duvidas", label: "Dúvidas" },
];

const livros = [
  { href: "/livros#enciclopedia", label: "Enciclopédia" },
  { href: "/livros#detox-ionico", label: "DETOX Iônico" },
  { href: "/livros#bioequilibrio", label: "DETOX BioEquilíbrio" },
  { href: "/livros#autor", label: "Sobre o autor" },
];

export function SiteHeader({ ancorasHome = true }: { ancorasHome?: boolean }) {
  const [open, setOpen] = useState(false);
  const [livrosOpen, setLivrosOpen] = useState(false);
  const [livrosMobileOpen, setLivrosMobileOpen] = useState(false);
  const livrosRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeMenus = () => {
      setOpen(false);
      setLivrosOpen(false);
      setLivrosMobileOpen(false);
    };
    const onKey = (event: KeyboardEvent) =>
      event.key === "Escape" && closeMenus();
    const onPointerDown = (event: PointerEvent) => {
      if (!livrosRef.current?.contains(event.target as Node))
        setLivrosOpen(false);
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  const links = ancorasHome
    ? ancoras
    : ancoras.map((link) => ({ ...link, href: `/${link.href}` }));

  const closeMobile = () => {
    setOpen(false);
    setLivrosMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-6 lg:px-10">
        <Link
          to="/"
          className="flex min-w-0 items-center gap-3"
          aria-label="STS DETOX BioEquilíbrio - início"
        >
          <img
            src="/sts-favicon.png"
            alt=""
            width={40}
            height={40}
            className="size-10 shrink-0 rounded-full ring-1 ring-deep/20"
          />
          <span className="truncate font-display text-sm font-bold sm:text-base">
            DETOX BioEquilíbrio
          </span>
        </Link>

        <nav
          aria-label="Navegação principal"
          className="hidden items-center gap-6 text-sm text-muted-foreground lg:flex"
        >
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="whitespace-nowrap transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none"
            >
              {link.label}
            </a>
          ))}

          <div
            ref={livrosRef}
            className="relative"
            onMouseEnter={() => setLivrosOpen(true)}
            onMouseLeave={() => setLivrosOpen(false)}
          >
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={livrosOpen}
              aria-controls="menu-livros-desktop"
              onClick={() => setLivrosOpen((value) => !value)}
              className="inline-flex items-center gap-1.5 whitespace-nowrap py-3 transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none"
            >
              Livros
              <ChevronDown
                className={`size-4 transition-transform ${livrosOpen ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </button>

            <div
              id="menu-livros-desktop"
              className={`absolute right-0 top-full w-64 pt-2 transition duration-150 ${
                livrosOpen
                  ? "visible translate-y-0 opacity-100"
                  : "invisible -translate-y-1 opacity-0"
              }`}
            >
              <div
                role="menu"
                aria-label="Livros"
                className="overflow-hidden rounded-lg border border-border bg-surface p-2 shadow-xl"
              >
                {livros.map((livro) => (
                  <a
                    key={livro.href}
                    href={livro.href}
                    role="menuitem"
                    onClick={() => setLivrosOpen(false)}
                    className="block rounded-md px-4 py-3 text-sm text-foreground transition-colors hover:bg-aqua-soft/55 focus-visible:bg-aqua-soft/55 focus-visible:outline-none"
                  >
                    {livro.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </nav>

        <button
          type="button"
          onClick={() => {
            setOpen((value) => !value);
            if (open) setLivrosMobileOpen(false);
          }}
          aria-expanded={open}
          aria-controls="menu-mobile"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          className="grid size-11 shrink-0 place-items-center rounded-full ring-1 ring-border transition-colors hover:bg-surface lg:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <div
        id="menu-mobile"
        hidden={!open}
        className="border-t border-border bg-background lg:hidden"
      >
        <nav
          aria-label="Navegação móvel"
          className="mx-auto max-w-7xl px-6 py-4"
        >
          <ul className="flex flex-col">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={closeMobile}
                  className="block border-b border-border/60 py-3.5 text-base text-foreground"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="border-b border-border/60">
              <button
                type="button"
                aria-expanded={livrosMobileOpen}
                aria-controls="menu-livros-mobile"
                onClick={() => setLivrosMobileOpen((value) => !value)}
                className="flex w-full items-center justify-between py-3.5 text-left text-base text-foreground"
              >
                Livros
                <ChevronDown
                  className={`size-5 transition-transform ${livrosMobileOpen ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </button>
              <ul
                id="menu-livros-mobile"
                hidden={!livrosMobileOpen}
                className="mb-3 border-l-2 border-aqua/45 pl-4"
              >
                {livros.map((livro) => (
                  <li key={livro.href}>
                    <a
                      href={livro.href}
                      onClick={closeMobile}
                      className="block py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {livro.label}
                    </a>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
