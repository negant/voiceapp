import { Image, View } from 'react-native';
import Svg, {
  ClipPath,
  Defs,
  G,
  Image as SvgImage,
  Polygon,
  Rect,
} from 'react-native-svg';

import type { ComicLauncherBackgroundProps } from '@/components/molecules/ComicLauncherBackground/ComicLauncherBackground.types';
import {
  getPanelBounds,
  LAUNCH_COMIC_PANELS,
  type LaunchComicPanel,
} from '@/components/molecules/ComicLauncherBackground/launchComicPanels';
import { cn } from '@/lib/cn';

const VIEWBOX_WIDTH = 100;
const VIEWBOX_HEIGHT = 200;
const COMIC_GUTTER = 1.35;
const COMIC_INK = '#111111';
export const COMIC_PAPER = '#F4E8CF';

function clipId(panelId: string): string {
  return `launch-comic-clip-${panelId}`;
}

function ComicPanelArt({ panel }: { panel: LaunchComicPanel }) {
  const bounds = getPanelBounds(panel.points);
  const scale = panel.imageScale ?? 1.15;
  const imageWidth = bounds.width * scale;
  const imageHeight = bounds.height * scale;
  const imageX =
    bounds.centerX - imageWidth / 2 + (panel.imageOffsetX ?? 0);
  const imageY =
    bounds.centerY - imageHeight / 2 + (panel.imageOffsetY ?? 0);
  const asset = Image.resolveAssetSource(panel.image);

  return (
    <G clipPath={`url(#${clipId(panel.id)})`}>
      <SvgImage
        href={asset}
        x={imageX}
        y={imageY}
        width={imageWidth}
        height={imageHeight}
        preserveAspectRatio="xMidYMid slice"
      />
    </G>
  );
}

/** Full-screen comic panel collage behind the launcher logo. */
export function ComicLauncherBackground({
  className,
}: ComicLauncherBackgroundProps) {
  return (
    <View className={cn('overflow-hidden', className)}>
      <Svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
        preserveAspectRatio="xMidYMid slice">
        <Rect
          x={0}
          y={0}
          width={VIEWBOX_WIDTH}
          height={VIEWBOX_HEIGHT}
          fill={COMIC_PAPER}
        />

        <Defs>
          {LAUNCH_COMIC_PANELS.map(panel => (
            <ClipPath key={panel.id} id={clipId(panel.id)}>
              <Polygon points={panel.points} />
            </ClipPath>
          ))}
        </Defs>

        {LAUNCH_COMIC_PANELS.map(panel => (
          <ComicPanelArt key={panel.id} panel={panel} />
        ))}

        {LAUNCH_COMIC_PANELS.map(panel => (
          <Polygon
            key={`${panel.id}-ink`}
            points={panel.points}
            fill="none"
            stroke={COMIC_INK}
            strokeWidth={COMIC_GUTTER}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}

        <Rect
          x={0}
          y={0}
          width={VIEWBOX_WIDTH}
          height={VIEWBOX_HEIGHT}
          fill="none"
          stroke={COMIC_INK}
          strokeWidth={COMIC_GUTTER * 1.4}
        />
      </Svg>
    </View>
  );
}
