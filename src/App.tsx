/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback } from 'react';
import { useMqtt } from './hooks/useMqtt';
import { useVoiceControl } from './hooks/useVoiceControl';
import { 
  Mic, 
  MicOff, 
  Activity 
} from 'lucide-react';

export default function App() {
  const { sensorData, brokerStatus, publishCommand } = useMqtt();

  const handlePublish = useCallback((cmd: string) => {
    publishCommand(cmd);
  }, [publishCommand]);

  const readSensorData = useCallback(() => {
    if ('speechSynthesis' in window) {
      const text = `Suhu saat ini adalah ${sensorData.suhu || 0} derajat celcius, dan kelembapan ${sensorData.kelembapan || 0} persen`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID';
      window.speechSynthesis.speak(utterance);
    }
  }, [sensorData.suhu, sensorData.kelembapan]);

  const { isListening, toggleListening, lastTranscript } = useVoiceControl(handlePublish, readSensorData);

  return (
    <div className="min-h-screen bg-[#FFF5F8] text-gray-800 font-sans flex flex-col p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-[#FFD1DC] mb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FF69B4] rounded-xl flex items-center justify-center shadow-lg shadow-[#FF69B4]/20">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">AURA <span className="text-[#FF69B4]">IoT</span></h1>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Enterprise Control System</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#FFF0F5] border border-[#FFB6C1] rounded-full">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-xs font-semibold text-[#FF69B4]">System Live</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#FFF0F5] border border-[#FFB6C1] rounded-full">
              <div className="w-2 h-2 rounded-full bg-[#FF69B4]"></div>
              <span className="text-xs font-semibold text-[#FF69B4]">{Object.values(brokerStatus).filter(Boolean).length} Brokers Connected</span>
            </div>
          </div>
        </header>

        {/* Main Content Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Panel: Connectivity & Sensors */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Broker Status Card */}
            <div className="bg-white p-5 rounded-3xl border border-[#FFD1DC] shadow-sm flex-1 flex flex-col">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#FF69B4] mb-4">MQTT Brokers</h2>
              <div className="space-y-3 flex-1 flex flex-col justify-center">
                <BrokerCard name="test.mosquitto.org" protocol="Port 9001 • WebSocket" connected={brokerStatus.mosquitto} />
                <BrokerCard name="broker.mqtt.cool" protocol="Port 9001 • WebSocket" connected={brokerStatus.mqttcool} />
                <BrokerCard name="mqtt.flespi.io" protocol="Port 80 • Secure WS" connected={brokerStatus.flespi} />
              </div>
            </div>

            {/* Sensors Display */}
            <div className="bg-[#FF69B4] p-5 rounded-3xl shadow-lg shadow-[#FF69B4]/20 flex flex-col justify-between">
              <h2 className="text-xs font-bold uppercase tracking-widest text-white/80 mb-4">ESP32 Sensor Real-time</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-4xl font-light text-white">
                    {sensorData.suhu !== null ? sensorData.suhu.toFixed(1) : '--'}
                    <span className="text-xl">°C</span>
                  </div>
                  <div className="text-[10px] uppercase font-bold text-white/70 mt-1">Temperature</div>
                </div>
                <div className="text-center border-l border-white/20">
                  <div className="text-4xl font-light text-white">
                    {sensorData.kelembapan !== null ? sensorData.kelembapan.toFixed(1) : '--'}
                    <span className="text-xl">%</span>
                  </div>
                  <div className="text-[10px] uppercase font-bold text-white/70 mt-1">Humidity</div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-white/60 text-[10px]">
                <span>Topic: esp32/sensor/status</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span> Live</span>
              </div>
            </div>
          </div>

          {/* Center/Right Panel: Controls */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Relay Main Controls */}
            <div className="bg-white p-6 rounded-3xl border border-[#FFD1DC] shadow-sm flex-1 flex flex-col">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-xs font-bold uppercase tracking-widest text-[#FF69B4]">Relay Command Center</h2>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button onClick={() => handlePublish('ON')} className="flex-1 sm:flex-none px-4 py-1.5 bg-[#FF69B4] hover:bg-pink-600 transition-colors text-white text-[10px] font-bold rounded-lg uppercase tracking-wider shadow-md active:scale-95">All ON</button>
                  <button onClick={() => handlePublish('OFF')} className="flex-1 sm:flex-none px-4 py-1.5 bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600 text-[10px] font-bold rounded-lg border border-gray-200 uppercase tracking-wider active:scale-95">All OFF</button>
                </div>
              </div>

              {/* 4 Relay Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    onClick={() => handlePublish(num.toString())}
                    className="group flex flex-col items-center justify-center gap-3 rounded-2xl border border-gray-100 bg-white text-gray-400 hover:border-[#FFB6C1] hover:text-[#FF69B4] hover:bg-[#FFF5F8] active:bg-[#FFE4E1] transition-all p-4"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-[#FF69B4] group-hover:text-white text-gray-400 flex items-center justify-center text-sm font-bold transition-all shadow-sm">
                      {num}
                    </div>
                    <span className="font-bold text-sm">RELAY {num}</span>
                  </button>
                ))}
              </div>

              {/* Pattern Controls */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button onClick={() => handlePublish('POLA1')} className="py-4 bg-[#FFB6C1] hover:bg-pink-400 text-white rounded-2xl font-bold tracking-widest text-xs shadow-sm active:scale-95 transition-transform flex flex-col items-center">
                  POLA 1 
                  <span className="text-[8px] opacity-80 uppercase font-normal tracking-normal mt-1">Sequential L-R</span>
                </button>
                <button onClick={() => handlePublish('POLA2')} className="py-4 bg-[#FFC0CB] hover:bg-pink-300 text-[#FF69B4] hover:text-white rounded-2xl font-bold tracking-widest text-xs border border-[#FF69B4]/20 active:scale-95 transition-transform flex flex-col items-center">
                  POLA 2 
                  <span className="text-[8px] opacity-80 hover:opacity-100 uppercase font-normal tracking-normal mt-1">Strobe Light</span>
                </button>
                <button onClick={() => handlePublish('STOP')} className="py-4 bg-gray-900 hover:bg-black text-white rounded-2xl font-bold tracking-widest text-xs shadow-xl active:scale-95 transition-transform flex flex-col items-center">
                  STOP 
                  <span className="text-[8px] opacity-80 uppercase font-normal tracking-normal mt-1">Emergency Halt</span>
                </button>
              </div>
            </div>

            {/* Voice Assistant Section */}
            <div 
              onClick={toggleListening}
              className={`bg-white p-5 rounded-3xl border shadow-sm flex items-center gap-6 cursor-pointer transition-all active:scale-[0.99] ${isListening ? 'border-[#FF69B4] ring-2 ring-[#FF69B4]/20' : 'border-[#FFD1DC] hover:border-[#FFB6C1]'}`}
            >
              <div className="relative">
                <div className="w-16 h-16 bg-[#FFF0F5] border-2 border-[#FF69B4] rounded-full flex items-center justify-center">
                  {isListening ? <Mic className="h-8 w-8 text-[#FF69B4]" /> : <MicOff className="h-8 w-8 text-[#FF69B4]" />}
                </div>
                {isListening && <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF69B4] rounded-full border-2 border-white animate-pulse"></div>}
              </div>
              <div className="flex-1">
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                  {isListening ? "Voice Command Active" : "Voice Command Disabled"}
                </h2>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="text-sm italic text-gray-500 font-medium">
                    {isListening ? (lastTranscript ? `"${lastTranscript}"` : '"Listening..."') : '"Tap mic to start"'}
                  </span>
                  {isListening && (
                    <div className="flex gap-1 items-center mt-1 sm:mt-0">
                       <div className="w-1 h-3 bg-[#FFC0CB] rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                       <div className="w-1 h-5 bg-[#FFB6C1] rounded-full animate-bounce" style={{animationDelay: '75ms'}}></div>
                       <div className="w-1 h-2 bg-[#FFD1DC] rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                       <div className="w-1 h-4 bg-[#FF69B4] rounded-full animate-bounce" style={{animationDelay: '225ms'}}></div>
                       <div className="w-1 h-2 bg-[#FFD1DC] rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                    </div>
                  )}
                </div>
              </div>
              <div className="hidden sm:block text-right border-l border-gray-100 pl-6">
                <p className="text-[10px] text-gray-400 font-bold uppercase">Try Saying</p>
                <p className="text-[11px] font-semibold text-[#FF69B4] italic">"baca sensor"</p>
              </div>
            </div>

          </div>
        </div>

        {/* Footer / System Logs Overlay */}
        <footer className="mt-6 bg-[#1A1A1A] p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono text-white/50 gap-4">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-center sm:text-left">
            <span className="text-[#FF69B4]">[MQTT] Endpoints active</span>
            <span>[VOICE] API Ready</span>
            {sensorData.suhu && <span>[SENSOR] Data sync: {sensorData.suhu}, {sensorData.kelembapan}</span>}
          </div>
          <div className="flex items-center gap-3">
            <span className="uppercase tracking-widest hidden sm:inline">Console Output v2.4.1</span>
            <div className="w-2 h-2 rounded-full bg-white opacity-20"></div>
          </div>
        </footer>
      </div>
    </div>
  );
}

function BrokerCard({ name, connected, protocol }: { name: string; connected: boolean; protocol: string }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-[#FFF5F8] border border-[#FFC0CB]/30">
      <div className="flex flex-col">
        <span className="text-xs font-bold text-gray-800">{name}</span>
        <span className="text-[10px] text-gray-500">{protocol}</span>
      </div>
      {connected ? (
        <span className="px-2 py-1 bg-green-100 text-green-600 text-[10px] font-bold rounded-md uppercase tracking-wider">ONLINE</span>
      ) : (
        <span className="px-2 py-1 bg-red-100 text-red-600 text-[10px] font-bold rounded-md uppercase tracking-wider">OFFLINE</span>
      )}
    </div>
  );
}
