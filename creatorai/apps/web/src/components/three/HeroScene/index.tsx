import { Image as ImageIcon, Clapperboard, Box, Presentation, Music, Sparkles } from 'lucide-react';
import { Cube3D } from '../Cube3D';
import { useStyles } from '../../../lib/useStyles';
import { heroSceneStyles } from './styles';

const faceIcon = (Icon: typeof ImageIcon, app = false) => (
  <Icon className={heroSceneStyles.faceIcon(app)} strokeWidth={app ? 2.2 : 1.9} />
);

/** Hero 3D cube — each face shows something users can create; app icon on top. */
export function HeroScene() {
  const s = useStyles(heroSceneStyles);
  // order: front, back, right, left, top, bottom
  const faces = [
    faceIcon(ImageIcon), // front — images
    faceIcon(Clapperboard), // back — video
    faceIcon(Box), // right — 3D
    faceIcon(Presentation), // left — presentations
    faceIcon(Sparkles, true), // top — app icon
    faceIcon(Music), // bottom — audio/songs
  ];

  return (
    <div className={s.container}>
      <div className={s.glow} />
      <div className={s.float}>
        <Cube3D size={172} faces={faces} spin={22} />
      </div>
    </div>
  );
}
