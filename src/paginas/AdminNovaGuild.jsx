import React from "react";

export default function AdminNovaGuild({ guildForm, onChange, onSubmit }) {
  return (
    <div className="p-4 mb-12 border rounded-md bg-neutral-800 border-neutral-700">
      <div className="p-6 rounded-md bg-neutral-900 border-neutral-700">
        <h2 className="mb-4 text-lg font-semibold">Nova Guild</h2>
        <form onSubmit={onSubmit} className="flex gap-3">
          <input
            type="text"
            placeholder="Nome da guild"
            value={guildForm.name}
            onChange={(e) => onChange("name", e.target.value)}
            className="w-1/3 p-2 text-black rounded bg-neutral-300"
          />
          <input
            type="text"
            placeholder="URL do emblema"
            value={guildForm.spriteUrl}
            onChange={(e) => onChange("spriteUrl", e.target.value)}
            className="w-1/3 p-2 text-black rounded bg-neutral-300"
          />
          <button
            type="submit"
            className="px-6 py-2 text-white rounded bg-primary"
          >
            Criar
          </button>
        </form>
      </div>
    </div>
  );
}
