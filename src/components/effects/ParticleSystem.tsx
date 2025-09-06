import React, { useEffect, useRef, useMemo } from "react";
import { ParticleEffect, ThemeColor } from "@/types/theme";
import { hslToString } from "@/lib/theme-utils";

interface ParticleSystemProps {
  effect: ParticleEffect;
  containerWidth?: number;
  containerHeight?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
  rotation: number;
  rotationSpeed: number;
  color: ThemeColor;
}

export function ParticleSystem({
  effect,
  containerWidth = window.innerWidth,
  containerHeight = window.innerHeight,
}: ParticleSystemProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);

  const particles = useMemo(() => {
    if (!effect.enabled) return [];

    const newParticles: Particle[] = [];
    for (let i = 0; i < effect.count; i++) {
      newParticles.push(createParticle(effect, containerWidth, containerHeight));
    }
    return newParticles;
  }, [effect, containerWidth, containerHeight]);

  useEffect(() => {
    particlesRef.current = particles;
  }, [particles]);

  useEffect(() => {
    if (!effect.enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = containerWidth;
    canvas.height = containerHeight;

    let lastTime = 0;
    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Add mild blur for fog effect
      if (effect.type === "fog") {
        ctx.filter = "blur(8px)";
      } else {
        ctx.filter = "none";
      }

      // Update and draw particles
      particlesRef.current.forEach((particle, index) => {
        updateParticle(particle, deltaTime, effect, containerWidth, containerHeight);
        drawParticle(ctx, particle, effect);

        // Remove dead particles and create new ones
        if (particle.life <= 0) {
          particlesRef.current[index] = createParticle(effect, containerWidth, containerHeight);
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [effect, containerWidth, containerHeight]);

  if (!effect.enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        width: containerWidth,
        height: containerHeight,
        opacity: effect.type === "fog" ? 0.35 : 0.8,
      }}
    />
  );
}

function createParticle(effect: ParticleEffect, width: number, height: number): Particle {
  const size = Math.random() * (effect.size.max - effect.size.min) + effect.size.min;
  const opacity = Math.random() * (effect.opacity.max - effect.opacity.min) + effect.opacity.min;
  const life = effect.type === "fog" ? Math.random() * 15000 + 10000 : Math.random() * 5000 + 2000;

  // Convert direction from degrees to radians
  const directionRad = (effect.direction * Math.PI) / 180;
  const speed = effect.speed;

  let x, y, vx, vy;

  switch (effect.type) {
    case "snow":
      x = Math.random() * width;
      y = -size;
      vx = Math.sin(directionRad) * speed + (Math.random() - 0.5) * effect.wind;
      vy = Math.cos(directionRad) * speed;
      break;

    case "rain":
      x = Math.random() * width;
      y = -size;
      vx = Math.sin(directionRad) * speed * 2 + effect.wind;
      vy = Math.cos(directionRad) * speed * 3;
      break;

    case "dust":
      x = Math.random() * width;
      y = Math.random() * height;
      vx = (Math.random() - 0.5) * speed + effect.wind;
      vy = (Math.random() - 0.5) * speed * 0.5;
      break;

    case "sparks":
      x = Math.random() * width;
      y = height + size;
      vx = (Math.random() - 0.5) * speed * 2;
      vy = -Math.random() * speed * 2;
      break;

    case "geometric":
      x = Math.random() * width;
      y = Math.random() * height;
      vx = Math.sin(directionRad) * speed + (Math.random() - 0.5) * 0.5;
      vy = Math.cos(directionRad) * speed + (Math.random() - 0.5) * 0.5;
      break;

    case "fog":
      x = Math.random() * width;
      y = Math.random() * height;
      vx = (Math.random() - 0.5) * speed * 0.2 + effect.wind * 0.05;
      vy = (Math.random() - 0.5) * speed * 0.2;
      break;

    default:
      x = Math.random() * width;
      y = Math.random() * height;
      vx = (Math.random() - 0.5) * speed;
      vy = (Math.random() - 0.5) * speed;
      break;
  }

  return {
    x,
    y,
    vx,
    vy,
    size,
    opacity,
    life,
    maxLife: life,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.02,
    color: effect.color,
  };
}

function updateParticle(
  particle: Particle,
  deltaTime: number,
  effect: ParticleEffect,
  width: number,
  height: number,
) {
  const dt = deltaTime / 16.67; // Normalize to 60fps

  // Update position
  particle.x += particle.vx * dt;
  particle.y += particle.vy * dt;

  // Update rotation
  particle.rotation += particle.rotationSpeed * dt;

  // Update life and opacity
  particle.life -= deltaTime;
  const lifeRatio = particle.life / particle.maxLife;
  particle.opacity = Math.max(
    0,
    lifeRatio * (Math.random() * (effect.opacity.max - effect.opacity.min) + effect.opacity.min),
  );

  // Apply physics based on particle type
  switch (effect.type) {
    case "snow":
      particle.vx += Math.sin(Date.now() * 0.001 + particle.x * 0.01) * 0.01;
      particle.vy += 0.01; // Gravity
      break;

    case "rain":
      particle.vy += 0.05; // Stronger gravity
      break;

    case "dust":
      particle.vx *= 0.999; // Air resistance
      particle.vy *= 0.999;
      particle.vx += (Math.random() - 0.5) * 0.01; // Brownian motion
      particle.vy += (Math.random() - 0.5) * 0.01;
      break;

    case "sparks":
      particle.vy += 0.02; // Gravity
      particle.vx *= 0.995; // Air resistance
      particle.vy *= 0.995;
      break;

    case "geometric":
      // Orbital motion
      const centerX = width / 2;
      const centerY = height / 2;
      const angle = Math.atan2(particle.y - centerY, particle.x - centerX);
      const radius = Math.sqrt(
        Math.pow(particle.x - centerX, 2) + Math.pow(particle.y - centerY, 2),
      );
      const newAngle = angle + 0.005;
      particle.x = centerX + Math.cos(newAngle) * radius;
      particle.y = centerY + Math.sin(newAngle) * radius;
      break;

    case "fog":
      // Slow drift
      particle.vx *= 0.9995;
      particle.vy *= 0.9995;
      break;
  }

  // Wrap around screen boundaries
  if (particle.x < -particle.size) particle.x = width + particle.size;
  if (particle.x > width + particle.size) particle.x = -particle.size;

  // Reset particles that go off screen
  if (effect.type === "snow" || effect.type === "rain") {
    if (particle.y > height + particle.size) {
      particle.y = -particle.size;
      particle.x = Math.random() * width;
      particle.life = particle.maxLife;
    }
  } else if (effect.type === "sparks") {
    if (particle.y < -particle.size) {
      particle.y = height + particle.size;
      particle.x = Math.random() * width;
      particle.life = particle.maxLife;
    }
  } else {
    if (particle.y < -particle.size) particle.y = height + particle.size;
    if (particle.y > height + particle.size) particle.y = -particle.size;
  }
}

function drawParticle(ctx: CanvasRenderingContext2D, particle: Particle, effect: ParticleEffect) {
  ctx.save();

  ctx.globalAlpha = effect.type === "fog" ? particle.opacity * 0.5 : particle.opacity;
  ctx.translate(particle.x, particle.y);
  ctx.rotate(particle.rotation);

  const colorString = hslToString(particle.color);

  switch (effect.type) {
    case "snow":
      ctx.fillStyle = colorString;
      ctx.beginPath();
      ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
      ctx.fill();
      break;

    case "rain":
      ctx.strokeStyle = colorString;
      ctx.lineWidth = particle.size;
      ctx.beginPath();
      ctx.moveTo(0, -particle.size * 3);
      ctx.lineTo(0, particle.size * 3);
      ctx.stroke();
      break;

    case "dust":
      ctx.fillStyle = colorString;
      ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
      break;

    case "sparks":
      // Create spark trail effect
      const gradient = ctx.createLinearGradient(0, -particle.size * 2, 0, particle.size * 2);
      gradient.addColorStop(0, colorString);
      gradient.addColorStop(1, hslToString({ ...particle.color, a: 0 }));

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(0, -particle.size * 2);
      ctx.lineTo(-particle.size / 2, particle.size);
      ctx.lineTo(particle.size / 2, particle.size);
      ctx.closePath();
      ctx.fill();
      break;

    case "geometric":
      ctx.strokeStyle = colorString;
      ctx.lineWidth = 1;
      ctx.beginPath();

      // Draw hexagon
      const sides = 6;
      for (let i = 0; i < sides; i++) {
        const angle = (i * Math.PI * 2) / sides;
        const x = Math.cos(angle) * particle.size;
        const y = Math.sin(angle) * particle.size;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.stroke();
      break;

    case "fog":
      const radial = ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size * 4);
      radial.addColorStop(0, hslToString({ ...particle.color, a: 0.08 }));
      radial.addColorStop(1, hslToString({ ...particle.color, a: 0 }));
      ctx.fillStyle = radial;
      ctx.beginPath();
      ctx.arc(0, 0, particle.size * 4, 0, Math.PI * 2);
      ctx.fill();
      break;

    default:
      ctx.fillStyle = colorString;
      ctx.beginPath();
      ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
      ctx.fill();
      break;
  }

  ctx.restore();
}

export default ParticleSystem;
