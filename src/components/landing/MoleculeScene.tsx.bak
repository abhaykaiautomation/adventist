"use client";

import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

const PURPLE = "#5b3df0";
const GOLD = "#f6c667";
const WHITE = "#f5f1ff";
const CORAL = "#f0866b";
const PALETTE = [PURPLE, PURPLE, PURPLE, GOLD, GOLD, WHITE, CORAL];

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface StrandDef {
  points: THREE.Vector3[];
  seed: number;
  count: number;
  tubeRadius: number;
}

interface ImpulseState {
  count: number;
}

/** One bent, twisting strand of beads. Multiple of these, differently
 * shaped and seeded, fill the porthole instead of one lone thread. Each
 * wiggles independently (different frequency/phase per seed), and a click
 * anywhere in the scene kicks every strand off in its own random
 * direction — a damped spring pulls each one back to its resting spot. */
function BeadStrand({
  points,
  seed,
  count,
  tubeRadius,
  impulseTrigger,
}: StrandDef & { impulseTrigger: React.RefObject<ImpulseState> }) {
  const wiggleRef = useRef<THREE.Group>(null);
  const rand = useMemo(() => mulberry32(seed + 500), [seed]);
  const wiggle = useMemo(
    () => ({
      freqX: 0.35 + rand() * 0.25,
      freqY: 0.3 + rand() * 0.25,
      freqZ: 0.4 + rand() * 0.2,
      phase: rand() * Math.PI * 2,
      amp: 0.12 + rand() * 0.08,
    }),
    [rand]
  );

  // Click-push physics: a damped spring pulls impulsePos back toward zero;
  // a click adds a random kick to impulseVel, which the spring then decays.
  const impulsePos = useRef(new THREE.Vector3());
  const impulseVel = useRef(new THREE.Vector3());
  const lastImpulseCount = useRef(0);
  const impulseRand = useRef(mulberry32(seed + 900));
  const SPRING_K = 9;
  const DAMPING = 5;

  useFrame((state, delta) => {
    if (impulseTrigger.current.count !== lastImpulseCount.current) {
      lastImpulseCount.current = impulseTrigger.current.count;
      const r = impulseRand.current;
      const dir = new THREE.Vector3(r() * 2 - 1, r() * 2 - 1, r() * 2 - 1).normalize();
      const strength = 3.5 + r() * 3;
      impulseVel.current.addScaledVector(dir, strength);
    }

    // Semi-implicit Euler spring-damper, clamped delta to avoid a big
    // jump if the tab was backgrounded.
    const dt = Math.min(delta, 0.05);
    const accel = impulsePos.current
      .clone()
      .multiplyScalar(-SPRING_K)
      .addScaledVector(impulseVel.current, -DAMPING);
    impulseVel.current.addScaledVector(accel, dt);
    impulsePos.current.addScaledVector(impulseVel.current, dt);

    const t = state.clock.getElapsedTime();
    if (wiggleRef.current) {
      wiggleRef.current.position.x =
        Math.sin(t * wiggle.freqX + wiggle.phase) * wiggle.amp + impulsePos.current.x;
      wiggleRef.current.position.y =
        Math.cos(t * wiggle.freqY + wiggle.phase) * wiggle.amp + impulsePos.current.y;
      wiggleRef.current.position.z =
        Math.sin(t * wiggle.freqZ + wiggle.phase * 1.3) * wiggle.amp * 0.6 + impulsePos.current.z;
    }
  });

  const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points]);

  const instances = useMemo(() => {
    const rand = mulberry32(seed);
    const colors = new Float32Array(count * 3);
    const data: { position: THREE.Vector3 }[] = [];

    for (let i = 0; i < count; i++) {
      const t = rand();
      const point = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t);

      const normal = new THREE.Vector3(-tangent.y, tangent.x, tangent.z || 0.0001).normalize();
      const binormal = new THREE.Vector3().crossVectors(tangent, normal);
      const radius = tubeRadius * Math.pow(rand(), 0.5);
      const angle = rand() * Math.PI * 2;
      const offset = normal
        .clone()
        .multiplyScalar(Math.cos(angle) * radius)
        .add(binormal.clone().multiplyScalar(Math.sin(angle) * radius));

      const position = point.clone().add(offset);
      data.push({ position });

      const color = new THREE.Color(PALETTE[Math.floor(rand() * PALETTE.length)]);
      color.toArray(colors, i * 3);
    }

    return { data, colors };
  }, [curve, count, seed, tubeRadius]);

  const setup = (mesh: THREE.InstancedMesh | null) => {
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    const rand = mulberry32(seed + 1);
    for (let i = 0; i < instances.data.length; i++) {
      const { position } = instances.data[i];
      dummy.position.copy(position);
      const scale = 0.06 + rand() * 0.1;
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.geometry.setAttribute("color", new THREE.InstancedBufferAttribute(instances.colors, 3));
  };

  return (
    <group ref={wiggleRef}>
      <instancedMesh ref={setup} args={[undefined, undefined, count]}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshStandardMaterial vertexColors roughness={0.3} metalness={0.15} />
      </instancedMesh>
    </group>
  );
}

