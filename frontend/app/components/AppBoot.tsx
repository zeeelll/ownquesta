'use client';

import { useState } from 'react';
import LoadingScreen from './LoadingScreen';

export default function AppBoot({ children }: { children: React.ReactNode }) {
  const [introDone, setIntroDone] = useState(false);

  return (
    <>
      {!introDone && <LoadingScreen onComplete={() => setIntroDone(true)} />}
      <div style={{ visibility: introDone ? 'visible' : 'hidden' }}>{children}</div>
    </>
  );
}
