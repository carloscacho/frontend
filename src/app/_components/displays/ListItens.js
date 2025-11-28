import { useState } from "react";
import { PiCheck, PiX, PiPencilSimple, PiTrash, PiUserGear } from "react-icons/pi";

export default function ListItens(props) {
  const [editingId, setEditingId] = useState(null);
  const [tempValue, setTempValue] = useState("");

  const handleEditClick = (item) => {
    if (props.editFunction) {
      props.editFunction(item);
      return;
    }
    setEditingId(item.id);
    setTempValue(item.nome);
  };

  const handleCancelClick = () => {
    setEditingId(null);
    setTempValue("");
  };

  const handleSaveClick = (id) => {
    if (props.onEdit) {
      props.onEdit(id, { nome: tempValue });
    }
    setEditingId(null);
  };

  return (
    <ul className="list bg-base-100 rounded-box shadow-md overflow-y-auto h-[calc(100vh-300px)] pb-3">

      <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">{props.info}</li>

      {props.list.map(item => (
        <li key={item.id} className="list-row hover:bg-base-200/50 transition-colors duration-200">
          <div className="text-4xl font-thin opacity-30 tabular-nums">{item.id}</div>

          <div className="list-col-grow">
            {editingId === item.id ? (
              <input
                type="text"
                className="input input-sm input-bordered w-full max-w-xs"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                autoFocus
              />
            ) : (
              <div className="font-medium text-lg">{item.nome}</div>
            )}
            {item.description && <div className="text-xs uppercase font-semibold opacity-60">{item.description}</div>}
          </div>

          <div className="flex gap-2">
            {(props.editFunction || props.onEdit) && (
              editingId === item.id ? (
                <>
                  <button className="btn btn-square btn-sm btn-success btn-ghost md:btn-outline md:w-auto md:px-5" onClick={() => handleSaveClick(item.id)} title="Salvar">
                    <PiCheck size={20} />
                    <span className="hidden md:inline">Salvar</span>
                  </button>
                  <button className="btn btn-square btn-sm btn-error btn-ghost md:btn-outline md:w-auto md:px-5" onClick={handleCancelClick} title="Cancelar">
                    <PiX size={20} />
                    <span className="hidden md:inline">Cancelar</span>
                  </button>
                </>
              ) : (
                <button className="btn btn-square btn-sm btn-ghost md:btn-outline md:btn-primary md:w-auto md:px-5" onClick={() => handleEditClick(item)} title="Editar">
                  <PiPencilSimple size={20} />
                  <span className="hidden md:inline">Editar</span>
                </button>
              )
            )}

            {props.roleFunction && (
              <button className="btn btn-square btn-sm btn-ghost md:btn-outline md:btn-warning md:w-auto md:px-5" onClick={() => props.roleFunction(item)} title="Alterar Cargo">
                <PiUserGear size={20} />
                <span className="hidden md:inline">Cargo</span>
              </button>
            )}

            {props.deleteFunction && (
              <button className="btn btn-square btn-sm btn-ghost text-error md:btn-outline md:btn-error md:text-base-content md:w-auto md:px-5" onClick={() => props.deleteFunction && props.deleteFunction(item.id)} title="Deletar">
                <PiTrash size={20} />
                <span className="hidden md:inline">Deletar</span>
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}