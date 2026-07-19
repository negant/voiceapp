import SoundPlayer from 'react-native-sound-player';

import { toFileUri } from '@/services/audio/audioStorage';

export type AudioPlaybackInfo = {
  currentTime: number;
  duration: number;
};

export async function playAudioFile(uri: string): Promise<void> {
  await stopAudioPlayback();
  SoundPlayer.playUrl(toFileUri(uri));
}

export async function pauseAudioPlayback(): Promise<void> {
  SoundPlayer.pause();
}

export async function resumeAudioPlayback(): Promise<void> {
  SoundPlayer.resume();
}

export async function stopAudioPlayback(): Promise<void> {
  try {
    SoundPlayer.stop();
  } catch {
    // Player may not be active; ignore stop errors.
  }
}

export async function getAudioPlaybackInfo(): Promise<AudioPlaybackInfo | null> {
  try {
    return await SoundPlayer.getInfo();
  } catch {
    return null;
  }
}
