import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { CampusBlockHeatmap } from '../../types';
import { CAMPUS_BLOCKS } from '../../data/mockData';
import { Box, Eye, Layers, ShieldAlert, Sparkles, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';

interface CampusAttendance3DProps {
  onSelectBlock?: (block: CampusBlockHeatmap) => void;
  className?: string;
}

export const CampusAttendance3D: React.FC<CampusAttendance3DProps> = ({
  onSelectBlock,
  className = ''
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedBlock, setSelectedBlock] = useState<CampusBlockHeatmap | null>(CAMPUS_BLOCKS[0]);
  const [hoveredBlock, setHoveredBlock] = useState<CampusBlockHeatmap | null>(null);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);

  // References for scene & camera controls
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = 360;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0f172a); // Slate 900
    scene.fog = new THREE.FogExp2(0x0f172a, 0.05);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 7, 10);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(10, 15, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const bluePoint = new THREE.PointLight(0x6366f1, 2, 20);
    bluePoint.position.set(-5, 4, -5);
    scene.add(bluePoint);

    // 5. Ground grid plane
    const gridHelper = new THREE.GridHelper(16, 16, 0x4f46e5, 0x1e293b);
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);

    // 6. Buildings Group
    const campusGroup = new THREE.Group();
    groupRef.current = campusGroup;
    scene.add(campusGroup);

    const blockMeshes: { mesh: THREE.Mesh; data: CampusBlockHeatmap }[] = [];

    CAMPUS_BLOCKS.forEach((block) => {
      // Determine color based on Afternoon attendance rate
      const color =
        block.anAttendanceRate >= 90
          ? 0x10b981 // Emerald
          : block.anAttendanceRate >= 80
          ? 0x3b82f6 // Indigo/Blue
          : block.anAttendanceRate >= 75
          ? 0xf59e0b // Amber
          : 0xef4444; // Rose/Red

      const geometry = new THREE.BoxGeometry(
        block.dimensions[0],
        block.dimensions[1],
        block.dimensions[2]
      );

      const material = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.3,
        metalness: 0.2,
        transparent: true,
        opacity: 0.92
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        block.position[0],
        block.position[1] / 2 + 0.1,
        block.position[2]
      );
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { block };

      // Add architectural wireframe / edge accent
      const edges = new THREE.EdgesGeometry(geometry);
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.35
      });
      const wireframe = new THREE.LineSegments(edges, lineMaterial);
      mesh.add(wireframe);

      campusGroup.add(mesh);
      blockMeshes.push({ mesh, data: block });
    });

    // Raycasting for interactivity
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(
        blockMeshes.map((b) => b.mesh)
      );

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        const bData = hit.userData.block as CampusBlockHeatmap;
        setHoveredBlock(bData);
        container.style.cursor = 'pointer';
      } else {
        setHoveredBlock(null);
        container.style.cursor = 'default';
      }
    };

    const onClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(
        blockMeshes.map((b) => b.mesh)
      );

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        const bData = hit.userData.block as CampusBlockHeatmap;
        setSelectedBlock(bData);
        if (onSelectBlock) onSelectBlock(bData);
      }
    };

    // Orbit controls via manual dragging
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      onPointerMove(e);
      if (!isDragging) return;

      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;

      campusGroup.rotation.y += deltaX * 0.008;
      camera.position.y = Math.max(3, Math.min(12, camera.position.y - deltaY * 0.02));
      camera.lookAt(0, 0, 0);

      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('click', onClick);

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (autoRotate && !isDragging) {
        campusGroup.rotation.y += 0.003;
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newW = container.clientWidth;
      camera.aspect = newW / height;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('click', onClick);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [autoRotate, onSelectBlock]);

  return (
    <div className={`bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl ${className}`}>
      {/* 3D Header Bar */}
      <div className="px-5 py-3.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/60">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              3D Campus Academic Heatmap
            </h4>
            <p className="text-[11px] text-slate-400">
              Interactive WebGL spatial attendance telemetry
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Legend */}
          <div className="hidden sm:flex items-center gap-3 text-[11px] font-semibold text-slate-400 mr-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> &gt;90%
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" /> 80-90%
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" /> 75-80%
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" /> &lt;75%
            </span>
          </div>

          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 border transition-colors ${
              autoRotate
                ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title="Toggle Continuous Rotation"
          >
            <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">Auto</span>
          </button>
        </div>
      </div>

      {/* 3D Canvas Mount */}
      <div className="relative">
        <div ref={mountRef} className="w-full h-[360px] cursor-grab active:cursor-grabbing" />

        {/* Hover overlay hint */}
        {hoveredBlock && (
          <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md border border-slate-700 px-3 py-1.5 rounded-xl text-white pointer-events-none text-xs z-10 shadow-lg animate-in fade-in">
            <span className="font-bold text-indigo-300">{hoveredBlock.name}</span>
            <span className="text-slate-400 ml-2 font-mono">FN: {hoveredBlock.fnAttendanceRate}% | AN: {hoveredBlock.anAttendanceRate}%</span>
          </div>
        )}

        <div className="absolute bottom-3 left-3 text-[10px] text-slate-400 bg-slate-950/70 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-slate-800 pointer-events-none">
          Click block to inspect | Drag to orbit
        </div>
      </div>

      {/* Inspector Panel for Selected Block */}
      {selectedBlock && (
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 text-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Active Inspection
            </span>
            <p className="font-bold text-white text-sm mt-0.5">{selectedBlock.name}</p>
            <p className="text-[11px] text-indigo-400 font-mono">{selectedBlock.code}</p>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Forenoon (FN) Attendance
            </span>
            <p className="font-bold text-emerald-400 text-base mt-0.5 tabular-nums">
              {selectedBlock.fnAttendanceRate}%
            </p>
            <p className="text-[10px] text-slate-400">09:00 AM – 12:45 PM</p>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Afternoon (AN) Attendance
            </span>
            <p
              className={`font-bold text-base mt-0.5 tabular-nums ${
                selectedBlock.anAttendanceRate < 80 ? 'text-rose-400' : 'text-blue-400'
              }`}
            >
              {selectedBlock.anAttendanceRate}%
            </p>
            <p className="text-[10px] text-slate-400">01:30 PM – 04:30 PM</p>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Telemetry Status
            </span>
            <div className="mt-1 flex items-center gap-1.5">
              {selectedBlock.anomaliesDetected > 0 ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                  <ShieldAlert className="w-3 h-3 text-amber-400" />
                  {selectedBlock.anomaliesDetected} Anomalies
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                  Normal Flow
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Occupancy: {selectedBlock.occupancyRate}% ({selectedBlock.totalStudents} students)
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
