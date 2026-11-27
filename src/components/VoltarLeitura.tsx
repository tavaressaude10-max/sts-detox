import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";

const key = "sts:leitura-conjunto";
const changeEvent = "sts:leitura-change";
type Reading = { destination: string; item: number; offset: number; width: number; returning?: boolean };
let memory: Reading | null = null;

function read(): Reading | null {
  try {
    const value = JSON.parse(sessionStorage.getItem(key) || "null");
    return value && typeof value.destination === "string" && Number.isFinite(value.offset)
      && Number.isInteger(value.item) && value.item >= 0 && value.item < 4
      && Number.isFinite(value.width) ? value : null;
  } catch { return memory; }
}

function save(value: Reading | null) {
  memory = value;
  try {
    if (value) sessionStorage.setItem(key, JSON.stringify(value));
    else sessionStorage.removeItem(key);
  } catch { /* O retorno à âncora funciona mesmo sem armazenamento. */ }
  window.dispatchEvent(new Event(changeEvent));
}

export function rememberReading(destination: string, item: number) {
  const target = new URL(destination, window.location.href);
  save({ destination: target.pathname + target.hash, item,
    offset: document.getElementById("conjunto-inclui")?.getBoundingClientRect().top ?? 96,
    width: window.innerWidth });
}

function restoreReading() {
  const value = read();
  if (!value?.returning) return;
  const card = document.getElementById("conjunto-inclui");
  if (!card) return;
  const offset = value.width === window.innerWidth ? value.offset : 96;
  window.scrollTo({ top: window.scrollY + card.getBoundingClientRect().top - offset, behavior: "instant" });
  document.getElementById(`conjunto-item-${value.item}`)?.focus({ preventScroll: true });
  save(null);
}

export function useReadingReturn() {
  useEffect(() => {
    let frame = 0;
    const restore = () => {
      frame = requestAnimationFrame(() => { frame = requestAnimationFrame(restoreReading); });
    };
    if (document.readyState === "complete") restore();
    else window.addEventListener("load", restore, { once: true });
    return () => { cancelAnimationFrame(frame); window.removeEventListener("load", restore); };
  }, []);
}

export function VoltarLeitura({ destination, dark = false }: { destination: string; dark?: boolean }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const update = () => setVisible(read()?.destination === destination
      && window.location.pathname + window.location.hash === destination);
    update();
    window.addEventListener("hashchange", update);
    window.addEventListener(changeEvent, update);
    return () => { window.removeEventListener("hashchange", update); window.removeEventListener(changeEvent, update); };
  }, [destination]);
  if (!visible) return null;
  return (
    <a href="/#conjunto-inclui" onClick={(event) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      document.querySelectorAll("video").forEach(video => video.pause());
      window.dispatchEvent(new CustomEvent("sts:video-play", { detail: "return-to-reading" }));
      const value = read();
      if (value) save({ ...value, returning: true });
      if (window.location.pathname === "/") {
        event.preventDefault();
        window.history.pushState(window.history.state, "", "/#conjunto-inclui");
        restoreReading();
      }
    }} className={`mb-4 inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 ${dark ? "border-aqua-soft/30 text-aqua-soft hover:bg-white/10 focus-visible:outline-aqua-soft" : "border-deep/25 text-deep hover:bg-aqua-soft/40 focus-visible:outline-deep"}`}>
      <ArrowLeft className="size-4" aria-hidden="true" />Voltar à leitura
    </a>
  );
}
