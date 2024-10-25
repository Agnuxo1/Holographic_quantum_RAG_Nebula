import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { ChatInterface } from './components/ChatInterface';
import { EmergentOpticalScene } from './components/EmergentOpticalScene';
import { Moon, Sun } from 'lucide-react';
import { Button } from './components/ui/button';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  return (
    <div className={`flex h-screen ${isDarkMode ? 'dark' : ''}`}>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-50"
        onClick={() => setIsDarkMode(!isDarkMode)}
      >
        {isDarkMode ? (
          <Sun className="h-5 w-5 text-yellow-500" />
        ) : (
          <Moon className="h-5 w-5 text-slate-700" />
        )}
      </Button>
      <div className="w-1/2 flex flex-col">
        <ChatInterface isDarkMode={isDarkMode} />
      </div>
      <div className="w-1/2">
        <Canvas>
          <EmergentOpticalScene />
        </Canvas>
      </div>
    </div>
  );
}

export default App;