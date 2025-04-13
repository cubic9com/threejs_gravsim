/**
 * Gravity Simulation Application
 * Solar system simulation using Three.js
 */

// Global variables
let scene, camera, renderer;
let physicsEngine, inputHandler, sun;
let container, planetCountElement;
let lastDrawTime = 0;

// Initialization
function init() {
    // Get HTML elements
    container = document.getElementById('container');
    planetCountElement = document.getElementById('planet-count');
    
    // Initialize Three.js scene, camera, and renderer
    initThreeJS();
    
    // Initialize physics engine
    physicsEngine = new PhysicsEngine(scene);
    
    // Initialize sun
    sun = new Sun(scene);
    
    // Initialize input handler
    inputHandler = new InputHandler(physicsEngine, camera, container);
    
    // Start animation loop
    animate();
}

/**
 * Initialize Three.js
 */
function initThreeJS() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    // Create camera
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspectRatio = width / height;
    
    // Set camera field of view based on screen size
    const viewSize = 50;
    camera = new THREE.OrthographicCamera(
        -viewSize * aspectRatio, viewSize * aspectRatio,
        viewSize, -viewSize,
        0.1, 1000
    );
    camera.position.z = 10;
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
}

/**
 * Handle window resize
 */
function onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspectRatio = width / height;
    
    // Update camera aspect ratio
    const viewSize = 50;
    camera.left = -viewSize * aspectRatio;
    camera.right = viewSize * aspectRatio;
    camera.top = viewSize;
    camera.bottom = -viewSize;
    camera.updateProjectionMatrix();
    
    // Update renderer size
    renderer.setSize(width, height);
}

/**
 * Animation loop
 */
function animate() {
    requestAnimationFrame(animate);
    
    // Get current time
    const currentTime = Date.now();
    
    // Limit drawing interval (to reduce processing load)
    if (currentTime - lastDrawTime > RenderConstants.DRAW_INTERVAL) {
        lastDrawTime = currentTime;
        
        // Process input operations
        const isPointerDown = inputHandler.update();
        
        // Update physics simulation
        physicsEngine.update();
        
        // Remove planets that are off-screen
        const maxBoundsX = camera.right + RenderConstants.SCREEN_MARGIN;
        const maxBoundsY = camera.top + RenderConstants.SCREEN_MARGIN;
        physicsEngine.removeOutOfBoundsPlanets(maxBoundsX, maxBoundsY);
        
        // Update sun
        sun.update();
        
        // Display planet count
        updatePlanetCount();
        
        // Render scene
        renderer.render(scene, camera);
    }
}

/**
 * Update planet count
 */
function updatePlanetCount() {
    planetCountElement.textContent = `Planets: ${physicsEngine.getPlanetCount()}`;
}

// Initialize when page loading is complete
window.addEventListener('DOMContentLoaded', init);
