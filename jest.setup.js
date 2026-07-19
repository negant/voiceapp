/* eslint-env jest */
jest.mock('react-native-reanimated');
jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: {
    addEventListener: jest.fn(() => jest.fn()),
    fetch: jest.fn(() =>
      Promise.resolve({ isConnected: true, isInternetReachable: true }),
    ),
  },
}));
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('react-native-sqlite-storage');
jest.mock('@react-native-documents/picker', () => ({
  pick: jest.fn(),
  keepLocalCopy: jest.fn(),
  types: { audio: 'audio/*' },
  errorCodes: { OPERATION_CANCELED: 'OPERATION_CANCELED' },
  isErrorWithCode: (error: { code?: string }) =>
    Boolean(error && typeof error.code === 'string'),
}));
jest.mock('react-native-blob-util', () => ({
  __esModule: true,
  default: {
    config: jest.fn().mockReturnValue({
      fetch: jest.fn().mockResolvedValue({
        path: () => '/mock/cache/sts-response.mp3',
      }),
    }),
    fs: {
      dirs: { DocumentDir: '/mock/documents', CacheDir: '/mock/cache' },
      exists: jest.fn().mockResolvedValue(true),
      mkdir: jest.fn().mockResolvedValue(true),
      stat: jest.fn().mockResolvedValue({ size: 1000 }),
      cp: jest.fn().mockResolvedValue(true),
      mv: jest.fn().mockResolvedValue(true),
      unlink: jest.fn().mockResolvedValue(true),
      readFile: jest.fn().mockResolvedValue(''),
      writeFile: jest.fn().mockResolvedValue(true),
    },
    MediaCollection: {
      copyToMediaStore: jest.fn().mockResolvedValue('content://downloads/1'),
    },
  },
}));
jest.mock('react-native-sound-player', () => ({
  __esModule: true,
  default: {
    getInfo: jest.fn().mockResolvedValue({ currentTime: 0, duration: 0 }),
    pause: jest.fn(),
    playUrl: jest.fn(),
    resume: jest.fn(),
    stop: jest.fn(),
  },
}));
jest.mock('react-native-audio-api', () => {
  class MockAudioBuffer {
    constructor(numberOfChannels, length, sampleRate) {
      this.numberOfChannels = numberOfChannels;
      this.length = length;
      this.sampleRate = sampleRate;
      this.duration = length / sampleRate;
      this._channels = Array.from(
        { length: numberOfChannels },
        () => new Float32Array(length),
      );
    }

    getChannelData(channel) {
      return this._channels[channel];
    }

    copyToChannel(source, channel) {
      this._channels[channel].set(source);
    }
  }

  const createNode = () => ({
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    playbackRate: { value: 1 },
    detune: { value: 0 },
    type: 'lowshelf',
    frequency: { value: 0 },
    gain: { value: 1 },
    delayTime: { value: 0 },
    buffer: null,
  });

  return {
    AudioContext: jest.fn().mockImplementation(() => ({
      decodeAudioData: jest
        .fn()
        .mockResolvedValue(new MockAudioBuffer(1, 4410, 44100)),
    })),
    OfflineAudioContext: jest.fn().mockImplementation(() => ({
      destination: {},
      createBuffer: jest
        .fn()
        .mockImplementation(
          (numberOfChannels, length, sampleRate) =>
            new MockAudioBuffer(numberOfChannels, length, sampleRate),
        ),
      createBufferSource: createNode,
      createBiquadFilter: createNode,
      createGain: createNode,
      createDelay: createNode,
      startRendering: jest
        .fn()
        .mockResolvedValue(new MockAudioBuffer(1, 4410, 44100)),
    })),
  };
});
