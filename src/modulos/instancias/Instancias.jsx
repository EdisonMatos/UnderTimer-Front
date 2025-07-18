import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import LootInstancia from "./LootInstancia";
import CriarInstancia from "./CriarInstancia";
import HeaderInstancia from "./HeaderInstancia";
import AddMembroInstancia from "./AddMembroInstancia";
import MembrosInstancia from "./MembrosInstancia";
import { FaPlus, FaMinus, FaChevronDown, FaChevronRight } from "react-icons/fa";

export default function Instancias() {
  const [instancias, setInstancias] = useState([]);
  const [novaInstancia, setNovaInstancia] = useState({
    name: "",
    spriteUrl: "https://game.ragnaplace.com/ro/job/1133/0.png",
    last: "",
    gerenciadapor: "",
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
  const [instanciaExpandida, setInstanciaExpandida] = useState({});

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

      const agora = Date.now();
      const expansaoInicial = {};
      res.data.forEach((inst) => {
        expansaoInicial[inst.id] = new Date(inst.last).getTime() > agora;
      });
      setInstanciaExpandida(expansaoInicial);
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
        gerenciadapor: novaInstancia.gerenciadapor,
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
        observacoes: instanciaEditada[inst.id]?.observacoes ?? inst.observacoes,
        gerenciadapor:
          instanciaEditada[inst.id]?.gerenciadapor || inst.gerenciadapor,
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

    const toastId = toast.loading("Em andamento. Aguarde...");

    try {
      const instancia = instancias.find((inst) => inst.id === id);
      if (instancia && instancia.membros && instancia.membros.length > 0) {
        for (const membro of instancia.membros) {
          await axios.delete(
            `https://undertimer-biel.onrender.com/membrosinstancia/${membro.id}`
          );
        }
      }

      await axios.delete(
        `https://undertimer-biel.onrender.com/instancias/${id}`
      );

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
  const agora = Date.now();
  const instanciasAtivas = instanciasFiltradas.filter(
    (inst) => new Date(inst.last).getTime() > agora
  );
  const instanciasPassadas = instanciasFiltradas.filter(
    (inst) => new Date(inst.last).getTime() <= agora
  );

  const renderInstancias = (lista) =>
    lista
      .sort((a, b) => new Date(b.last).getTime() - new Date(a.last).getTime())
      .map((inst) => (
        <div
          key={inst.id}
          className="p-2 min-[375px]:p-3 md:p-4 text-white border border-neutral-900 bg-cards shadow-md shadow-black h-fit rounded-md w-full lg:max-w-[820px]"
        >
          <div className="flex items-center justify-between cursor-pointer">
            <div
              className="flex-1"
              onClick={() =>
                setInstanciaExpandida((prev) => ({
                  ...prev,
                  [inst.id]: !prev[inst.id],
                }))
              }
            >
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
            </div>
            <button
              className="p-2 ml-1 min-[375px]:ml-1 md:p-2 text-sm text-white rounded bg-neutral-900 hover:bg-neutral-700 hidden md:block"
              onClick={() =>
                setInstanciaExpandida((prev) => ({
                  ...prev,
                  [inst.id]: !prev[inst.id],
                }))
              }
            >
              {instanciaExpandida[inst.id] ? (
                <FaChevronDown />
              ) : (
                <FaChevronRight />
              )}
            </button>
          </div>
          <button
            className="p-2 text-sm text-white rounded md:p-2 bg-neutral-900 hover:bg-neutral-700 md:hidden"
            onClick={() =>
              setInstanciaExpandida((prev) => ({
                ...prev,
                [inst.id]: !prev[inst.id],
              }))
            }
          >
            {instanciaExpandida[inst.id] ? (
              <FaChevronDown />
            ) : (
              <FaChevronRight />
            )}
          </button>
          {instanciaExpandida[inst.id] && (
            <>
              <MembrosInstancia
                membros={inst.membros}
                instId={inst.id}
                instGerenciadaPor={inst.gerenciadapor}
                instUpdatedBy={inst.updatedby}
                editandoMembro={editandoMembro}
                setEditandoMembro={setEditandoMembro}
                setInstancias={setInstancias}
                deletarMembro={deletarMembro}
                editarMembroConfirmar={editarMembroConfirmar}
              />

              <div className="flex justify-between">
                <button
                  className="mt-0 text-[10px] md:text-sm font-semibold text-blue-400 hover:underline"
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
                  className="mt-0 text-[10px] md:text-sm font-semibold text-blue-400 hover:underline"
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
                <div className="p-2 mt-4 text-sm text-gray-300 rounded-md bg-neutral-900">
                  <LootInstancia
                    instanciaId={inst.id}
                    instGerenciadaPor={inst.gerenciadapor}
                    instUpdatedBy={inst.updatedby}
                  />
                </div>
              )}

              {mostrarAdicionarMembro[inst.id] && (
                <AddMembroInstancia
                  instanciaId={inst.id}
                  novosMembros={novosMembros}
                  setNovosMembros={setNovosMembros}
                  adicionarMembro={adicionarMembro}
                  carregandoMembros={carregandoMembros}
                  instGerenciadaPor={inst.gerenciadapor}
                  instUpdatedBy={inst.updatedby}
                />
              )}
            </>
          )}
        </div>
      ));

  return (
    <div className="">
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
        {renderInstancias(instanciasAtivas)}
      </div>

      <h2 className="mb-2 text-lg font-semibold text-white mt-14">Passadas</h2>
      <div className="flex flex-wrap gap-4">
        {renderInstancias(instanciasPassadas)}
      </div>
    </div>
  );
}
