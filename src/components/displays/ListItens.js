export default function ListItens(props) {

  return (
    <ul className="list bg-base-100 rounded-box shadow-md">

      <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">{props.info}</li>

      {props.list.map(item => (
        <li className="list-row">
          <div className="text-2xl font-thin opacity-30 tabular-nums">{item.id}</div>
          <div className="list-col-grow">
            <div>{item.nome}</div>
            {item.description && <div className="text-xs uppercase font-semibold opacity-60">{item.description}</div>}
          </div>
            <button className="btn btn-sm btn-warning mx-1.5 mt-4">
              <ion-icon name="create-outline"></ion-icon>
              Editar
              </button>
            <button className="btn btn-sm btn-error mx-1.5 mt-4">
              <ion-icon name="trash-outline"></ion-icon>
              Deletar
              </button>
        </li>
      ))}
      </ul>
  )
}