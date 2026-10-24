function Reconectando() {
  return (
    <div className="bg-info-subtle min-vh-100 d-flex flex-column justify-content-center align-items-center px-3 py-4">
      <div  role="status" aria-live="polite">
        <span className="reconectando__hex" aria-hidden="true" />
        <h1>Volviendo a tu partida…</h1>
        <p>Estamos recuperando tu lugar en la sala. Tus recursos y construcciones siguen ahí.</p>
      </div>
    </div>
  );
}

export default Reconectando;
