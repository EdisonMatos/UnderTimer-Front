import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import rapaz from "./rapaz.mp3";
import BuscaMvps from "./BuscaMvps";
import CardMvps from "./CardMvps";
import AdicionarMvp from "./AdicionarMvp";

export default function Mvps() {
  const [monsters, setMonsters] = useState([]);
  const [inputValues, setInputValues] = useState({});
  const [timers, setTimers] = useState({});
  const [loadingIds, setLoadingIds] = useState({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchMonsters();
  }, []);

  useEffect(() => {
    const interval = setInterval(updateCountdowns, 1000);
    return () => clearInterval(interval);
  }, [monsters]);

  const fetchMonsters = async () => {
    try {
      const response = await axios.get("https://undertimer-biel.onrender.com/");
      const allMonsters = response.data;
      const guildId = localStorage.getItem("guildId");

      const filteredMonsters = allMonsters.filter(
        (monster) => monster.guildId === guildId
      );

      setMonsters(filteredMonsters);
    } catch (error) {
      console.error("Erro ao buscar monstros:", error);
    }
  };

  const isElementInViewport = (el) => {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.right <= window.innerWidth
    );
  };

  const updateCountdowns = () => {
    const updatedTimers = {};
    monsters.forEach((monster) => {
      if (!monster.lastDeath) return;

      const lastDeath = new Date(monster.lastDeath);
      const respawnMs = monster.respawn * 60 * 60 * 1000;
      const respawnTime = new Date(lastDeath.getTime() + respawnMs);
      const diff = respawnTime - new Date();

      if (diff <= 0) {
        const timeSinceSpawn = new Date() - respawnTime;

        if (timeSinceSpawn < respawnMs) {
          const seconds = Math.floor(timeSinceSpawn / 1000);
          const hours = Math.floor(seconds / 3600);
          const minutes = Math.floor((seconds % 3600) / 60);
          const secs = seconds % 60;

          updatedTimers[monster.id] = {
            value: `${hours.toString().padStart(2, "0")}:${minutes
              .toString()
              .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`,
            born: true,
          };
        } else {
          updatedTimers[monster.id] = {
            value: "-",
            born: false,
          };
        }
      } else {
        const secondsLeft = Math.floor(diff / 1000);
        if (secondsLeft === 1) {
          const el = document.getElementById(monster.id);
          if (isElementInViewport(el)) {
            const audio = new Audio(rapaz);
            audio
              .play()
              .catch((e) => console.error("Erro ao reproduzir som:", e));
          }
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        updatedTimers[monster.id] = {
          value: `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
          born: false,
        };
      }
    });

    setTimers(updatedTimers);
  };

  const handleInputChange = (id, value) => {
    setInputValues((prev) => ({ ...prev, [id]: value }));
  };

  const handleConfirm = async (monster) => {
    const newDate = new Date(inputValues[monster.id]);
    if (newDate > new Date()) {
      toast.error("Data inválida. Insira uma data no passado.");
      return;
    }

    setLoadingIds((prev) => ({ ...prev, [monster.id]: true }));
    try {
      await axios.put("https://undertimer-biel.onrender.com/edit", {
        id: monster.id,
        lastDeath: newDate.toISOString(),
        updatedby: localStorage.getItem("apelido") || "-",
      });

      setMonsters((prev) =>
        prev.map((m) =>
          m.id === monster.id
            ? {
                ...m,
                lastDeath: newDate.toISOString(),
                updatedBy: localStorage.getItem("apelido") || "-",
              }
            : m
        )
      );

      toast.success("Atualizado com sucesso");
    } catch {
      toast.error("Erro ao atualizar");
    } finally {
      setLoadingIds((prev) => ({ ...prev, [monster.id]: false }));
    }
  };

  const handleQuickUpdate = (monster) => {
    const now = new Date().toISOString();
    setLoadingIds((prev) => ({ ...prev, [monster.id]: true }));
    axios
      .put("https://undertimer-biel.onrender.com/edit", {
        id: monster.id,
        lastDeath: now,
        updatedby: localStorage.getItem("apelido") || "-",
      })
      .then(() => {
        setMonsters((prev) =>
          prev.map((m) =>
            m.id === monster.id
              ? {
                  ...m,
                  lastDeath: now,
                  updatedBy: localStorage.getItem("apelido") || "-",
                }
              : m
          )
        );
        toast.success("Atualizado com sucesso");
      })
      .catch(() => toast.error("Erro ao atualizar"))
      .finally(() => {
        setLoadingIds((prev) => ({ ...prev, [monster.id]: false }));
      });
  };

  const calculateRespawnTime = (lastDeath, hours) => {
    const deathDate = new Date(lastDeath);
    return new Date(deathDate.getTime() + hours * 60 * 60 * 1000);
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const hours = d.getHours().toString().padStart(2, "0");
    const minutes = d.getMinutes().toString().padStart(2, "0");
    return [`${day}/${month}`, `${hours}:${minutes}`];
  };

  const renderCardsOnly = (filteredMonsters, label) => {
    if (filteredMonsters.length === 0) return null;

    const parseTime = (t) => {
      if (!t || t.value === "-") return Infinity;
      const [h, m, s] = t.value.split(":").map(Number);
      return h * 3600 + m * 60 + s;
    };

    const sortedMonsters = [...filteredMonsters].sort(
      (a, b) => parseTime(timers[a.id]) - parseTime(timers[b.id])
    );

    return (
      <>
        <h3 className="mt-5 mb-5 text-lg font-semibold text-center text-white lg:text-left">
          {label}
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:flex-wrap lg:justify-start">
          {sortedMonsters.map((monster) => {
            const timerObj = timers[monster.id] || {
              value: "—",
              born: false,
            };
            const isAlive = timerObj.born;
            const timerValue = timerObj.value;
            const fullRespawnDate = monster.lastDeath
              ? calculateRespawnTime(monster.lastDeath, monster.respawn)
              : null;
            const [respawnDate, respawnTime] = fullRespawnDate
              ? formatDate(fullRespawnDate)
              : ["—", ""];
            const [deathDate, deathTime] = monster.lastDeath
              ? formatDate(monster.lastDeath)
              : ["—", ""];
            const apelido = monster.updatedBy || monster.updatedby;
            const apelidoFormatado = apelido
              ? apelido.charAt(0).toUpperCase() + apelido.slice(1)
              : "-";

            return (
              <CardMvps
                key={monster.id}
                monster={monster}
                timerValue={timerValue}
                isAlive={isAlive}
                respawnDate={respawnDate}
                respawnTime={respawnTime}
                deathDate={deathDate}
                deathTime={deathTime}
                apelidoFormatado={apelidoFormatado}
                inputValue={inputValues[monster.id]}
                onInputChange={handleInputChange}
                onConfirm={handleConfirm}
                onQuickUpdate={handleQuickUpdate}
                loading={loadingIds[monster.id]}
              />
            );
          })}
        </div>
      </>
    );
  };

  const monstersS = monsters.filter((m) => m.tier === "S");
  const monstersA = monsters.filter((m) => m.tier === "A");
  const minibosses = monsters.filter((m) => m.type === "Miniboss");

  const filteredSearchResults =
    search.trim() === ""
      ? []
      : monsters.filter((m) =>
          m.name.toLowerCase().includes(search.toLowerCase())
        );

  return (
    <>
      <BuscaMvps search={search} setSearch={setSearch} />

      {search.trim() !== "" ? (
        filteredSearchResults.length > 0 ? (
          renderCardsOnly(filteredSearchResults, "Resultado da busca")
        ) : (
          <div className="flex w-full">
            <div className="max-w-md p-4 mt-6 text-white rounded-md shadow-lg bg-cards">
              <p className="mb-2 text-center">
                O monstro que você procurou não está adicionado ainda. <br />
                Preencha os campos abaixo para adicionar:
              </p>
              <AdicionarMvp
                onCreated={() => {
                  fetchMonsters();
                  setSearch(""); // limpa o campo de busca
                }}
              />
              <p className="mb-2 text-left text-[12px] opacity-70 mt-8">
                Sobre o ID: Para encontrar o ID do monstro que quer adicionar,
                basta procurar por ele em qualquer database de ragnarok, como
                por exemplo o{" "}
                <a
                  href="https://ratemyserver.net/"
                  target="_blank"
                  className="underline"
                >
                  ratemyserver
                </a>
                .
              </p>
              <p className="mb-2 text-left text-[12px] opacity-70">
                Sobre o Tier: Nosso sistema usar o Tier para separar os monstros
                por grau de dificuldade ou necessidade de grupo. Escolha o tier
                conforme fizer mais sentido.
              </p>
            </div>
          </div>
        )
      ) : (
        <>
          {renderCardsOnly(
            monstersS.filter((m) => timers[m.id]?.value !== "-"),
            "MVPs e Minibosses Tier S"
          )}
          {renderCardsOnly(
            monstersA.filter((m) => timers[m.id]?.value !== "-"),
            "MVPs e Minibosses Tier A"
          )}
          {renderCardsOnly(
            minibosses.filter((m) => timers[m.id]?.value !== "-"),
            "Miniboss"
          )}
        </>
      )}
    </>
  );
}
