/**
 * Main Application - Valentine 3D Experience
 */
class ValentineApp {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock();

        // Components
        this.stars = null;
        this.heart = null;
        this.gallery = null;
        this.flying = null;

        // Controls
        this.isDragging = false;
        this.previousMousePosition = { x: 0, y: 0 };
        this.cameraAngle = { x: 0, y: 0 };
        this.targetCameraAngle = { x: 0, y: 0 };
        this.cameraDistance = 25;
        this.targetCameraDistance = 25;

        // View mode
        this.currentView = 'heart'; // 'heart', 'gallery', or 'flying'

        // Double click detection
        this.clickCount = 0;
        this.clickTimer = null;

        this.init();
    }

    init() {
        this.setupScene();
        this.setupLights();
        this.createComponents();
        this.setupEventListeners();
        this.hideLoading();
        this.animate();
    }

    setupScene() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x000000, 0.008);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = this.cameraDistance;

        // Renderer
        const canvas = document.getElementById('canvas3d');
        this.renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            alpha: true,
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        // Cap pixel ratio at 1.5 for better performance on high DPI displays
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        this.renderer.setClearColor(0x000000, 1);
    }

    setupLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xff69b4, 0.3);
        this.scene.add(ambientLight);

        // Point lights for glow effect
        const pointLight1 = new THREE.PointLight(0xff1493, 1, 50);
        pointLight1.position.set(10, 10, 10);
        this.scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0xff69b4, 1, 50);
        pointLight2.position.set(-10, -10, 10);
        this.scene.add(pointLight2);
    }

    createComponents() {
        // Background stars (increased for better aesthetics)
        this.stars = new StarsBackground(this.scene, 1500);

        // Heart particles (reduced for performance)
        this.heart = new HeartParticles(this.scene, 1000);

        // Gallery
        this.gallery = new Gallery3D(this.scene);
        this.gallery.createCards();

        // Flying gallery
        this.flying = new FlyingGallery3D(this.scene);
        this.flying.createCards();
    }

    setupEventListeners() {
        // Resize
        window.addEventListener('resize', () => this.onResize());

        // Mouse controls
        const canvas = this.renderer.domElement;
        canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        canvas.addEventListener('mouseup', () => this.onMouseUp());
        canvas.addEventListener('mouseleave', () => this.onMouseUp());
        canvas.addEventListener('wheel', (e) => this.onWheel(e));

        // Double click detection on canvas
        canvas.addEventListener('click', (e) => this.onCanvasClick(e));

        // Touch controls
        canvas.addEventListener('touchstart', (e) => this.onTouchStart(e));
        canvas.addEventListener('touchmove', (e) => this.onTouchMove(e));
        canvas.addEventListener('touchend', () => this.onMouseUp());

        // View buttons
        document.getElementById('btn-heart').addEventListener('click', () => {
            this.switchView('heart');
        });
        document.getElementById('btn-gallery').addEventListener('click', () => {
            this.switchView('gallery');
        });
        document.getElementById('btn-flying').addEventListener('click', () => {
            this.switchView('flying');
        });
    }

    onCanvasClick(e) {
        // Don't trigger on drag
        if (this.isDragging) return;

        this.clickCount++;

        if (this.clickCount === 1) {
            this.clickTimer = setTimeout(() => {
                this.clickCount = 0;
            }, 300);
        } else if (this.clickCount === 2) {
            clearTimeout(this.clickTimer);
            this.clickCount = 0;
            // Double click detected - switch to flying view ONLY if on gallery view
            if (this.currentView === 'gallery') {
                this.switchView('flying');
            }
        }
    }

    onMouseDown(e) {
        this.isDragging = true;
        this.previousMousePosition = { x: e.clientX, y: e.clientY };
    }

    onMouseMove(e) {
        if (!this.isDragging) return;

        const deltaX = e.clientX - this.previousMousePosition.x;
        const deltaY = e.clientY - this.previousMousePosition.y;

        this.targetCameraAngle.x += deltaX * 0.005;
        this.targetCameraAngle.y += deltaY * 0.005;

        // Clamp vertical angle
        this.targetCameraAngle.y = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, this.targetCameraAngle.y));

        this.previousMousePosition = { x: e.clientX, y: e.clientY };
    }

    onMouseUp() {
        this.isDragging = false;
    }

    onWheel(e) {
        e.preventDefault();
        this.targetCameraDistance += e.deltaY * 0.05;
        this.targetCameraDistance = Math.max(10, Math.min(50, this.targetCameraDistance));
    }

    onTouchStart(e) {
        if (e.touches.length === 1) {
            this.isDragging = true;
            this.previousMousePosition = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY,
            };
        }
    }

    onTouchMove(e) {
        if (!this.isDragging || e.touches.length !== 1) return;
        e.preventDefault();

        const deltaX = e.touches[0].clientX - this.previousMousePosition.x;
        const deltaY = e.touches[0].clientY - this.previousMousePosition.y;

        this.targetCameraAngle.x += deltaX * 0.005;
        this.targetCameraAngle.y += deltaY * 0.005;
        this.targetCameraAngle.y = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, this.targetCameraAngle.y));

        this.previousMousePosition = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY,
        };
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    switchView(view) {
        this.currentView = view;

        // Update buttons
        document.querySelectorAll('.control-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`btn-${view}`).classList.add('active');

        // Hide all components first
        this.heart.hide();
        this.gallery.hide();
        this.flying.hide();

        // Show selected component and adjust camera
        const overlay = document.querySelector('.overlay');
        
        if (view === 'heart') {
            this.heart.show();
            this.targetCameraDistance = 25;
            this.targetCameraAngle = { x: 0, y: 0 };
            overlay.style.display = 'block'; // Show overlay
        } else if (view === 'gallery') {
            this.gallery.show();
            this.targetCameraDistance = 35;
            overlay.style.display = 'block'; // Show overlay
        } else if (view === 'flying') {
            this.flying.show();
            this.targetCameraDistance = 8;
            // Camera looks UP - standing at center looking upward
            this.targetCameraAngle = { x: 0, y: -0.85 };
            overlay.style.display = 'none'; // Hide overlay for flying view
        }
    }

    updateCamera() {
        // Smooth camera movement
        this.cameraAngle.x += (this.targetCameraAngle.x - this.cameraAngle.x) * 0.05;
        this.cameraAngle.y += (this.targetCameraAngle.y - this.cameraAngle.y) * 0.05;
        this.cameraDistance += (this.targetCameraDistance - this.cameraDistance) * 0.05;

        // Calculate camera position on sphere
        const x = this.cameraDistance * Math.sin(this.cameraAngle.x) * Math.cos(this.cameraAngle.y);
        const y = this.cameraDistance * Math.sin(this.cameraAngle.y);
        const z = this.cameraDistance * Math.cos(this.cameraAngle.x) * Math.cos(this.cameraAngle.y);

        this.camera.position.set(x, y + 3, z);
        this.camera.lookAt(0, 2, 0);
    }

    hideLoading() {
        setTimeout(() => {
            const loading = document.getElementById('loading');
            loading.classList.add('hidden');
        }, 1500);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const time = this.clock.getElapsedTime();

        // Update components
        this.stars.update(time);
        this.heart.update(time);
        this.gallery.update(time);
        this.flying.update(time);

        // Update camera
        this.updateCamera();

        // Render
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ValentineApp();
});
