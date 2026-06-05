import mqtt from 'mqtt';
import { useEffect, useRef, useState } from 'react';

export interface SensorData {
  suhu: number | null;
  kelembapan: number | null;
}

export interface BrokerStatus {
  mosquitto: boolean;
  mqttcool: boolean;
  flespi: boolean;
}

export function useMqtt() {
  const [sensorData, setSensorData] = useState<SensorData>({ suhu: null, kelembapan: null });
  const [brokerStatus, setBrokerStatus] = useState<BrokerStatus>({
    mosquitto: false,
    mqttcool: false,
    flespi: false,
  });

  const clientsRef = useRef<{ id: keyof BrokerStatus; client: mqtt.MqttClient }[]>([]);

  useEffect(() => {
    // The user specified 'ws://' and specific ports.
    // However, since this site is served over HTTPS, some browsers block mixed content (ws over https).
    // The library and browser will attempt to connect.
    const brokers = [
      {
        id: 'mosquitto' as const,
        url: window.location.protocol === 'https:' ? 'wss://test.mosquitto.org:8081' : 'ws://test.mosquitto.org:9001',
      },
      {
        id: 'mqttcool' as const,
        url: 'wss://public.cloud.shiftr.io:443',
        options: {
          username: 'public',
          password: 'public',
        },
      },
      {
        id: 'flespi' as const,
        url: window.location.protocol === 'https:' ? 'wss://mqtt.flespi.io:443' : 'ws://mqtt.flespi.io:80',
        options: {
          username: 'Sg5wMD6XCo3tb7dGJz9Ss0jZcLX8CqR1f5qiI03K8zPt8tkcdZJXiutyawoclTOo',
        },
      },
    ];

    clientsRef.current = brokers.map((b) => {
      const client = mqtt.connect(b.url, {
        clientId: `client_${Math.random().toString(16).slice(2)}`,
        ...(b.options || {}),
      });

      client.on('connect', () => {
        setBrokerStatus((prev) => ({ ...prev, [b.id]: true }));
        client.subscribe('esp32/sensor/status', (err) => {
          if (err) console.error(`Error subscribing on ${b.id}`, err);
        });
      });

      client.on('message', (topic, message) => {
        if (topic === 'esp32/sensor/status') {
          try {
            const data = JSON.parse(message.toString());
            // Only update if valid to avoid flickering from multiple brokers
            if (data && typeof data.suhu === 'number') {
              setSensorData({ suhu: data.suhu, kelembapan: data.kelembapan });
            }
          } catch (e) {
             console.error("Failed to parse mqtt message", e);
          }
        }
      });

      client.on('close', () => {
        setBrokerStatus((prev) => ({ ...prev, [b.id]: false }));
      });
      
      client.on('error', () => {
         setBrokerStatus((prev) => ({ ...prev, [b.id]: false }));
      });

      return { id: b.id, client };
    });

    return () => {
      clientsRef.current.forEach(({ client }) => client.end());
      clientsRef.current = [];
    };
  }, []);

  const publishCommand = (command: string) => {
    clientsRef.current.forEach(({ client, id }) => {
      if (client.connected) {
        client.publish('esp32/relay/cmd', command, (error) => {
            if (error) {
                console.error(`Failed to publish via ${id}`, error);
            }
        });
      }
    });
  };

  return { sensorData, brokerStatus, publishCommand };
}
