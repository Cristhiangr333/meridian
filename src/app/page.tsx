export default function Home() {
  return (
    <main style={{ padding: "48px 32px" }}>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 24,
          fontWeight: 600,
        }}
      >
        Meridian está en línea
      </h1>
      <p style={{ color: "#5C5470", marginTop: 8 }}>
        El sistema de diseño ya está cargado. Siguiente paso: autenticación.
      </p>
    </main>
  );
}
