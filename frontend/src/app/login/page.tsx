import { PageHeader } from "@/components/ui/PageHeader";

export default function LoginPage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Acceso"
        title="Ingreso simple para cuidadores y profesionales"
        description="La base de autenticacion esta pensada para crecer hacia perfiles, permisos y gestion de usuarios sin cambiar la experiencia principal."
      />

      <section className="login-card">
        <form className="login-form">
          <label>
            Nombre de usuario o email
            <input type="email" placeholder="familia@stcs.cl" />
          </label>
          <label>
            Contrasena
            <input type="password" placeholder="Ingresa tu contrasena" />
          </label>
          <button type="submit" className="primary-button">
            Ingresar
          </button>
        </form>

        <aside className="login-help">
          <h2>Preparado para futuras mejoras</h2>
          <ul className="clean-list">
            <li>Login real conectado al backend.</li>
            <li>Roles por tipo de usuario.</li>
            <li>Recuperacion de acceso y gestion de perfiles.</li>
          </ul>
        </aside>
      </section>
    </div>
  );
}
