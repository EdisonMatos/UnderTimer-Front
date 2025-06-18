import React from "react";

export default function LogoutButton() {
  const apelidoRaw = localStorage.getItem("apelido") || "Usuário";
  const guildId = localStorage.getItem("guildId") || "Sem guild";

  const capitalize = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const apelido = capitalize(apelidoRaw);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("apelido");
    localStorage.removeItem("guildId");
    window.location.reload(); // força a tela a recarregar e cair no LoginPage
  };

  return (
    <div className="mt-10">
      <p>Bem vindo, {apelido}!</p>
      <button onClick={handleLogout} className="p-2 mt-6 bg-red-500 rounded-lg">
        Sair
      </button>
    </div>
  );
}
