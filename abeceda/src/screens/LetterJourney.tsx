import { useEffect, useMemo, useRef, useState } from 'react';
import type { Animal, LetterContent } from '../content/types';
import { LETTERS } from '../content/letters';
import { GLYPHS } from '../content/strokes';
import {
  PHRASES,
  sayExtraOffer,
  sayFact,
  sayIntro,
  sayMoved,
  sayName,
  sayNameEn,
  sayQuestion,
  sayTraceLower,
  sayTraceUpper,
} from '../content/phrases';
import { speak, stopSpeaking } from '../lib/speech';
import { chime, pop } from '../lib/sfx';
import { navigate } from '../lib/router';
import { useStore } from '../lib/store';
import { MAX_FAILS, toleranceFor } from '../lib/tracing';
import { TracingBoard } from '../components/TracingBoard';
import { AnimalName, AnimalPic, ProgressDots, RoundButton } from '../components/ui';
import { IconCheck, IconHand, IconHome, IconMap, IconNext, IconSkip, IconSpeaker } from '../components/icons';

type Prompt = () => void;
interface StepProps {
  letter: LetterContent;
  setPrompt: (p: Prompt) => void;
  onNext: () => void;
}

const STEPS = 5;

export function LetterJourney({ letter }: { letter: LetterContent }) {
  const { data } = useStore();
  const [step, setStep] = useState(0);
  const prompt = useRef<Prompt>(() => {});
  const setPrompt = (p: Prompt) => {
    prompt.current = p;
    p();
  };
  useEffect(() => () => stopSpeaking(), []);

  const props: StepProps = { letter, setPrompt, onNext: () => setStep((s) => s + 1) };
  return (
    <div className={`screen journey ${data.settings.leftHanded ? 'left' : ''}`}>
      <header className="topbar">
        <RoundButton label="Domov" onClick={() => navigate('/')}>
          <IconHome />
        </RoundButton>
        <ProgressDots total={STEPS} current={step} />
        <RoundButton label="Zopakuj" onClick={() => prompt.current()}>
          <IconSpeaker />
        </RoundButton>
      </header>
      {step === 0 && <IntroStep key="0" {...props} />}
      {step === 1 && <TraceStep key="1" {...props} />}
      {step === 2 && <ListenStep key="2" {...props} />}
      {step === 3 && <FactStep key="3" {...props} />}
      {step === 4 && <EnglishStep key="4" {...props} />}
      {step >= 5 && <Finale key="5" {...props} />}
    </div>
  );
}

function NextButton({ onClick, pulse = true, disabled }: { onClick: () => void; pulse?: boolean; disabled?: boolean }) {
  return (
    <RoundButton label="Ďalej" variant="primary" size="xl" pulse={pulse && !disabled} onClick={onClick} disabled={disabled}>
      <IconNext />
    </RoundButton>
  );
}

// ---------- 1. Zoznámenie ----------
function IntroStep({ letter, setPrompt, onNext }: StepProps) {
  useEffect(() => setPrompt(() => speak(sayIntro(letter.upper, letter.animal))), []); // eslint-disable-line
  return (
    <>
      <main className="stage intro">
        <AnimalPic animal={letter.animal} className="pop-in big" />
        <div className="big-letter slide-in">
          {letter.upper}
          <span className="small">{letter.lower}</span>
        </div>
        <p className="caption">
          <AnimalName animal={letter.animal} />
        </p>
      </main>
      <aside className="controls">
        <NextButton onClick={onNext} />
      </aside>
    </>
  );
}

// ---------- 2. Ukáž mi a píšem ----------
interface Phase {
  char: string;
  reps: number;
  kind: 'upper' | 'lower';
}

