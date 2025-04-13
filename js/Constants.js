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
    MAX_FORCE_DISTANCE: 100.0,
    // Speed factor
    SPEED_FACTOR: 2.0e-14
};

// Constants for the sun
const SunConstants = {
    // Sun's mass
    MASS: 1.11e7,
    // Sun's radius (pixels)
    RADIUS: 5,
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
    RADIUS: 1,
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

// Constants for collision effects
const CollisionConstants = {
    // Collision effect radius (pixels)
    COLLISION_EFFECT_RADIUS: 2,
    // Collision effect color
    COLLISION_EFFECT_COLOR: 0xFFFF00, // Yellow
    // Collision effect duration (milliseconds)
    COLLISION_EFFECT_DURATION: 105
};
