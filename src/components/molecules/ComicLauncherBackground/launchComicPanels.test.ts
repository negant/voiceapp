import {
  getPanelBounds,
  LAUNCH_COMIC_PANELS,
} from '@/components/molecules/ComicLauncherBackground/launchComicPanels';

describe('LAUNCH_COMIC_PANELS', () => {
  it('defines five angled comic panels in preset order', () => {
    expect(LAUNCH_COMIC_PANELS).toHaveLength(5);
    expect(LAUNCH_COMIC_PANELS.map(panel => panel.presetId)).toEqual([
      'female',
      'male',
      'robot',
      'femaleVoice',
      'legionista',
    ]);
  });

  it('keeps female as the largest top-left hero panel', () => {
    const female = LAUNCH_COMIC_PANELS[0];
    const male = LAUNCH_COMIC_PANELS[1];
    const femaleArea =
      getPanelBounds(female.points).width * getPanelBounds(female.points).height;
    const maleArea =
      getPanelBounds(male.points).width * getPanelBounds(male.points).height;

    expect(femaleArea).toBeGreaterThan(maleArea);
    expect(getPanelBounds(female.points).minX).toBe(0);
    expect(getPanelBounds(female.points).minY).toBe(0);
  });

  it('places legionista in the bottom band', () => {
    const legionista = LAUNCH_COMIC_PANELS[4];
    const bounds = getPanelBounds(legionista.points);

    expect(bounds.maxY).toBe(200);
    expect(bounds.centerY).toBeGreaterThan(120);
  });

  it('shares one junction point between robot, femaleVoice and legionista panels', () => {
    const junction = '65,115';
    const robot = LAUNCH_COMIC_PANELS.find(panel => panel.id === 'robot');
    const femaleVoice = LAUNCH_COMIC_PANELS.find(
      panel => panel.id === 'femaleVoice',
    );
    const legionista = LAUNCH_COMIC_PANELS.find(
      panel => panel.id === 'legionista',
    );

    expect(robot?.points).toContain(junction);
    expect(femaleVoice?.points).toContain(junction);
    expect(legionista?.points).toContain(junction);
  });
});
