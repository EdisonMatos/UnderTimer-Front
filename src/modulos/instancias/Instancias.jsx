import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaTrash, FaPencilAlt, FaCheck, FaTimes } from "react-icons/fa";
import LootInstancia from "./LootInstancia";
import CriarInstancia from "./CriarInstancia";
import HeaderInstancia from "./HeaderInstancia";
import AddMembroInstancia from "./AddMembroInstancia";

export default function Instancias() {
  const [instancias, setInstancias] = useState([]);
  const [novaInstancia, setNovaInstancia] = useState({
    name: "",
    spriteUrl: "https://game.ragnaplace.com/ro/job/1133/0.png", // padrão já aqui
    last: "",
  });
  const [carregandoNovaInstancia, setCarregandoNovaInstancia] = useState(false);
  const [carregandoMembros, setCarregandoMembros] = useState({});
  const [novosMembros, setNovosMembros] = useState({});
  const [editandoMembro, setEditandoMembro] = useState({});
  const [editandoInstancia, setEditandoInstancia] = useState({});
  const [instanciaEditada, setInstanciaEditada] = useState({});
  const [contagemRegressiva, setContagemRegressiva] = useState({});
  const [mostrarAdicionarMembro, setMostrarAdicionarMembro] = useState({});
  const [usarImagemPersonalizada, setUsarImagemPersonalizada] = useState(false);
  const [mostrarLoot, setMostrarLoot] = useState({});

  useEffect(() => {
    buscarInstancias();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const agora = Date.now();
      const novosTempos = {};
      instancias.forEach((inst) => {
        const target = new Date(inst.last).getTime();
        const distancia = target - agora;
        if (distancia <= 0) {
          novosTempos[inst.id] = "-";
        } else {
          const dias = Math.floor(distancia / (1000 * 60 * 60 * 24));
          const horas = Math.floor(
            (distancia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          );
          const minutos = Math.floor(
            (distancia % (1000 * 60 * 60)) / (1000 * 60)
          );
          const segundos = Math.floor((distancia % (1000 * 60)) / 1000);
          const f = (n) => (n < 10 ? "0" + n : n);
          novosTempos[inst.id] = `${dias}d ${f(horas)}:${f(minutos)}:${f(
            segundos
          )}`;
        }
      });
      setContagemRegressiva(novosTempos);
    }, 1000);
    return () => clearInterval(interval);
  }, [instancias]);

  const buscarInstancias = async () => {
    try {
      const res = await axios.get(
        "https://undertimer-biel.onrender.com/instancias"
      );
      setInstancias(res.data);
    } catch (err) {
      console.error("Erro ao buscar instâncias:", err);
    }
  };

  const adicionarInstancia = async () => {
    try {
      setCarregandoNovaInstancia(true);

      const guildId = localStorage.getItem("guildId");
      const updatedby = localStorage.getItem("apelido");

      if (!guildId) {
        toast.error("Guild ID não encontrado. Faça login novamente.");
        setCarregandoNovaInstancia(false);
        return;
      }

      const payload = {
        name: novaInstancia.name,
        spriteUrl: novaInstancia.spriteUrl,
        last: new Date(novaInstancia.last).toISOString(),
        guildId,
        updatedby,
      };

      await axios.post(
        "https://undertimer-biel.onrender.com/instancias",
        payload
      );
      toast.success("Instância adicionada com sucesso");
      setNovaInstancia({
        name: "",
        spriteUrl: "https://game.ragnaplace.com/ro/job/1133/0.png",
        last: "",
      });
      setUsarImagemPersonalizada(false);
      buscarInstancias();
    } catch (err) {
      console.error("Erro ao adicionar instância:", err);
      toast.error("Erro ao adicionar instância.");
    } finally {
      setCarregandoNovaInstancia(false);
    }
  };

  const editarInstanciaConfirmar = async (inst) => {
    try {
      const rawLast =
        instanciaEditada[inst.id]?.last ||
        new Date(inst.last).toISOString().slice(0, 16);
      const lastISO = new Date(rawLast).toISOString();
      const payload = {
        name: instanciaEditada[inst.id]?.name || inst.name,
        spriteUrl: instanciaEditada[inst.id]?.spriteUrl || inst.spriteUrl,
        last: lastISO,
      };
      await axios.put(
        `https://undertimer-biel.onrender.com/instancias/${inst.id}`,
        payload
      );
      toast.success("Instância editada com sucesso");
      setEditandoInstancia((prev) => ({ ...prev, [inst.id]: false }));
      buscarInstancias();
    } catch (err) {
      console.error("Erro ao editar instância:", err);
    }
  };

  const deletarInstancia = async (id) => {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir esta instância e todos os seus membros?"
    );
    if (!confirmar) return;

    // Exibe o toast de loading e guarda o ID para atualização
    const toastId = toast.loading("Em andamento. Aguarde...");

    try {
      // Primeiro, buscar os membros da instância
      const instancia = instancias.find((inst) => inst.id === id);
      if (instancia && instancia.membros && instancia.membros.length > 0) {
        // Deletar cada membro individualmente
        for (const membro of instancia.membros) {
          await axios.delete(
            `https://undertimer-biel.onrender.com/membrosinstancia/${membro.id}`
          );
        }
      }

      // Agora deletar a instância
      await axios.delete(
        `https://undertimer-biel.onrender.com/instancias/${id}`
      );

      // Atualiza o toast para sucesso
      toast.update(toastId, {
        render: "Instância e membros excluídos com sucesso",
        type: "success",
        isLoading: false,
        autoClose: 3000,
        closeOnClick: true,
      });

      buscarInstancias();
    } catch (err) {
      console.error("Erro ao deletar instância e membros:", err);

      // Atualiza o toast para erro
      toast.update(toastId, {
        render: "Erro ao excluir instância ou seus membros.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
        closeOnClick: true,
      });
    }
  };

  const adicionarMembro = async (instanciaId) => {
    const { name, role } = novosMembros[instanciaId] || {};
    try {
      setCarregandoMembros((prev) => ({ ...prev, [instanciaId]: true }));
      await axios.post(
        "https://undertimer-biel.onrender.com/membrosinstancia",
        {
          name,
          role,
          instanciaId,
        }
      );
      toast.success("Membro adicionado com sucesso");
      setNovosMembros((prev) => ({
        ...prev,
        [instanciaId]: { name: "", role: "" },
      }));
      buscarInstancias();
    } catch (err) {
      console.error("Erro ao adicionar membro:", err);
    } finally {
      setCarregandoMembros((prev) => ({ ...prev, [instanciaId]: false }));
    }
  };

  const deletarMembro = async (id) => {
    try {
      await axios.delete(
        `https://undertimer-biel.onrender.com/membrosinstancia/${id}`
      );
      toast.success("Membro excluído com sucesso");
      buscarInstancias();
    } catch (err) {
      console.error("Erro ao deletar membro:", err);
    }
  };

  const editarMembroConfirmar = async (membro) => {
    try {
      await axios.put(
        `https://undertimer-biel.onrender.com/membrosinstancia/${membro.id}`,
        membro
      );
      toast.success("Membro editado com sucesso");
      setEditandoMembro((prev) => ({ ...prev, [membro.id]: false }));
      buscarInstancias();
    } catch (err) {
      console.error("Erro ao editar membro:", err);
    }
  };

  const guildId = localStorage.getItem("guildId");
  const instanciasFiltradas = instancias.filter(
    (inst) => inst.guildId === guildId
  );

  const SPRITE_PADRAO = "https://game.ragnaplace.com/ro/job/1133/0.png";

  return (
    <div className="mt-32">
      <h1 className="mb-6 text-[24px] font-semibold">Instâncias e Eventos</h1>

      <CriarInstancia
        novaInstancia={novaInstancia}
        setNovaInstancia={setNovaInstancia}
        usarImagemPersonalizada={usarImagemPersonalizada}
        setUsarImagemPersonalizada={setUsarImagemPersonalizada}
        adicionarInstancia={adicionarInstancia}
        carregandoNovaInstancia={carregandoNovaInstancia}
      />

      <h2 className="mb-2 text-lg font-semibold text-white mt-14">
        Instâncias ativas
      </h2>
      <div className="flex flex-wrap gap-4">
        {[...instanciasFiltradas]
          .sort((a, b) => {
            const now = Date.now();
            const timeA = new Date(a.last).getTime();
            const timeB = new Date(b.last).getTime();
            const isAFut = timeA > now,
              isBFut = timeB > now;
            if (isAFut && !isBFut) return -1;
            if (!isAFut && isBFut) return 1;
            return timeA - timeB;
          })
          .map((inst) => {
            const nome = novosMembros[inst.id]?.name || "";
            const funcao = novosMembros[inst.id]?.role || "";
            const carregando = carregandoMembros[inst.id];
            const desabilitado = carregando || (!nome.trim() && !funcao.trim());

            return (
              <div
                key={inst.id}
                className="p-4 mb-10 text-white border border-neutral-900 bg-cards shadow-md shadow-black h-fit rounded-md w-full lg:w-[32%] lg:max-w-[330px]"
              >
                {/* Usando o componente HeaderInstancia */}
                <HeaderInstancia
                  inst={inst}
                  editandoInstancia={editandoInstancia}
                  setEditandoInstancia={setEditandoInstancia}
                  instanciaEditada={instanciaEditada}
                  setInstanciaEditada={setInstanciaEditada}
                  editarInstanciaConfirmar={editarInstanciaConfirmar}
                  deletarInstancia={deletarInstancia}
                  contagemRegressiva={contagemRegressiva}
                />

                <h4 className="mt-4 mb-2 font-semibold">Membros</h4>
                <table className="w-full mb-4 text-sm">
                  <thead>
                    <tr className="w-full text-left text-gray-400">
                      <th className="w-[10%]"> Nº </th>
                      <th className="w-[50%]"> Nome </th>
                      <th className="w-[50%]"> Função </th>
                      <th className="w-[20%]"> Ações </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...inst.membros]
                      .sort((a, b) => a.role.localeCompare(b.role))
                      .map((membro, i) => (
                        <tr
                          key={membro.id}
                          className="border-t border-neutral-700"
                        >
                          <td>{i + 1}</td>
                          <td>
                            {editandoMembro[membro.id] ? (
                              <input
                                type="text"
                                value={membro.name}
                                onChange={(e) =>
                                  setInstancias((prev) =>
                                    prev.map((instMap) =>
                                      instMap.id === inst.id
                                        ? {
                                            ...instMap,
                                            membros: instMap.membros.map((m) =>
                                              m.id === membro.id
                                                ? { ...m, name: e.target.value }
                                                : m
                                            ),
                                          }
                                        : instMap
                                    )
                                  )
                                }
                                className="p-1 h-5 text-black rounded w-[60%]"
                              />
                            ) : (
                              membro.name
                            )}
                          </td>
                          <td>
                            {editandoMembro[membro.id] ? (
                              <input
                                type="text"
                                value={membro.role}
                                onChange={(e) =>
                                  setInstancias((prev) =>
                                    prev.map((instMap) =>
                                      instMap.id === inst.id
                                        ? {
                                            ...instMap,
                                            membros: instMap.membros.map((m) =>
                                              m.id === membro.id
                                                ? { ...m, role: e.target.value }
                                                : m
                                            ),
                                          }
                                        : instMap
                                    )
                                  )
                                }
                                className="p-1 h-5 text-black rounded w-[60%]"
                              />
                            ) : (
                              membro.role
                            )}
                          </td>
                          <td className="flex gap-2 mt-1">
                            {editandoMembro[membro.id] ? (
                              <>
                                <button
                                  onClick={() => editarMembroConfirmar(membro)}
                                  className="text-green-400 hover:text-green-200"
                                >
                                  <FaCheck />
                                </button>
                                <button
                                  onClick={() =>
                                    setEditandoMembro((prev) => ({
                                      ...prev,
                                      [membro.id]: false,
                                    }))
                                  }
                                  className="text-white hover:text-red-200"
                                >
                                  <FaTimes />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() =>
                                    setEditandoMembro((prev) => ({
                                      ...prev,
                                      [membro.id]: true,
                                    }))
                                  }
                                  className="text-white hover:text-yellow-200"
                                >
                                  <FaPencilAlt />
                                </button>
                                <button
                                  onClick={() => deletarMembro(membro.id)}
                                  className="text-white hover:text-red-200"
                                >
                                  <FaTrash />
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    {inst.membros.length === 0 && (
                      <tr>
                        <td colSpan={4} className="italic text-gray-400">
                          Nenhum membro ainda
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <div className="flex justify-between">
                  <button
                    className="mt-0 text-sm font-semibold text-blue-400 hover:underline"
                    onClick={() =>
                      setMostrarAdicionarMembro((prev) => ({
                        ...prev,
                        [inst.id]: !prev[inst.id],
                      }))
                    }
                  >
                    {mostrarAdicionarMembro[inst.id]
                      ? "Ocultar"
                      : "Adicionar Membro +"}
                  </button>

                  <button
                    className="mt-0 text-sm font-semibold text-blue-400 hover:underline"
                    onClick={() =>
                      setMostrarLoot((prev) => ({
                        ...prev,
                        [inst.id]: !prev[inst.id],
                      }))
                    }
                  >
                    {mostrarLoot?.[inst.id] ? "Ocultar" : "Loot da instância +"}
                  </button>
                </div>

                {mostrarLoot?.[inst.id] && (
                  <div className="p-2 mt-4 text-sm text-gray-300 border rounded border-neutral-700 bg-neutral-800">
                    <LootInstancia instanciaId={inst.id} />
                  </div>
                )}

                {mostrarAdicionarMembro[inst.id] && (
                  <AddMembroInstancia
                    instanciaId={inst.id}
                    novosMembros={novosMembros}
                    setNovosMembros={setNovosMembros}
                    adicionarMembro={adicionarMembro}
                    carregandoMembros={carregandoMembros}
                  />
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}
