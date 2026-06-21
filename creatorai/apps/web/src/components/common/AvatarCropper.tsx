import { useEffect, useRef, useState } from 'react';
import { ZoomIn } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

const BOX = 256; // crop viewport (px)
const OUT = 256; // output resolution (px)

interface AvatarCropperProps {
  file: File;
  saving?: boolean;
  onCancel: () => void;
  onApply: (dataUrl: string) => void;
}

export function AvatarCropper({ file, saving, onCancel, onApply }: AvatarCropperProps) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => setImg(image);
    image.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const baseScale = img ? Math.max(BOX / img.naturalWidth, BOX / img.naturalHeight) : 1;
  const dispScale = baseScale * zoom;
  const dispW = img ? img.naturalWidth * dispScale : 0;
  const dispH = img ? img.naturalHeight * dispScale : 0;

  // Clamp an offset for a given zoom so the image always covers the crop box.
  const clampFor = (z: number, o: { x: number; y: number }) => {
    if (!img) return o;
    const s = baseScale * z;
    const w = img.naturalWidth * s;
    const h = img.naturalHeight * s;
    return {
      x: Math.max(-(w - BOX) / 2, Math.min((w - BOX) / 2, o.x)),
      y: Math.max(-(h - BOX) / 2, Math.min((h - BOX) / 2, o.y)),
    };
  };

  const onZoomChange = (z: number) => {
    setZoom(z);
    setOffset((o) => clampFor(z, o));
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    setOffset(clampFor(zoom, { x: drag.current.ox + (e.clientX - drag.current.x), y: drag.current.oy + (e.clientY - drag.current.y) }));
  };
  const onPointerUp = () => {
    drag.current = null;
  };

  const apply = () => {
    if (!img) return;
    const canvas = document.createElement('canvas');
    canvas.width = OUT;
    canvas.height = OUT;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const centerX = (BOX - dispW) / 2 + offset.x;
    const centerY = (BOX - dispH) / 2 + offset.y;
    const srcX = -centerX / dispScale;
    const srcY = -centerY / dispScale;
    const srcSize = BOX / dispScale;
    ctx.drawImage(img, srcX, srcY, srcSize, srcSize, 0, 0, OUT, OUT);
    onApply(canvas.toDataURL('image/jpeg', 0.85));
  };

  const centerX = (BOX - dispW) / 2 + offset.x;
  const centerY = (BOX - dispH) / 2 + offset.y;

  return (
    <Modal open onClose={onCancel} title="Adjust photo">
      <div className="px-5 pb-5 pt-2 flex flex-col items-center">
        <div
          className="relative rounded-full overflow-hidden border-2 border-primary/40 touch-none select-none bg-surface-2"
          style={{ width: BOX, height: BOX, maxWidth: '70vw', maxHeight: '70vw' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          {img && (
            <img
              src={img.src}
              alt="Crop preview"
              draggable={false}
              className="absolute cursor-grab active:cursor-grabbing"
              // maxWidth/maxHeight 'none' overrides Tailwind's base `img { max-width:100% }`,
              // which would otherwise cap width and break the aspect ratio while zooming.
              style={{ width: dispW, height: dispH, left: centerX, top: centerY, maxWidth: 'none', maxHeight: 'none' }}
            />
          )}
        </div>

        <p className="text-xs text-muted mt-3">Drag to reposition</p>

        <div className="flex items-center gap-3 w-full mt-3 max-w-xs">
          <ZoomIn className="h-4 w-4 text-muted shrink-0" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => onZoomChange(Number(e.target.value))}
            className="w-full accent-[var(--primary)]"
          />
        </div>

        <div className="flex gap-3 mt-6 w-full">
          <Button variant="ghost" fullWidth onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
          <Button fullWidth onClick={apply} loading={saving}>
            Apply
          </Button>
        </div>
      </div>
    </Modal>
  );
}
