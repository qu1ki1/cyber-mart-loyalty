type Props = { businessName: string; onContinue: () => void }

export default function OnboardingChecklist({ businessName, onContinue }: Props) {
  return (
    <div className="cyber-card">
      <h1>«{businessName}» готов!</h1>
      <p className="panel-hint" style={{ marginBottom: 22, maxWidth: 300 }}>
        Мы уже добавили 5 стандартных призов, чтобы можно было сразу тестировать. Дальше — три шага:
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 320, marginBottom: 26 }}>
        <Step n={1} title="Проверь призы" desc="Вкладка «Призы» — поправь названия и веса под себя" />
        <Step n={2} title="Скачай QR-код" desc="Вкладка «Команда» — распечатай и повесь у входа или на кассе" />
        <Step n={3} title="Пригласи персонал" desc="Там же — ссылка для кассира, без паролей" />
      </div>

      <button className="cta" onClick={onContinue}>
        Перейти в панель
      </button>
    </div>
  )
}

function Step({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', textAlign: 'left' }}>
      <span
        style={{
          width: 26,
          height: 26,
          borderRadius: '50%',
          background: 'var(--panel)',
          border: '1px solid var(--line)',
          color: 'var(--neon)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {n}
      </span>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>{desc}</div>
      </div>
    </div>
  )
}
