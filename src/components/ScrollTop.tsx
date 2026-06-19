import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export function ScrollTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 700);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="Nahoru"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={cn(
        'fixed bottom-5 right-5 z-[900] grid place-items-center w-11 h-11 rounded-full',
        'bg-ink text-white shadow-lift transition-all duration-300 hover:bg-sea',
        show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none',
      )}
    >
      ↑
    </button>
  );
}
