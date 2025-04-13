/**
 * Physics Engine Class
 * Calculates planet movements and executes physics simulation
 */
class PhysicsEngine {
    /**
     * Constructor
     * @param {THREE.Scene} scene - Three.js scene
     */
    constructor(scene) {
        this.scene = scene;
        this.planets = [];
        this.lastTrailUpdateTime = 0;
        this.distanceScaleSquared = PhysicsConstants.DISTANCE_SCALE * PhysicsConstants.DISTANCE_SCALE;
        
        // Collision effect variables
        this.collisionEffectActive = false;
        this.collisionEffectX = 0;
        this.collisionEffectY = 0;
        this.collisionEffectStartTime = 0;
        this.collisionEffectMesh = null;
    }
    
    /**
     * Add a planet
     * @param {number} x - Initial X coordinate
     * @param {number} y - Initial Y coordinate
     * @param {number} vx - Initial X velocity
     * @param {number} vy - Initial Y velocity
     */
    addPlanet(x, y, vx, vy) {
        const color = Planet.randomPastelColor();
        const planet = new Planet(this.scene, x, y, vx, vy, color);
        this.planets.push(planet);
        
        // Remove the oldest planet if the maximum number of planets is exceeded
        if (this.planets.length > PlanetConstants.MAX_COUNT) {
            const oldestPlanet = this.planets.shift();
            oldestPlanet.remove();
        }
    }
    
    /**
     * Determine whether trails should be updated
     * @returns {boolean} true if trails should be updated
     */
    shouldUpdateTrails() {
        const currentTime = Date.now();
        if (currentTime - this.lastTrailUpdateTime > RenderConstants.TRAIL_UPDATE_INTERVAL) {
            this.lastTrailUpdateTime = currentTime;
            return true;
        }
        return false;
    }
    
    /**
     * Calculate gravity from the sun
     * @param {number} planetIndex - Planet index
     * @param {Array<number>} ax - Array of X-direction accelerations
     * @param {Array<number>} ay - Array of Y-direction accelerations
     */
    calculateSunGravity(planetIndex, ax, ay) {
        // Calculate gravity from the sun (sun is at origin (0,0))
        const planet = this.planets[planetIndex];
        const dx = -planet.x;
        const dy = -planet.y;
        const r2 = dx*dx + dy*dy;
        const r = Math.sqrt(r2);
        
        // Law of universal gravitation: F = G * m1 * m2 / r^2
        const force = PhysicsConstants.G * PlanetConstants.MASS * SunConstants.MASS / (r * r * this.distanceScaleSquared);
        
        // Acceleration: a = F / m
        const accelX = force * dx / (r * PlanetConstants.MASS);
        const accelY = force * dy / (r * PlanetConstants.MASS);
        
        ax[planetIndex] += accelX;
        ay[planetIndex] += accelY;
    }
    
    /**
     * Calculate gravity between planets
     * @param {Array<number>} ax - Array of X-direction accelerations
     * @param {Array<number>} ay - Array of Y-direction accelerations
     */
    calculatePlanetGravity(ax, ay) {
        // Calculate gravity between planets (skip calculations between distant planets to reduce processing load)
        for (let i = 0; i < this.planets.length; i++) {
            for (let j = i + 1; j < this.planets.length; j++) {
                // Calculate distance between planets
                const dx = this.planets[j].x - this.planets[i].x;
                const dy = this.planets[j].y - this.planets[i].y;
                const r2 = dx*dx + dy*dy;
                
                // Skip calculation if distance is too far (to reduce processing load)
                const maxDistanceSquared = PhysicsConstants.MAX_FORCE_DISTANCE * PhysicsConstants.MAX_FORCE_DISTANCE;
                if (r2 > maxDistanceSquared) {
                    continue;
                }
                
                // Apply minimum distance (to prevent collisions)
                const minDistanceSquared = PhysicsConstants.MIN_DISTANCE * PhysicsConstants.MIN_DISTANCE;
                const effectiveR2 = r2 < minDistanceSquared ? minDistanceSquared : r2;
                
                const r = Math.sqrt(effectiveR2);
                
                // Law of universal gravitation: F = G * m1 * m2 / r^2
                const force = PhysicsConstants.G * PlanetConstants.MASS * PlanetConstants.MASS / (r * r * this.distanceScaleSquared);
                
                // Acceleration: a = F / m
                const accelX = force * dx / (r * PlanetConstants.MASS);
                const accelY = force * dy / (r * PlanetConstants.MASS);
                
                // Acceleration of planet i
                ax[i] += accelX;
                ay[i] += accelY;
                
                // Acceleration of planet j (opposite direction)
                ax[j] -= accelX;
                ay[j] -= accelY;
            }
        }
    }
    
