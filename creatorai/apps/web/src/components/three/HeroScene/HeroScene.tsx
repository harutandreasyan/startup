import { Image as ImageIcon, Clapperboard, Box, Presentation, Music, Sparkles } from 'lucide-react';
import Cube3D from '../Cube3D';
import { useStyles } from '../../../lib/useStyles';
import { heroSceneStyles } from './styles';

const faceIcon = (Icon: typeof ImageIcon, app = false) => (
  <Icon className={heroSceneStyles.faceIcon(app)} strokeWidth={app ? 2.2 : 1.9} />
);

/** Hero 3D cube — each face shows something users can create; app icon on top. */
export default function HeroScene() {
  const styles = useStyles(heroSceneStyles);
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
    <div className={styles.container}>
      <div className={styles.glow} />
      <div className={styles.float}>
        <Cube3D size={172} faces={faces} spin={22} />
      </div>
    </div>
  );
}
