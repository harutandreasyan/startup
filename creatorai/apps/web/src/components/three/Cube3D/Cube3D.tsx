import type { CSSProperties, ReactNode } from 'react';
import { useStyles } from '../../../lib/useStyles';
import { makeCube3DStyles } from './styles';

interface Cube3DProps {
  size: number;
  /** Up to 6 face contents in order: front, back, right, left, top, bottom */
  faces: ReactNode[];
  spin?: number; // seconds per rotation
  perspective?: number;
  tint?: { c1: string; c2: string };
  mini?: boolean;
  className?: string;
}

function transforms(half: number) {
  return [
    `rotateY(0deg) translateZ(${half}px)`,
    `rotateY(180deg) translateZ(${half}px)`,
    `rotateY(90deg) translateZ(${half}px)`,
    `rotateY(-90deg) translateZ(${half}px)`,
    `rotateX(90deg) translateZ(${half}px)`,
    `rotateX(-90deg) translateZ(${half}px)`,
  ];
}

/** Reusable pure-CSS animated 3D cube. No dependencies. */
export default function Cube3D({ size, faces, spin = 20, perspective = 900, tint, mini = false, className = '' }: Cube3DProps) {
  const s = useStyles(() => makeCube3DStyles(mini, className), [mini, className]);
  const half = size / 2;
  const ts = transforms(half);
  const style: CSSProperties = {
    width: size,
    height: size,
    animationDuration: `${spin}s`,
    ...(tint ? ({ ['--cube-c1' as string]: tint.c1, ['--cube-c2' as string]: tint.c2 } as CSSProperties) : {}),
  };

  return (
    <div className={s.scene} style={{ perspective }}>
      <div className={s.cube} style={style}>
        {ts.map((t, i) => (
          <div key={i} className={s.face} style={{ transform: t }}>
            {faces[i]}
          </div>
        ))}
      </div>
    </div>
  );
}
