'use client';
import { useAlerta } from '@/shared/contexts/AlertContext';

export default function Alert() {
  const { alertas } = useAlerta();

  if (!alertas || alertas.length === 0) return null;

  return (
    <div className="toast toast-top toast-end z-[9999]">
      {alertas.map((alerta) => {
        let alertClass = 'alert-info';

        switch (alerta.tipo) {
          case 'success': alertClass = 'alert-success'; break;
          case 'warning': alertClass = 'alert-warning'; break;
          case 'error': alertClass = 'alert-error'; break;
          case 'info':
          default: alertClass = 'alert-info'; break;
        }

        return (
          <div key={alerta.id} role="alert" className={`alert ${alertClass} shadow-lg slide-bottom`}>
            <span>{alerta.msg}</span>
          </div>
        );
      })}
    </div>
  );
}
