import { useState } from 'react';
import { findLetter } from './content/letters';
import { navigate, useRoute } from './lib/router';
import { useStore } from './lib/store';
import { Home } from './screens/Home';
import { LetterJourney } from './screens/LetterJourney';
import { MapScreen } from './screens/MapScreen';
import { Parents } from './screens/Parents';
import { ProfilePicker } from './screens/ProfilePicker';
import { SpeechBubble } from './components/ui';

export function App() {
  const path = useRoute();
  const { active, parentUnlocked } = useStore();
  // úvodné ťuknutie (odomkne zvuk v prehliadači) – raz za spustenie
  const [started, setStarted] = useState(false);

  let screen;
  if (path === '/rodicia' && parentUnlocked) {
    screen = <Parents />;
  } else if (!started || !active) {
    screen = <ProfilePicker onPicked={() => setStarted(true)} />;
  } else {
    const m = path.match(/^\/pismeno\/([^/]+)/);
    const letter = m ? findLetter(decodeURIComponent(m[1])) : undefined;
    if (letter) screen = <LetterJourney key={letter.id} letter={letter} />;
    else if (path === '/mapa') screen = <MapScreen />;
    else {
      if (path !== '/') navigate('/');
      screen = <Home />;
    }
  }
  return (
    <>
      {screen}
      <SpeechBubble />
    </>
  );
}
