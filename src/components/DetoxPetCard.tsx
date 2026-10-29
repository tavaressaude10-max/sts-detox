export const amazonDetoxPet = "https://www.amazon.com/dp/B0HNWDSW4V";

export function DetoxPetCard() {
  return (
    <div className="mx-auto flex w-full max-w-[280px] flex-col items-center text-center">
      <a href={amazonDetoxPet} target="_blank" rel="noopener noreferrer"
        aria-label="Ver DETOX PET na Amazon (abre em nova aba)"
        className="block w-full rounded-2xl transition-transform hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-aqua">
        <img src="/assets/capa-detox-pet.jpg" alt="Capa do livro DETOX PET, de Severino Tavares da Silva"
          width={228} height={342} loading="lazy" className="w-full rounded-2xl object-contain shadow-lg" />
      </a>
      <h3 className="mt-3 font-display text-sm font-bold text-deep">DETOX PET</h3>
      <a href={amazonDetoxPet} target="_blank" rel="noopener noreferrer"
        className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-deep px-5 py-3 text-sm font-semibold text-aqua-soft transition-colors hover:bg-deep-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-aqua">
        Ver na Amazon
      </a>
    </div>
  );
}
