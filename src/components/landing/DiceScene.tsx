"use client";

/*
  A single six-sided die — soft rounded-cube geometry, matte cream body,
  ink pips in the standard opposite-faces-sum-to-7 layout, warm/cool point
  lights carving a coral-gold rim highlight along the bevels — in place of
  the bead-strand cluster. Style reference: the rounded-cube cluster on
  yinger.dev (https://yinger.dev/?ref=refs.gallery), adapted to this site's
  own indigo/gold/cream palette rather than that reference's literal
  colors.
*/

import { Suspense, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

const GOLD = "#f6c667";
const PURPLE = "#6a4bc9";
const CREAM = "#f3ede2";
const INK = "#241a5e";

interface RollState {
  count: number;
}

// Standard pip layout on a 3x3 grid (opposite faces sum to 7).
const D = 0.62;
const PIP_LAYOUTS: Record<number, [number, number][]> = {
  1: [[0, 0]],
  2: [[-D, D], [D, -D]],
  3: [[-D, D], [0, 0], [D, -D]],
  4: [[-D, D], [D, D], [-D, -D], [D, -D]],
  5: [[-D, D], [D, D], [0, 0], [-D, -D], [D, -D]],
  6: [[-D, D], [D, D], [-D, 0], [D, 0], [-D, -D], [D, -D]],
};

interface FaceDef {
  normal: THREE.Vector3;
  uAxis: THREE.Vector3;
  vAxis: THREE.Vector3;
  pips: number;
}

const FACES: FaceDef[] = [
  { normal: new THREE.Vector3(0, 0, 1), uAxis: new THREE.Vector3(1, 0, 0), vAxis: new THREE.Vector3(0, 1, 0), pips: 1 },
  { normal: new THREE.Vector3(0, 0, -1), uAxis: new THREE.Vector3(-1, 0, 0), vAxis: new THREE.Vector3(0, 1, 0), pips: 6 },
  { normal: new THREE.Vector3(1, 0, 0), uAxis: new THREE.Vector3(0, 0, -1), vAxis: new THREE.Vector3(0, 1, 0), pips: 2 },
  { normal: new THREE.Vector3(-1, 0, 0), uAxis: new THREE.Vector3(0, 0, 1), vAxis: new THREE.Vector3(0, 1, 0), pips: 5 },
  { normal: new THREE.Vector3(0, 1, 0), uAxis: new THREE.Vector3(1, 0, 0), vAxis: new THREE.Vector3(0, 0, -1), pips: 3 },
  { normal: new THREE.Vector3(0, -1, 0), uAxis: new THREE.Vector3(1, 0, 0), vAxis: new THREE.Vector3(0, 0, 1), pips: 4 },
];

const UP = new THREE.Vector3(0, 1, 0);

/** Flat matte dots flush with each face, in the classic opposite-sides-
 * sum-to-7 arrangement — painted-on pips like a real die, not raised
 * beads. */
function DiePips({ halfExtent }: { halfExtent: number }) {
  const pipRadius = 0.16;
  const pipDepth = 0.05;

  return (
    <>
      {FACES.flatMap((face) => {
        const quaternion = new THREE.Quaternion().setFromUnitVectors(UP, face.normal);
        return PIP_LAYOUTS[face.pips].map(([u, v], i) => {
          const center = face.normal
            .clone()
            .multiplyScalar(halfExtent - pipDepth * 0.15)
            .addScaledVector(face.uAxis, u)
            .addScaledVector(face.vAxis, v);
          return (
            <mesh key={`${face.pips}-${i}`} position={center} quaternion={quaternion}>
              <cylinderGeometry args={[pipRadius, pipRadius, pipDepth, 28]} />
              <meshStandardMaterial color={INK} roughness={0.8} metalness={0} />
            </mesh>
          );
        });
      })}
    </>
  );
}

/** Idle: a slow continuous tumble plus a small wobble. Click: a damped
 * angular-velocity kick on a random axis, so it rolls like a tossed die and
 * settles back into the idle tumble — the same spring/damping language the
 * old bead scene used, applied to rotation instead of position. */
function Die({ rollTrigger }: { rollTrigger: React.RefObject<RollState> }) {
  const group = useRef<THREE.Group>(null);
  const angularVel = useRef(new THREE.Vector3(0, 0, 0));
  const lastRollCount = useRef(0);
  const randRef = useRef(Math.random);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);

    if (rollTrigger.current.count !== lastRollCount.current) {
      lastRollCount.current = rollTrigger.current.count;
      const r = randRef.current;
      angularVel.current.set(
        (r() * 2 - 1) * 4.5,
        (r() * 2 - 1) * 4.5,
        (r() * 2 - 1) * 4.5
      );
    }

    // Exponential decay back toward the resting angular velocity of zero
    // (the base idle spin below is applied on top, independent of this).
    const decay = Math.exp(-2.2 * dt);
    angularVel.current.multiplyScalar(decay);

    if (group.current) {
      const t = state.clock.getElapsedTime();
      group.current.rotation.x += angularVel.current.x * dt + Math.sin(t * 0.4) * 0.0015;
      group.current.rotation.y += angularVel.current.y * dt + delta * 0.15;
      group.current.rotation.z += angularVel.current.z * dt + Math.cos(t * 0.33) * 0.0012;
    }
  });

  return (
    <group ref={group}>
      <RoundedBox args={[2.6, 2.6, 2.6]} radius={0.32} smoothness={6}>
        <meshStandardMaterial color={CREAM} roughness={0.45} metalness={0.08} />
      </RoundedBox>
      <DiePips halfExtent={1.3} />
    </group>
  );
}

function Scene({ rollTrigger }: { rollTrigger: React.RefObject<RollState> }) {
  return (
    <>
      <ambientLight intensity={0.55} color="#8b7dfd" />
      <pointLight position={[2.2, 2, 3]} intensity={45} distance={12} color={GOLD} />
      <pointLight position={[-3, -2, 2]} intensity={18} distance={10} color={PURPLE} />
      <Die rollTrigger={rollTrigger} />
      <EffectComposer>
        <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.85} intensity={0.5} mipmapBlur />
      </EffectComposer>
    </>
  );
}

/** Client-only entry point — rendered via next/dynamic in page.tsx. Click
 * or tap anywhere in the scene to give the die a roll. */
export function DiceScene() {
  const rollTrigger = useRef<RollState>({ count: 0 });

  return (
    <div
      className="h-full w-full cursor-pointer"
      aria-hidden="true"
      onPointerDown={() => {
        rollTrigger.current.count += 1;
      }}
    >
      <Canvas camera={{ position: [0, 0, 6.5], fov: 45 }} dpr={[1, 2]}>
        <Suspense fallback={null}>
          <Scene rollTrigger={rollTrigger} />
        </Suspense>
      </Canvas>
    </div>
  );
}