function TraceStep({ letter, setPrompt, onNext }: StepProps) {
  const { data, updateProgress } = useStore();
  const basePhases: Phase[] = [
    { char: letter.upper, reps: 3, kind: 'upper' },
    { char: letter.lower, reps: 3, kind: 'lower' },
  ];
  const extraPhases: Phase[] = letter.extra
    ? [
        { char: letter.extra.upper, reps: 1, kind: 'upper' },
        { char: letter.extra.lower, reps: 1, kind: 'lower' },
      ]
    : [];
  const [inExtra, setInExtra] = useState(false);
  const phases = inExtra ? extraPhases : basePhases;
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [rep, setRep] = useState(0);
  const [mode, setMode] = useState<'trace' | 'celebrate' | 'offer'>('trace');
  const [boosted, setBoosted] = useState(false);
  const [demoKey, setDemoKey] = useState(0);
  const phase = phases[phaseIdx];

  // pokyn pri každom novom písmene
  useEffect(() => {
    if (mode === 'offer') return;
    const say = phase.kind === 'upper' ? sayTraceUpper(phase.char) : sayTraceLower(phase.char);
    setPrompt(() => speak(say));
  }, [phaseIdx, inExtra]); // eslint-disable-line

  const showDemo = () => {
    speak(PHRASES.watch);
    setDemoKey((k) => k + 1);
  };

  const finishLetter = () => {
    if (rep + 1 < phase.reps) {
      setRep(rep + 1);
      setMode('trace');
      return;
    }
    if (phaseIdx + 1 < phases.length) {
      setPhaseIdx(phaseIdx + 1);
      setRep(0);
      setBoosted(false);
      setMode('trace');
      return;
    }
    if (!inExtra && letter.extra) {
      setMode('offer');
      const offer = sayExtraOffer(letter)!;
      setPrompt(() => speak(offer));
      return;
    }
    if (inExtra) updateProgress(letter.id, (p) => ({ ...p, extraDone: true }));
    onNext();
  };

  if (mode === 'offer' && letter.extra) {
    const ex = letter.extra;
    return (
      <>
        <main className="stage offer">
          <div className="offer-card pop-in">
            <AnimalPic animal={ex.animal} className="big" />
            <div className="offer-letter">{ex.upper}</div>
            <p className="caption">
              <AnimalName animal={ex.animal} letter={ex.lower} />
            </p>
          </div>
          <div className="offer-buttons">
            <RoundButton
              label="Áno, skúsim"
              variant="primary"
              size="xl"
              onClick={() => {
                setInExtra(true);
                setPhaseIdx(0);
                setRep(0);
                setBoosted(false);
                setMode('trace');
              }}
            >
              <IconCheck />
            </RoundButton>
            <RoundButton label="Preskočiť" size="xl" onClick={onNext}>
              <IconSkip />
            </RoundButton>
          </div>
        </main>
        <aside className="controls" />
      </>
    );
  }

  const glyph = GLYPHS[phase.char];
  return (
    <>
      <main className="stage trace">
        <div className={`board-wrap ${mode === 'celebrate' ? 'celebrate' : ''}`}>
          <TracingBoard
            key={`${inExtra}-${phaseIdx}-${rep}`}
            glyph={glyph}
            tolerance={toleranceFor(data.settings.difficulty, boosted)}
            showHints={phase.reps === 1 || rep < 2}
            leftHanded={data.settings.leftHanded}
            demoKey={demoKey}
            onEvent={(ev, tracer) => {
              if (ev === 'strokeDone') pop();
              if (ev === 'letterDone') {
                chime();
                speak(PHRASES.great);
                setMode('celebrate');
                setTimeout(finishLetter, 1600);
              }
              if (ev === 'failed' && tracer.consecutiveFails >= MAX_FAILS) {
                tracer.consecutiveFails = 0;
                setBoosted(true);
                updateProgress(letter.id, (p) => ({ ...p, autoDemos: p.autoDemos + 1 }));
                showDemo();
              }
            }}
          />
          {mode === 'celebrate' && <div className="reward-star" aria-hidden>⭐</div>}
        </div>
        <div className="reps" aria-label={`Opakovanie ${rep + 1} z ${phase.reps}`}>
          {Array.from({ length: phase.reps }, (_, i) => (
            <span key={i} className={`rep ${i < rep || (i === rep && mode === 'celebrate') ? 'done' : ''} ${i === rep ? 'now' : ''}`} />
          ))}
        </div>
      </main>
      <aside className="controls">
        <RoundButton label="Ukáž mi" size="xl" onClick={showDemo}>
          <IconHand />
        </RoundButton>
      </aside>
    </>
  );
}

// ---------- 3. Počúvam ----------
function pickOthers(letter: LetterContent, n: number): Animal[] {
  const others = LETTERS.filter((l) => l.id !== letter.id).map((l) => l.animal);
  return shuffle(others).slice(0, n);
}
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function ChoiceGrid({
  options,
  correct,
  onCorrect,
  speakOnTap,
}: {
  options: Animal[];
  correct: Animal;
  onCorrect: () => void;
  speakOnTap: (a: Animal) => Parameters<typeof speak>[0];
}) {
  const [wrong, setWrong] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);
  return (
    <div className="choices">
      {options.map((a) => (
        <button
          key={a.id}
          type="button"
          className={`choice ${wrong === a.id ? 'wiggle' : ''} ${solved && a.id === correct.id ? 'right' : ''}`}
          aria-label={a.name}
          onClick={() => {
            if (solved) {
              speak(speakOnTap(a));
              return;
            }
            if (a.id === correct.id) {
              setSolved(true);
              chime();
              speak(speakOnTap(a), PHRASES.great);
              onCorrect();
            } else {
              setWrong(a.id);
              setTimeout(() => setWrong(null), 600);
              speak(speakOnTap(a), PHRASES.tryAgain);
            }
          }}
        >
          <AnimalPic animal={a} />
        </button>
      ))}
    </div>
  );
}

