/**
 * Input Handler Class
 * Manages mouse and touch operations
 */
class InputHandler {
    /**
     * Constructor
     * @param {PhysicsEngine} physicsEngine - Physics engine
     * @param {THREE.Camera} camera - Three.js camera
     * @param {HTMLElement} container - Container element that receives events
     */
    constructor(physicsEngine, camera, container) {
        this.physicsEngine = physicsEngine;
        this.camera = camera;
        this.container = container;
        
        this.isPointerDown = false;
        this.pointerStartX = 0;
        this.pointerStartY = 0;
        this.pointerCurrentX = 0;
        this.pointerCurrentY = 0;
        
        // Object for displaying the arrow
        this.arrowHelper = null;
        
        // Get audio manager instance
        this.audioManager = AudioManager.getInstance();
        
        // Set up event listeners
        this.setupEventListeners();
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Mouse events
        this.container.addEventListener('mousedown', this.onPointerDown.bind(this));
        this.container.addEventListener('mousemove', this.onPointerMove.bind(this));
        this.container.addEventListener('mouseup', this.onPointerUp.bind(this));
        
        // Touch events
        this.container.addEventListener('touchstart', this.onPointerDown.bind(this));
        this.container.addEventListener('touchmove', this.onPointerMove.bind(this));
        this.container.addEventListener('touchend', this.onPointerUp.bind(this));
    }
    
    /**
     * Handler for when pointer (mouse or touch) is pressed
     * @param {Event} event - Event object
     */
    onPointerDown(event) {
        event.preventDefault();
        
        // Determine if it's mouse or touch and get pointer position
        const pointer = event.touches ? event.touches[0] : event;
        
        // Get client coordinates
        const rect = this.container.getBoundingClientRect();
        const x = pointer.clientX - rect.left;
        const y = pointer.clientY - rect.top;
        
        // Update pointer state
        this.isPointerDown = true;
        this.pointerStartX = x;
        this.pointerStartY = y;
        this.pointerCurrentX = x;
        this.pointerCurrentY = y;
        
        // Create arrow helper
        this.createArrowHelper();
    }
    
    /**
     * Handler for when pointer is moved
     * @param {Event} event - Event object
     */
    onPointerMove(event) {
        if (!this.isPointerDown) return;
        
        event.preventDefault();
        
        // Determine if it's mouse or touch and get pointer position
        const pointer = event.touches ? event.touches[0] : event;
        
        // Get client coordinates
        const rect = this.container.getBoundingClientRect();
        const x = pointer.clientX - rect.left;
        const y = pointer.clientY - rect.top;
        
        // Update pointer state
        this.pointerCurrentX = x;
        this.pointerCurrentY = y;
        
        // Update arrow helper
        this.updateArrowHelper();
    }
    
    /**
     * Handler for when pointer is released
     * @param {Event} event - Event object
     */
    onPointerUp(event) {
        if (!this.isPointerDown) return;
        
        event.preventDefault();
        
        // Calculate initial velocity from drag distance and direction
        const dx = this.pointerCurrentX - this.pointerStartX;
        const dy = this.pointerCurrentY - this.pointerStartY;
        
        // Velocity magnitude is proportional to distance
        // Browser coordinate system (down is positive) and Three.js coordinate system (up is positive) have opposite Y axes, so invert Y velocity
        const vx = dx * PhysicsConstants.SPEED_FACTOR;
        const vy = -dy * PhysicsConstants.SPEED_FACTOR; // Invert Y direction
        
        // Convert screen coordinates to world coordinates
        const worldCoords = this.screenToWorld(this.pointerStartX, this.pointerStartY);
        
        // Add a new planet
        this.physicsEngine.addPlanet(worldCoords.x, worldCoords.y, vx, vy);
        
        // Play sound for planet creation
        this.audioManager.playSound('planetCreation');
        
        // Reset pointer state
        this.isPointerDown = false;
        
        // Remove arrow helper
        this.removeArrowHelper();
    }
    
    /**
     * Convert screen coordinates to world coordinates
     * @param {number} screenX - Screen X coordinate
     * @param {number} screenY - Screen Y coordinate
     * @returns {Object} World coordinates {x, y}
     */
    screenToWorld(screenX, screenY) {
        // Convert screen coordinates to normalized coordinates (-1 to +1)
        const rect = this.container.getBoundingClientRect();
        const normalizedX = (screenX / rect.width) * 2 - 1;
        const normalizedY = -(screenY / rect.height) * 2 + 1;
        
        // Convert normalized coordinates to world coordinates
        const vector = new THREE.Vector3(normalizedX, normalizedY, 0);
        vector.unproject(this.camera);
        
        return { x: vector.x, y: vector.y };
    }
    
