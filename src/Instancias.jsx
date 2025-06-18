import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaTrash, FaPencilAlt, FaCheck } from "react-icons/fa";

export default function Instancias() {
  const [instancias, setInstancias] = useState([]);
  const [novaInstancia, setNovaInstancia] = useState({
    name: "",
    spriteUrl: "",
    last: "",
  });
  const [carregandoNovaInstancia, setCarregandoNovaInstancia] = useState(false);
  const [carregandoMembros, setCarregandoMembros] = useState({});
  const [novosMembros, setNovosMembros] = useState({});
  const [editandoMembro, setEditandoMembro] = useState({});
  const [editandoInstancia, setEditandoInstancia] = useState({});
  const [instanciaEditada, setInstanciaEditada] = useState({});
  const [contagemRegressiva, setContagemRegressiva] = useState({});

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
      setNovaInstancia({ name: "", spriteUrl: "", last: "" });
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
        spriteUrl: inst.spriteUrl,
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
    try {
      await axios.delete(
        `https://undertimer-biel.onrender.com/instancias/${id}`
      );
      toast.success("Instância excluída com sucesso");
      buscarInstancias();
    } catch (err) {
      console.error("Erro ao deletar instância:", err);
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

  return (
    <div className="mt-32">
      <h1 className="mb-6 text-[24px] font-semibold">Instâncias e Eventos</h1>
      <h2 className="mb-2 text-lg font-semibold text-white">
        Criar nova instância ou evento
      </h2>
      <div className="flex flex-col gap-2 mb-6 sm:flex-row">
        <input
          type="text"
          placeholder="Nome da instância"
          value={novaInstancia.name}
          onChange={(e) =>
            setNovaInstancia((prev) => ({ ...prev, name: e.target.value }))
          }
          className="p-2 text-black border border-gray-300 rounded bg-neutral-300"
        />
        <input
          type="text"
          placeholder="Sprite URL"
          value={novaInstancia.spriteUrl}
          onChange={(e) =>
            setNovaInstancia((prev) => ({ ...prev, spriteUrl: e.target.value }))
          }
          className="p-2 text-black border border-gray-300 rounded bg-neutral-300"
        />
        <input
          type="datetime-local"
          value={novaInstancia.last}
          onChange={(e) =>
            setNovaInstancia((prev) => ({ ...prev, last: e.target.value }))
          }
          className="p-2 text-black border border-gray-300 rounded bg-neutral-300"
        />
        <button
          onClick={adicionarInstancia}
          disabled={
            carregandoNovaInstancia ||
            !novaInstancia.name.trim() ||
            !novaInstancia.spriteUrl.trim() ||
            !novaInstancia.last.trim()
          }
          className="px-4 py-2 text-white rounded bg-primary disabled:opacity-50"
        >
          {carregandoNovaInstancia ? "..." : "Adicionar"}
        </button>
      </div>

      <h2 className="mb-2 text-lg font-semibold text-white">
        Instâncias ativas
      </h2>
      <div className="flex flex-wrap justify-between">
        {[...instancias]
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
                className="p-4 mb-10 text-white border border-neutral-900 bg-neutral-700 shadow-md shadow-black h-fit rounded-md w-full lg:w-[31%]"
              >
                <div className="flex items-center gap-4 mb-3">
                  <img
                    src={inst.spriteUrl}
                    alt={inst.name}
                    className="w-12 h-12"
                  />
                  <div>
                    {editandoInstancia[inst.id] ? (
                      <>
                        <input
                          type="text"
                          value={instanciaEditada[inst.id]?.name || inst.name}
                          onChange={(e) =>
                            setInstanciaEditada((prev) => ({
                              ...prev,
                              [inst.id]: {
                                ...prev[inst.id],
                                name: e.target.value,
                              },
                            }))
                          }
                          className="p-1 text-black rounded w-[30%] h-8"
                        />
                        <input
                          type="datetime-local"
                          value={
                            instanciaEditada[inst.id]?.last ||
                            new Date(inst.last).toISOString().slice(0, 16)
                          }
                          onChange={(e) =>
                            setInstanciaEditada((prev) => ({
                              ...prev,
                              [inst.id]: {
                                ...prev[inst.id],
                                last: e.target.value,
                              },
                            }))
                          }
                          className="p-1 ml-2 text-black rounded w-[30%] h-8"
                        />
                      </>
                    ) : (
                      <>
                        <h3 className="text-lg font-semibold">{inst.name}</h3>
                        <p className="text-sm opacity-70">
                          Data: {new Date(inst.last).toLocaleString()}
                        </p>
                      </>
                    )}
                    <p className="text-sm opacity-70">
                      Tempo:{" "}
                      <span
                        className={
                          contagemRegressiva[inst.id] !== "-"
                            ? "text-green-400"
                            : ""
                        }
                      >
                        {contagemRegressiva[inst.id] || "-"}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 mb-3">
                  {editandoInstancia[inst.id] ? (
                    <button
                      onClick={() => editarInstanciaConfirmar(inst)}
                      className="text-green-400 hover:text-green-200"
                    >
                      <FaCheck />
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        setEditandoInstancia((prev) => ({
                          ...prev,
                          [inst.id]: true,
                        }))
                      }
                      className="text-white hover:text-yellow-200"
                    >
                      <FaPencilAlt />
                    </button>
                  )}
                  <button
                    onClick={() => deletarInstancia(inst.id)}
                    className="text-white hover:text-red-200"
                  >
                    <FaTrash />
                  </button>
                </div>

                <h4 className="mt-4 mb-2 font-semibold">Membros</h4>
                <table className="w-full mb-4 text-sm">
                  <thead>
                    <tr className="w-full text-left text-gray-400">
                      <th className="w-[10%]"> nº </th>
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
                                className="p-1 text-black rounded w-[60%]"
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
                                className="p-1 text-black rounded w-[60%]"
                              />
                            ) : (
                              membro.role
                            )}
                          </td>
                          <td className="flex gap-2 mt-1">
                            {editandoMembro[membro.id] ? (
                              <button
                                onClick={() => editarMembroConfirmar(membro)}
                                className="text-green-400 hover:text-green-200"
                              >
                                <FaCheck />
                              </button>
                            ) : (
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
                            )}
                            <button
                              onClick={() => deletarMembro(membro.id)}
                              className="text-white hover:text-red-200"
                            >
                              <FaTrash />
                            </button>
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

                <p className="mt-8 font-semibold">Adicionar membro:</p>
                <div className="flex justify-between gap-2 mt-3">
                  <input
                    type="text"
                    placeholder="Nome"
                    value={novosMembros[inst.id]?.name || ""}
                    onChange={(e) =>
                      setNovosMembros((prev) => ({
                        ...prev,
                        [inst.id]: {
                          name: e.target.value,
                          role: prev[inst.id]?.role || "",
                        },
                      }))
                    }
                    className="p-2 text-black border rounded w-[30%] bg-neutral-300 border-gray-300"
                  />
                  <input
                    type="text"
                    placeholder="Função"
                    value={novosMembros[inst.id]?.role || ""}
                    onChange={(e) =>
                      setNovosMembros((prev) => ({
                        ...prev,
                        [inst.id]: {
                          name: prev[inst.id]?.name || "",
                          role: e.target.value,
                        },
                      }))
                    }
                    className="p-2 text-black border rounded w-[30%] bg-neutral-300 border-gray-300"
                  />
                  <button
                    onClick={() => adicionarMembro(inst.id)}
                    disabled={
                      carregandoMembros[inst.id] ||
                      (!novosMembros[inst.id]?.name?.trim() &&
                        !novosMembros[inst.id]?.role?.trim())
                    }
                    className="px-4 py-2 text-white bg-primary rounded w-[30%] disabled:opacity-50"
                  >
                    {carregandoMembros[inst.id] ? "..." : "Adicionar"}
                  </button>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
