import {
  encodeAudioBufferToWavBase64,
  encodeAudioBufferToWavBytes,
} from '@/utils/wavEncoder';

describe('encodeAudioBufferToWavBytes', () => {
  const buffer = {
    numberOfChannels: 1,
    length: 4,
    sampleRate: 44100,
    getChannelData: () => new Float32Array([0, 0.5, -0.5, 1]),
  };

  it('encodes a short mono buffer as WAV bytes', () => {
    const bytes = encodeAudioBufferToWavBytes(buffer);
    const riff = String.fromCharCode(...bytes.slice(0, 4));
    const wave = String.fromCharCode(...bytes.slice(8, 12));

    expect(riff).toBe('RIFF');
    expect(wave).toBe('WAVE');
    expect(bytes.length).toBeGreaterThan(44);
  });

  it('keeps base64 helper compatible with byte encoder', () => {
    const base64 = encodeAudioBufferToWavBase64(buffer);
    const fromBase64 = Uint8Array.from(globalThis.atob(base64), char =>
      char.charCodeAt(0),
    );

    expect(fromBase64).toEqual(encodeAudioBufferToWavBytes(buffer));
  });
});
