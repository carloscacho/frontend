'use client';
import { useAlerta } from '@/context/AlertContext';

export default function Alert() {
  const { alerta } = useAlerta();

  if (!alerta) return null;

  switch (alerta.tipo) {
    case 'info':
      return (
        <div role="alert" className="alert alert-info slide-bottom pos-abs">
          <span>{alerta.msg}</span>
        </div>
      )
    case 'success':
      return (
        <div role="alert" className="alert alert-success slide-bottom pos-abs">
          <span>{alerta.msg}</span>
        </div>
      )

    case 'warning':
      return (
        <div role="alert" className="alert alert-warning slide-bottom pos-abs">
          <span>{alerta.msg}</span>
        </div>
      )

    case 'error':
      return (
        <div role="alert" className="alert alert-error slide-bottom pos-abs">
          <span>{alerta.msg}</span>
        </div>
      )

    default:

      return (
        <div role="alert" className="alert alert-info slide-bottom pos-abs">
          <span>{alerta.msg}</span>
        </div>
      )

  }

}
