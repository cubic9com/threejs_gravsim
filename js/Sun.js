/**
 * Sun Class
 * Manages rendering and physical properties of the sun
 */
class Sun {
    /**
     * Constructor
     * @param {THREE.Scene} scene - Three.js scene
     */
    constructor(scene) {
        this.scene = scene;
        
        // Create sun light
        this.light = new THREE.PointLight(SunConstants.COLOR, 1, 1000);
        this.light.position.set(0, 0, 0);
        this.scene.add(this.light);
        
        // Create sun rays
        this.createSunRays();
        
        // Create sun geometry and material
        this.geometry = new THREE.CircleGeometry(SunConstants.RADIUS, 32);
        this.material = new THREE.MeshBasicMaterial({
            color: SunConstants.COLOR,
            transparent: false,
            opacity: 1.0
        });
        
        // Create sun mesh
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.scene.add(this.mesh);
    }
    
    /**
     * Create sun rays
     */
    createSunRays() {
        this.rays = [];
        
        // Create 10 rays
        for (let i = 0; i < 10; i++) {
            // Random angle (0-359 degrees)
            const angle = Math.random() * Math.PI * 2;
            
            // Line starting point (sun center, Z coordinate set behind the sun body)
            const startX = 0;
            const startY = 0;
            const startZ = -1; // Set behind the sun body
            
            // Line endpoint 
            const length = 2 + Math.random() * 2;
            const endX = length * Math.cos(angle);
            const endY = length * Math.sin(angle);
            const endZ = -1; // Set behind the sun body
            
            // Create ray geometry
            const rayGeometry = new THREE.BufferGeometry();
            const vertices = new Float32Array([
                startX, startY, startZ,
                endX, endY, endZ
            ]);
            rayGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
            
            // Create ray material
            const rayMaterial = new THREE.LineBasicMaterial({
                color: SunConstants.COLOR
            });
            
            // Create ray line
            const ray = new THREE.Line(rayGeometry, rayMaterial);
            this.scene.add(ray);
            this.rays.push(ray);
        }
    }
    
    /**
     * Calculate sun color
     * @returns {THREE.Color} Sun color
     */
    calculateColor() {
        // Generate brightness fluctuation (range 0.7-1.3)
        const brightness = 1.0 + (Math.random() * 2 - 1) * SunConstants.BRIGHTNESS_FLUCTUATION;
        
        // Apply brightness to base color
        const color = new THREE.Color(SunConstants.COLOR);
        color.r = Math.min(1, color.r * brightness);
        color.g = Math.min(1, color.g * brightness);
        color.b = Math.min(1, color.b * brightness);
        
        return color;
    }
    
    /**
     * Update sun
     */
    update() {
        // Update sun color
        const newColor = this.calculateColor();
        this.material.color.copy(newColor);
        this.light.color.copy(newColor);
        
        // Update rays (create new rays)
        this.rays.forEach(ray => this.scene.remove(ray));
        this.rays = [];
        this.createSunRays();
    }
    
    /**
     * Get sun mass
     * @returns {number} Sun mass
     */
    getMass() {
        return SunConstants.MASS;
    }
    
    /**
     * Get sun radius
     * @returns {number} Sun radius
     */
    getRadius() {
        return SunConstants.RADIUS;
    }
}
