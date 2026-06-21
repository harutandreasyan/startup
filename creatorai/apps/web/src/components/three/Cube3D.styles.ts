export const makeCube3DStyles = (mini: boolean, className: string) => ({
  scene: 'scene-3d inline-flex',
  cube: `cube3d ${mini ? 'cube3d--mini' : ''} ${className}`,
  face: 'cube3d__face',
});
