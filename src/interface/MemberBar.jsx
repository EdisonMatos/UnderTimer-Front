import React from "react";

export default function MemberBar() {
  const apelidoRaw = localStorage.getItem("apelido") || "Usuário";

  const capitalize = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const apelido = capitalize(apelidoRaw);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("apelido");
    localStorage.removeItem("guildId");
    window.location.reload();
  };

  return (
    <div className="flex items-center justify-center gap-3 mt-4 lg:justify-start ">
      <p>Bem vindo, {apelido}!</p>
      <button
        onClick={handleLogout}
        className="px-3 py-1 bg-red-900 rounded-lg hover:scale-110"
      >
        Sair
      </button>
    </div>
  );
}
