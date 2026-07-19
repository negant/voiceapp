import {
  decodeBase64Chunk,
  parseAudioDurationFromHeader,
  parseMp3Duration,
  parseMp4Duration,
  parseWavDuration,
} from './audioMetadata';

describe('audioMetadata', () => {
  it('parses wav duration from a minimal header', () => {
    const bytes = new Uint8Array(44);
    const view = new DataView(bytes.buffer);
    bytes.set([0x52, 0x49, 0x46, 0x46]); // RIFF
    bytes.set([0x57, 0x41, 0x56, 0x45], 8); // WAVE
    view.setUint32(28, 32000, true); // byte rate
    bytes.set([0x64, 0x61, 0x74, 0x61], 12); // data
    view.setUint32(16, 64000, true); // chunk size

    expect(parseWavDuration(bytes)).toBe(2);
  });

  it('parses mp4 duration from mvhd atom', () => {
    const bytes = new Uint8Array(40);
    const view = new DataView(bytes.buffer);
    view.setUint32(0, 32, false);
    bytes.set([0x6d, 0x76, 0x68, 0x64], 4);
    bytes[8] = 0;
    view.setUint32(20, 44100, false);
    view.setUint32(24, 88200, false);

    expect(parseMp4Duration(bytes)).toBe(2);
  });

  it('routes extensions through parseAudioDurationFromHeader', () => {
    const bytes = decodeBase64Chunk('');
    expect(parseAudioDurationFromHeader(bytes, 'wav')).toBeNull();
    expect(parseMp3Duration(bytes)).toBeNull();
  });
});
