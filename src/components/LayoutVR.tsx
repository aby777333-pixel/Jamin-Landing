"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import * as THREE from "three";
import { plotStatus, type Plot, type PlotPlan } from "@/lib/properties";
import { istDate, sunPosition, sunVector } from "@/lib/sun";

/**
 * THE SITE, STANDING UP AND LIT — the fourth view.
 *
 * 🚨 THIS IS THE ONE PLACE THE LIBRARY EARNS ITS KEEP, and `LayoutRelief`'s own
 * header is the argument: an axonometric painter is the right answer for
 * extruded slabs, and the wrong one the moment you need true perspective,
 * orbiting or LIGHT. A sun that moves is not decoration here — "which way does
 * this plot face and where does the shade fall at four o'clock" is a question
 * buyers ask about land, and it cannot be answered by a fixed 2D drawing.
 * `LayoutRelief` STAYS. This is offered beside it, not instead of it, because
 * the flat view is faster, works without WebGL, and is the better read on a
 * cheap phone.
 *
 * ⚠️ LAZY-LOADED FROM `LayoutViews` (`ssr: false`). three.js is ~150 KB gzipped
 * against a site whose posture is a zero-JS hero and a static prerender, so it
 * must never enter the bundle of a route that does not draw it. Nothing outside
 * this file may import it statically.
 *
 * ⚠️ NO HOUSES ON THE PLOTS. Same rule as the relief view and for the same
 * reason: massing a villa on every parcel would look magnificent and would tell
 * a buyer this is a built development. It is bare, formed land. What is modelled
 * is what has been sanctioned — parcels, levels, roads, the OSR, and the
 * street lighting the approved conditions actually promise.
 *
 * ⚠️ THE MODEL IS INDICATIVE AND SAYS SO. Its geometry is traced from a sheet
 * that disagrees with its own labels by 16%; see `lib/sun.ts` on why the shadow
 * DIRECTION is trustworthy while its LENGTH is only as good as the model. There
 * is deliberately no measuring tool in this view.
 */

type Vec2 = [number, number];

/** Tokens resolved through the DOM so the scene follows the site's palette. */
const TOKENS = {
  formation: "var(--vr-formation)",
  plot: "var(--vr-plot)",
  plotEdge: "var(--color-emerald)",
  osr: "var(--vr-tree)",
  ground: "var(--vr-earth)",
  skyDay: "var(--vr-sky-day)",
  skyDusk: "var(--vr-sky-dusk)",
  skyNight: "var(--vr-sky-night)",
  tree: "var(--vr-tree)",
  lamp: "var(--vr-lamp)",
} as const;

