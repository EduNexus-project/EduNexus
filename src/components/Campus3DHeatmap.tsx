import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Compass,
  Eye,
  Maximize2,
  ShieldAlert,
  Info,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
  Layers,
  Building2,
} from 'lucide-react';

interface ZoneData {
  id: string;
  name: string;
  code: string;
  attendancePct: number;
  fnCount: number;
  anCount: number;
  truancyFlag: boolean;
  statusText: string;
  details: string;
  position: [number, number, number];
  color: number;
}

const CAMPUS_ZONES: ZoneData[] = [
  {
    id: 'cs_wing',
    name: 'Computer Science & AI Complex',
    code: 'BLDG-A',
    attendancePct: 88,
    fnCount: 142,
    anCount: 125,
    truancyFlag: true,
    statusText: '1 Truancy Flag (Mateo Rossi)',
    details: 'Houses distributed systems labs, GPU cluster basement, and honors capstone studios.',
    position: [-6, 0, -4],
    color: 0x38bdf8, // Sky Blue
  },
  {
    id: 'ds_wing',
    name: 'Data Science & Machine Learning Wing',
    code: 'BLDG-B',
    attendancePct: 94,
    fnCount: 110,
    anCount: 106,
    truancyFlag: false,
    statusText: 'Optimal Operations',
    details: 'Predictive analytics facilities, high-throughput simulation pods, and faculty offices.',
    position: [6, 0, -5],
    color: 0x34d399, // Emerald
  },
  {
    id: 'it_hall',
    name: 'Information Systems & Telecom Hall',
    code: 'BLDG-C',
    attendancePct: 96,
    fnCount: 88,
    anCount: 86,
    truancyFlag: false,
    statusText: 'All Checkpoints Normal',
    details: 'Enterprise networking core, server room annex, and main testing auditorium.',
    position: [7, 0, 4],
    color: 0x10b981, // Green
  },
  {
    id: 'security_gate',
    name: 'Campus Main Gate 2 & Turnstiles',
    code: 'GATE-02',
    attendancePct: 65,
    fnCount: 340,
    anCount: 221,
    truancyFlag: true,
    statusText: 'CRITICAL: Unauthorized Exit Detected',
    details: 'Turnstile gate sensors flagged unbadged mid-day departure at 12:40 PM. CCTV active.',
    position: [-4, 0, 6],
    color: 0xf43f5e, // Rose / Red Alert
  },
  {
    id: 'library_quad',
    name: 'Central Academic Quad & Library',
    code: 'QUAD-01',
    attendancePct: 91,
    fnCount: 195,
    anCount: 182,
    truancyFlag: false,
    statusText: 'High Study Flow',
    details: 'Digital media center, collaborative group rooms, and principal administrative suite.',
    position: [0, 0, 0],
    color: 0x818cf8, // Indigo
  },
];

