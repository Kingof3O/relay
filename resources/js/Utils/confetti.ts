/**
 * Lightweight canvas particle burst celebration.
 * Zero external dependencies.
 */
export function triggerCelebration(originX?: number, originY?: number) {
    if (typeof window === 'undefined') return;

    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.inset = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        canvas.remove();
        return;
    }

    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);

    const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4'];
    const particleCount = 45;
    const startX = originX ?? window.innerWidth * 0.7;
    const startY = originY ?? window.innerHeight * 0.5;

    interface Particle {
        x: number;
        y: number;
        vx: number;
        vy: number;
        size: number;
        color: string;
        rotation: number;
        vRot: number;
        opacity: number;
    }

    const particles: Particle[] = Array.from({ length: particleCount }, () => {
        const angle = Math.random() * Math.PI * 2;
        const speed = 4 + Math.random() * 8;
        return {
            x: startX,
            y: startY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 3,
            size: 4 + Math.random() * 5,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 360,
            vRot: (Math.random() - 0.5) * 12,
            opacity: 1,
        };
    });

    let startTime = performance.now();
    const duration = 1200; // 1.2s

    function animate(currentTime: number) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach((p) => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.28; // gravity
            p.vx *= 0.98; // friction
            p.rotation += p.vRot;
            p.opacity = Math.max(0, 1 - progress);

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.globalAlpha = p.opacity;
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
            ctx.restore();
        });

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            canvas.remove();
        }
    }

    requestAnimationFrame(animate);
}

export const triggerConfetti = triggerCelebration;
