import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";

export function WhatsAppFab({ href }: { href: string }) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const alvos = [
      document.getElementById("contato"),
      ...document.querySelectorAll("[data-hide-whatsapp-fab]"),
    ].filter((alvo): alvo is Element => alvo !== null);
    if (!alvos.length) return;

    const visiveis = new Set<Element>();
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visiveis.add(entry.target);
          else visiveis.delete(entry.target);
        });
        setHidden(visiveis.size > 0);
      },
      { threshold: 0.15 },
    );
    alvos.forEach((alvo) => obs.observe(alvo));
    return () => obs.disconnect();
  }, []);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar pelo WhatsApp"
      aria-hidden={hidden}
      tabIndex={hidden ? -1 : 0}
      className={`fixed right-4 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-50 inline-flex size-12 items-center justify-center rounded-full bg-deep text-aqua-soft shadow-xl transition-all duration-300 hover:bg-deep-2 sm:right-5 sm:bottom-5 sm:h-auto sm:w-auto sm:gap-2 sm:px-4 sm:py-2.5 sm:text-xs ${
        hidden ? "pointer-events-none translate-y-3 opacity-0" : "opacity-100"
      }`}
    >
      <MessageCircle className="size-5" aria-hidden="true" />
      <span className="hidden sm:inline">Falar pelo WhatsApp</span>
    </a>
  );
}
