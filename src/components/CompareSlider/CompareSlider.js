import React, { useCallback, useRef, useState } from "react";
import "./CompareSlider.css";

/**
 * Confronto tra due immagini con barra divisoria trascinabile.
 *
 * Le due immagini hanno le stesse dimensioni (garantito dall'Uploader):
 * quella sopra (overlay, es. topologia) viene ritagliata con clip-path
 * alla posizione della barra; trascinando (mouse o touch) si rivela
 * l'una o l'altra. Accessibile anche da tastiera (frecce ←/→).
 */
function CompareSlider({ baseSrc, overlaySrc, alt, onImgError }) {
  const boxRef = useRef(null);
  const trascinando = useRef(false);
  const [pos, setPos] = useState(50); // posizione barra in % (0..100)

  const aggiorna = useCallback((clientX) => {
    const rect = boxRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const p = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, p)));
  }, []);

  const onPointerDown = (e) => {
    trascinando.current = true;
    boxRef.current?.setPointerCapture?.(e.pointerId);
    aggiorna(e.clientX);
  };
  const onPointerMove = (e) => {
    if (trascinando.current) aggiorna(e.clientX);
  };
  const onPointerUp = () => {
    trascinando.current = false;
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowLeft") setPos((p) => Math.max(0, p - 4));
    if (e.key === "ArrowRight") setPos((p) => Math.min(100, p + 4));
  };

  return (
    <div
      className="compare-box"
      ref={boxRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
      role="slider"
      aria-label="Confronto immagini"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pos)}
      tabIndex={0}
    >
      <img
        src={baseSrc}
        alt={alt}
        className="compare-img"
        draggable={false}
        onError={onImgError}
      />
      <img
        src={overlaySrc}
        alt={`${alt} (confronto)`}
        className="compare-img compare-img--overlay"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        draggable={false}
        onError={onImgError}
      />
      <div className="compare-divider" style={{ left: `${pos}%` }}>
        <div className="compare-handle" aria-hidden="true">⇄</div>
      </div>
    </div>
  );
}

export default CompareSlider;
