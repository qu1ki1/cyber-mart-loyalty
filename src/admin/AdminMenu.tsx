export default function AdminMenu() {
  const path = window.location.pathname;

  const linkStyle = (href: string) => ({
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 16px",
    borderRadius: "10px",
    color: path === href ? "var(--neon)" : "var(--muted)",
    background: path === href ? "rgba(57,255,138,0.08)" : "transparent",
    border: path === href ? "1px solid var(--line)" : "1px solid transparent",
    textDecoration: "none",
    fontWeight: 500,
    fontSize: "15px",
    transition: "all 0.15s ease",
    marginBottom: "6px",
  });

  return (
    <div
      style={{
        width: 240,
        minHeight: "100vh",
        padding: "24px 16px",
        borderRight: "1px solid var(--line-dim)",
        background: "rgba(0,0,0,0.3)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ marginBottom: 32, paddingLeft: 8 }}>
        <div
          style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontWeight: 700,
            fontSize: 20,
            letterSpacing: "0.12em",
            color: "var(--ink)",
          }}
        >
          CYBER <span style={{ color: "var(--neon)" }}>MART</span>
        </div>
        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
          Admin Panel
        </div>
      </div>

      <nav style={{ flex: 1 }}>
        <a href="/admin" style={linkStyle("/admin")}>
          📊 Дашборд
        </a>
        <a href="/admin/users" style={linkStyle("/admin/users")}>
          👥 Пользователи
        </a>
        <a href="/admin/gifts" style={linkStyle("/admin/gifts")}>
          🎁 Подарки
        </a>
        <a href="/admin/winners" style={linkStyle("/admin/winners")}>
          🏆 Победы
        </a>
        <a href="/admin/settings" style={linkStyle("/admin/settings")}>
          ⚙️ Настройки
        </a>
      </nav>

      <div
        style={{
          fontSize: 11,
          color: "var(--muted)",
          padding: "12px 8px",
          borderTop: "1px solid var(--line-dim)",
          marginTop: 20,
        }}
      >
        v1.0 · Cyber Mart
      </div>
    </div>
  );
}