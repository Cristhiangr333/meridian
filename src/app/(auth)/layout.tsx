export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 justify-center mb-8">
          <svg width="30" height="30" viewBox="0 0 26 26" fill="none" className="flex-shrink-0">
            <circle cx="13" cy="13" r="11.5" stroke="#7DD3FC" strokeWidth="1" opacity="0.5" />
            <ellipse cx="13" cy="13" rx="11.5" ry="4.2" stroke="#7DD3FC" strokeWidth="1" opacity="0.8" />
            <line x1="13" y1="1.5" x2="13" y2="24.5" stroke="#7DD3FC" strokeWidth="1" opacity="0.5" />
          </svg>
          <div>
            <h1 className="font-display text-lg font-semibold text-ink-1 leading-none">
              Meridi<span className="text-signal">a</span>n
            </h1>
            <p className="font-mono text-[9.5px] tracking-widest text-ink-3 uppercase mt-0.5">
              Sistema de inteligencia de trading
            </p>
          </div>
        </div>

        <div className="bg-surface border border-hairline rounded-2xl p-7 md:p-8 shadow-[0_20px_60px_-24px_rgba(0,0,0,.6)]">
          {children}
        </div>
      </div>
    </div>
  );
}
