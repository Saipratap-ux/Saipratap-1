import React, { useEffect, useRef } from 'react';
import { AgentState } from '../types';

interface VoiceVisualizerProps {
  state: AgentState;
  analyserRef: React.MutableRefObject<AnalyserNode | null>;
  mode?: 'wave' | 'radial' | 'frequency';
  audioLevel: number;
}

export const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({
  state,
  analyserRef,
  mode = 'wave',
  audioLevel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let phase = 0;

    // Buffer for analyser data
    const bufferLength = analyserRef.current ? analyserRef.current.frequencyBinCount : 64;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      phase += 0.04;

      ctx.clearRect(0, 0, width, height);

      // Get real audio data if available
      let hasRealAudio = false;
      if (analyserRef.current && (state === 'listening' || state === 'speaking')) {
        analyserRef.current.getByteFrequencyData(dataArray);
        hasRealAudio = true;
      }

      // Determine palette based on AgentState
      let primaryColor = 'rgba(56, 189, 248, '; // Sky blue
      let glowColor = 'rgba(14, 165, 233, 0.4)';

      if (state === 'listening') {
        primaryColor = 'rgba(251, 191, 36, '; // Radiant warm gold
        glowColor = 'rgba(245, 158, 11, 0.5)';
      } else if (state === 'processing') {
        primaryColor = 'rgba(168, 85, 247, '; // Cosmic purple/violet
        glowColor = 'rgba(147, 51, 234, 0.5)';
      } else if (state === 'speaking') {
        primaryColor = 'rgba(45, 212, 191, '; // Luminous cyan/emerald
        glowColor = 'rgba(20, 184, 166, 0.6)';
      } else if (state === 'interrupted' || state === 'error') {
        primaryColor = 'rgba(244, 63, 94, '; // Rose / Coral
        glowColor = 'rgba(225, 29, 72, 0.4)';
      } else if (state === 'connecting') {
        primaryColor = 'rgba(129, 140, 248, '; // Indigo
        glowColor = 'rgba(99, 102, 241, 0.4)';
      }

      // Base activity multiplier
      const energy = state === 'idle' ? 0.08 : Math.max(0.15, audioLevel * 1.8);

      if (mode === 'radial') {
        // RADIAL ORBITAL MODE
        const centerX = width / 2;
        const centerY = height / 2;
        const baseRadius = Math.min(width, height) * 0.32;

        ctx.save();
        ctx.shadowBlur = 18;
        ctx.shadowColor = glowColor;

        const rings = 3;
        for (let r = 0; r < rings; r++) {
          const currentRadius = baseRadius + r * 14 + energy * 25;
          ctx.beginPath();
          ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `${primaryColor}${0.18 + (rings - r) * 0.15})`;
          ctx.lineWidth = 2 - r * 0.4;
          ctx.stroke();
        }

        // Draw orbital particle points
        const points = 16;
        for (let i = 0; i < points; i++) {
          const angle = (i / points) * Math.PI * 2 + phase * 0.5;
          const mag = hasRealAudio ? (dataArray[i * 2] || 0) / 255 : Math.sin(phase + i) * 0.5 + 0.5;
          const dist = baseRadius + mag * energy * 40;
          const px = centerX + Math.cos(angle) * dist;
          const py = centerY + Math.sin(angle) * dist;

          ctx.beginPath();
          ctx.arc(px, py, 2.5 + mag * 2, 0, Math.PI * 2);
          ctx.fillStyle = `${primaryColor}0.9)`;
          ctx.fill();
        }

        ctx.restore();
      } else if (mode === 'frequency') {
        // BALANCED SPECTRUM BARS
        const barCount = 36;
        const barWidth = (width / barCount) * 0.65;
        const gap = (width / barCount) * 0.35;
        const startX = (width - (barCount * (barWidth + gap))) / 2;
        const centerY = height / 2;

        for (let i = 0; i < barCount; i++) {
          const index = Math.floor((i / barCount) * (dataArray.length / 2));
          const val = hasRealAudio
            ? dataArray[index] / 255
            : (Math.sin(phase * 1.5 + i * 0.3) * 0.5 + 0.5) * energy;

          const barHeight = Math.max(6, val * height * 0.65 * (state === 'idle' ? 0.3 : 1));
          const x = startX + i * (barWidth + gap);

          const gradient = ctx.createLinearGradient(x, centerY - barHeight / 2, x, centerY + barHeight / 2);
          gradient.addColorStop(0, `${primaryColor}0.2)`);
          gradient.addColorStop(0.5, `${primaryColor}0.9)`);
          gradient.addColorStop(1, `${primaryColor}0.2)`);

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(x, centerY - barHeight / 2, barWidth, barHeight, 4);
          ctx.fill();
        }
      } else {
        // FLUID HARMONIC SINE WAVES (DEFAULT)
        const waveCount = 3;
        const centerY = height / 2;

        ctx.save();
        ctx.shadowBlur = 12;
        ctx.shadowColor = glowColor;

        for (let w = 0; w < waveCount; w++) {
          ctx.beginPath();
          const wavePhase = phase + w * 1.2;
          const opacity = (0.8 - w * 0.25).toFixed(2);
          ctx.strokeStyle = `${primaryColor}${opacity})`;
          ctx.lineWidth = 2.5 - w * 0.5;

          const sliceWidth = width / 60;
          let x = 0;

          for (let i = 0; i <= 60; i++) {
            const normalizedI = i / 60;
            // Bell curve envelope so waves taper naturally at canvas edges
            const envelope = Math.sin(normalizedI * Math.PI);

            const freqFactor = hasRealAudio
              ? (dataArray[Math.floor(normalizedI * 32)] || 0) / 255
              : 0.5;

            const y =
              centerY +
              Math.sin(normalizedI * 9 + wavePhase) *
                envelope *
                (18 + energy * 42 + freqFactor * 25);

            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
            x += sliceWidth;
          }

          ctx.stroke();
        }

        ctx.restore();
      }

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [analyserRef, audioLevel, mode, state]);

  return (
    <div className="relative w-full flex items-center justify-center overflow-hidden py-1">
      <canvas
        ref={canvasRef}
        width={560}
        height={110}
        className="w-full max-w-[560px] h-[100px] pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );
};
