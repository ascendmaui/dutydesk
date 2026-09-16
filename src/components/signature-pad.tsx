import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from "react";
import { cn } from "@/lib/utils";

const CSS_H = 148;

type Props = {
  onChange: (dataUrl: string | null) => void;
  disabled?: boolean;
  className?: string;
};

export function SignaturePad({ onChange, disabled, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const dirty = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = parent.clientWidth;
      const snapshot = dirty.current ? canvas.toDataURL("image/png") : null;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(CSS_H * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${CSS_H}px`;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#161616";
      ctx.lineWidth = 2.2 * dpr;
      if (snapshot) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = snapshot;
      }
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(parent);
    return () => ro.disconnect();
  }, []);

  function point(e: PointerEvent) {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    return { x, y };
  }

  function emit() {
    const canvas = canvasRef.current;
    if (!canvas || !dirty.current) {
      onChange(null);
      return;
    }
    onChange(canvas.toDataURL("image/png"));
  }

  function onPointerDown(e: ReactPointerEvent<HTMLCanvasElement>) {
    if (disabled) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);
    drawing.current = true;
    last.current = point(e.nativeEvent);
  }

  function onPointerMove(e: ReactPointerEvent<HTMLCanvasElement>) {
    if (!drawing.current || disabled) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const next = point(e.nativeEvent);
    const prev = last.current;
    if (!canvas || !ctx || !next || !prev) return;
    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(next.x, next.y);
    ctx.stroke();
    last.current = next;
    dirty.current = true;
  }

  function onPointerUp(e: ReactPointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    drawing.current = false;
    last.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
    emit();
  }

  function clear() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    dirty.current = false;
    onChange(null);
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <div className="overflow-hidden rounded-md border border-border bg-paper">
        <canvas
          ref={canvasRef}
          className="block w-full touch-none"
          style={{ height: CSS_H }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          aria-label="Signature pad"
        />
      </div>
      <button
        type="button"
        onClick={clear}
        disabled={disabled}
        className="h-11 justify-self-start text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-50"
      >
        Clear drawing
      </button>
    </div>
  );
}