    /**
     * Update physics simulation
     * @returns {boolean} Whether trail positions were updated
     */
    update() {
        // Determine whether trail positions should be updated
        const shouldUpdateTrailPositions = this.shouldUpdateTrails();
        
        // Check if collision effect has expired
        if (this.collisionEffectActive) {
            const currentTime = Date.now();
            if (currentTime - this.collisionEffectStartTime > CollisionConstants.COLLISION_EFFECT_DURATION) {
                this.collisionEffectActive = false;
                
                // Remove collision effect mesh if it exists
                if (this.collisionEffectMesh) {
                    this.scene.remove(this.collisionEffectMesh);
                    this.collisionEffectMesh = null;
                }
            }
        }
        
        // Early return if there are no planets
        if (this.planets.length === 0) {
            return shouldUpdateTrailPositions;
        }
        
        // Initialize acceleration for each planet
        const accelerationX = new Array(this.planets.length).fill(0);
        const accelerationY = new Array(this.planets.length).fill(0);
        
        // Apply gravity from the sun to each planet
        for (let i = 0; i < this.planets.length; i++) {
            this.calculateSunGravity(i, accelerationX, accelerationY);
        }
        
        // Calculate gravity between planets
        this.calculatePlanetGravity(accelerationX, accelerationY);
        
        // Update velocity and position of each planet
        for (let i = 0; i < this.planets.length; i++) {
            this.planets[i].update(accelerationX[i], accelerationY[i], shouldUpdateTrailPositions);
        }
        
        return shouldUpdateTrailPositions;
    }
    
    /**
     * Remove planets that are off-screen
     * @param {number} maxX - Maximum X coordinate of the screen
     * @param {number} maxY - Maximum Y coordinate of the screen
     */
    removeOutOfBoundsPlanets(maxX, maxY) {
        // Early return if there are no planets
        if (this.planets.length === 0) {
            return;
        }
        
        // Remove planets that are off-screen or have collided with the sun
        // Process from the end to prevent index shifting due to removal
        for (let i = this.planets.length - 1; i >= 0; i--) {
            const planet = this.planets[i];
            
            // Remove planets that are off-screen
            if (planet.isOutOfBounds(maxX, maxY)) {
                planet.remove();
                this.planets.splice(i, 1);
            }
            // Remove planets that have collided with the sun and play sound effect
            else if (planet.isCollidedWithSun()) {
                // Record collision position and display effect
                this.collisionEffectActive = true;
                this.collisionEffectX = planet.x;
                this.collisionEffectY = planet.y;
                this.collisionEffectStartTime = Date.now();
                
                // Create collision effect mesh
                if (this.collisionEffectMesh) {
                    this.scene.remove(this.collisionEffectMesh);
                }
                
                const effectGeometry = new THREE.CircleGeometry(CollisionConstants.COLLISION_EFFECT_RADIUS, 32);
                const effectMaterial = new THREE.MeshBasicMaterial({
                    color: CollisionConstants.COLLISION_EFFECT_COLOR
                });
                this.collisionEffectMesh = new THREE.Mesh(effectGeometry, effectMaterial);
                this.collisionEffectMesh.position.set(this.collisionEffectX, this.collisionEffectY, 0);
                this.scene.add(this.collisionEffectMesh);
                
                // Remove planet
                planet.remove();
                this.planets.splice(i, 1);
            }
        }
    }
    
    /**
     * Get the number of planets
     * @returns {number} Number of planets
     */
    getPlanetCount() {
        return this.planets.length;
    }
    
    /**
     * Get the collection of planets
     * @returns {Array<Planet>} Collection of planets
     */
    getPlanets() {
        return this.planets;
    }
    
    /**
     * Check if there is an active collision effect
     * @returns {boolean} true if there is an active collision effect
     */
    hasActiveCollisionEffect() {
        return this.collisionEffectActive;
    }
    
    /**
     * Get X coordinate of collision effect
     * @returns {number} X coordinate of collision effect
     */
    getCollisionEffectX() {
        return this.collisionEffectX;
    }
    
    /**
     * Get Y coordinate of collision effect
     * @returns {number} Y coordinate of collision effect
     */
    getCollisionEffectY() {
        return this.collisionEffectY;
    }
}
