export default function Header() {
  return (
    <>
      {" "}
      <h2 className="mb-1 text-lg text-center lg:text-left">UnderTimer</h2>
      <p className="mt-0 mb-0 text-sm text-center lg:text-left">
        Sistema de Controle de Tempos para Ragnarok Online
      </p>
      <p className="mt-0 text-xs text-center text-white opacity-50 lg:text-left">
        Beta - v0.8 (em desenvolvimento)
      </p>
      <div className="flex justify-center w-full mb-10 lg:justify-start">
        <button className="p-2 mt-4 transition-all rounded-lg bg-primary w-fit hover:scale-105">
          <a href="https://forms.gle/Nmi7WzCzwqy3qP8Z6" target="_blank">
            Sugestões / Bugs / Reclamações
          </a>
        </button>
      </div>
    </>
  );
}
