import { useState } from "react";

export default function ListItens(props) {
  const [editingId, setEditingId] = useState(null);
  const [tempValue, setTempValue] = useState("");

  const handleEditClick = (item) => {
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
    <ul className="list bg-base-100 rounded-box shadow-md overflow-y-auto h-screen pb-7">

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
            {editingId === item.id ? (
              <>
                <button className="btn btn-square btn-sm btn-success btn-ghost" onClick={() => handleSaveClick(item.id)} title="Salvar">
                  <ion-icon name="checkmark-outline" size="small"></ion-icon>
                </button>
                <button className="btn btn-square btn-sm btn-error btn-ghost" onClick={handleCancelClick} title="Cancelar">
                  <ion-icon name="close-outline" size="small"></ion-icon>
                </button>
              </>
            ) : (
              <button className="btn btn-square btn-sm btn-ghost" onClick={() => handleEditClick(item)} title="Editar">
                <ion-icon name="create-outline" size="small"></ion-icon>
              </button>
            )}

            <button className="btn btn-square btn-sm btn-ghost text-error" onClick={() => props.onDelete && props.onDelete(item.id)} title="Deletar">
              <ion-icon name="trash-outline" size="small"></ion-icon>
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}