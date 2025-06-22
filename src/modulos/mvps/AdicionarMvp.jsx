import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export default function AdicionarMvp({ onCreated }) {
  const [monsterId, setMonsterId] = useState("");
  const [tier, setTier] = useState("");
  const [loading, setLoading] = useState(false); // <-- novo estado

  const formatName = (rawName) => {
    return rawName
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleSubmit = async () => {
    if (!monsterId || !tier) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    if (!["A", "S"].includes(tier)) {
      toast.error("Tier deve ser A ou S.");
      return;
    }

    try {
      setLoading(true); // inicia carregamento

      const response = await axios.get(
        `https://undertimer-biel.onrender.com/proxy/monster/${monsterId}`
      );

      const data = response.data;

      let type = "";
      const modes = data.skills?.mode || [];
      if (modes.includes("mvp") && modes.includes("boss")) {
        type = "MVP";
      } else if (modes.includes("boss")) {
        type = "miniboss";
      } else {
        toast.error("ID inválido ou não pertence a um MVP/Miniboss. Verifique");
        return;
      }

      const rawFrequency = data.maps?.[0]?.frequency || "";
      const hoursMatch = rawFrequency.match(/(\d+)_hour/);
      const minsMatch = rawFrequency.match(/(\d+)_min/);
      const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
      const minutes = minsMatch ? parseInt(minsMatch[1], 10) : 0;
      const respawn = +(hours + minutes / 60).toFixed(2);

      const guildId = localStorage.getItem("guildId") || "-";
      const updatedby = localStorage.getItem("apelido") || "-";

      const payload = {
        type,
        tier: tier.toUpperCase(),
        name: formatName(data.monster_info),
        respawn,
        spriteUrl: data.gif,
        updatedby,
        guildId,
        lastDeath: new Date().toISOString(),
      };

      await axios.post(
        "https://undertimer-biel.onrender.com/creatures",
        payload
      );

      toast.success("MVP adicionado com sucesso!");
      setMonsterId("");
      setTier("");

      if (onCreated) {
        onCreated();
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao adicionar MVP. Verifique o ID e tente novamente.");
    } finally {
      setLoading(false); // encerra carregamento
    }
  };

  return (
    <div className="max-w-md p-4 mx-auto mt-10 space-y-4 text-white shadow-lg bg-zinc-800 rounded-xl">
      <h2 className="text-xl font-bold">Adicionar MVP/Miniboss</h2>

      <div className="flex flex-col">
        <label htmlFor="monsterId" className="mb-1">
          ID do MVP/Miniboss
        </label>
        <input
          id="monsterId"
          type="number"
          maxLength={6}
          value={monsterId}
          onChange={(e) => {
            if (e.target.value.length <= 6) setMonsterId(e.target.value);
          }}
          className="p-2 text-white border rounded bg-zinc-700 border-zinc-600"
          placeholder="Ex: 1832"
        />
      </div>

      <div className="flex flex-col">
        <label htmlFor="tier" className="mb-1">
          Tier (obrigatório)
        </label>
        <select
          id="tier"
          value={tier}
          onChange={(e) => setTier(e.target.value)}
          className="p-2 text-white border rounded bg-zinc-700 border-zinc-600"
        >
          <option value="">Selecione</option>
          <option value="A">A</option>
          <option value="S">S</option>
        </select>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className={`w-full py-2 font-semibold rounded transition ${
          loading
            ? "bg-gray-500 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {loading ? "Carregando..." : "Adicionar"}
      </button>
    </div>
  );
}
