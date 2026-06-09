import { useState } from "react";
import { PiCheck, PiX, PiPencilSimple, PiTrash, PiUserGear, PiUploadSimple } from "react-icons/pi";

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

  const renderItem = (item) => (
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
          <div className="flex items-center gap-2">
            <span className="font-medium text-lg">{item.nome}</span>
            {item.isIncomplete && (
              <span
                className="badge badge-warning badge-sm gap-1"
                title={`Falta: ${item.missingItems}`}
              >
                ⚠ Pendente
              </span>
            )}
          </div>
        )}
        {item.description && <div className="text-xs uppercase font-semibold opacity-60">{item.description}</div>}
      </div>

      <div className="flex gap-2">
        {props.importFunction && (
          <button
            className="btn btn-square btn-sm btn-ghost md:btn-outline md:btn-info md:w-auto md:px-5"
            onClick={() => props.importFunction(item)}
            title="Importar CSV"
          >
            <PiUploadSimple size={20} />
            <span className="hidden md:inline">Importar CSV</span>
          </button>
        )}

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
  );

  let content;
  if (!props.list || props.list.length === 0) {
    content = <li className="p-4 text-center text-sm opacity-50">Nenhum item cadastrado.</li>;
  } else if (props.groupBy) {
    const grouped = props.list.reduce((acc, item) => {
      const group = props.groupBy(item) || "Outros";
      if (!acc[group]) acc[group] = [];
      acc[group].push(item);
      return acc;
    }, {});

    let entries = Object.entries(grouped);
    if (props.groupOrder) {
      entries.sort(([a], [b]) => {
        const idxA = props.groupOrder.indexOf(a);
        const idxB = props.groupOrder.indexOf(b);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return a.localeCompare(b);
      });
    }

    content = entries.map(([groupName, items]) => (
      <div key={groupName} className="mb-4">
        <li className="list-row bg-base-200/80 min-h-0 py-2 sticky top-0 z-10 flex justify-between shadow-sm">
          <span className="font-bold opacity-80 text-sm uppercase tracking-wider">{groupName}</span>
          <span className="badge badge-sm">{items.length}</span>
        </li>
        {items.map(item => renderItem(item))}
      </div>
    ));
  } else {
    content = props.list.map(item => renderItem(item));
  }

  return (
    <ul className="list bg-base-100 rounded-box shadow-md overflow-y-auto h-[calc(100vh-300px)] pb-3">

      <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">{props.info}</li>

      {content}
    </ul>
  )
}