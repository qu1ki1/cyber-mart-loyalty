import { useEffect, useState } from "react";
import { getGifts, type Gift } from "./supabaseAdmin";

export default function Gifts() {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGifts()
      .then(setGifts)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: "32px 40px", maxWidth: 1100 }}>
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: 28,
            fontWeight: 600,
            marginBottom: 6,
            color: "var(--ink)",
          }}
        >
          🎁 Подарки
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 14 }}>
          Управление призами и их шансами
        </p>
      </div>

      {loading ? (
        <div style={{ color: "var(--muted)" }}>Загрузка...</div>
      ) : gifts.length === 0 ? (
        <div style={{ color: "var(--muted)" }}>Подарков пока нет</div>
      ) : (
        <div
          style={{
            background: "var(--panel)",
            border: "1px solid var(--line-dim)",
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--line-dim)", background: "rgba(0,0,0,0.25)" }}>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Название</th>
                <th style={thStyle}>Шанс (%)</th>
                <th style={thStyle}>Количество</th>
                <th style={thStyle}>Статус</th>
                <th style={thStyle}>Создан</th>
              </tr>
            </thead>
            <tbody>
              {gifts.map((gift) => (
                <tr key={gift.id} style={{ borderBottom: "1px solid var(--line-dim)" }}>
                  <td style={tdStyle}>{gift.id}</td>
                  <td style={{ ...tdStyle, fontWeight: 500 }}>{gift.name}</td>
                  <td style={tdStyle}>
                    <span style={{ color: "var(--neon)", fontWeight: 600 }}>{gift.chance}%</span>
                  </td>
                  <td style={tdStyle}>{gift.quantity}</td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 500,
                        background: gift.active ? "rgba(57,255,138,0.12)" : "rgba(255,80,80,0.12)",
                        color: gift.active ? "var(--neon)" : "#ff6b6b",
                        border: `1px solid ${gift.active ? "rgba(57,255,138,0.3)" : "rgba(255,80,80,0.3)"}`,
                      }}
                    >
                      {gift.active ? "Активен" : "Выключен"}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, color: "var(--muted)", fontSize: 13 }}>
                    {new Date(gift.created_at).toLocaleDateString("ru-RU")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "14px 18px",
  fontSize: 13,
  fontWeight: 500,
  color: "var(--muted)",
  letterSpacing: "0.03em",
};

const tdStyle: React.CSSProperties = {
  padding: "16px 18px",
  fontSize: 14,
  color: "var(--ink)",
};