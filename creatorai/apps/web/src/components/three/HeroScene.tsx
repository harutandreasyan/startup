import { Sparkles } from 'lucide-react';

const FACE = 84; // half of cube edge (168px)

const faces = [
  `rotateY(0deg) translateZ(${FACE}px)`,
  `rotateY(180deg) translateZ(${FACE}px)`,
  `rotateY(90deg) translateZ(${FACE}px)`,
  `rotateY(-90deg) translateZ(${FACE}px)`,
  `rotateX(90deg) translateZ(${FACE}px)`,
  `rotateX(-90deg) translateZ(${FACE}px)`,
];

/** Pure-CSS animated 3D cube with a glowing core. No dependencies. */
export function HeroScene() {
  return (
    <div className="scene-3d relative w-full h-full flex items-center justify-center">
      {/* glowing aura behind */}
      <div className="absolute h-56 w-56 rounded-full bg-gradient-to-br from-primary to-accent blur-3xl opacity-40 animate-float" />
      {/* floating wrapper (float) → spinning cube (spin) */}
      <div className="animate-float">
        <div className="cube3d">
          {faces.map((t, i) => (
            <div key={i} className="cube3d__face" style={{ transform: t }}>
              {i === 0 && (
                <div className="w-full h-full flex items-center justify-center">
                  <Sparkles className="h-10 w-10 text-white/90" strokeWidth={2} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
