import { useEffect, useRef, useState, type ReactNode } from "react";

const LETTER_W = 816;
const LETTER_H = 1056;

export function LetterStage({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const width = el.clientWidth;
      setScale(Math.min(1, width / LETTER_W));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={ref} className="w-full">
      <div
        className="relative w-full"
        style={{ height: LETTER_H * scale }}
      >
        <div
          className="letter-print-source absolute top-0 left-0 origin-top-left"
          style={{
            width: LETTER_W,
            transform: `scale(${scale})`,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
