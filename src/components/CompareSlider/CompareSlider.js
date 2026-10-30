import React, { useCallback, useRef, useState } from "react";
import "./CompareSlider.css";

/**
 * Confronto tra due immagini con barra divisoria.
 *
 * Le due immagini hanno le stesse proporzioni (il gestionale avvisa se no):
 * quella sopra (overlay, es. topologia) viene ritagliata con clip-path
 * alla posizione della barra. La barra si sposta SOLO trascinando il
 * pallino con le frecce (mouse o touch): un clic sull'immagine non fa
 * niente e sul telefono la pagina scorre normalmente. Da tastiera: Tab sul
 * pallino, poi frecce ←/→ (Home/Fine per i bordi).
 */
// base / overlay: attributi <img> (src, srcSet, sizes, width, height) da imageProps().
function CompareSlider({ base, overlay, alt }) {
  const boxRef = useRef(null);
  const [pos, setPos] = useState(50); // posizione barra in % (0..100)
  const [dragging, setDragging] = useState(false);

  const aggiorna = useCallback((clientX) => {
    const rect = boxRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const p = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, p)));
  }, []);

  // Il trascinamento parte solo dal pallino; la cattura del puntatore lo
  // segue anche se esce dall'immagine.
  const onPointerDown = (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDragging(true);
  };
  const onPointerMove = (e) => {
    if (dragging) aggiorna(e.clientX);
  };
  const onPointerUp = () => setDragging(false);

  const onKeyDown = (e) => {
    const step = e.shiftKey ? 10 : 4;
    if (e.key === "ArrowLeft") setPos((p) => Math.max(0, p - step));
    else if (e.key === "ArrowRight") setPos((p) => Math.min(100, p + step));
    else if (e.key === "Home") setPos(0);
    else if (e.key === "End") setPos(100);
    else return;
    e.preventDefault();
  };

  return (
    <div className={`compare-box ${dragging ? "is-dragging" : ""}`} ref={boxRef}>
      <img
        {...base}
        alt={alt}
        className="compare-img"
        decoding="async"
        draggable={false}
      />
      <img
        {...overlay}
        alt={`${alt} (confronto)`}
        className="compare-img compare-img--overlay"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        decoding="async"
        draggable={false}
      />
      <div className="compare-divider" style={{ left: `${pos}%` }}>
        <div
          className="compare-handle"
          role="slider"
          aria-label="Sposta il confronto tra le immagini"
          aria-orientation="horizontal"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pos)}
          tabIndex={0}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onLostPointerCapture={onPointerUp}
          onKeyDown={onKeyDown}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path d="M9.5 7 4.5 12l5 5M14.5 7l5 5-5 5" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default CompareSlider;
