/**
 * Effects Class
 * Manages ripple effects shown when a planet is placed and
 * firework effects shown when a planet collides with the sun.
 * Ported from the M5Stack version (m5core2_gravsim).
 */
class Effects {
    /**
     * Constructor
     * @param {THREE.Scene} scene - Three.js scene
     */
    constructor(scene) {
        this.scene = scene;
        this.ripples = [];
        this.fireworks = [];
        this.particleCount = 0;

        // Unit circle geometry shared by all ripple rings
        const points = [];
        const segments = 64;
        for (let i = 0; i < segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            points.push(new THREE.Vector3(Math.cos(angle), Math.sin(angle), 0));
        }
        this.circleGeometry = new THREE.BufferGeometry().setFromPoints(points);
    }

    /**
     * Create a ripple effect at the specified position
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} color - Ripple color
     */
    createRipple(x, y, color) {
        // Do not create more than the maximum number of ripples
        if (this.ripples.length >= RippleConstants.MAX_RIPPLES) {
            return;
        }

        // Outer ring
        const outerMaterial = new THREE.LineBasicMaterial({
            color: color,
            transparent: true,
            opacity: 1.0
        });
        const outer = new THREE.LineLoop(this.circleGeometry, outerMaterial);
        outer.position.set(x, y, 0);

        // Inner ring (drawn at half opacity, slightly smaller)
        const innerMaterial = new THREE.LineBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.5
        });
        const inner = new THREE.LineLoop(this.circleGeometry, innerMaterial);
        inner.position.set(x, y, 0);

        this.scene.add(outer);
        this.scene.add(inner);

        this.ripples.push({
            outer: outer,
            inner: inner,
            radius: RippleConstants.INITIAL_RADIUS,
            lifetime: RippleConstants.LIFETIME,
            initialLifetime: RippleConstants.LIFETIME
        });
        this.applyRippleState(this.ripples[this.ripples.length - 1]);
    }

    /**
     * Apply a ripple's radius and opacity to its rings
     * @param {Object} ripple - Ripple object
     */
    applyRippleState(ripple) {
        const opacity = ripple.lifetime / ripple.initialLifetime;

        ripple.outer.scale.set(ripple.radius, ripple.radius, 1);
        ripple.outer.material.opacity = opacity;

        // The inner ring appears once the ripple has grown enough
        const innerRadius = ripple.radius - RippleConstants.INNER_RING_OFFSET;
        ripple.inner.visible = ripple.radius > RippleConstants.INNER_RING_MIN_RADIUS && innerRadius > 0;
        if (ripple.inner.visible) {
            ripple.inner.scale.set(innerRadius, innerRadius, 1);
            ripple.inner.material.opacity = opacity * 0.5;
        }
    }

    /**
     * Create a firework effect at the specified position
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} color - Particle color
     */
    createFirework(x, y, color) {
        // Limit the total number of particles across all fireworks
        const maxParticles = FireworkConstants.MAX_EFFECTS * FireworkConstants.PARTICLE_COUNT;
        const count = Math.min(FireworkConstants.PARTICLE_COUNT, maxParticles - this.particleCount);
        if (count <= 0) {
            return;
        }

        const positions = new Float32Array(count * 3);
        const velocities = [];
        for (let i = 0; i < count; i++) {
            // Random angle (0-360 degrees)
            const angle = Math.random() * Math.PI * 2;

            // Random speed variation (0.7x to 1.3x of base speed)
            const speed = FireworkConstants.PARTICLE_SPEED * (0.7 + Math.random() * 0.6);

            velocities.push({
                vx: speed * Math.cos(angle),
                vy: speed * Math.sin(angle)
            });
            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = 0;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const material = new THREE.PointsMaterial({
            color: color,
            size: FireworkConstants.PARTICLE_SIZE,
            sizeAttenuation: false,
            transparent: true,
            opacity: 1.0,
            depthWrite: false
        });
        const points = new THREE.Points(geometry, material);
        this.scene.add(points);

        this.fireworks.push({
            points: points,
            velocities: velocities,
            count: count,
            lifetime: FireworkConstants.PARTICLE_LIFETIME,
            initialLifetime: FireworkConstants.PARTICLE_LIFETIME
        });
        this.particleCount += count;
    }

    /**
     * Update all effects (called once per frame)
     */
    update() {
        this.updateRipples();
        this.updateFireworks();
    }

    /**
     * Update ripple effects
     */
    updateRipples() {
        for (let i = this.ripples.length - 1; i >= 0; i--) {
            const ripple = this.ripples[i];

            // Expand radius and decrease lifetime
            ripple.radius += RippleConstants.EXPANSION_SPEED;
            ripple.lifetime--;

            // Remove expired ripples
            if (ripple.lifetime <= 0) {
                this.scene.remove(ripple.outer);
                this.scene.remove(ripple.inner);
                ripple.outer.material.dispose();
                ripple.inner.material.dispose();
                this.ripples.splice(i, 1);
                continue;
            }

            this.applyRippleState(ripple);
        }
    }

    /**
     * Update firework effects
     */
    updateFireworks() {
        for (let i = this.fireworks.length - 1; i >= 0; i--) {
            const firework = this.fireworks[i];

            // Decrease lifetime and remove expired fireworks
            firework.lifetime--;
            if (firework.lifetime <= 0) {
                this.scene.remove(firework.points);
                firework.points.geometry.dispose();
                firework.points.material.dispose();
                this.particleCount -= firework.count;
                this.fireworks.splice(i, 1);
                continue;
            }

            // Move particles
            const positions = firework.points.geometry.attributes.position.array;
            for (let j = 0; j < firework.count; j++) {
                positions[j * 3] += firework.velocities[j].vx;
                positions[j * 3 + 1] += firework.velocities[j].vy;
            }
            firework.points.geometry.attributes.position.needsUpdate = true;

            // Fade out and shrink as the lifetime runs out
            const ratio = firework.lifetime / firework.initialLifetime;
            firework.points.material.opacity = ratio;
            firework.points.material.size = Math.max(2, FireworkConstants.PARTICLE_SIZE * ratio);
        }
    }
}
