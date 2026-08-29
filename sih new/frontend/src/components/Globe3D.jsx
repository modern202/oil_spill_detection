import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Globe3D({ onSelectIncident, timeSteps, showForecast, showHindcast }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 0, 195);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const earthGroup = new THREE.Group();
    scene.add(earthGroup);

    // NASA Satellite Earth Surface
    const textureLoader = new THREE.TextureLoader();
    const earthMap = textureLoader.load(
      "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg"
    );
    const nightMap = textureLoader.load(
      "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_lights_2048.png"
    );

    const globeGeo = new THREE.SphereGeometry(66, 64, 64);
    const globeMat = new THREE.MeshStandardMaterial({
      map: earthMap,
      color: new THREE.Color(0x0a192f),
      emissive: new THREE.Color(0x0ea5e9),
      emissiveMap: nightMap,
      emissiveIntensity: 1.4,
      roughness: 0.75,
      metalness: 0.15,
    });
    const globeMesh = new THREE.Mesh(globeGeo, globeMat);
    earthGroup.add(globeMesh);

    // Atmospheric Glow Rim
    const atmosGeo = new THREE.SphereGeometry(68.2, 48, 48);
    const atmosMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.18,
      side: THREE.BackSide,
    });
    earthGroup.add(new THREE.Mesh(atmosGeo, atmosMat));

    const latLonToVector3 = (lat, lon, radius) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      );
    };

    // ── RENDER ALL HINDCAST & FORECAST RED BEACONS ON 3D GLOBE ──
    const steps = timeSteps || {
      "-24h": { lat: 28.57908, lon: -89.33227 },
      "-12h": { lat: 28.65380, lon: -89.27570 },
      "NOW": { lat: 28.72856, lon: -89.21910 },
      "+12h": { lat: 28.84850, lon: -89.03910 },
      "+24h": { lat: 28.96850, lon: -88.85910 },
    };

    Object.entries(steps).forEach(([key, val]) => {
      const isNow = key === "NOW";
      const isHindcast = key.startsWith("-");
      const isForecast = key.startsWith("+");

      if ((isHindcast && !showHindcast) || (isForecast && !showForecast)) return;

      const pos = latLonToVector3(val.lat, val.lon, 66.8);
      const nodeGeo = new THREE.SphereGeometry(isNow ? 1.8 : 1.1, 16, 16);
      const nodeMat = new THREE.MeshBasicMaterial({
        color: isNow ? 0xffffff : isHindcast ? 0xef4444 : 0xf43f5e,
      });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.copy(pos);
      earthGroup.add(nodeMesh);

      // Add halo ring on active NOW spot
      if (isNow) {
        const ringGeo = new THREE.RingGeometry(1.8, 3.8, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0xf43f5e,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.9,
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.copy(pos);
        ring.lookAt(pos.clone().multiplyScalar(2));
        earthGroup.add(ring);
      }
    });

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x030712, 1.5);
    scene.add(ambientLight);
    const keyLight = new THREE.DirectionalLight(0x38bdf8, 2.0);
    keyLight.position.set(130, 80, 120);
    scene.add(keyLight);

    earthGroup.rotation.y = -1.55;
    earthGroup.rotation.x = 0.35;

    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };

    const onMouseDown = (e) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;
      earthGroup.rotation.y += dx * 0.005;
      earthGroup.rotation.x += dy * 0.005;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => (isDragging = false);

    const dom = renderer.domElement;
    dom.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!isDragging) {
        earthGroup.rotation.y += 0.0028;
      }
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      dom.removeEventListener("mousedown", onMouseDown);
      cancelAnimationFrame(animId);
      if (container && renderer.domElement) container.removeChild(renderer.domElement);
      globeGeo.dispose();
      globeMat.dispose();
      atmosGeo.dispose();
      atmosMat.dispose();
      renderer.dispose();
    };
  }, [timeSteps, showForecast, showHindcast]);

  return (
    <div className="relative w-full h-full bg-[#020617] rounded-2xl overflow-hidden border border-slate-800/90 flex items-center justify-center select-none">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      <button
        onClick={onSelectIncident}
        className="absolute bottom-4 right-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs font-mono flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-transform active:scale-95 z-20"
      >
        <span>🎯 SWITCH TO TACTICAL GIS MAP</span>
      </button>
    </div>
  );
}