export const Campus3DHeatmap: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedZone, setSelectedZone] = useState<ZoneData>(CAMPUS_ZONES[0]);
  const [isDockCollapsed, setIsDockCollapsed] = useState<boolean>(false);
  const [heatmapMode, setHeatmapMode] = useState<'attendance' | 'truancy' | 'sessions'>('attendance');
  const [autoRotate, setAutoRotate] = useState<boolean>(true);

  // References for camera transitions inside animation loop
  const cameraTargetRef = useRef(new THREE.Vector3(0, 0, 0));
  const cameraPosTargetRef = useRef(new THREE.Vector3(0, 18, 22));

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 580;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060b14);
    scene.fog = new THREE.FogExp2(0x060b14, 0.022);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 18, 22);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 2. Studio Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x0f172a, 0.8);
    scene.add(hemiLight);

    const dirKeyLight = new THREE.DirectionalLight(0xfff5ea, 1.8);
    dirKeyLight.position.set(15, 25, 12);
    dirKeyLight.castShadow = true;
    dirKeyLight.shadow.mapSize.width = 1024;
    dirKeyLight.shadow.mapSize.height = 1024;
    dirKeyLight.shadow.camera.near = 0.5;
    dirKeyLight.shadow.camera.far = 60;
    dirKeyLight.shadow.camera.left = -20;
    dirKeyLight.shadow.camera.right = 20;
    dirKeyLight.shadow.camera.top = 20;
    dirKeyLight.shadow.camera.bottom = -20;
    dirKeyLight.shadow.bias = -0.0004;
    scene.add(dirKeyLight);

    const rimLight = new THREE.DirectionalLight(0x6366f1, 1.2);
    rimLight.position.set(-15, 15, -15);
    scene.add(rimLight);

    // 3. Procedural Ground Plane with High-Tech Grid
    const groundGeo = new THREE.PlaneGeometry(80, 80);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x09101d,
      roughness: 0.85,
      metalness: 0.2,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid Floor
    const gridHelper = new THREE.GridHelper(60, 40, 0x1e293b, 0x0f172a);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // 4. Procedural Building Groups (3-8 composite parts each)
    const buildingMeshes: THREE.Group[] = [];
    const interactiveMeshes: THREE.Object3D[] = [];

    CAMPUS_ZONES.forEach((zone) => {
      const group = new THREE.Group();
      group.position.set(zone.position[0], zone.position[1], zone.position[2]);
      group.userData = { zone };

      // (a) Base Plinth
      const plinthGeo = new THREE.BoxGeometry(4.6, 0.4, 4.6);
      const plinthMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.7,
        metalness: 0.3,
      });
      const plinth = new THREE.Mesh(plinthGeo, plinthMat);
      plinth.position.y = 0.2;
      plinth.receiveShadow = true;
      group.add(plinth);

      // (b) Main Tower Body
      const height = zone.id === 'library_quad' ? 6 : zone.id === 'security_gate' ? 2.5 : 4.8;
      const towerGeo = new THREE.BoxGeometry(3.6, height, 3.6);
      const towerMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.4,
        metalness: 0.6,
      });
      const tower = new THREE.Mesh(towerGeo, towerMat);
      tower.position.y = 0.4 + height / 2;
      tower.castShadow = true;
      tower.receiveShadow = true;
      group.add(tower);

      // (c) Glowing Heatmap Accent Glass Panels
      const glassHeight = height * 0.75;
      const glassGeo = new THREE.BoxGeometry(3.7, glassHeight, 3.7);
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: zone.color,
        emissive: zone.color,
        emissiveIntensity: zone.truancyFlag ? 0.65 : 0.25,
        roughness: 0.1,
        metalness: 0.2,
        transmission: 0.6,
        transparent: true,
        opacity: 0.85,
      });
      const glass = new THREE.Mesh(glassGeo, glassMat);
      glass.position.y = 0.4 + height / 2;
      group.add(glass);

      // (d) Rooftop HVAC & Antenna
      const roofGeo = new THREE.BoxGeometry(2.2, 0.5, 2.2);
      const roofMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.y = 0.4 + height + 0.25;
      group.add(roof);

      const mastGeo = new THREE.CylinderGeometry(0.04, 0.08, 1.8, 8);
      const mastMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
      const mast = new THREE.Mesh(mastGeo, mastMat);
      mast.position.y = 0.4 + height + 0.5 + 0.9;
      group.add(mast);

      // (e) Floating Beacon Marker on Top
      const beaconGeo = new THREE.OctahedronGeometry(0.35);
      const beaconMat = new THREE.MeshStandardMaterial({
        color: zone.color,
        emissive: zone.color,
        emissiveIntensity: 0.9,
      });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.y = 0.4 + height + 2.5;
      group.add(beacon);

      // (f) Ground Contact Shadow
      const shadowGeo = new THREE.PlaneGeometry(5.5, 5.5);
      const shadowMat = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
      });
      const shadow = new THREE.Mesh(shadowGeo, shadowMat);
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.y = 0.02;
      group.add(shadow);

      scene.add(group);
      buildingMeshes.push(group);
      interactiveMeshes.push(tower, glass);
    });

    // 5. Raycasting for Click / Hover Inspection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveMeshes, true);

      if (intersects.length > 0) {
        let parentGroup: THREE.Object3D | null = intersects[0].object;
        while (parentGroup && !parentGroup.userData?.zone) {
          parentGroup = parentGroup.parent;
        }
        if (parentGroup && parentGroup.userData?.zone) {
          const clickedZone = parentGroup.userData.zone as ZoneData;
          setSelectedZone(clickedZone);
          // Focus camera toward selected building
          cameraTargetRef.current.set(clickedZone.position[0], 2, clickedZone.position[2]);
          cameraPosTargetRef.current.set(
            clickedZone.position[0] + 5,
            clickedZone.position[1] + 8,
            clickedZone.position[2] + 9
          );
        }
      }
    };

    renderer.domElement.addEventListener('click', handleClick);

    // 6. Animation Loop with Smooth Exponential Damping
    let animationFrameId: number;
    let angle = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Smooth camera interpolation
      camera.position.x = THREE.MathUtils.damp(camera.position.x, cameraPosTargetRef.current.x, 3.5, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, cameraPosTargetRef.current.y, 3.5, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, cameraPosTargetRef.current.z, 3.5, delta);
      camera.lookAt(cameraTargetRef.current);

      // Subtle slow auto-orbit when idle
      if (autoRotate && cameraPosTargetRef.current.y > 15) {
        angle += delta * 0.15;
        cameraPosTargetRef.current.x = Math.sin(angle) * 22;
        cameraPosTargetRef.current.z = Math.cos(angle) * 22;
      }

      // Rotate beacons
      buildingMeshes.forEach((g) => {
        const beacon = g.children[g.children.length - 2];
        if (beacon) {
          beacon.rotation.y += delta * 1.5;
          beacon.rotation.x += delta * 0.8;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // 7. Resize Observer
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight || 580;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', handleClick);
      renderer.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [autoRotate]);

  // Preset Views Handler
  const handleViewPreset = (preset: 'birds_eye' | 'security' | 'cs' | 'ds') => {
    setAutoRotate(false);
    if (preset === 'birds_eye') {
      cameraTargetRef.current.set(0, 0, 0);
      cameraPosTargetRef.current.set(0, 22, 26);
    } else if (preset === 'security') {
      const z = CAMPUS_ZONES.find((x) => x.id === 'security_gate')!;
      setSelectedZone(z);
      cameraTargetRef.current.set(z.position[0], 1.5, z.position[2]);
      cameraPosTargetRef.current.set(z.position[0] - 2, 6, z.position[2] + 9);
    } else if (preset === 'cs') {
      const z = CAMPUS_ZONES.find((x) => x.id === 'cs_wing')!;
      setSelectedZone(z);
      cameraTargetRef.current.set(z.position[0], 2, z.position[2]);
      cameraPosTargetRef.current.set(z.position[0] - 4, 8, z.position[2] + 8);
    } else {
      const z = CAMPUS_ZONES.find((x) => x.id === 'ds_wing')!;
      setSelectedZone(z);
      cameraTargetRef.current.set(z.position[0], 2, z.position[2]);
      cameraPosTargetRef.current.set(z.position[0] + 5, 8, z.position[2] + 8);
    }
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-xl">
      {/* Top Spec & Live Status Header (Minimal Top Viewport Presence) */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 pointer-events-auto">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs font-semibold text-slate-200 backdrop-blur-sm">
          <Building2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>Interactive 3D Campus Heatmap</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-950/80 border border-rose-700/60 text-xs font-bold text-rose-300 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          <span>1 Active Truancy Flag (Gate 2 Turnstile)</span>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <button
          onClick={() => handleViewPreset('birds_eye')}
          title="Reset to Master Bird's Eye View"
          className="p-2 rounded-xl bg-slate-900/90 border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs flex items-center gap-1 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset Orbit</span>
        </button>
      </div>

      {/* 3D WebGL Canvas Mount Container */}
      <div ref={mountRef} className="w-full h-[580px] cursor-grab active:cursor-grabbing" />

      {/* Selected Zone Float Card (Pinned Non-Occluding Top Right) */}
      {selectedZone && (
        <div className="absolute top-16 right-4 z-20 w-72 bg-slate-900/95 border border-slate-700 rounded-xl p-3.5 shadow-2xl backdrop-blur-md pointer-events-auto text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] font-bold text-indigo-400">{selectedZone.code}</span>
            <span
              className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                selectedZone.truancyFlag
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}
            >
              {selectedZone.attendancePct}% Attendance
            </span>
          </div>

          <h3 className="font-bold text-slate-100 text-sm">{selectedZone.name}</h3>
          <p className="text-[11px] text-slate-400 leading-relaxed">{selectedZone.details}</p>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800 font-mono text-[11px]">
            <div>
              <span className="text-slate-500 block">Forenoon (FN):</span>
              <span className="font-bold text-emerald-400">{selectedZone.fnCount} Present</span>
            </div>
            <div>
              <span className="text-slate-500 block">Afternoon (AN):</span>
              <span className="font-bold text-amber-400">{selectedZone.anCount} Present</span>
            </div>
          </div>

          {selectedZone.truancyFlag && (
            <div className="p-2 bg-rose-950/40 border border-rose-800/60 rounded-lg text-rose-300 text-[11px] flex items-start gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400 mt-0.5 flex-shrink-0" />
              <span>{selectedZone.statusText}</span>
            </div>
          )}
        </div>
      )}

      {/* Unified Bottom Control Dock (Following Three.js Zero-Viewport-Occlusion Directives) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 w-full max-w-2xl px-4 pointer-events-auto">
        <div className="bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden">
          {/* Collapse / Expand Tab */}
          <button
            onClick={() => setIsDockCollapsed(!isDockCollapsed)}
            className="w-full py-1.5 bg-slate-950/70 border-b border-slate-800/80 text-[11px] font-semibold text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1 transition"
          >
            {isDockCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Expand 3D Heatmap Controls</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>Collapse Controls (Full Scene View)</span>
              </>
            )}
          </button>

          {!isDockCollapsed && (
            <div className="p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              {/* Presets */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-slate-400 text-[11px] font-semibold">Camera:</span>
                <button
                  onClick={() => handleViewPreset('birds_eye')}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition"
                >
                  Overview
                </button>
                <button
                  onClick={() => handleViewPreset('security')}
                  className="px-2.5 py-1 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 font-medium border border-rose-800/50 transition"
                >
                  Gate 2 (Truancy)
                </button>
                <button
                  onClick={() => handleViewPreset('cs')}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition"
                >
                  CS Wing
                </button>
                <button
                  onClick={() => handleViewPreset('ds')}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition"
                >
                  Data Science
                </button>
              </div>

              {/* Heatmap Layer Selector */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setHeatmapMode('attendance')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                    heatmapMode === 'attendance' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400'
                  }`}
                >
                  Attendance %
                </button>
                <button
                  onClick={() => setHeatmapMode('truancy')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                    heatmapMode === 'truancy' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400'
                  }`}
                >
                  Truancy Flags
                </button>
                <button
                  onClick={() => setHeatmapMode('sessions')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                    heatmapMode === 'sessions' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400'
                  }`}
                >
                  FN vs AN
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
