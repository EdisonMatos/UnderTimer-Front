import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export default function AdicionarMvp({ onCreated }) {
  const [monsterId, setMonsterId] = useState("");
  const [tier, setTier] = useState("");
  const [loading, setLoading] = useState(false);
  const [availableMaps, setAvailableMaps] = useState([]);
  const [selectedMapIndex, setSelectedMapIndex] = useState(null);
  const [manualRespawn, setManualRespawn] = useState("");
  const [requireManualRespawn, setRequireManualRespawn] = useState(false);

  const formatName = (rawName) => {
    return rawName
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatMapName = (mapRaw) => {
    return mapRaw
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

    if (availableMaps.length > 1 && selectedMapIndex === null) {
      toast.error("Selecione o mapa.");
      return;
    }

    try {
      setLoading(true);

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

      const maps = data.maps || [];

      if (maps.length > 1 && availableMaps.length === 0) {
        setAvailableMaps(maps);
        toast.info("Selecione o mapa antes de prosseguir.");
        return;
      }

      if (maps.length === 0 && !requireManualRespawn) {
        setRequireManualRespawn(true);
        toast.info(
          "Esse monstro é de instância, depende de quest ou não tem tempo predefinido. Informe o tempo de respawn manualmente."
        );
        return;
      }

      let respawn = 0;

      if (maps.length === 0) {
        if (!manualRespawn || isNaN(manualRespawn)) {
          toast.error("Informe o tempo de respawn manualmente.");
          return;
        }
        respawn = parseFloat(manualRespawn);
      } else {
        const selectedMap =
          maps.length > 1 ? maps[selectedMapIndex] : maps[0] || {};
        const rawFrequency = selectedMap.frequency || "";

        const hoursMatch = rawFrequency.match(/(\d+)_hour/);
        const minsMatch = rawFrequency.match(/(\d+)_min/);
        const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
        const minutes = minsMatch ? parseInt(minsMatch[1], 10) : 0;
        respawn = +(hours + minutes / 60).toFixed(2);
      }

      const guildId = localStorage.getItem("guildId") || "-";
      const updatedby = localStorage.getItem("apelido") || "-";

      let name = formatName(data.monster_info);
      if (maps.length > 1) {
        const selectedMap = maps[selectedMapIndex];
        const formattedMapName = formatMapName(selectedMap?.name || "");
        const mapNumber = selectedMap?.number ? ` ${selectedMap.number}` : "";
        name += ` (${formattedMapName}${mapNumber})`;
      }

      // Verificação se o nome já existe na GUILDA do usuário
      const existing = await axios.get("https://undertimer-biel.onrender.com");

      const filtered = existing.data.filter((m) => m.guildId === guildId);
      const nameExists = filtered.some(
        (m) => m.name.toLowerCase() === name.toLowerCase()
      );

      if (nameExists) {
        toast.error("Já existe um monstro com esse nome nessa guild.");
        return;
      }

      const payload = {
        type,
        tier: tier.toUpperCase(),
        name,
        respawn,
        spriteUrl: `https://game.ragnaplace.com/ro/job/${monsterId}/0.png`,
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
      setAvailableMaps([]);
      setSelectedMapIndex(null);
      setManualRespawn("");
      setRequireManualRespawn(false);

      if (onCreated) onCreated();
    } catch (error) {
      console.error(error);
      toast.error(
        "Erro ao adicionar MVP. O MVP já existe ou o ID digitado é inválido. Verifique."
      );
    } finally {
      setLoading(false);
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
          <option value="S">Tier S - Mais fortes, precisa de grupo</option>
          <option value="A">Tier A - Todos os demais</option>
        </select>
      </div>

      {availableMaps.length > 1 && (
        <div className="flex flex-col">
          <label htmlFor="mapSelect" className="mb-1">
            Selecione o mapa
          </label>
          <select
            id="mapSelect"
            value={selectedMapIndex ?? ""}
            onChange={(e) =>
              setSelectedMapIndex(
                e.target.value !== "" ? parseInt(e.target.value) : null
              )
            }
            className="p-2 text-white border rounded bg-zinc-700 border-zinc-600"
          >
            <option value="">Selecione</option>
            {availableMaps.map((map, index) => {
              const mapName = formatMapName(map.name); // Ex: Rachel Field
              const mapNumber = map.number ? ` ${map.number}` : ""; // Ex: 2
              const frequency = map.frequency.replace(/_/g, " "); // Ex: after 4 hours
              return (
                <option key={index} value={index}>
                  {mapName}
                  {mapNumber} ({frequency})
                </option>
              );
            })}
          </select>
        </div>
      )}

      {requireManualRespawn && (
        <div className="flex flex-col">
          <label htmlFor="manualRespawn" className="mb-1">
            Respawn em horas
          </label>
          <input
            id="manualRespawn"
            type="number"
            step="0.1"
            min="0"
            value={manualRespawn}
            onChange={(e) => setManualRespawn(e.target.value)}
            className="p-2 text-white border rounded bg-zinc-700 border-zinc-600"
            placeholder="Ex: 2"
          />
        </div>
      )}

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
