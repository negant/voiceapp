import { env } from '@/config/env';

import { logger } from './logger';

describe('logger', () => {
  const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
  const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    logSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('logs debug messages only when debugMode is enabled', () => {
    (env as { debugMode: boolean }).debugMode = false;
    logger.debug('Test', 'hidden');
    expect(logSpy).not.toHaveBeenCalled();

    (env as { debugMode: boolean }).debugMode = true;
    logger.debug('Test', 'visible', { ok: true });
    expect(logSpy).toHaveBeenCalledWith(
      '[VoiceApp][Test] visible',
      { ok: true },
    );
  });

  it('always logs info messages', () => {
    logger.info('Test', 'info', { path: 'dry_dsp' });
    expect(logSpy).toHaveBeenCalledWith(
      '[VoiceApp][Test] info',
      { path: 'dry_dsp' },
    );
  });

  it('always logs warn and error', () => {
    logger.warn('Test', 'warn');
    logger.error('Test', 'error', new Error('boom'));

    expect(warnSpy).toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith(
      '[VoiceApp][Test] error',
      expect.objectContaining({ message: 'boom' }),
    );
  });
});
