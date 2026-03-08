import { useEffect, useRef, useState } from 'react';

export function useParticles() {
  const canvasRef = useRef(null);
  const [error, setError] = useState(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      setError('Canvas element not found');
      return;
    }

    try {
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setError('Could not get canvas context');
        return;
      }

      let width = canvas.width = window.innerWidth;
      let height = canvas.height = window.innerHeight;
      let particlesArray = [];

      class Particle {
        constructor() {
          this.x = Math.random() * width;
          this.y = Math.random() * height;
          this.size = Math.random() * 3 + 1;
          this.speedX = Math.random() * 0.5 - 0.25;
          this.speedY = Math.random() * 0.5 - 0.25;
          this.color = 'rgba(255, 215, 0, 0.5)';
        }

        update() {
          this.x += this.speedX;
          this.y += this.speedY;
          if (this.x > width) this.x = 0;
          if (this.x < 0) this.x = width;
          if (this.y > height) this.y = 0;
          if (this.y < 0) this.y = height;
        }

        draw() {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fillStyle = this.color;
          ctx.fill();
        }
      }

      function init() {
        particlesArray = [];
        for (let i = 0; i < 80; i++) {
          particlesArray.push(new Particle());
        }
      }

      function animate() {
        ctx.clearRect(0, 0, width, height);
        particlesArray.forEach(p => {
          p.update();
          p.draw();
        });
        animationRef.current = requestAnimationFrame(animate);
      }

      const handleResize = () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        init();
      };

      window.addEventListener('resize', handleResize);
      init();
      animate();

      return () => {
        window.removeEventListener('resize', handleResize);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    } catch (err) {
      setError(err.message);
    }
  }, []);

  return { canvasRef, error };
}

export default useParticles;