function ListenStep({ letter, setPrompt, onNext }: StepProps) {
  const options = useMemo(() => shuffle([letter.animal, ...pickOthers(letter, 2)]), [letter]);
  const hasSound = !!letter.animal.soundPath;
  const [round, setRound] = useState<'letter' | 'sound'>('letter');
  const [solved, setSolved] = useState(false);

  useEffect(() => {
    if (round === 'letter') setPrompt(() => speak(sayQuestion(letter)));
    else
      setPrompt(() =>
        speak(PHRASES.whoMakesSound, { text: '', audio: letter.animal.soundPath ?? undefined }),
      );
  }, [round]); // eslint-disable-line

  return (
    <>
      <main className="stage listen">
        <div className="question-letter">{round === 'letter' ? letter.upper : '🔊'}</div>
        <ChoiceGrid
          key={round}
          options={options}
          correct={letter.animal}
          speakOnTap={sayName}
          onCorrect={() => setSolved(true)}
        />
      </main>
      <aside className="controls">
        <NextButton
          disabled={!solved}
          onClick={() => {
            if (round === 'letter' && hasSound) {
              setRound('sound');
              setSolved(false);
            } else onNext();
          }}
        />
      </aside>
    </>
  );
}

// ---------- 4. Zaujímavosť ----------
function FactStep({ letter, setPrompt, onNext }: StepProps) {
  useEffect(() => setPrompt(() => speak(sayFact(letter.animal))), []); // eslint-disable-line
  return (
    <>
      <main className="stage fact">
        <AnimalPic animal={letter.animal} className="huge pop-in" />
        <p className="fact-text">{letter.animal.fact}</p>
      </main>
      <aside className="controls">
        <NextButton onClick={onNext} />
      </aside>
    </>
  );
}

// ---------- 5. Po anglicky ----------
function EnglishStep({ letter, setPrompt, onNext }: StepProps) {
  const a = letter.animal;
  const [phase, setPhase] = useState<'learn' | 'game'>('learn');
  const [solved, setSolved] = useState(false);
  const options = useMemo(() => shuffle([a, ...pickOthers(letter, 2)]), [letter, a]);

  useEffect(() => {
    if (phase === 'learn') setPrompt(() => speak(sayNameEn(a), PHRASES.sayItToo, sayNameEn(a)));
    else setPrompt(() => speak(PHRASES.tapPicture, sayNameEn(a)));
  }, [phase]); // eslint-disable-line

  return (
    <>
      <main className="stage english">
        {phase === 'learn' ? (
          <>
            <AnimalPic animal={a} className="big pop-in" />
            <div className="en-word" lang="en">
              <span className="flag" aria-hidden>🇬🇧</span> {a.nameEn}
            </div>
            <p className="caption small-caption">
              Povedz to aj ty: <span lang="en">{a.nameEn}</span>!
            </p>
          </>
        ) : (
          <>
            <div className="en-word" lang="en">
              <span className="flag" aria-hidden>🇬🇧</span> 🔊
            </div>
            <ChoiceGrid options={options} correct={a} speakOnTap={sayNameEn} onCorrect={() => setSolved(true)} />
          </>
        )}
      </main>
      <aside className="controls">
        {phase === 'learn' ? (
          <NextButton onClick={() => setPhase('game')} />
        ) : (
          <NextButton disabled={!solved} onClick={onNext} />
        )}
      </aside>
    </>
  );
}

// ---------- Koniec cesty ----------
function Finale({ letter, setPrompt }: StepProps) {
  const { updateProgress } = useStore();
  useEffect(() => {
    updateProgress(letter.id, (p) => ({ ...p, completed: true, completedAt: p.completedAt ?? new Date().toISOString() }));
    chime();
    setPrompt(() => speak(sayMoved(letter.animal)));
  }, []); // eslint-disable-line
  return (
    <>
      <main className="stage finale">
        <div className="fly-away">
          <AnimalPic animal={letter.animal} className="big" />
        </div>
        <div className="finale-map" aria-hidden>
          🗺️
        </div>
      </main>
      <aside className="controls">
        <RoundButton label="Mapa" variant="primary" size="xl" pulse onClick={() => navigate('/mapa')}>
          <IconMap />
        </RoundButton>
        <RoundButton label="Domov" size="xl" onClick={() => navigate('/')}>
          <IconHome />
        </RoundButton>
      </aside>
    </>
  );
}
