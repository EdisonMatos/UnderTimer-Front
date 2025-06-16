import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Instancias() {
  const [instancias, setInstancias] = useState([]);
  const [novaInstancia, setNovaInstancia] = useState({
    name: "",
    spriteUrl: "",
    last: "",
  });

  const [novosMembros, setNovosMembros] = useState({});
  const [editandoMembro, setEditandoMembro] = useState({});
  const [editandoInstancia, setEditandoInstancia] = useState({});
  const [instanciaEditada, setInstanciaEditada] = useState({});

  useEffect(() => {
    buscarInstancias();
  }, []);

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
      const payload = {
        name: novaInstancia.name,
        spriteUrl: novaInstancia.spriteUrl,
        last: new Date(novaInstancia.last).toISOString(),
      };

      console.log("Payload convertido:", payload);

      await axios.post(
        "https://undertimer-biel.onrender.com/instancias",
        payload
      );

      setNovaInstancia({ name: "", spriteUrl: "", last: "" });
      buscarInstancias();
    } catch (err) {
      console.error("Erro ao adicionar instância:", err);
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

      console.log("Payload convertido:", payload);

      await axios.put(
        `https://undertimer-biel.onrender.com/instancias/${inst.id}`,
        payload
      );

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
      buscarInstancias();
    } catch (err) {
      console.error("Erro ao deletar instância:", err);
    }
  };

  const adicionarMembro = async (instanciaId) => {
    const { name, role } = novosMembros[instanciaId] || {};
    try {
      await axios.post(
        "https://undertimer-biel.onrender.com/membrosinstancia",
        {
          name,
          role,
          instanciaId,
        }
      );
      setNovosMembros((prev) => ({
        ...prev,
        [instanciaId]: { name: "", role: "" },
      }));
      buscarInstancias();
    } catch (err) {
      console.error("Erro ao adicionar membro:", err);
    }
  };

  const deletarMembro = async (id) => {
    try {
      await axios.delete(
        `https://undertimer-biel.onrender.com/membrosinstancia/${id}`
      );
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
      setEditandoMembro((prev) => ({ ...prev, [membro.id]: false }));
      buscarInstancias();
    } catch (err) {
      console.error("Erro ao editar membro:", err);
    }
  };

  return (
    <div className="mt-32">
      <h1 className="mb-6 text-[24px] font-semibold">Instâncias</h1>
      <h2 className="mb-2 text-lg font-semibold text-white">
        Criar nova instância
      </h2>
      <div className="flex flex-col gap-2 mb-6 sm:flex-row">
        <input
          type="text"
          placeholder="Nome da instância"
          value={novaInstancia.name}
          onChange={(e) =>
            setNovaInstancia({ ...novaInstancia, name: e.target.value })
          }
          className="p-2 text-black border border-gray-300 rounded bg-neutral-300"
        />
        <input
          type="text"
          placeholder="Sprite URL"
          value={novaInstancia.spriteUrl}
          onChange={(e) =>
            setNovaInstancia({ ...novaInstancia, spriteUrl: e.target.value })
          }
          className="p-2 text-black border border-gray-300 rounded bg-neutral-300"
        />
        <input
          type="datetime-local"
          value={novaInstancia.last}
          onChange={(e) =>
            setNovaInstancia({ ...novaInstancia, last: e.target.value })
          }
          className="p-2 text-black border border-gray-300 rounded bg-neutral-300"
        />
        <button
          onClick={adicionarInstancia}
          className="px-4 py-2 text-white rounded bg-primary"
        >
          Adicionar
        </button>
      </div>
      <h2 className="mb-2 text-lg font-semibold text-white">
        Instâncias ativas
      </h2>
      <div className="flex flex-wrap justify-between">
        {instancias.map((inst) => (
          <div
            key={inst.id}
            className="p-4 mb-10 text-white border border-neutral-900  bg-neutral-700 shadow-md shadow-black h-fit rounded-md w-full lg:w-[31%]"
          >
            <div className="flex items-center gap-4 mb-3">
              <img src={inst.spriteUrl} alt={inst.name} className="w-12 h-12" />
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
                      className="p-1 text-black rounded"
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
                      className="p-1 ml-2 text-black rounded"
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
              </div>
            </div>

            <div className="flex gap-2 mb-3">
              {editandoInstancia[inst.id] ? (
                <button
                  onClick={() => editarInstanciaConfirmar(inst)}
                  className="text-green-400"
                >
                  Confirmar
                </button>
              ) : (
                <button
                  onClick={() =>
                    setEditandoInstancia((prev) => ({
                      ...prev,
                      [inst.id]: true,
                    }))
                  }
                  className="text-yellow-400"
                >
                  {/* Editar */}
                </button>
              )}
              <button
                onClick={() => deletarInstancia(inst.id)}
                className="text-red-400"
              >
                Deletar
              </button>
            </div>

            <h4 className="mt-4 mb-2 font-semibold">Membros</h4>
            <table className="w-full mb-4 text-sm">
              <thead>
                <tr className="text-left text-gray-400">
                  <th>Nº</th>
                  <th>Nome</th>
                  <th>Função</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {inst.membros.map((membro, index) => (
                  <tr key={membro.id} className="border-t border-neutral-700">
                    <td>{index + 1}</td>
                    <td>
                      {editandoMembro[membro.id] ? (
                        <input
                          type="text"
                          value={membro.name}
                          onChange={(e) =>
                            setInstancias((prev) =>
                              prev.map((i) =>
                                i.id === inst.id
                                  ? {
                                      ...i,
                                      membros: i.membros.map((m) =>
                                        m.id === membro.id
                                          ? { ...m, name: e.target.value }
                                          : m
                                      ),
                                    }
                                  : i
                              )
                            )
                          }
                          className="p-1 text-black rounded"
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
                              prev.map((i) =>
                                i.id === inst.id
                                  ? {
                                      ...i,
                                      membros: i.membros.map((m) =>
                                        m.id === membro.id
                                          ? { ...m, role: e.target.value }
                                          : m
                                      ),
                                    }
                                  : i
                              )
                            )
                          }
                          className="p-1 text-black rounded"
                        />
                      ) : (
                        membro.role
                      )}
                    </td>
                    <td className="flex gap-2 mt-1">
                      {editandoMembro[membro.id] ? (
                        <button
                          onClick={() => editarMembroConfirmar(membro)}
                          className="text-green-400"
                        >
                          Confirmar
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            setEditandoMembro((prev) => ({
                              ...prev,
                              [membro.id]: true,
                            }))
                          }
                          className="text-yellow-400"
                        >
                          Editar
                        </button>
                      )}
                      <button
                        onClick={() => deletarMembro(membro.id)}
                        className="text-red-400"
                      >
                        Deletar
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
            <p className="mt-8">Adicionar membro:</p>
            <div className="flex justify-between gap-2 mt-3 ">
              <input
                type="text"
                placeholder="Nome"
                value={novosMembros[inst.id]?.name || ""}
                onChange={(e) =>
                  setNovosMembros((prev) => ({
                    ...prev,
                    [inst.id]: {
                      ...prev[inst.id],
                      name: e.target.value,
                    },
                  }))
                }
                className="p-2 text-black border  rounded w-[30%] bg-neutral-300 border-gray-300"
              />
              <input
                type="text"
                placeholder="Função"
                value={novosMembros[inst.id]?.role || ""}
                onChange={(e) =>
                  setNovosMembros((prev) => ({
                    ...prev,
                    [inst.id]: {
                      ...prev[inst.id],
                      role: e.target.value,
                    },
                  }))
                }
                className="p-2 text-black border  rounded w-[30%] bg-neutral-300 border-gray-300"
              />
              <button
                onClick={() => adicionarMembro(inst.id)}
                className="px-4 py-2 text-white bg-primary rounded w-[30%]"
              >
                Adicionar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
