import { useEffect, useRef, useState } from "react";

interface AdvancedEcosystemCanvasProps {
  simulationState: {
    co2Levels: number;
    forestCover: number;
    temperature: number;
    renewableEnergy: number;
    population: number;
    industryLevel: number;
  };
  metrics: {
    speciesCount: number;
    airQuality: string;
    carbonStorage: number;
    biodiversityIndex: number;
    sustainabilityScore: number;
  };
  isRunning: boolean;
}

interface EcosystemElement {
  x: number;
  y: number;
  type: 'tree' | 'animal' | 'renewable' | 'industry';
  health: number;
  age: number;
  size: number;
  color: string;
  animationOffset: number;
  subtype?: 'wind' | 'solar'; // For renewable energy deterministic rendering
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: 'pollution' | 'clean';
}

export default function AdvancedEcosystemCanvas({
  simulationState,
  metrics,
  isRunning
}: AdvancedEcosystemCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const elementsRef = useRef<EcosystemElement[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const frameCountRef = useRef(0);
  const groundTextureRef = useRef<HTMLCanvasElement | null>(null);
  
  // Refs to avoid stale closures in animation loop
  const simulationStateRef = useRef(simulationState);
  const metricsRef = useRef(metrics);
  
  // Particle pool for performance
  const maxParticles = 100;

  // Update refs to avoid stale closures
  useEffect(() => {
    simulationStateRef.current = simulationState;
    metricsRef.current = metrics;
  }, [simulationState, metrics]);

  // Initialize ecosystem elements based on current state
  const initializeElements = () => {
    const elements: EcosystemElement[] = [];
    
    // Trees based on forest cover
    const treeCount = Math.floor((simulationState.forestCover / 100) * 30);
    for (let i = 0; i < treeCount; i++) {
      elements.push({
        x: Math.random() * 780 + 10,
        y: Math.random() * 200 + 200,
        type: 'tree',
        health: calculateTreeHealth(),
        age: Math.random() * 100,
        size: Math.random() * 15 + 15,
        color: getTreeColor(),
        animationOffset: Math.random() * Math.PI * 2
      });
    }

    // Animals based on biodiversity
    const animalCount = Math.floor((metrics.biodiversityIndex / 100) * 15);
    for (let i = 0; i < animalCount; i++) {
      elements.push({
        x: Math.random() * 780 + 10,
        y: Math.random() * 100 + 250,
        type: 'animal',
        health: calculateAnimalHealth(),
        age: Math.random() * 50,
        size: Math.random() * 8 + 5,
        color: getAnimalColor(),
        animationOffset: Math.random() * Math.PI * 2
      });
    }

    // Renewable energy sources
    const renewableCount = Math.floor((simulationState.renewableEnergy / 100) * 8);
    for (let i = 0; i < renewableCount; i++) {
      elements.push({
        x: Math.random() * 780 + 10,
        y: Math.random() * 150 + 100,
        type: 'renewable',
        health: 1,
        age: 0,
        size: 20,
        color: '#3b82f6',
        animationOffset: Math.random() * Math.PI * 2,
        subtype: i % 2 === 0 ? 'wind' : 'solar' // Deterministic alternating types
      });
    }

    // Industry sources
    const industryCount = Math.floor((simulationState.industryLevel / 100) * 6);
    for (let i = 0; i < industryCount; i++) {
      elements.push({
        x: Math.random() * 780 + 10,
        y: Math.random() * 120 + 150,
        type: 'industry',
        health: 1,
        age: 0,
        size: 25,
        color: '#6b7280',
        animationOffset: 0
      });
    }

    elementsRef.current = elements;
  };

  const calculateTreeHealth = (): number => {
    const tempFactor = Math.max(0, 2 - simulationState.temperature) / 2;
    const co2Factor = Math.max(0, (450 - simulationState.co2Levels) / 100);
    return Math.min(1, (tempFactor + co2Factor) / 2);
  };

  const calculateAnimalHealth = (): number => {
    const biodiversityFactor = metrics.biodiversityIndex / 100;
    const tempFactor = Math.max(0, (3 - Math.abs(simulationState.temperature - 1)) / 3);
    return Math.min(1, (biodiversityFactor + tempFactor) / 2);
  };

  const getTreeColor = (): string => {
    const health = calculateTreeHealth();
    if (health > 0.8) return '#22c55e'; // Vibrant green
    if (health > 0.6) return '#65a30d'; // Yellow-green
    if (health > 0.4) return '#ca8a04'; // Yellow
    return '#dc2626'; // Red (unhealthy)
  };

  const getAnimalColor = (): string => {
    const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const getSkyColor = (): string => {
    const pollution = (simulationStateRef.current.co2Levels - 350) / 150;
    if (pollution > 0.7) return '#b8860b'; // Heavily polluted
    if (pollution > 0.4) return '#dda0dd'; // Moderately polluted
    if (pollution > 0.2) return '#f0e68c'; // Slightly polluted
    return '#87ceeb'; // Clean sky
  };

  // Precompute ground texture once
  const createGroundTexture = (width: number, height: number) => {
    if (groundTextureRef.current) return groundTextureRef.current;
    
    const groundCanvas = document.createElement('canvas');
    groundCanvas.width = width;
    groundCanvas.height = height * 0.3;
    const groundCtx = groundCanvas.getContext('2d')!;
    
    // Ground gradient
    const groundGradient = groundCtx.createLinearGradient(0, 0, 0, groundCanvas.height);
    groundGradient.addColorStop(0, '#84cc16');
    groundGradient.addColorStop(1, '#365314');
    
    groundCtx.fillStyle = groundGradient;
    groundCtx.fillRect(0, 0, groundCanvas.width, groundCanvas.height);

    // Add static texture to the ground (precomputed once)
    groundCtx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * groundCanvas.width;
      const y = Math.random() * groundCanvas.height;
      groundCtx.fillRect(x, y, 2, 1);
    }
    
    groundTextureRef.current = groundCanvas;
    return groundCanvas;
  };

  const drawBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Sky gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, height * 0.7);
    skyGradient.addColorStop(0, getSkyColor());
    skyGradient.addColorStop(1, '#e0f2fe');
    
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, width, height * 0.7);

    // Draw precomputed ground texture
    const groundTexture = createGroundTexture(width, height);
    ctx.drawImage(groundTexture, 0, height * 0.7);
  };

  const drawTree = (ctx: CanvasRenderingContext2D, element: EcosystemElement) => {
    const swayAmount = Math.sin(frameCountRef.current * 0.02 + element.animationOffset) * 2;
    
    ctx.save();
    ctx.translate(element.x + swayAmount, element.y);
    
    // Tree trunk
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(-3, 0, 6, 25);
    
    // Tree crown - size and color based on health
    ctx.fillStyle = element.color;
    ctx.globalAlpha = 0.7 + element.health * 0.3;
    ctx.beginPath();
    ctx.arc(0, -10, element.size * element.health, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  };

  const drawAnimal = (ctx: CanvasRenderingContext2D, element: EcosystemElement) => {
    // Animals move in gentle patterns
    const moveX = Math.sin(frameCountRef.current * 0.01 + element.animationOffset) * 20;
    const moveY = Math.cos(frameCountRef.current * 0.015 + element.animationOffset) * 5;
    
    ctx.save();
    ctx.translate(element.x + moveX, element.y + moveY);
    
    // Simple animal body
    ctx.fillStyle = element.color;
    ctx.globalAlpha = element.health;
    ctx.beginPath();
    ctx.arc(0, 0, element.size, 0, Math.PI * 2);
    ctx.fill();
    
    // Eyes
    ctx.fillStyle = '#000';
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(-3, -2, 1, 0, Math.PI * 2);
    ctx.arc(3, -2, 1, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  };

  const drawRenewableEnergy = (ctx: CanvasRenderingContext2D, element: EcosystemElement) => {
    ctx.save();
    ctx.translate(element.x, element.y);
    
    // Rotating wind turbine or solar panel
    const rotation = frameCountRef.current * 0.05 + element.animationOffset;
    
    if (element.subtype === 'wind') {
      // Wind turbine
      ctx.rotate(rotation);
      ctx.strokeStyle = element.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, -20);
      ctx.lineTo(0, 20);
      ctx.stroke();
      
      // Blades
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        ctx.save();
        ctx.rotate((i * Math.PI * 2) / 3);
        ctx.beginPath();
        ctx.moveTo(0, -20);
        ctx.lineTo(0, -35);
        ctx.stroke();
        ctx.restore();
      }
    } else {
      // Solar panel
      ctx.fillStyle = '#1e40af';
      ctx.fillRect(-15, -8, 30, 16);
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 1;
      for (let i = -12; i <= 12; i += 6) {
        ctx.beginPath();
        ctx.moveTo(i, -8);
        ctx.lineTo(i, 8);
        ctx.stroke();
      }
    }
    
    ctx.restore();
  };

  const drawIndustry = (ctx: CanvasRenderingContext2D, element: EcosystemElement) => {
    ctx.save();
    ctx.translate(element.x, element.y);
    
    // Factory building
    ctx.fillStyle = element.color;
    ctx.fillRect(-20, -15, 40, 30);
    
    // Smokestacks
    ctx.fillStyle = '#4b5563';
    ctx.fillRect(-15, -25, 8, 15);
    ctx.fillRect(7, -25, 8, 15);
    
    // Windows
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(-10, -10, 6, 6);
    ctx.fillRect(4, -10, 6, 6);
    
    ctx.restore();
  };

  const updateParticles = () => {
    // Add pollution particles from industry (with particle pooling)
    const industries = elementsRef.current.filter(el => el.type === 'industry');
    industries.forEach(industry => {
      if (Math.random() < 0.2 && particlesRef.current.length < maxParticles) { // Reduced spawn rate and added limit
        particlesRef.current.push({
          x: industry.x + (Math.random() - 0.5) * 20,
          y: industry.y - 25,
          vx: (Math.random() - 0.5) * 2,
          vy: -Math.random() * 2 - 1,
          life: 0,
          maxLife: 120,
          color: '#6b7280',
          size: Math.random() * 4 + 2,
          type: 'pollution'
        });
      }
    });

    // Add clean particles from renewable energy (with particle pooling)
    const renewables = elementsRef.current.filter(el => el.type === 'renewable');
    renewables.forEach(renewable => {
      if (Math.random() < 0.1 && particlesRef.current.length < maxParticles) { // Reduced spawn rate and added limit
        particlesRef.current.push({
          x: renewable.x + (Math.random() - 0.5) * 10,
          y: renewable.y,
          vx: (Math.random() - 0.5) * 1,
          vy: -Math.random() * 1 - 0.5,
          life: 0,
          maxLife: 80,
          color: '#10b981',
          size: Math.random() * 3 + 1,
          type: 'clean'
        });
      }
    });

    // Update existing particles
    particlesRef.current = particlesRef.current.filter(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life++;
      
      return particle.life < particle.maxLife;
    });
  };

  const drawParticles = (ctx: CanvasRenderingContext2D) => {
    particlesRef.current.forEach(particle => {
      const alpha = 1 - (particle.life / particle.maxLife);
      ctx.fillStyle = particle.color;
      ctx.globalAlpha = alpha * 0.7;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  };

  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    drawBackground(ctx, canvas.width, canvas.height);

    // Update and draw particles if simulation is running
    if (isRunning) {
      updateParticles();
      frameCountRef.current += 1;
    }

    // Draw ecosystem elements
    elementsRef.current.forEach(element => {
      switch (element.type) {
        case 'tree':
          drawTree(ctx, element);
          break;
        case 'animal':
          drawAnimal(ctx, element);
          break;
        case 'renewable':
          drawRenewableEnergy(ctx, element);
          break;
        case 'industry':
          drawIndustry(ctx, element);
          break;
      }
    });

    // Draw particles
    drawParticles(ctx);

    // Only continue animation if still running
    if (isRunning) {
      animationRef.current = requestAnimationFrame(animate);
    }
  };

  // Initialize elements when simulation state changes
  useEffect(() => {
    initializeElements();
  }, [simulationState, metrics]);

  // Start/stop animation
  useEffect(() => {
    if (canvasRef.current && isRunning) {
      animate();
    } else if (!isRunning && animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning]);

  return (
    <div className="relative border rounded-lg overflow-hidden bg-gradient-to-b from-blue-100 to-green-100 dark:from-blue-900/20 dark:to-green-900/20">
      <canvas 
        ref={canvasRef}
        width={800}
        height={400}
        className="w-full h-full"
        data-testid="canvas-ecosystem-simulation"
      />
      
      {/* Overlay information */}
      <div className="absolute top-4 left-4 bg-black/70 text-white p-3 rounded-lg text-sm">
        <div className="space-y-1">
          <div>Species: {metrics.speciesCount}</div>
          <div>Biodiversity: {metrics.biodiversityIndex}%</div>
          <div>Air Quality: {metrics.airQuality}</div>
          <div>Temperature: +{simulationState.temperature}°C</div>
        </div>
      </div>
      
      {/* Performance indicator */}
      {isRunning && (
        <div className="absolute top-4 right-4 bg-green-500/80 text-white px-2 py-1 rounded text-xs">
          Simulating... ({frameCountRef.current} frames)
        </div>
      )}
      
      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-black/70 text-white p-3 rounded-lg text-xs">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Trees</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Animals</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
            <span>Renewable</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <span>Industry</span>
          </div>
        </div>
      </div>
    </div>
  );
}