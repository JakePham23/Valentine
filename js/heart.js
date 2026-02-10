/**
 * Heart Particle System - Creates 3D heart shape from particles
 */
class HeartParticles {
    constructor(scene, count = 3000) {
        this.scene = scene;
        this.count = count;
        this.particles = null;
        this.originalPositions = null;
        this.visible = true;
        this.init();
    }

    // Heart shape parametric equation
    getHeartPosition(u, v) {
        // Parametric heart shape
        const a = 1;
        
        // Heart surface
        const x = a * 16 * Math.pow(Math.sin(u), 3);
        const y = a * (13 * Math.cos(u) - 5 * Math.cos(2 * u) - 2 * Math.cos(3 * u) - Math.cos(4 * u));
        const z = v * 4 - 2; // Depth variation

        return { x: x * 0.5, y: y * 0.5, z: z };
    }

    init() {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.count * 3);
        const colors = new Float32Array(this.count * 3);
        const sizes = new Float32Array(this.count);
        const randoms = new Float32Array(this.count);

        const colorPink = new THREE.Color(0xff69b4);
        const colorMagenta = new THREE.Color(0xff1493);
        const colorRose = new THREE.Color(0xff007f);

        for (let i = 0; i < this.count; i++) {
            // Generate points on/near heart surface
            const u = Math.random() * Math.PI * 2;
            const v = Math.random();
            const pos = this.getHeartPosition(u, v);

            // Add some noise for volume
            const noise = 0.3;
            positions[i * 3] = pos.x + (Math.random() - 0.5) * noise;
            positions[i * 3 + 1] = pos.y + (Math.random() - 0.5) * noise;
            positions[i * 3 + 2] = pos.z + (Math.random() - 0.5) * noise * 2;

            // Gradient color from center to edge
            const t = Math.random();
            const color = new THREE.Color().lerpColors(
                colorPink,
                t > 0.5 ? colorMagenta : colorRose,
                t
            );
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;

            // Random size
            sizes[i] = Math.random() * 3 + 1;
            randoms[i] = Math.random();
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute('random', new THREE.BufferAttribute(randoms, 1));

        // Store original positions for animation
        this.originalPositions = positions.slice();

        // Custom shader material for glowing particles
        const material = new THREE.PointsMaterial({
            size: 0.15,
            vertexColors: true,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true,
        });

        this.particles = new THREE.Points(geometry, material);
        this.particles.position.y = 2;
        this.scene.add(this.particles);
    }

    update(time) {
        if (!this.particles || !this.visible) return;

        const positions = this.particles.geometry.attributes.position.array;
        const randoms = this.particles.geometry.attributes.random.array;

        // Breathing animation - particles move slightly
        for (let i = 0; i < this.count; i++) {
            const i3 = i * 3;
            const random = randoms[i];
            
            // Subtle pulsing motion
            const breathe = Math.sin(time * 2 + random * 10) * 0.05;
            const wave = Math.sin(time * 1.5 + random * 5) * 0.03;

            positions[i3] = this.originalPositions[i3] + breathe;
            positions[i3 + 1] = this.originalPositions[i3 + 1] + wave;
            positions[i3 + 2] = this.originalPositions[i3 + 2] + breathe * 0.5;
        }

        this.particles.geometry.attributes.position.needsUpdate = true;

        // Slow rotation
        this.particles.rotation.y = Math.sin(time * 0.3) * 0.2;
    }

    show() {
        if (this.particles) {
            this.particles.visible = true;
            this.visible = true;
        }
    }

    hide() {
        if (this.particles) {
            this.particles.visible = false;
            this.visible = false;
        }
    }

    dispose() {
        if (this.particles) {
            this.particles.geometry.dispose();
            this.particles.material.dispose();
            this.scene.remove(this.particles);
        }
    }
}
