import * as THREE from 'three';

// Global clock for time-based animations
const clock = new THREE.Clock();

// Mouse tracker object
const mouse = {
  x: 0,
  y: 0,
  targetX: 0,
  targetY: 0
};

// Handle global mouse moves for parallax
window.addEventListener('mousemove', (event) => {
  // Normalize mouse coordinates to [-1, 1]
  mouse.targetX = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.targetY = -(event.clientY / window.innerHeight) * 2 + 1;
});

/* ==========================================================================
   1. Interactive Particles Background Scene
   ========================================================================== */
export function initBackgroundParticles() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  // Create Scene, Camera, and Renderer
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 30;

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Particles Geometry
  const particleCount = 80;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount * 3; i += 3) {
    // Spread particles in a 3D box
    positions[i] = (Math.random() - 0.5) * 80;
    positions[i + 1] = (Math.random() - 0.5) * 80;
    positions[i + 2] = (Math.random() - 0.5) * 60;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  // Create circular particle texture using HTML Canvas
  const pCanvas = document.createElement('canvas');
  pCanvas.width = 16;
  pCanvas.height = 16;
  const ctx = pCanvas.getContext('2d');
  const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 16, 16);
  const pTexture = new THREE.CanvasTexture(pCanvas);

  // Material settings (white minimal glowing dots)
  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.16,
    map: pTexture,
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const particleSystem = new THREE.Points(geometry, material);
  scene.add(particleSystem);

  // Resize Handler
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });

  // Scroll Parallax Handler
  let scrollY = window.scrollY;
  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
  });

  // Animation Loop
  const animate = () => {
    requestAnimationFrame(animate);

    const time = clock.getElapsedTime();

    // Rotate particle system slowly
    particleSystem.rotation.y = time * 0.02;
    particleSystem.rotation.x = time * 0.01;

    // Apply mouse parallax lerp
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;

    particleSystem.position.x = mouse.x * 2.5;
    particleSystem.position.y = mouse.y * 2.5;

    // Apply scroll parallax
    particleSystem.position.z = scrollY * 0.015;

    renderer.render(scene, camera);
  };

  animate();
}

/* ==========================================================================
   2. Holographic Morphing Mesh Scene in Hero
   ========================================================================== */
export function initHeroHologram() {
  const container = document.getElementById('hero-canvas-container');
  if (!container) return;

  // Create Canvas Element
  const canvas = document.createElement('canvas');
  canvas.id = 'hero-canvas';
  // Insert canvas as the first child of container (behind the HUD overlays)
  container.insertBefore(canvas, container.firstChild);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.z = 18;

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
  });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Hologram Geometry (Torus Knot)
  const geometry = new THREE.TorusKnotGeometry(3.5, 1.1, 150, 20);

  // Store original positions for deformation math
  const count = geometry.attributes.position.count;
  const originalPositions = new Float32Array(count * 3);
  const positionAttr = geometry.attributes.position;
  for (let i = 0; i < count * 3; i++) {
    originalPositions[i] = positionAttr.array[i];
  }
  geometry.userData = { originalPositions };

  // Create wireframe mesh layer
  const meshMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color('#bd00ff'),
    wireframe: true,
    transparent: true,
    opacity: 0.18,
    blending: THREE.AdditiveBlending
  });
  const hologramMesh = new THREE.Mesh(geometry, meshMaterial);
  scene.add(hologramMesh);

  // Create point cloud layer on top of mesh
  const pointsMaterial = new THREE.PointsMaterial({
    color: new THREE.Color('#00f0ff'),
    size: 0.08,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  });
  const hologramPoints = new THREE.Points(geometry, pointsMaterial);
  scene.add(hologramPoints);


  // Add subtle light guides
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
  scene.add(ambientLight);

  // HUD Rotation display metric target
  const hudRotVal = document.getElementById('hud-rot-val');

  // Resize Handler
  const resizeObserver = new ResizeObserver(() => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });
  resizeObserver.observe(container);

  // Scroll offset tracking
  let scrollY = window.scrollY;
  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
  });

  // Track if mouse is inside hero canvas container
  let isHovered = false;
  container.addEventListener('mouseenter', () => { isHovered = true; });
  container.addEventListener('mouseleave', () => { isHovered = false; });

  // Animation Loop
  const animate = () => {
    requestAnimationFrame(animate);

    const time = clock.getElapsedTime();
    
    // Core rotations (influenced by mouse hover coordinates)
    const baseRotationSpeedX = time * 0.15;
    const baseRotationSpeedY = time * 0.22;

    const targetRotX = baseRotationSpeedX - (mouse.y * 0.5);
    const targetRotY = baseRotationSpeedY + (mouse.x * 0.5);

    hologramMesh.rotation.x += (targetRotX - hologramMesh.rotation.x) * 0.05;
    hologramMesh.rotation.y += (targetRotY - hologramMesh.rotation.y) * 0.05;
    
    hologramPoints.rotation.x = hologramMesh.rotation.x;
    hologramPoints.rotation.y = hologramMesh.rotation.y;



    // Update HUD indicator value
    if (hudRotVal) {
      hudRotVal.textContent = Math.abs(hologramMesh.rotation.y % (Math.PI * 2)).toFixed(2);
    }

    // Vertex Morphing: Sine wave distortion based on vertex indices and coordinate offsets
    const currentPositions = positionAttr.array;
    const orig = geometry.userData.originalPositions;
    
    // Wave intensity increases slightly when hovered
    const waveIntensity = isHovered ? 0.35 : 0.15;
    const speedMultiplier = isHovered ? 3.5 : 1.8;

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      const x = orig[idx];
      const y = orig[idx + 1];
      const z = orig[idx + 2];

      // Calculate distortion factor using trigonometric wave layers
      const distance = Math.sqrt(x*x + y*y + z*z);
      const wave = Math.sin(distance * 1.5 - time * speedMultiplier) * waveIntensity;

      // Displace coordinates along normal-like projection
      currentPositions[idx] = x + (x / distance) * wave;
      currentPositions[idx + 1] = y + (y / distance) * wave;
      currentPositions[idx + 2] = z + (z / distance) * wave;
    }
    
    // Flag to GPU that geometries have updated coordinates
    positionAttr.needsUpdate = true;

    // Slowly push hologram off-screen on scroll
    scene.position.y = -scrollY * 0.008;
    scene.position.z = -scrollY * 0.005;

    renderer.render(scene, camera);
  };

  animate();
}
