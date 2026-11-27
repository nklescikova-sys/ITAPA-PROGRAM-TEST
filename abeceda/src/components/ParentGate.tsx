import { useEffect, useRef, useState } from 'react';
import { navigate } from '../lib/router';
import { useStore } from '../lib/store';
import { IconParents } from './icons';

const HOLD_MS = 3000;

/** Malé tlačidlo v rohu: podržať 3 sekundy → príklad → časť pre rodičov. */
export function ParentGate() {
  const { setParentUnlocked } = useStore();
  const [holding, setHolding] = useState(false);
  const [quiz, setQuiz] = useState<{ a: number; b: number; options: number[] } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const start = () => {
    setHolding(true);
    timer.current = setTimeout(() => {
      setHolding(false);
      const a = 3 + Math.floor(Math.random() * 7);
      const b = 3 + Math.floor(Math.random() * 7);
      const right = a + b;
      const set = new Set([right]);
      while (set.size < 3) set.add(right + Math.floor(Math.random() * 7) - 3);
      setQuiz({ a, b, options: [...set].sort(() => Math.random() - 0.5) });
    }, HOLD_MS);
  };
  const cancel = () => {
    clearTimeout(timer.current);
    setHolding(false);
  };
  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <>
      <button
        type="button"
        className={`parent-btn ${holding ? 'holding' : ''}`}
        aria-label="Pre rodičov (podržte 3 sekundy)"
        title="Pre rodičov – podržte 3 sekundy"
        onPointerDown={start}
        onPointerUp={cancel}
        onPointerLeave={cancel}
        onPointerCancel={cancel}
        onContextMenu={(e) => e.preventDefault()}
      >
        <svg className="hold-ring" viewBox="0 0 36 36" aria-hidden>
          <circle cx="18" cy="18" r="16" />
        </svg>
        <IconParents />
      </button>
      {quiz && (
        <div className="modal-backdrop" onClick={() => setQuiz(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Overenie pre rodičov">
            <p className="modal-title">Pre rodičov</p>
            <p className="quiz">
              {quiz.a} + {quiz.b} = ?
            </p>
            <div className="quiz-options">
              {quiz.options.map((o) => (
                <button
                  key={o}
                  type="button"
                  className="quiz-btn"
                  onClick={() => {
                    setQuiz(null);
                    if (o === quiz.a + quiz.b) {
                      setParentUnlocked(true);
                      navigate('/rodicia');
                    }
                  }}
                >
                  {o}
                </button>
              ))}
            </div>
            <button type="button" className="link-btn" onClick={() => setQuiz(null)}>
              Zrušiť
            </button>
          </div>
        </div>
      )}
    </>
  );
}
