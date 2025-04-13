/**
 * Planet Class
 * Manages physical properties and rendering information of planets
 */
class Planet {
    /**
     * Constructor
     * @param {THREE.Scene} scene - Three.js scene
     * @param {number} x - Initial X coordinate
     * @param {number} y - Initial Y coordinate
     * @param {number} vx - Initial X velocity
     * @param {number} vy - Initial Y velocity
     * @param {number} color - Planet color
     */
    constructor(scene, x, y, vx, vy, color) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        
        // Create planet geometry and material
        this.geometry = new THREE.SphereGeometry(PlanetConstants.RADIUS, 16, 16);
        this.material = new THREE.MeshBasicMaterial({ 
            color: this.color,
            transparent: false,
            opacity: 1.0
        });
        
        // Create planet mesh
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.set(this.x, this.y, 0);
        this.scene.add(this.mesh);
        
        // Initialize trail (call after planet is created)
        setTimeout(() => {
            this.initTrail();
        }, 0);
    }
    
    /**
     * Initialize trail
     */
    initTrail() {
        // Initialize trail positions
        this.trailPositions = [];
        for (let i = 0; i < PlanetConstants.TRAIL_LENGTH; i++) {
            this.trailPositions.push({ x: this.x, y: this.y });
        }
        
        // Create trail points
        const points = [];
        for (let i = 0; i < PlanetConstants.TRAIL_LENGTH; i++) {
            points.push(new THREE.Vector3(this.x, this.y, 0));
        }
        
        // Create trail geometry
        this.trailGeometry = new THREE.BufferGeometry().setFromPoints(points);
        
        // Create trail material
        this.trailMaterial = new THREE.LineBasicMaterial({
            color: this.color,
            transparent: true,
            opacity: 0.5
        });
        
        // Create trail line
        this.trailLine = new THREE.Line(this.trailGeometry, this.trailMaterial);
        this.scene.add(this.trailLine);
    }
    
    /**
     * Update trail geometry
     */
    updateTrailGeometry() {
        // Create trail points
        const points = [];
        for (let i = 0; i < this.trailPositions.length; i++) {
            const point = this.trailPositions[i];
            points.push(new THREE.Vector3(point.x, point.y, 0));
        }
        
        // Create new geometry
        const newGeometry = new THREE.BufferGeometry().setFromPoints(points);
        
        // Dispose of old geometry
        if (this.trailGeometry) {
            this.trailGeometry.dispose();
        }
        
        // Set new geometry
        this.trailLine.geometry = newGeometry;
        this.trailGeometry = newGeometry;
    }
    
    /**
     * Update planet position
     * @param {number} ax - X-direction acceleration
     * @param {number} ay - Y-direction acceleration
     * @param {boolean} updateTrails - Whether to update trails
     */
    update(ax, ay, updateTrails) {
        // Update velocity: v = v + a * dt
        this.vx += ax * PhysicsConstants.TIME_SCALE;
        this.vy += ay * PhysicsConstants.TIME_SCALE;
        
        // Update position: p = p + v * dt
        this.x += this.vx * PhysicsConstants.TIME_SCALE;
        this.y += this.vy * PhysicsConstants.TIME_SCALE;
        
        // Update mesh position
        this.mesh.position.set(this.x, this.y, 0);
        
        // Update trail positions (at regular intervals)
        if (updateTrails) {
            // Shift old positions back
            for (let j = PlanetConstants.TRAIL_LENGTH - 1; j > 0; j--) {
                this.trailPositions[j] = this.trailPositions[j - 1];
            }
            
            // Add latest position to the front
            this.trailPositions[0] = { x: this.x, y: this.y };
            
            // Update trail geometry
            this.updateTrailGeometry();
        }
    }
    
    /**
     * Determine if planet is off-screen
     * @param {number} maxX - Maximum X coordinate of the screen
     * @param {number} maxY - Maximum Y coordinate of the screen
     * @returns {boolean} true if off-screen
     */
    isOutOfBounds(maxX, maxY) {
        return (Math.abs(this.x) > maxX || Math.abs(this.y) > maxY);
    }
    
    /**
     * Determine if planet has collided with the sun
     * @returns {boolean} true if collided with the sun
     */
    isCollidedWithSun() {
        // Collision occurs if distance from sun center is less than sun radius
        const distanceSquared = this.x * this.x + this.y * this.y;
        return (distanceSquared < SunConstants.RADIUS * SunConstants.RADIUS);
    }
    
    /**
     * Remove planet
     */
    remove() {
        // Remove mesh from scene
        this.scene.remove(this.mesh);
        
        // Remove trail from scene
        this.scene.remove(this.trailLine);
        
        // Dispose of geometry and material
        this.geometry.dispose();
        this.material.dispose();
        this.trailGeometry.dispose();
        this.trailMaterial.dispose();
    }
    
    /**
     * Generate random pastel color
     * @returns {number} Generated color
     */
    static randomPastelColor() {
        let r, g, b;
        
        // Randomly emphasize one of the three components, make others medium-low
        switch (Math.floor(Math.random() * 3)) {
            case 0: // Emphasize red
                r = 200 + Math.random() * 55;  // 200-255
                g = 80 + Math.random() * 149;  // 80-229
                b = 80 + Math.random() * 149;  // 80-229
                break;
            case 1: // Emphasize green
                r = 80 + Math.random() * 149;  // 80-229
                g = 200 + Math.random() * 55;  // 200-255
                b = 80 + Math.random() * 149;  // 80-229
                break;
            case 2: // Emphasize blue
                r = 80 + Math.random() * 149;  // 80-229
                g = 80 + Math.random() * 149;  // 80-229
                b = 200 + Math.random() * 55;  // 200-255
                break;
        }
        
        // Normalize RGB values to 0-1 range
        r /= 255;
        g /= 255;
        b /= 255;
        
        // Create THREE.Color object and return hex color code
        return new THREE.Color(r, g, b).getHex();
    }
}
