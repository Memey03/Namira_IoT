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
      // Relay ON individual
      case 'hidupkan relay satu':
      case 'nyalakan relay satu':
      case 'relay satu nyala':
        onCommandRecognized('1'); break;
      case 'hidupkan relay dua':
      case 'nyalakan relay dua':
      case 'relay dua nyala':
        onCommandRecognized('2'); break;
      case 'hidupkan relay tiga':
      case 'nyalakan relay tiga':
      case 'relay tiga nyala':
        onCommandRecognized('3'); break;
      case 'hidupkan relay empat':
      case 'nyalakan relay empat':
      case 'relay empat nyala':
        onCommandRecognized('4'); break;
    
      // Relay OFF individual
      case 'matikan relay satu':
      case 'relay satu mati':
        onCommandRecognized('1'); break;
      case 'matikan relay dua':
      case 'relay dua mati':
        onCommandRecognized('2'); break;
      case 'matikan relay tiga':
      case 'relay tiga mati':
        onCommandRecognized('3'); break;
      case 'matikan relay empat':
      case 'relay empat mati':
        onCommandRecognized('4'); break;
    
      // Semua relay
      case 'hidupkan semua':
      case 'nyalakan semua':
      case 'semua nyala':
        onCommandRecognized('ON'); break;
      case 'matikan semua':
      case 'semua mati':
        onCommandRecognized('OFF'); break;
    
      // Pola
      case 'pola satu':
      case 'pola 1':
        onCommandRecognized('POLA1'); break;
      case 'pola dua':
      case 'pola 2':
        onCommandRecognized('POLA2'); break;
      case 'stop':
      case 'berhenti':
        onCommandRecognized('STOP'); break;
    
      // Info sensor
      case 'info sensor':
      case 'baca sensor':
      case 'berapa suhu':
      case 'berapa kelembapan':
      case 'cek suhu':
        readSensorData(); break;
    
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
