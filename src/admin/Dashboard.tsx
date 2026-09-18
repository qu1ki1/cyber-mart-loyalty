import { useEffect, useState } from "react";
import { getUsers, type User } from "./supabaseAdmin";

export default function Dashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUsers()
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

  const totalUsers = users.length;
  const totalGifts = users.filter((u) => u.gift).length;
  const totalAttempts = users.reduce((sum, u) => sum + (u.attempts || 0), 0);

  return (
    <div style={{ padding: "32px 40px", maxWidth: 1100 }}>
      <h1
        style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: 28,
          fontWeight: 600,
          marginBottom: 8,
          color: "var(--ink)",
        }}
      >
        📊 Дашборд
      </h1>
      <p style={{ color: "var(--muted)", marginBottom: 32, fontSize: 14 }}>
        Общая статистика Cyber Mart
      </p>

      {loading ? (
        <div style={{ color: "var(--muted)" }}>Загрузка...</div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 20,
          }}
        >
          <StatCard title="Пользователей" value={totalUsers} icon="👥" color="var(--neon)" />
          <StatCard title="Выдано подарков" value={totalGifts} icon="🎁" color="var(--cyan)" />
          <StatCard title="Всего попыток" value={totalAttempts} icon="🎯" color="#ff9f43" />
        </div>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: string;
  color: string;
}) {
  return (
    <div
      style={{
        background: "var(--panel)",
        border: "1px solid var(--line-dim)",
        borderRadius: 16,
        padding: "24px",
        backdropFilter: "blur(10px)",
      }}
    >
      <div style={{ fontSize: 28, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 6, letterSpacing: "0.03em" }}>
        {title}
      </div>
      <div
        style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: 32,
          fontWeight: 700,
          color: color,
        }}
      >
        {value}
      </div>
    </div>
  );
}