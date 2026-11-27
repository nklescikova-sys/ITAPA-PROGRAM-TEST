import { useEffect } from 'react';
import { APP_NAME } from '../content/letters';
import { PHRASES } from '../content/phrases';
import { speak } from '../lib/speech';
import { unlockAudio } from '../lib/sfx';
import { useStore } from '../lib/store';
import { IconPlay } from '../components/icons';
import { Guide } from '../components/Guide';
import { Scenery } from '../components/Scenery';

/** Úvodná obrazovka: pri viacerých profiloch výber avatara, inak veľké tlačidlo „Hraj“ (odomkne zvuk). */
export function ProfilePicker({ onPicked }: { onPicked: () => void }) {
  const { data, setActiveId } = useStore();
  const many = data.profiles.length > 1;
  useEffect(() => {
    if (many) speak(PHRASES.chooseProfile);
  }, [many]);

  return (
    <div className="screen picker">
      <Scenery />
      <h1 className="app-title big">{APP_NAME}</h1>
      <Guide size={150} mood="happy" />
      {many ? (
        <div className="avatars">
          {data.profiles.map((p) => (
            <button
              key={p.id}
              type="button"
              className="avatar-btn"
              aria-label={p.name}
              onClick={() => {
                unlockAudio();
                setActiveId(p.id);
                onPicked();
              }}
            >
              <span className="avatar">{p.avatar}</span>
            </button>
          ))}
        </div>
      ) : (
        <button
          type="button"
          className="play-btn"
          aria-label="Hrať"
          onClick={() => {
            unlockAudio();
            setActiveId(data.profiles[0].id);
            onPicked();
          }}
        >
          <IconPlay />
        </button>
      )}
    </div>
  );
}
