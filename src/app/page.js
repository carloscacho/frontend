export default function Home() {
  return (
    <div className="card w-96 bg-base-100 shadow-sm">
      <div className="card-body">
        <span className="badge badge-lg badge-error">Somente Administradores</span>
        <div className="flex justify-between">
          <h2 className="text-4xl font-bold">Login</h2>
        </div>

        <div>
          <fieldset className="fieldset">
      <legend className="fieldset-legend text-2xl">Email</legend>
      <input type="email" className="input input-info" placeholder="Digite seu email" />
    
    </fieldset>

    <fieldset className="fieldset">
      <legend className="fieldset-legend text-2xl">Senha</legend>
      <input type="password" className="input input-info" placeholder="Digite sua senha"  />
    
    </fieldset>
        </div>


        <div className="mt-6">
          <button className="btn btn-primary btn-block">Entrar</button>
        </div>
      </div>
    </div>
  );
}
