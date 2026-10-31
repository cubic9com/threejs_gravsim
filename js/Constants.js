/**
 * Constants for gravity simulation
 */

// Constants for physics simulation
const PhysicsConstants = {
    // Gravitational constant
    G: 6.67430e-11,
    // Time scale (to speed up the simulation)
    TIME_SCALE: 2.0e11,
    // Distance scale (to adjust the display)
    DISTANCE_SCALE: 1.0e9,
    // Minimum distance (to prevent collisions)
    MIN_DISTANCE: 1.0,
    // Skip gravity calculations between planets beyond this distance (to reduce processing load)
    MAX_FORCE_DISTANCE: 50.0,
    // Speed factor
    SPEED_FACTOR: 2.0e-14
};

// Constants for the sun
const SunConstants = {
    // Sun's mass
    MASS: 1.11e7,
    // Sun's radius (pixels)
    RADIUS: 3,
    // Sun's base color
    COLOR: 0xFFA500, // Orange
    // Intensity of sun's brightness fluctuation
    BRIGHTNESS_FLUCTUATION: 0.1 // Brightness fluctuation range (0-1)
};

// Constants for planets
const PlanetConstants = {
    // Planet's mass
    MASS: 200000,
    // Planet's radius (pixels)
    RADIUS: 0.5,
    // Maximum number of planets
    MAX_COUNT: 10,
    // Number of points in the trail
    TRAIL_LENGTH: 10
};

// Constants for rendering
const RenderConstants = {
    // Drawing update interval (milliseconds)
    DRAW_INTERVAL: 70,
    // Trail update interval (milliseconds)
    TRAIL_UPDATE_INTERVAL: 35,
    // Margin for off-screen detection (pixels)
    SCREEN_MARGIN: 20
};

// Constants for firework effects (shown when a planet collides with the sun)
// Values are converted from the M5Stack version's pixels to world units
// (the M5Stack screen is 240 px tall, the world view is 100 units tall)
const FireworkConstants = {
    // Number of particles per firework
    PARTICLE_COUNT: 30,
    // Initial speed of particles (world units per frame)
    PARTICLE_SPEED: 1.25,
    // Particle size (pixels, shrinks as it fades)
    PARTICLE_SIZE: 4,
    // Lifetime of particles (frames)
    PARTICLE_LIFETIME: 10,
    // Maximum number of firework effects
    MAX_EFFECTS: 5
};

// Constants for ripple effects (shown when a planet is placed)
const RippleConstants = {
    // Ripple expansion speed (world units per frame)
    EXPANSION_SPEED: 1.04,
    // Ripple lifetime (frames)
    LIFETIME: 20,
    // Maximum number of simultaneous ripples
    MAX_RIPPLES: 10,
    // Initial ripple radius (world units)
    INITIAL_RADIUS: 0.83,
    // Distance between the outer and inner rings (world units)
    INNER_RING_OFFSET: 1.25,
    // The inner ring is drawn once the radius exceeds this value (world units)
    INNER_RING_MIN_RADIUS: 1.67
};

// Constants for collision effects
const CollisionConstants = {
    // Collision effect radius (pixels)
    COLLISION_EFFECT_RADIUS: 1,
    // Collision effect color
    COLLISION_EFFECT_COLOR: 0xFFFF00, // Yellow
    // Collision effect duration (milliseconds)
    COLLISION_EFFECT_DURATION: 105
};