// Four differently-shaped, differently-seeded strands so the porthole
// reads as a tangled cluster rather than one lone thread.
const STRANDS: StrandDef[] = [
  {
    seed: 42,
    count: 2200,
    tubeRadius: 0.3,
    points: [
      new THREE.Vector3(-5.5, -1.6, -1),
      new THREE.Vector3(-2.5, -1.3, -0.4),
      new THREE.Vector3(0.4, -0.6, 0.2),
      new THREE.Vector3(0.9, 0.6, 0.4),
      new THREE.Vector3(0.6, 2.4, 0),
      new THREE.Vector3(0.2, 4.2, -0.6),
    ],
  },
  {
    seed: 137,
    count: 1800,
    tubeRadius: 0.24,
    points: [
      new THREE.Vector3(4.8, 3.2, -0.8),
      new THREE.Vector3(2.2, 2.0, 0.3),
      new THREE.Vector3(0.6, 0.4, 0.6),
      new THREE.Vector3(-0.6, -1.2, 0.1),
      new THREE.Vector3(-2.6, -2.6, -0.5),
      new THREE.Vector3(-4.6, -3.4, -1.2),
    ],
  },
  {
    seed: 271,
    count: 1500,
    tubeRadius: 0.2,
    points: [
      new THREE.Vector3(-1, 4.4, 1.4),
      new THREE.Vector3(-0.4, 2.6, 0.6),
      new THREE.Vector3(0.3, 0.8, -0.2),
      new THREE.Vector3(1.1, -0.8, -0.6),
      new THREE.Vector3(1.9, -2.6, -1),
      new THREE.Vector3(2.6, -4.2, -1.4),
    ],
  },
  {
    seed: 389,
    count: 1400,
    tubeRadius: 0.18,
    points: [
      new THREE.Vector3(-4.2, 2.8, 1.2),
      new THREE.Vector3(-2.4, 1.2, 0.4),
      new THREE.Vector3(-0.8, -0.4, -0.3),
      new THREE.Vector3(0.9, -1.6, -0.2),
      new THREE.Vector3(2.8, -2.2, 0.5),
      new THREE.Vector3(4.6, -2.4, 1.3),
    ],
  },
];

function Scene({ impulseTrigger }: { impulseTrigger: React.RefObject<ImpulseState> }) {
  const group = useRef<THREE.Group>(null);

  useFrame((_state, delta) => {
    if (group.current) {
      // Continuous slow spin — one full turn roughly every 50s — rather
      // than a barely-visible oscillation. This is the reference's actual
      // idle motion, not a static hero shot.
      group.current.rotation.y += delta * 0.125;
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} color="#8b7dfd" />
      <pointLight position={[2, 2, 3]} intensity={40} distance={12} color={GOLD} />
      <pointLight position={[-3, -2, 2]} intensity={15} distance={10} color={PURPLE} />
      <group ref={group} position={[0.5, -0.5, 0]}>
        {STRANDS.map((strand) => (
          <BeadStrand key={strand.seed} {...strand} impulseTrigger={impulseTrigger} />
        ))}
      </group>
      <EffectComposer>
        <Bloom luminanceThreshold={0.4} luminanceSmoothing={0.85} intensity={0.7} mipmapBlur />
      </EffectComposer>
    </>
  );
}

/** Client-only entry point — rendered via next/dynamic in page.tsx. Click
 * or tap anywhere in the scene to scatter the strands apart. */
export function MoleculeScene() {
  const impulseTrigger = useRef<ImpulseState>({ count: 0 });

  return (
    <div
      className="h-full w-full cursor-pointer"
      aria-hidden="true"
      onPointerDown={() => {
        impulseTrigger.current.count += 1;
      }}
    >
      <Canvas camera={{ position: [0, 0, 6.5], fov: 45 }} dpr={[1, 2]}>
        <Suspense fallback={null}>
          <Scene impulseTrigger={impulseTrigger} />
        </Suspense>
      </Canvas>
    </div>
  );
}
