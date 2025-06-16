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
        last: new Date(novaInstancia.last).toISOString(), // CONVERSÃO AQUI
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
    <div className="mt-10 lg:w-[60%]">
      <h2 className="text-lg font-semibold text-white mb-2">Instâncias</h2>

      {instancias.map((inst) => (
        <div
          key={inst.id}
          className="mb-10 p-4 border border-gray-700 rounded bg-neutral-800 text-white"
        >
          <div className="flex items-center gap-4 mb-3">
            <img src={inst.spriteUrl} alt={inst.name} className="w-12 h-12" />
            <div>
              <h3 className="text-lg font-semibold">{inst.name}</h3>
              <p className="text-sm opacity-70">
                Data: {new Date(inst.last).toLocaleString()}
              </p>
            </div>
          </div>

          <h4 className="mt-4 mb-2 font-semibold">Membros</h4>
          <table className="w-full text-sm mb-4">
            <thead>
              <tr className="text-left text-gray-400">
                <th>Nome</th>
                <th>Função</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {inst.membros.map((membro) => (
                <tr key={membro.id} className="border-t border-neutral-700">
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
                  <td colSpan={3} className="text-gray-400 italic">
                    Nenhum membro ainda
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="flex flex-col sm:flex-row gap-2 mt-3">
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
              className="p-2 border border-gray-300 rounded text-black"
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
              className="p-2 border border-gray-300 rounded text-black"
            />
            <button
              onClick={() => adicionarMembro(inst.id)}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Adicionar novo membro
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
