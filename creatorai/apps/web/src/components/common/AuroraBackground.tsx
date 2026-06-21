/** Animated aurora/mesh backdrop with fine grain. Sits behind all content. */
export function AuroraBackground() {
  return (
    <div className="aurora" aria-hidden>
      <div className="aurora__blob aurora__blob--1" />
      <div className="aurora__blob aurora__blob--2" />
      <div className="aurora__blob aurora__blob--3" />
      <div className="aurora__grain" />
    </div>
  );
}
