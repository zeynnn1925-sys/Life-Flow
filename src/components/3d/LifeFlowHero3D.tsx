import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface LifeFlowHero3DProps {
  className?: string;
}

export const LifeFlowHero3D: React.FC<LifeFlowHero3DProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const width = container.clientWidth || 520;
    const height = container.clientHeight || 460;

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 3.8, 6.2);
    camera.lookAt(0, 0, 0);

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      container.appendChild(renderer.domElement);
    } catch {
      return;
    }

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const deskKeyLight = new THREE.DirectionalLight(0xfff8ee, 2.6);
    deskKeyLight.position.set(4, 8, 5);
    scene.add(deskKeyLight);

    const softFillLight = new THREE.DirectionalLight(0xa5b4fc, 1.4);
    softFillLight.position.set(-5, 4, -3);
    scene.add(softFillLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.8);
    rimLight.position.set(0, -2, -4);
    scene.add(rimLight);

    const deskGroup = new THREE.Group();
    deskGroup.position.set(0, -0.2, 0);
    scene.add(deskGroup);

    const matGeo = new THREE.BoxGeometry(4.8, 0.04, 3.4);
    const matMaterial = new THREE.MeshStandardMaterial({
      color: 0x12141a,
      roughness: 0.85,
      metalness: 0.1,
    });
    const deskMat = new THREE.Mesh(matGeo, matMaterial);
    deskMat.position.set(0, -0.04, 0);
    deskGroup.add(deskMat);

    const matBorderGeo = new THREE.BoxGeometry(4.86, 0.02, 3.46);
    const matBorderMat = new THREE.MeshStandardMaterial({
      color: 0x242833,
      roughness: 0.7,
      metalness: 0.2,
    });
    const matBorder = new THREE.Mesh(matBorderGeo, matBorderMat);
    matBorder.position.set(0, -0.06, 0);
    deskGroup.add(matBorder);

    const plannerGroup = new THREE.Group();
    plannerGroup.position.set(-0.85, 0.08, 0.1);
    plannerGroup.rotation.y = 0.14;

    const coverMat = new THREE.MeshStandardMaterial({
      color: 0x181a22,
      roughness: 0.55,
      metalness: 0.2,
    });
    const paperMat = new THREE.MeshStandardMaterial({
      color: 0xf1efe9,
      roughness: 0.9,
      metalness: 0.05,
    });

    const bottomCoverGeo = new THREE.BoxGeometry(1.85, 0.05, 2.5);
    const bottomCover = new THREE.Mesh(bottomCoverGeo, coverMat);
    bottomCover.position.set(0, 0, 0);
    plannerGroup.add(bottomCover);

    const pagesGeo = new THREE.BoxGeometry(1.8, 0.12, 2.44);
    const pages = new THREE.Mesh(pagesGeo, paperMat);
    pages.position.set(0.01, 0.085, 0);
    plannerGroup.add(pages);

    const topCoverGeo = new THREE.BoxGeometry(1.85, 0.05, 2.5);
    const topCover = new THREE.Mesh(topCoverGeo, coverMat);
    topCover.position.set(0, 0.17, 0);
    plannerGroup.add(topCover);

    const badgePlateGeo = new THREE.BoxGeometry(0.75, 0.015, 0.45);
    const badgePlateMat = new THREE.MeshPhysicalMaterial({
      color: 0x00f0ff,
      metalness: 0.85,
      roughness: 0.2,
      clearcoat: 0.8,
    });
    const badgePlate = new THREE.Mesh(badgePlateGeo, badgePlateMat);
    badgePlate.position.set(0, 0.2, 0);
    plannerGroup.add(badgePlate);

    const spineGeo = new THREE.CylinderGeometry(0.1, 0.1, 2.5, 24);
    const spineMat = new THREE.MeshStandardMaterial({
      color: 0x101217,
      roughness: 0.5,
      metalness: 0.3,
    });
    const spine = new THREE.Mesh(spineGeo, spineMat);
    spine.position.set(-0.93, 0.085, 0);
    spine.rotation.x = Math.PI / 2;
    plannerGroup.add(spine);

    const ribbonGeo = new THREE.BoxGeometry(0.08, 0.02, 1.2);
    const ribbonMat = new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      roughness: 0.4,
      metalness: 0.1,
    });
    const ribbon = new THREE.Mesh(ribbonGeo, ribbonMat);
    ribbon.position.set(0.2, 0.18, 1.1);
    ribbon.rotation.y = 0.08;
    plannerGroup.add(ribbon);

    deskGroup.add(plannerGroup);

    const cardGroup = new THREE.Group();
    cardGroup.position.set(1.15, 0.04, 0.65);
    cardGroup.rotation.y = -0.22;

    const cardBodyGeo = new THREE.BoxGeometry(1.4, 0.03, 0.88);
    const cardBodyMat = new THREE.MeshPhysicalMaterial({
      color: 0x161820,
      metalness: 0.75,
      roughness: 0.28,
      clearcoat: 0.7,
      clearcoatRoughness: 0.15,
    });
    const cardBody = new THREE.Mesh(cardBodyGeo, cardBodyMat);
    cardGroup.add(cardBody);

    const chipGeo = new THREE.BoxGeometry(0.26, 0.035, 0.2);
    const chipMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.95,
      roughness: 0.15,
    });
    const cardChip = new THREE.Mesh(chipGeo, chipMat);
    cardChip.position.set(-0.4, 0.005, -0.15);
    cardGroup.add(cardChip);

    const cardLineGeo = new THREE.BoxGeometry(0.85, 0.032, 0.06);
    const cardLineMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      metalness: 0.8,
      roughness: 0.3,
    });
    const cardLine = new THREE.Mesh(cardLineGeo, cardLineMat);
    cardLine.position.set(0.12, 0.004, 0.22);
    cardGroup.add(cardLine);

    deskGroup.add(cardGroup);

    const timerGroup = new THREE.Group();
    timerGroup.position.set(1.2, 0.16, -0.65);

    const timerCaseGeo = new THREE.CylinderGeometry(0.68, 0.72, 0.32, 48);
    const timerCaseMat = new THREE.MeshStandardMaterial({
      color: 0x222630,
      metalness: 0.88,
      roughness: 0.22,
    });
    const timerCase = new THREE.Mesh(timerCaseGeo, timerCaseMat);
    timerGroup.add(timerCase);

    const timerKnurlGeo = new THREE.TorusGeometry(0.7, 0.03, 16, 48);
    const timerKnurlMat = new THREE.MeshStandardMaterial({
      color: 0x333845,
      metalness: 0.9,
      roughness: 0.35,
    });
    const timerKnurl = new THREE.Mesh(timerKnurlGeo, timerKnurlMat);
    timerKnurl.rotation.x = Math.PI / 2;
    timerKnurl.position.y = 0.08;
    timerGroup.add(timerKnurl);

    const dialFaceGeo = new THREE.CylinderGeometry(0.58, 0.58, 0.02, 48);
    const dialFaceMat = new THREE.MeshStandardMaterial({
      color: 0x0c0e12,
      metalness: 0.3,
      roughness: 0.6,
    });
    const dialFace = new THREE.Mesh(dialFaceGeo, dialFaceMat);
    dialFace.position.y = 0.165;
    timerGroup.add(dialFace);

    const dialRingGeo = new THREE.TorusGeometry(0.52, 0.02, 16, 48);
    const dialRingMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      metalness: 0.8,
      roughness: 0.2,
    });
    const dialRing = new THREE.Mesh(dialRingGeo, dialRingMat);
    dialRing.rotation.x = Math.PI / 2;
    dialRing.position.y = 0.175;
    timerGroup.add(dialRing);

    const needlePivot = new THREE.Group();
    needlePivot.position.y = 0.18;

    const needleGeo = new THREE.BoxGeometry(0.04, 0.02, 0.42);
    const needleMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      roughness: 0.2,
      metalness: 0.6,
    });
    const needle = new THREE.Mesh(needleGeo, needleMat);
    needle.position.set(0, 0, -0.18);
    needlePivot.add(needle);

    const centerCapGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.04, 24);
    const centerCapMat = new THREE.MeshStandardMaterial({
      color: 0xd4d4d8,
      metalness: 0.9,
      roughness: 0.2,
    });
    const centerCap = new THREE.Mesh(centerCapGeo, centerCapMat);
    needlePivot.add(centerCap);

    timerGroup.add(needlePivot);

    const glassGeo = new THREE.CylinderGeometry(0.62, 0.62, 0.02, 32);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.9,
      roughness: 0.08,
      thickness: 0.4,
      ior: 1.5,
      transparent: true,
      opacity: 0.6,
    });
    const glassCover = new THREE.Mesh(glassGeo, glassMat);
    glassCover.position.y = 0.21;
    timerGroup.add(glassCover);

    deskGroup.add(timerGroup);

    const penGroup = new THREE.Group();
    penGroup.position.set(-0.95, 0.04, 1.4);
    penGroup.rotation.y = 0.35;

    const penBodyGeo = new THREE.CylinderGeometry(0.035, 0.035, 1.9, 24);
    const penBodyMat = new THREE.MeshStandardMaterial({
      color: 0x272a33,
      metalness: 0.85,
      roughness: 0.2,
    });
    const penBody = new THREE.Mesh(penBodyGeo, penBodyMat);
    penBody.rotation.z = Math.PI / 2;
    penGroup.add(penBody);

    const penClipGeo = new THREE.BoxGeometry(0.35, 0.025, 0.02);
    const penClipMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      metalness: 0.9,
      roughness: 0.2,
    });
    const penClip = new THREE.Mesh(penClipGeo, penClipMat);
    penClip.position.set(-0.6, 0.045, 0);
    penGroup.add(penClip);

    deskGroup.add(penGroup);

    const pointer = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
    };

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      pointer.targetX = nx * 0.35;
      pointer.targetY = ny * 0.25;
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newWidth = entry.contentRect.width;
        const newHeight = entry.contentRect.height;
        if (newWidth > 0 && newHeight > 0 && renderer) {
          camera.aspect = newWidth / newHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(newWidth, newHeight);
        }
      }
    });
    resizeObserver.observe(container);

    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      pointer.x += (pointer.targetX - pointer.x) * 0.045;
      pointer.y += (pointer.targetY - pointer.y) * 0.045;

      deskGroup.rotation.y = pointer.x * 0.5 + Math.sin(elapsedTime * 0.25) * 0.02;
      deskGroup.rotation.x = -pointer.y * 0.35 + Math.cos(elapsedTime * 0.2) * 0.015;

      needlePivot.rotation.y = elapsedTime * 0.35;

      if (renderer) {
        renderer.render(scene, camera);
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handlePointerMove);
      resizeObserver.disconnect();

      const disposeObj = (obj: THREE.Object3D) => {
        if (obj instanceof THREE.Mesh) {
          if (obj.geometry) obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else if (obj.material) {
            obj.material.dispose();
          }
        }
        obj.children.forEach(disposeObj);
      };

      deskGroup.children.forEach(disposeObj);
      scene.clear();

      if (renderer) {
        renderer.dispose();
        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      }
    };
  }, []);

  return (
    <div className={`relative w-full h-full flex flex-col items-center justify-center select-none ${className}`}>
      <div 
        ref={containerRef} 
        className="w-full h-[360px] sm:h-[420px] lg:h-[460px] relative"
      />
    </div>
  );
};

export default LifeFlowHero3D;
