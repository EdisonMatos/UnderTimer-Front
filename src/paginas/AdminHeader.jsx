import React from "react";
import { FaPencilAlt, FaTrash, FaCheck, FaTimes } from "react-icons/fa";

export default function AdminHeader({
  guild,
  counts,
  isEditingGuild,
  editValues,
  onChange,
  onUpdate,
  onCancelEdit,
  onStartEdit,
  onDelete,
  endpoints,
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <img
          src={guild.spriteUrl}
          alt="Emblema"
          className="w-16 h-16 border rounded-full"
        />
        {isEditingGuild ? (
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={editValues.name}
              onChange={(e) => onChange("name", e.target.value)}
              className="p-1 text-black rounded bg-neutral-200"
            />
            <input
              type="text"
              value={editValues.spriteUrl}
              onChange={(e) => onChange("spriteUrl", e.target.value)}
              className="p-1 text-black rounded bg-neutral-200"
            />
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-semibold">
              {guild.name || `Guild ${guild.id}`}
            </h2>
            <div className="flex gap-4 text-md opacity-80">
              {endpoints.map((ep) => (
                <p key={ep.key}>
                  {ep.label}:{" "}
                  <span className="text-green-400">{counts[ep.key] ?? 0}</span>
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="flex gap-3">
        {isEditingGuild ? (
          <>
            <button
              onClick={onUpdate}
              className="text-green-400 hover:text-green-300"
            >
              <FaCheck />
            </button>
            <button
              onClick={onCancelEdit}
              className="text-white hover:text-red-200"
            >
              <FaTimes />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onStartEdit}
              className="text-white hover:text-yellow-200"
            >
              <FaPencilAlt />
            </button>
            <button
              onClick={onDelete}
              className="text-white hover:text-red-200"
            >
              <FaTrash />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
