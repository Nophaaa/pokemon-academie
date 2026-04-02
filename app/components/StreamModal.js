'use client';

import { useEffect, useRef } from 'react';

export default function StreamModal({ streamModal, onClose }) {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!streamModal) return;
    previousFocusRef.current = document.activeElement;

    const handleKey = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll('button, a, iframe, [tabindex]:not([tabindex="-1"])');
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKey);

    requestAnimationFrame(() => {
      modalRef.current?.querySelector('[aria-label="Fermer"]')?.focus();
    });

    return () => {
      document.removeEventListener('keydown', handleKey);
      previousFocusRef.current?.focus();
    };
  }, [streamModal, onClose]);

  useEffect(() => {
    document.body.style.overflow = streamModal ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [streamModal]);

  if (!streamModal) return null;

  const { login, displayName } = streamModal;
  const parent = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

  return (
    <div
      className="stream-modal"
      role="dialog"
      aria-modal="true"
      aria-label={`Stream de ${displayName}`}
      ref={modalRef}
    >
      <div className="stream-modal__backdrop" onClick={onClose}></div>
      <div className="stream-modal__box">
        <div className="stream-modal__header">
          <span className="stream-modal__title">{displayName}</span>
          <button className="stream-modal__close" aria-label="Fermer" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="stream-modal__player">
          <iframe
            src={`https://player.twitch.tv/?channel=${encodeURIComponent(login)}&parent=${parent}&autoplay=true`}
            allowFullScreen
            title={`Stream Twitch de ${displayName}`}
          ></iframe>
        </div>
      </div>
    </div>
  );
}