    /**
     * Create arrow helper
     */
    createArrowHelper() {
        // Remove existing arrow helper if any
        this.removeArrowHelper();
        
        // World coordinates of the starting point
        const startWorld = this.screenToWorld(this.pointerStartX, this.pointerStartY);
        
        // Create a small circle to indicate the arrow's starting point
        const circleGeometry = new THREE.CircleGeometry(PlanetConstants.RADIUS, 16);
        const circleMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        this.startCircle = new THREE.Mesh(circleGeometry, circleMaterial);
        this.startCircle.position.set(startWorld.x, startWorld.y, 0);
        this.physicsEngine.scene.add(this.startCircle);
        
        // Create the arrow line
        const lineGeometry = new THREE.BufferGeometry();
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0xFFFFFF });
        
        // Initial position (same as starting point)
        const positions = new Float32Array([
            startWorld.x, startWorld.y, 0,
            startWorld.x, startWorld.y, 0
        ]);
        
        lineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.arrowLine = new THREE.Line(lineGeometry, lineMaterial);
        this.physicsEngine.scene.add(this.arrowLine);
        
        // Create the arrow head (triangle)
        const arrowHeadPoints = [
            new THREE.Vector3(startWorld.x, startWorld.y, 0),
            new THREE.Vector3(startWorld.x, startWorld.y, 0),
            new THREE.Vector3(startWorld.x, startWorld.y, 0)
        ];
        
        const arrowHeadGeometry = new THREE.BufferGeometry().setFromPoints(arrowHeadPoints);
        const arrowHeadMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFFFFFF,
            side: THREE.DoubleSide // Display both sides
        });
        
        // Set indices to form a triangle
        arrowHeadGeometry.setIndex([0, 1, 2]);
        this.arrowHead = new THREE.Mesh(arrowHeadGeometry, arrowHeadMaterial);
        this.physicsEngine.scene.add(this.arrowHead);
    }
    
    /**
     * Update arrow helper
     */
    updateArrowHelper() {
        if (!this.arrowLine || !this.arrowHead) return;
        
        // World coordinates of the starting point and current position
        const startWorld = this.screenToWorld(this.pointerStartX, this.pointerStartY);
        const currentWorld = this.screenToWorld(this.pointerCurrentX, this.pointerCurrentY);
        
        // Update the position of the arrow line
        const linePositions = this.arrowLine.geometry.attributes.position.array;
        linePositions[0] = startWorld.x;
        linePositions[1] = startWorld.y;
        linePositions[2] = 0;
        linePositions[3] = currentWorld.x;
        linePositions[4] = currentWorld.y;
        linePositions[5] = 0;
        
        this.arrowLine.geometry.attributes.position.needsUpdate = true;
        
        // Calculate direction vector
        const dx = currentWorld.x - startWorld.x;
        const dy = currentWorld.y - startWorld.y;
        
        // Don't update if vector length is 0
        const length = Math.sqrt(dx * dx + dy * dy);
        if (length < 0.001) return;
        
        // Normalized direction vector
        const nx = dx / length;
        const ny = dy / length;
        
        // Size of the arrow head
        const headSize = 2.5;
        
        // Calculate the position of the arrow head
        const perpX = -ny;  // Perpendicular vector
        const perpY = nx;
        
        // Triangle vertices
        const x1 = currentWorld.x;
        const y1 = currentWorld.y;
        const x2 = currentWorld.x - headSize * nx + headSize * 0.5 * perpX;
        const y2 = currentWorld.y - headSize * ny + headSize * 0.5 * perpY;
        const x3 = currentWorld.x - headSize * nx - headSize * 0.5 * perpX;
        const y3 = currentWorld.y - headSize * ny - headSize * 0.5 * perpY;
        
        // Create new geometry for the arrow head
        const arrowHeadPoints = [
            new THREE.Vector3(x1, y1, 0),
            new THREE.Vector3(x2, y2, 0),
            new THREE.Vector3(x3, y3, 0)
        ];
        
        // Dispose of old geometry
        if (this.arrowHead.geometry) {
            this.arrowHead.geometry.dispose();
        }
        
        // Set new geometry
        const newGeometry = new THREE.BufferGeometry().setFromPoints(arrowHeadPoints);
        newGeometry.setIndex([0, 1, 2]);
        this.arrowHead.geometry = newGeometry;
    }
    
    /**
     * Remove arrow helper
     */
    removeArrowHelper() {
        if (this.startCircle) {
            this.physicsEngine.scene.remove(this.startCircle);
            this.startCircle.geometry.dispose();
            this.startCircle.material.dispose();
            this.startCircle = null;
        }
        
        if (this.arrowLine) {
            this.physicsEngine.scene.remove(this.arrowLine);
            this.arrowLine.geometry.dispose();
            this.arrowLine.material.dispose();
            this.arrowLine = null;
        }
        
        if (this.arrowHead) {
            this.physicsEngine.scene.remove(this.arrowHead);
            this.arrowHead.geometry.dispose();
            this.arrowHead.material.dispose();
            this.arrowHead = null;
        }
    }
    
    /**
     * Update input state
     * @returns {boolean} Whether the pointer is pressed
     */
    update() {
        return this.isPointerDown;
    }
    
    /**
     * Get X coordinate of pointer start position
     * @returns {number} X coordinate of pointer start position
     */
    getPointerStartX() {
        return this.pointerStartX;
    }
    
    /**
     * Get Y coordinate of pointer start position
     * @returns {number} Y coordinate of pointer start position
     */
    getPointerStartY() {
        return this.pointerStartY;
    }
}
