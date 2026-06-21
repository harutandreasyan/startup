import { Image as ImageIcon, Clapperboard, Box, Presentation, Music, Sparkles } from 'lucide-react';
import { Cube3D } from './Cube3D';

const faceIcon = (Icon: typeof ImageIcon, app = false) => (
  <Icon className={app ? 'h-12 w-12 text-white' : 'h-10 w-10 text-white/90'} strokeWidth={app ? 2.2 : 1.9} />
);

/** Hero 3D cube — each face shows something users can create; app icon on top. */
export function HeroScene() {
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
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="absolute h-56 w-56 rounded-full bg-gradient-to-br from-primary to-accent blur-3xl opacity-40 animate-float" />
      <div className="animate-float">
        <Cube3D size={172} faces={faces} spin={22} />
      </div>
    </div>
  );
}
