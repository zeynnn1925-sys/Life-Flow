import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface LifeFlow3DCanvasProps {
  className?: string;
}

export const LifeFlow3DCanvas: React.FC<LifeFlow3DCanvasProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Detect software-rendered WebGL to optimize frame pacing and pixel ratio
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0c0d12, 0.045);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 7.5);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // Lighting rig (Warm key + Cool fill + Ambient rim)
    const keyLight = new THREE.DirectionalLight(0xffeedd, 2.2);
    keyLight.position.set(4, 5, 4);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x7090b0, 1.2);
    fillLight.position.set(-4, -3, -2);
    scene.add(fillLight);

    const amberLight = new THREE.PointLight(0xc8a27c, 3.5, 12);
    amberLight.position.set(0, 1.5, 2);
    scene.add(amberLight);

    const hemiLight = new THREE.HemisphereLight(0xfff5ea, 0x14161f, 0.9);
    scene.add(hemiLight);

    // Central Hero 3D Group: The "LifeFlow Orb & Gyroscope"
    const heroGroup = new THREE.Group();
    scene.add(heroGroup);

    // Part 1: Outer Celestial Gyroscope Ring (representing Time & Routines)
    const ring1Geo = new THREE.TorusGeometry(2.1, 0.035, 16, 100);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xc8a27c,
      metalness: 0.9,
      roughness: 0.22,
    });
    const ring1 = new THREE.Mesh(ring1Geo, goldMat);
    heroGroup.add(ring1);

    // Part 2: Middle Inclined Gyroscope Ring (representing Financial Growth)
    const ring2Geo = new THREE.TorusGeometry(1.65, 0.03, 16, 80);
    const bronzeMat = new THREE.MeshStandardMaterial({
      color: 0xdfb489,
      metalness: 0.85,
      roughness: 0.3,
    });
    const ring2 = new THREE.Mesh(ring2Geo, bronzeMat);
    ring2.rotation.x = Math.PI / 3;
    heroGroup.add(ring2);

    // Part 3: Inner Fast Gyroscope Ring (representing Focus & Flow)
    const ring3Geo = new THREE.TorusGeometry(1.25, 0.025, 16, 64);
    const emeraldMat = new THREE.MeshStandardMaterial({
      color: 0x4ade80,
      metalness: 0.6,
      roughness: 0.2,
      emissive: 0x166534,
      emissiveIntensity: 0.4,
    });
    const ring3 = new THREE.Mesh(ring3Geo, emeraldMat);
    ring3.rotation.y = Math.PI / 4;
    heroGroup.add(ring3);

    // Part 4: Central Faceted Crystalline Core (Icosahedron)
    const coreGeo = new THREE.IcosahedronGeometry(0.72, 1);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0x1a1c24,
      emissive: 0xc8a27c,
      emissiveIntensity: 0.35,
      roughness: 0.15,
      metalness: 0.7,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    heroGroup.add(core);

    // Floating satellite node: Target Badge marker
    const sat1Geo = new THREE.SphereGeometry(0.12, 16, 16);
    const sat1Mat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.7,
      roughness: 0.2,
      metalness: 0.8,
    });
    const sat1 = new THREE.Mesh(sat1Geo, sat1Mat);
    heroGroup.add(sat1);

    const sat2Geo = new THREE.OctahedronGeometry(0.14, 0);
    const sat2Mat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.7,
      roughness: 0.2,
      metalness: 0.8,
    });
    const sat2 = new THREE.Mesh(sat2Geo, sat2Mat);
    heroGroup.add(sat2);

    // Soft Contact Radial Glow Plane at bottom
    const glowGeo = new THREE.PlaneGeometry(6, 6);
    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = 128;
    glowCanvas.height = 128;
    const ctx = glowCanvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      grad.addColorStop(0, 'rgba(200, 162, 124, 0.45)');
      grad.addColorStop(0.4, 'rgba(200, 162, 124, 0.12)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 128, 128);
    }
    const glowTex = new THREE.CanvasTexture(glowCanvas);
    glowTex.colorSpace = THREE.SRGBColorSpace;
    const glowMat = new THREE.MeshBasicMaterial({
      map: glowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.6,
    });
    const glowPlane = new THREE.Mesh(glowGeo, glowMat);
    glowPlane.rotation.x = -Math.PI / 2;
    glowPlane.position.y = -2.3;
    scene.add(glowPlane);

    // Fluid Orbiting Particle System (900 glowing embers/stars)
    const particleCount = isSoftwareGl ? 350 : 900;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleScales = new Float32Array(particleCount);
    const particleAngles = new Float32Array(particleCount);
    const particleRadii = new Float32Array(particleCount);
    const particleSpeeds = new Float32Array(particleCount);
    const particleHeights = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const radius = 1.3 + Math.random() * 3.2;
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 3.8;
      const speed = (0.2 + Math.random() * 0.4) * (Math.random() > 0.5 ? 1 : -1);

      particleRadii[i] = radius;
      particleAngles[i] = angle;
      particleHeights[i] = height;
      particleSpeeds[i] = speed;

      particlePositions[i * 3] = Math.cos(angle) * radius;
      particlePositions[i * 3 + 1] = height;
      particlePositions[i * 3 + 2] = Math.sin(angle) * radius;

      particleScales[i] = Math.random() * 0.04 + 0.015;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    // Circle particle texture
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 64;
    pCanvas.height = 64;
    const pCtx = pCanvas.getContext('2d');
    if (pCtx) {
      const grad = pCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255, 235, 205, 1)');
      grad.addColorStop(0.3, 'rgba(200, 162, 124, 0.8)');
      grad.addColorStop(1, 'rgba(200, 162, 124, 0)');
      pCtx.fillStyle = grad;
      pCtx.beginPath();
      pCtx.arc(32, 32, 32, 0, Math.PI * 2);
      pCtx.fill();
    }
    const pTex = new THREE.CanvasTexture(pCanvas);
    pTex.colorSpace = THREE.SRGBColorSpace;

    const particleMat = new THREE.PointsMaterial({
      size: 0.08,
      map: pTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.75,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // Mouse parallax tracking
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouse.targetX = x * 1.5;
      mouse.targetY = y * 1.2;
    };
    window.addEventListener('pointermove', handlePointerMove);

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width === 0 || height === 0) return;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Animation render loop with clock
    const clock = new THREE.Clock();
    let frameId = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Smooth mouse damping
      mouse.x += (mouse.targetX - mouse.x) * (delta * 3.5);
      mouse.y += (mouse.targetY - mouse.y) * (delta * 3.5);

      // Hero group rotation & float
      heroGroup.rotation.y = time * 0.25 + mouse.x * 0.5;
      heroGroup.rotation.x = Math.sin(time * 0.3) * 0.15 - mouse.y * 0.4;
      heroGroup.position.y = Math.sin(time * 0.8) * 0.12;

      // Inner components rotation
      ring1.rotation.z = time * 0.18;
      ring2.rotation.y = -time * 0.35;
      ring3.rotation.x = time * 0.45;
      core.rotation.y = -time * 0.2;
      core.rotation.z = time * 0.15;

      // Orbiting satellites
      sat1.position.set(
        Math.cos(time * 0.9) * 2.1,
        Math.sin(time * 0.6) * 0.5,
        Math.sin(time * 0.9) * 2.1
      );
      sat2.position.set(
        Math.cos(-time * 1.1 + 2) * 1.65,
        Math.sin(-time * 1.1) * 1.2,
        Math.sin(-time * 1.1 + 2) * 1.65
      );
      sat2.rotation.x += 0.02;
      sat2.rotation.y += 0.03;

      // Update particle positions
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        particleAngles[i] += particleSpeeds[i] * delta;
        const r = particleRadii[i] + Math.sin(time * 0.5 + i) * 0.08;
        const h = particleHeights[i] + Math.sin(time * 0.8 + i * 2) * 0.12;

        positions[i * 3] = Math.cos(particleAngles[i]) * r;
        positions[i * 3 + 1] = h;
        positions[i * 3 + 2] = Math.sin(particleAngles[i]) * r;
      }
      particleGeo.attributes.position.needsUpdate = true;
      particleSystem.rotation.y = time * 0.05 + mouse.x * 0.2;

      // Gentle camera parallax
      camera.position.x = mouse.x * 0.6;
      camera.position.y = -mouse.y * 0.4;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    // Clean up
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);

      // Dispose Three.js resources
      ring1Geo.dispose();
      ring2Geo.dispose();
      ring3Geo.dispose();
      coreGeo.dispose();
      sat1Geo.dispose();
      sat2Geo.dispose();
      glowGeo.dispose();
      particleGeo.dispose();

      goldMat.dispose();
      bronzeMat.dispose();
      emeraldMat.dispose();
      coreMat.dispose();
      sat1Mat.dispose();
      sat2Mat.dispose();
      glowMat.dispose();
      particleMat.dispose();

      glowTex.dispose();
      pTex.dispose();

      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* Three.js canvas mount point */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full z-0 pointer-events-none select-none" />

      {/* Ambient vignettes */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0c0d12] via-transparent to-transparent opacity-80 pointer-events-none z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#0c0d12] opacity-70 pointer-events-none z-10 hidden lg:block" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,transparent_35%,rgba(12,13,18,0.75)_100%)] pointer-events-none z-10" />
    </div>
  );
};

export default LifeFlow3DCanvas;