export function LayoutVR({
  plots,
  plan,
  lat,
  lng,
}: {
  plots: Plot[];
  plan: PlotPlan;
  lat: number | null;
  lng: number | null;
}) {
  const host = useRef<HTMLDivElement>(null);
  const canvasWrap = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<SceneHandle | null>(null);

  const [hour, setHour] = useState(15.5);
  const [hovered, setHovered] = useState<string | null>(null);
  /* ⚠️ Capability is read during RENDER, not discovered in an effect. This repo's
     eslint forbids setState in an effect body (cascading renders), and a
     `setFailed(true)` in the catch is exactly that. `useSyncExternalStore` with a
     cached snapshot is the pattern the codebase already uses for
     `SpeechRecognition` detection. The server snapshot is `true` only so the
     shapes match — this component never server-renders. */
  const supported = useSyncExternalStore(subscribeNoop, hasWebGL, () => true);

  /* Edappadi if the row has no pin. A layout without coordinates still has a
     latitude in the world, and refusing to light it would be worse than lighting
     it from the district town it sits in. */
  const LAT = lat ?? 11.5872;
  const LNG = lng ?? 77.8194;

  const solid = useMemo(
    () => plots.filter((p) => Array.isArray(p.poly) && p.poly.length > 2),
    [plots],
  );

  /** The day the sun is computed for. Fixed at the equinox so the view is the
   *  same for every reader and every build — a "today" would make one buyer's
   *  screenshot disagree with another's, and nothing here is time-sensitive. */
  const DAY = useMemo(() => ({ y: new Date().getUTCFullYear(), m: 2, d: 21 }), []);

  const sun = useMemo(
    () => sunPosition(istDate(DAY.y, DAY.m, DAY.d, hour), LAT, LNG),
    [DAY, hour, LAT, LNG],
  );

  const resolve = useCallback((value: string) => {
    const el = host.current;
    if (!el) return new THREE.Color(0x888888);
    const probe = document.createElement("span");
    probe.style.cssText = "position:absolute;width:0;height:0;opacity:0";
    probe.style.color = value;
    el.appendChild(probe);
    const out = getComputedStyle(probe).color;
    el.removeChild(probe);
    try {
      return new THREE.Color(out);
    } catch {
      return new THREE.Color(0x888888);
    }
  }, []);

  /* ---- build the scene once ---------------------------------------------- */
  useEffect(() => {
    const wrap = canvasWrap.current;
    if (!wrap || !plan.viewBox || solid.length === 0 || !supported) return;

    let handle: SceneHandle | null = null;
    try {
      handle = buildScene({
        wrap,
        plots: solid,
        plan,
        colour: {
          formation: resolve(TOKENS.formation),
          plot: resolve(TOKENS.plot),
          plotEdge: resolve(TOKENS.plotEdge),
          osr: resolve(TOKENS.osr),
          ground: resolve(TOKENS.ground),
          skyDay: resolve(TOKENS.skyDay),
          skyDusk: resolve(TOKENS.skyDusk),
          skyNight: resolve(TOKENS.skyNight),
          tree: resolve(TOKENS.tree),
          lamp: resolve(TOKENS.lamp),
        },
        onHover: setHovered,
      });
    } catch {
      /* A context can still be refused after the capability test passes — the
         browser caps live WebGL contexts per page. Write the fallback into the
         host element rather than into React state: updating an external system
         is what an effect is FOR, and it keeps this off the setState-in-effect
         path the linter (rightly) blocks. */
      wrap.textContent =
        "This device could not open a 3D view. The approved plan and the plot list show the same layout.";
      wrap.classList.add("grid", "place-items-center", "p-phi3", "text-tiny", "text-ink-soft");
      return;
    }
    sceneRef.current = handle;
    return () => {
      handle?.dispose();
      sceneRef.current = null;
    };
  }, [plan, solid, resolve, supported]);

  /* ---- move the sun without rebuilding anything --------------------------- */
  useEffect(() => {
    sceneRef.current?.setSun(sun);
  }, [sun]);

  const alt = (sun.altitude * 180) / Math.PI;
  const isNight = alt < -0.5;
  const bearing = ((sun.azimuth * 180) / Math.PI + 360) % 360;

  if (!supported) {
    return (
      <p className="rounded-xl border border-line bg-canvas p-phi3 text-tiny text-ink-soft">
        This device does not support the 3D view. The approved plan and the plot
        list show the same layout.
      </p>
    );
  }

  return (
    <div ref={host}>
      <div
        ref={canvasWrap}
        className="relative overflow-hidden rounded-xl border border-line"
        style={{ height: "clamp(320px, 58vw, 580px)" }}
        role="img"
        aria-label={`Three-dimensional view of the layout: ${solid.length} plots, the internal roads and the open space reservation, lit by the sun's real position at ${formatHour(hour)}.`}
      />

      <div className="mt-phi2 flex flex-wrap items-center gap-phi2">
        <label className="flex min-w-[16rem] flex-1 items-center gap-phi2 text-tiny text-ink-soft">
          <span className="whitespace-nowrap font-medium tabular-nums">
            {formatHour(hour)}
          </span>
          <input
            type="range"
            min={0}
            max={24}
            step={0.25}
            value={hour}
            onChange={(e) => setHour(Number(e.target.value))}
            className="h-1 flex-1 accent-[var(--color-cta)]"
            aria-label="Time of day"
          />
        </label>

        <div role="group" aria-label="Time presets" className="flex gap-1">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => setHour(p.hour)}
              aria-pressed={Math.abs(hour - p.hour) < 0.13}
              className={`rounded-full border px-3 py-1 text-tiny transition-colors ${
                Math.abs(hour - p.hour) < 0.13
                  ? "border-ink bg-ink text-canvas"
                  : "border-line text-ink-soft hover:text-ink"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-phi2 text-tiny leading-relaxed text-ink-faint">
        {isNight ? (
          <>Sun below the horizon — street lighting shown as provided under the sanctioned conditions.</>
        ) : (
          <>
            Sun {alt.toFixed(0)}° above the horizon, bearing {bearing.toFixed(0)}° —
            computed for this site&rsquo;s own latitude at the March equinox.
          </>
        )}{" "}
        Drag to orbit, scroll or pinch to zoom.
        {hovered && <> Plot {hovered}.</>}
      </p>

      {/* ⚠️ Says what the picture is, in prose, because a canvas says nothing to a
          screen reader and because a lit 3D render is exactly the kind of image a
          reader could mistake for a photograph of a finished development. */}
      {/* ⚠️ THIS PARAGRAPH ONCE CONTRADICTED ITS OWN PICTURE. It said "bare
          formed land" while the scene drew trees and lit street lamps — neither
          of which the approved drawing dimensions. Plot geometry, the roads and
          the OSR come from the sanctioned sheet; the planting and the lighting
          are typical infrastructure drawn to make the site legible, and a
          caption that quietly lets them pass as sanctioned is the same class of
          error as massing houses on the plots. Say which is which. */}
      <p className="mt-phi2 text-tiny leading-relaxed text-ink-faint">
        An indicative model. The plots, roads and open space are taken from the
        approved drawing; no buildings are shown, because none are built. Trees and
        street lighting are drawn as typical infrastructure and are not detailed on
        the sanctioned plan. Shadow direction follows the real sun for this
        latitude; shadows are short because the land is bare and level. The
        approved plan remains the document of record.
      </p>
    </div>
  );
}

/** Nothing to subscribe to — capability does not change within a page life. */
const subscribeNoop = () => () => {};

let webglCache: boolean | null = null;
/** ⚠️ Must return a CACHED value: `useSyncExternalStore` re-reads the snapshot on
 *  every render and a fresh probe each time would both thrash the GPU and, by
 *  returning a new result, risk an infinite render loop. */
function hasWebGL(): boolean {
  if (webglCache !== null) return webglCache;
  try {
    const c = document.createElement("canvas");
    webglCache = !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    webglCache = false;
  }
  return webglCache;
}

const PRESETS = [
  { label: "Dawn", hour: 6.25 },
  { label: "Noon", hour: 12 },
  { label: "Evening", hour: 17.5 },
  { label: "Night", hour: 21 },
];

function formatHour(h: number) {
  const t = ((h % 24) + 24) % 24;
  const hh = Math.floor(t);
  const mm = Math.round((t - hh) * 60);
  const ampm = hh < 12 ? "am" : "pm";
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${h12}:${String(mm).padStart(2, "0")} ${ampm}`;
}

/* ========================================================================== */

type SceneHandle = {
  setSun: (s: { altitude: number; azimuth: number }) => void;
  dispose: () => void;
};

function buildScene({
  wrap,
  plots,
  plan,
  colour,
  onHover,
}: {
  wrap: HTMLDivElement;
  plots: Plot[];
  plan: PlotPlan;
  colour: {
    formation: THREE.Color;
    plot: THREE.Color;
    plotEdge: THREE.Color;
    osr: THREE.Color;
    ground: THREE.Color;
    skyDay: THREE.Color;
    skyDusk: THREE.Color;
    skyNight: THREE.Color;
    tree: THREE.Color;
    lamp: THREE.Color;
  };
  onHover: (plot: string | null) => void;
}): SceneHandle {
  const mpu = plan.metresPerUnit || 1;
  const vb = plan.viewBox ?? [0, 0, 100, 100];
  const cx = vb[0] + vb[2] / 2;
  const cy = vb[1] + vb[3] / 2;

  /** plan units -> metres, centred on the site. north is -Z (see lib/sun.ts). */
  const toWorld = (p: Vec2): Vec2 => [(p[0] - cx) * mpu, (p[1] - cy) * mpu];
  const siteW = vb[2] * mpu;
  const siteH = vb[3] * mpu;
  const span = Math.max(siteW, siteH);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(wrap.clientWidth, wrap.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  wrap.appendChild(renderer.domElement);
  renderer.domElement.style.display = "block";
  renderer.domElement.style.touchAction = "none";

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    42,
    wrap.clientWidth / wrap.clientHeight,
    0.5,
    span * 12,
  );

  /* ---- lights ------------------------------------------------------------- */
  const sunLight = new THREE.DirectionalLight(0xffffff, 3);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(2048, 2048);
  const s = span * 0.75;
  sunLight.shadow.camera.left = -s;
  sunLight.shadow.camera.right = s;
  sunLight.shadow.camera.top = s;
  sunLight.shadow.camera.bottom = -s;
  sunLight.shadow.camera.near = 1;
  sunLight.shadow.camera.far = span * 6;
  sunLight.shadow.bias = -0.0012;
  scene.add(sunLight);
  scene.add(sunLight.target);

  const hemi = new THREE.HemisphereLight(0xbcd4ff, 0x6b5c46, 1);
  scene.add(hemi);

  /* ---- ground ------------------------------------------------------------- */
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(span * 8, span * 8),
    new THREE.MeshStandardMaterial({ color: colour.ground, roughness: 1 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.06;
  ground.receiveShadow = true;
  scene.add(ground);

  /* ---- formation (the site's own surface: roads read as the gaps) --------- */
  const boundary = (plan.boundary ?? []) as Vec2[];
  if (boundary.length > 2) {
    const shape = new THREE.Shape();
    boundary.forEach((pt, i) => {
      const [x, z] = toWorld(pt);
      if (i === 0) shape.moveTo(x, z);
      else shape.lineTo(x, z);
    });
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.12, bevelEnabled: false });
    geo.rotateX(-Math.PI / 2);
    const mesh = new THREE.Mesh(
      geo,
      new THREE.MeshStandardMaterial({ color: colour.formation, roughness: 0.95 }),
    );
    mesh.receiveShadow = true;
    scene.add(mesh);
  }

  /* ---- OSR ---------------------------------------------------------------- */
  const osrPoly = (plan.osr?.polygon ?? []) as Vec2[];
  if (osrPoly.length > 2) {
    const shape = new THREE.Shape();
    osrPoly.forEach((pt, i) => {
      const [x, z] = toWorld(pt);
      if (i === 0) shape.moveTo(x, z);
      else shape.lineTo(x, z);
    });
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.18, bevelEnabled: false });
    geo.rotateX(-Math.PI / 2);
    const mesh = new THREE.Mesh(
      geo,
      new THREE.MeshStandardMaterial({
        color: colour.osr.clone().lerp(colour.plot, 0.4),
        roughness: 1,
      }),
    );
    mesh.position.y = 0.02;
    mesh.receiveShadow = true;
    scene.add(mesh);
  }

  /* ---- plots -------------------------------------------------------------- */
  const PLOT_H = 0.55;
  const plotMeshes: THREE.Mesh[] = [];
  const worldPolys: Vec2[][] = [];
  for (const p of plots) {
    const poly = (p.poly ?? []) as Vec2[];
    if (poly.length < 3) continue;
    const w = poly.map(toWorld);
    worldPolys.push(w);
    const shape = new THREE.Shape();
    w.forEach(([x, z], i) => (i === 0 ? shape.moveTo(x, z) : shape.lineTo(x, z)));
    const geo = new THREE.ExtrudeGeometry(shape, { depth: PLOT_H, bevelEnabled: false });
    geo.rotateX(-Math.PI / 2);

    const st = plotStatus(p);
    const base = colour.plot.clone();
    if (st !== "available") base.lerp(new THREE.Color(0x9a9a9a), 0.45);
    const mesh = new THREE.Mesh(
      geo,
      new THREE.MeshStandardMaterial({ color: base, roughness: 0.88 }),
    );
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.plot = p.plot;
    mesh.position.y = 0.12;
    scene.add(mesh);
    plotMeshes.push(mesh);

    /* a kerb line so parcels read as parcels rather than as one green field */
    const edge = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(
        w.map(([x, z]) => new THREE.Vector3(x, PLOT_H + 0.13, z)),
      ),
      new THREE.LineBasicMaterial({ color: colour.plotEdge }),
    );
    scene.add(edge);
  }

  /* ---- road space, derived rather than stored ----------------------------- */
  /* ⚠️ `plot_plan` carries no road polygons and MUST NOT be given any that only
     this view understands — `MasterPlan` destructures `roads[].band` and would
     throw on a polygon-only entry. So the streets are simply the site's surface
     minus the parcels, sampled on a grid. That also means they can never drift
     out of step with the plots. */
  const inPoly = (x: number, z: number, poly: Vec2[]) => {
    let hit = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, zi] = poly[i];
      const [xj, zj] = poly[j];
      if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) hit = !hit;
    }
    return hit;
  };
  const worldBoundary = boundary.map(toWorld);
  const roadPts: Vec2[] = [];
  const STEP = 2.5;
  for (let x = -siteW / 2; x <= siteW / 2; x += STEP) {
    for (let z = -siteH / 2; z <= siteH / 2; z += STEP) {
      if (worldBoundary.length > 2 && !inPoly(x, z, worldBoundary)) continue;
      if (worldPolys.some((w) => inPoly(x, z, w))) continue;
      if (osrPoly.length > 2 && inPoly(x, z, osrPoly.map(toWorld))) continue;
      roadPts.push([x, z]);
    }
  }

  /** greedy spacing so lamps line the streets instead of clustering */
  const spaced = (pts: Vec2[], min: number) => {
    const out: Vec2[] = [];
    for (const p of pts) {
      if (out.every((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) >= min)) out.push(p);
    }
    return out;
  };

  /* ---- street lights ------------------------------------------------------ */
  const lampPts = spaced(roadPts, 26);
  const lampGroup = new THREE.Group();
  const poleGeo = new THREE.CylinderGeometry(0.09, 0.12, 6, 6);
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.7, metalness: 0.3 });
  const headGeo = new THREE.BoxGeometry(0.9, 0.22, 0.45);
  const headMat = new THREE.MeshStandardMaterial({
    color: 0x2e2e2e,
    emissive: colour.lamp,
    emissiveIntensity: 0,
  });
  const lampLights: THREE.PointLight[] = [];
  for (const [x, z] of lampPts) {
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.set(x, 3, z);
    pole.castShadow = true;
    lampGroup.add(pole);
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.set(x, 6.05, z);
    lampGroup.add(head);
    /* Point lights are the expensive part of a night frame, so only the first
       handful are real; the rest glow. A reader cannot tell, and a phone can. */
    if (lampLights.length < 12) {
      const pl = new THREE.PointLight(colour.lamp.getHex(), 0, 42, 2);
      pl.position.set(x, 5.9, z);
      lampLights.push(pl);
      lampGroup.add(pl);
    }
  }
  scene.add(lampGroup);

  /* ---- trees -------------------------------------------------------------- */
  const osrWorld = osrPoly.map(toWorld);
  const treePts: Vec2[] = [];
  if (osrWorld.length > 2) {
    for (let x = -siteW / 2; x <= siteW / 2; x += 4) {
      for (let z = -siteH / 2; z <= siteH / 2; z += 4) {
        if (inPoly(x, z, osrWorld)) treePts.push([x + ((x * 7) % 1.6) - 0.8, z + ((z * 11) % 1.6) - 0.8]);
      }
    }
  }
  /* a thinner line of trees along the verges, offset from the lamps */
  treePts.push(...spaced(roadPts.filter((_, i) => i % 3 === 1), 19));

  if (treePts.length) {
    const trunkGeo = new THREE.CylinderGeometry(0.16, 0.22, 2.2, 5);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6b4b2e, roughness: 1 });
    const canopyGeo = new THREE.IcosahedronGeometry(1.55, 0);
    const canopyMat = new THREE.MeshStandardMaterial({
      color: colour.tree,
      roughness: 1,
      flatShading: true,
    });
    const trunks = new THREE.InstancedMesh(trunkGeo, trunkMat, treePts.length);
    const canopies = new THREE.InstancedMesh(canopyGeo, canopyMat, treePts.length);
    canopies.castShadow = true;
    trunks.castShadow = true;
    const m = new THREE.Matrix4();
    treePts.forEach(([x, z], i) => {
      /* deterministic jitter — a seeded look without a random number generator,
         so every reader and every build sees the same grove */
      const k = 0.82 + (((i * 2654435761) % 1000) / 1000) * 0.5;
      m.makeTranslation(x, 1.1 * k, z);
      m.scale(new THREE.Vector3(k, k, k));
      trunks.setMatrixAt(i, m);
      m.makeTranslation(x, 2.5 * k, z);
      m.scale(new THREE.Vector3(k, k * 1.15, k));
      canopies.setMatrixAt(i, m);
    });
    scene.add(trunks, canopies);
  }

  /* ---- camera + orbit ----------------------------------------------------- */
  /* ⚠️ Hand-rolled rather than pulling `OrbitControls` from three/examples: it is
     forty lines, it avoids a deep-path import that Next's bundler treats
     differently between dev and build, and it lets a plain drag orbit while a
     two-finger gesture still scrolls the PAGE on a phone. */
  /* ⚠️ FRAME ON THE PARCELS, NOT ON THE viewBox. The first cut sat the camera at
     `span * 1.25` where span is the viewBox's long side — but this site is a
     thin 91 m x 258 m strip, so that framing put the model across 78% of the
     frame while filling only 12% of its pixels, most of the view being empty
     ground. Fit to the plots' own bounding box and to the LARGER of what the
     width and the height each demand, which is the only version that behaves
     for both a strip like this one and a squarer site. */
  const px = worldPolys.flat();
  const bx = px.length ? px.map((p) => p[0]) : [0];
  const bz = px.length ? px.map((p) => p[1]) : [0];
  const fitW = Math.max(...bx) - Math.min(...bx);
  const fitH = Math.max(...bz) - Math.min(...bz);
  const target = new THREE.Vector3(
    (Math.max(...bx) + Math.min(...bx)) / 2,
    0,
    (Math.max(...bz) + Math.min(...bz)) / 2,
  );
  const vFov = (camera.fov * Math.PI) / 180;
  const fitDist =
    1.16 *
    Math.max(
      fitH / 2 / Math.tan(vFov / 2),
      fitW / 2 / Math.tan(Math.atan(Math.tan(vFov / 2) * camera.aspect)),
    );

  let yaw = -0.62;
  let pitch = 0.72;
  let dist = fitDist;
  const applyCamera = () => {
    dist = Math.min(Math.max(dist, fitDist * 0.25), fitDist * 2.6);
    pitch = Math.min(Math.max(pitch, 0.12), 1.45);
    camera.position.set(
      target.x + dist * Math.cos(pitch) * Math.sin(yaw),
      target.y + dist * Math.sin(pitch),
      target.z + dist * Math.cos(pitch) * Math.cos(yaw),
    );
    camera.lookAt(target);
    invalidate();
  };

  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  const el = renderer.domElement;
  const onDown = (e: PointerEvent) => {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    el.setPointerCapture(e.pointerId);
  };
  const onUp = (e: PointerEvent) => {
    dragging = false;
    if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
  };
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const onMove = (e: PointerEvent) => {
    if (dragging) {
      yaw -= (e.clientX - lastX) * 0.006;
      pitch += (e.clientY - lastY) * 0.005;
      lastX = e.clientX;
      lastY = e.clientY;
      applyCamera();
      return;
    }
    const r = el.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(plotMeshes, false)[0];
    onHover(hit ? String((hit.object.userData as { plot?: string }).plot ?? "") || null : null);
  };
  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    dist *= e.deltaY > 0 ? 1.09 : 0.92;
    applyCamera();
  };
  el.addEventListener("pointerdown", onDown);
  el.addEventListener("pointerup", onUp);
  el.addEventListener("pointercancel", onUp);
  el.addEventListener("pointermove", onMove);
  el.addEventListener("wheel", onWheel, { passive: false });

  /* ---- sun / sky ---------------------------------------------------------- */
  const SKY_DAY = colour.skyDay;
  const SKY_DUSK = colour.skyDusk;
  const SKY_NIGHT = colour.skyNight;
  const setSun = ({ altitude, azimuth }: { altitude: number; azimuth: number }) => {
    const v = sunVector({ altitude, azimuth });
    sunLight.position.set(v[0] * span * 2.2, Math.max(v[1], 0.02) * span * 2.2, v[2] * span * 2.2);
    sunLight.target.position.set(0, 0, 0);

    const a = altitude;
    const day = clamp01((a + 0.05) / 0.35);
    const dusk = clamp01(1 - Math.abs(a) / 0.22);
    const night = clamp01(-(a + 0.02) / 0.2);

    sunLight.intensity = 3.1 * day;
    /* warm and weak near the horizon, white and strong overhead — the single
       cheapest cue that the light is a real time of day */
    sunLight.color.setHSL(0.09, 0.55 * (1 - day) + 0.02, 0.5 + 0.2 * day);
    /* ⚠️ THE NIGHT FLOOR IS 0.62, AND IT IS NOT REALISM — IT IS LEGIBILITY.
       At a physically honest ambient (0.28) a readback put 92% of the frame
       below luma 32: the lamps were the only thing visible and the layout read
       as a black screen with a few orange dots, which a reader reports as
       broken rather than as night. Moonlight over open country genuinely is
       this readable once eyes adjust; a monitor gets no such adjustment. Keep
       the sky tint cool so it still says night. */
    hemi.intensity = 0.62 + 0.62 * day + 0.1 * dusk;
    hemi.color.setRGB(0.52 + 0.4 * day, 0.62 + 0.3 * day, 1);
    hemi.groundColor.setRGB(0.18 + 0.27 * day, 0.16 + 0.22 * day, 0.16 + 0.06 * day);

    const sky = SKY_NIGHT.clone().lerp(SKY_DUSK, clamp01(dusk + 0.15)).lerp(SKY_DAY, day);
    scene.background = sky;
    scene.fog = new THREE.Fog(sky.getHex(), span * 1.6, span * 4.2);

    headMat.emissiveIntensity = night * 2.4;
    for (const pl of lampLights) pl.intensity = night * 38;
    invalidate();
  };

  /* ---- loop / resize ------------------------------------------------------ */
  const ro = new ResizeObserver(() => {
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    invalidate();
  });
  ro.observe(wrap);

  /* ⚠️ RENDERS ON DEMAND, NOT EVERY FRAME. Nothing in this scene animates by
     itself — the sun only moves when a reader drags the slider — so a permanent
     rAF loop would burn a phone's battery for a still picture, on a page people
     leave open while they scroll a plot schedule. Redraw when something has
     actually changed, and stop entirely while the view is off-screen or the tab
     is hidden. */
  let raf = 0;
  let dirty = true;
  let onScreen = true;
  function invalidate() {
    dirty = true;
    if (!raf && onScreen) raf = requestAnimationFrame(frame);
  }
  function frame() {
    raf = 0;
    if (!onScreen || document.hidden) return;
    if (!dirty) return;
    dirty = false;
    renderer.render(scene, camera);
  }
  const io = new IntersectionObserver(
    (entries) => {
      onScreen = entries.some((e) => e.isIntersecting);
      if (onScreen) invalidate();
    },
    { threshold: 0 },
  );
  io.observe(wrap);
  const onVisibility = () => {
    if (!document.hidden) invalidate();
  };
  document.addEventListener("visibilitychange", onVisibility);

  applyCamera();

  return {
    setSun,
    dispose: () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("wheel", onWheel);
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((mm) => mm.dispose());
        else mat?.dispose();
      });
      renderer.dispose();
      el.remove();
    },
  };
}

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);
