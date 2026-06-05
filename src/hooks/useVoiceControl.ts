import { useState, useEffect, useRef } from 'react';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function useVoiceControl(
  onCommandRecognized: (command: string) => void,
  readSensorData: () => void
) {
  const [isListening, setIsListening] = useState(false);
  const [lastTranscript, setLastTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const lastCommandTime = useRef(0);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'id-ID';

      recognition.onstart = () => {
        setIsListening(true);
        isListeningRef.current = true;
      };

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript.toLowerCase().trim();
        setLastTranscript(transcript);
        const now = Date.now();
        if (now - lastCommandTime.current < 1500) return;
        lastCommandTime.current = now;
        switch (transcript) {
          case 'relay 1':
          case 'relay satu': onCommandRecognized('1'); break;
          case 'relay 2':
          case 'relay dua': onCommandRecognized('2'); break;
          case 'relay 3':
          case 'relay tiga': onCommandRecognized('3'); break;
          case 'relay 4':
          case 'relay empat': onCommandRecognized('4'); break;
          case 'semua nyala': onCommandRecognized('ON'); break;
          case 'semua mati': onCommandRecognized('OFF'); break;
          case 'pola 1':
          case 'pola satu': onCommandRecognized('POLA1'); break;
          case 'pola 2':
          case 'pola dua': onCommandRecognized('POLA2'); break;
          case 'stop': onCommandRecognized('STOP'); break;
          case 'baca sensor': readSensorData(); break;
          default: break;
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
      if ((event.error === 'no-speech' || event.error === 'aborted') && isListeningRef.current) {
          try { recognition.start(); } catch (e) {}
        } else {
          setIsListening(false);
          isListeningRef.current = false;
        }
      };

      recognition.onend = () => {
        if (isListeningRef.current) {
          try { recognition.start(); }
          catch (e) { setIsListening(false); isListeningRef.current = false; }
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      isListeningRef.current = false;
      if (recognitionRef.current) recognitionRef.current.stop()
    };
  }, [onCommandRecognized, readSensorData]);

  const toggleListening = () => {
    if (isListeningRef.current) {
      isListeningRef.current = false;
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try { recognitionRef.current?.start(); }
      catch (e) { console.error('Failed to start recognition', e); }
    }
  };

  return { isListening, toggleListening, lastTranscript };
}
