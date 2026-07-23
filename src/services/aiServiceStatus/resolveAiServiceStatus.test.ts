import {
  buildAiServiceStatusSnapshot,
  resolveAiServiceStatusSeverity,
  severityToColor,
} from './resolveAiServiceStatus';

describe('resolveAiServiceStatusSeverity', () => {
  it('returns ok when UP and both lists are empty', () => {
    expect(
      resolveAiServiceStatusSeverity({
        page: { status: 'UP' },
        activeIncidents: [],
        activeMaintenances: [],
      }),
    ).toBe('ok');
  });

  it('returns degraded when maintenance is active', () => {
    expect(
      resolveAiServiceStatusSeverity({
        page: { status: 'UP' },
        activeIncidents: [],
        activeMaintenances: [{ id: 'm1' }],
      }),
    ).toBe('degraded');

    expect(
      resolveAiServiceStatusSeverity({
        page: { status: 'UNDERMAINTENANCE' },
        activeIncidents: [],
        activeMaintenances: [],
      }),
    ).toBe('degraded');
  });

  it('returns outage when incidents or HASISSUES', () => {
    expect(
      resolveAiServiceStatusSeverity({
        page: { status: 'UP' },
        activeIncidents: [{ id: 'i1' }],
        activeMaintenances: [],
      }),
    ).toBe('outage');

    expect(
      resolveAiServiceStatusSeverity({
        page: { status: 'HASISSUES' },
        activeIncidents: [],
        activeMaintenances: [],
      }),
    ).toBe('outage');
  });

  it('prefers outage over maintenance when both are present', () => {
    expect(
      resolveAiServiceStatusSeverity({
        page: { status: 'HASISSUES' },
        activeIncidents: [{ id: 'i1' }],
        activeMaintenances: [{ id: 'm1' }],
      }),
    ).toBe('outage');
  });
});

describe('buildAiServiceStatusSnapshot', () => {
  it('maps severity to traffic-light colors', () => {
    expect(severityToColor('ok')).toBe('green');
    expect(severityToColor('degraded')).toBe('yellow');
    expect(severityToColor('outage')).toBe('red');
    expect(severityToColor('unknown')).toBe('gray');

    const snapshot = buildAiServiceStatusSnapshot(
      {
        page: { status: 'UP' },
        activeIncidents: [],
        activeMaintenances: [],
      },
      'network',
      1_700_000_000_000,
    );

    expect(snapshot).toMatchObject({
      severity: 'ok',
      color: 'green',
      pageStatus: 'UP',
      activeIncidentsCount: 0,
      activeMaintenancesCount: 0,
      fetchedAt: 1_700_000_000_000,
      source: 'network',
    });
  });
});
