import React from "react";

export default function LogoutButton() {
  const apelido = localStorage.getItem("apelido") || "Usuário";
  const guildId = localStorage.getItem("guildId") || "Sem guild";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("apelido");
    localStorage.removeItem("guildId");
    window.location.reload(); // força a tela a recarregar e cair no LoginPage
  };

  return (
    <div className="mt-10">
      <p>Bem vindo, {apelido}</p>
      <p>Guild Id: {guildId}</p>
      <button onClick={handleLogout} className="p-2 mt-6 bg-red-500 rounded-lg">
        Sair
      </button>
    </div>
  );
}
