export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gold to-violet flex items-center justify-center flex-shrink-0">
            <span className="font-display font-bold text-void text-sm">M</span>
          </div>
          <div>
            <h1 className="font-display text-lg font-semibold text-ink-1 leading-none">
              Meridian
            </h1>
            <p className="font-mono text-[9.5px] tracking-widest text-ink-3 uppercase mt-0.5">
              Sistema de inteligencia de trading
            </p>
          </div>
        </div>

        <div className="bg-surface-raised backdrop-blur-xl border border-hairline rounded-2xl p-7 md:p-8 shadow-[0_14px_40px_-20px_rgba(28,18,41,.14)]">
          {children}
        </div>
      </div>
    </div>
  );
}
