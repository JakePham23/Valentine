/**
 * Gallery 3D - Flying images in 3D space
 */
class Gallery3D {
    constructor(scene, images = []) {
        this.scene = scene;
        this.images = images;
        this.cards = [];
        this.visible = false;
        this.group = new THREE.Group();
        this.scene.add(this.group);
        this.group.visible = false;

        // Define actual images from images folder - UPDATED
        this.actualImages = [
            'images/1.jpg', 'images/2.jpg', 'images/3.jpg', 'images/4.JPG',
            'images/5.jpg', 'images/6.JPEG', 'images/7.JPG', 'images/8.JPG',
            'images/9.PNG', 'images/10.JPG', 'images/11.JPG', 'images/12.PNG',
            'images/13.JPG', 'images/14.JPG', 'images/15.PNG', 'images/16.PNG',
            'images/17.PNG', 'images/18.PNG', 'images/19.JPG', 'images/20.PNG',
            'images/21.JPG', 'images/22.JPG', 'images/23.JPG', 'images/24.PNG',
            'images/25.jpeg', 'images/26.jpg', 'images/27.jpeg', 'images/28.JPG',
            'images/30.JPG', 'images/31.png', 'images/32.jpg', 'images/33.jpeg',
            'images/34.jpeg', 'images/35.jpg', 'images/36.jpg', 'images/37.jpg',
            'images/38.JPG', 'images/39.PNG', 'images/40.JPG', 'images/41.JPG',
            'images/42.jpg', 'images/43.JPG', 'images/44.JPG', 'images/45.JPG',
            'images/46.JPG', 'images/47.jpg', 'images/48.JPG', 'images/49.PNG',
            'images/50.PNG', 'images/51.PNG', 'images/52.PNG', 'images/53.PNG',
            'images/54.PNG', 'images/couple.png', 'images/heart.png'
        ];
    }

    async loadImages(imagePaths) {
        this.images = imagePaths;
        await this.createCards();
    }

    async createCards() {
        // Clear existing cards
        this.cards.forEach(card => {
            card.geometry.dispose();
            card.material.dispose();
            this.group.remove(card);
        });
        this.cards = [];

        const loader = new THREE.TextureLoader();
        // Use actual images from folder
        const imagesToUse = this.actualImages;

        for (let i = 0; i < imagesToUse.length; i++) {
            const img = imagesToUse[i];
            
            // Create card geometry
            const geometry = new THREE.PlaneGeometry(4, 3);
            
            let material;
            // Load actual image from folder
            try {
                const texture = await this.loadTexture(loader, img);
                material = new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: true,
                    opacity: 0.95,
                    side: THREE.DoubleSide,
                });
            } catch (error) {
                // Fallback to gradient if image fails to load
                const canvas = this.createGradientCanvas(i);
                const texture = new THREE.CanvasTexture(canvas);
                material = new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: true,
                    opacity: 0.9,
                    side: THREE.DoubleSide,
                });
            }

            const card = new THREE.Mesh(geometry, material);

            // Arrange in cylinder formation
            const count = imagesToUse.length;
            const radius = 15;
            const angle = (i / count) * Math.PI * 2;
            const height = (Math.random() - 0.5) * 10;

            card.position.x = Math.cos(angle) * radius;
            card.position.y = height;
            card.position.z = Math.sin(angle) * radius;

            // Face center
            card.lookAt(0, card.position.y, 0);

            // Store animation data
            card.userData = {
                originalAngle: angle,
                originalHeight: height,
                speed: 0.2 + Math.random() * 0.3,
                phase: Math.random() * Math.PI * 2,
            };

            this.cards.push(card);
            this.group.add(card);
        }
    }

    loadTexture(loader, src) {
        return new Promise((resolve) => {
            loader.load(src, resolve, undefined, () => {
                // On error, create placeholder
                const canvas = this.createGradientCanvas(0);
                resolve(new THREE.CanvasTexture(canvas));
            });
        });
    }

    createGradientCanvas(index) {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 300;
        const ctx = canvas.getContext('2d');

        // Create gradient background
        const gradients = [
            ['#ff69b4', '#ff1493'],
            ['#ff1493', '#dc143c'],
            ['#ff69b4', '#ff007f'],
            ['#ffb6c1', '#ff69b4'],
            ['#db7093', '#ff1493'],
            ['#ff007f', '#ff69b4'],
        ];

        const [color1, color2] = gradients[index % gradients.length];
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add heart icon
        ctx.font = '80px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillText('💕', canvas.width / 2, canvas.height / 2);

        // Add text
        ctx.font = 'bold 24px Poppins, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillText(`Memory ${index + 1}`, canvas.width / 2, canvas.height - 40);

        return canvas;
    }

    generateDefaultImages() {
        // Generate 8 placeholder images
        return Array.from({ length: 8 }, (_, i) => `placeholder_${i}`);
    }

    update(time) {
        if (!this.visible) return;

        this.cards.forEach((card, i) => {
            const data = card.userData;
            
            // Orbit animation
            const angle = data.originalAngle + time * data.speed * 0.1;
            const radius = 15 + Math.sin(time + data.phase) * 2;
            
            card.position.x = Math.cos(angle) * radius;
            card.position.z = Math.sin(angle) * radius;
            card.position.y = data.originalHeight + Math.sin(time * 0.5 + data.phase) * 1;

            // Face camera (center)
            card.lookAt(0, card.position.y * 0.5, 0);

            // Subtle floating
            card.rotation.z = Math.sin(time + i) * 0.05;
        });

        // Rotate entire group slowly
        this.group.rotation.y = time * 0.05;
    }

    show() {
        this.group.visible = true;
        this.visible = true;
    }

    hide() {
        this.group.visible = false;
        this.visible = false;
    }

    dispose() {
        this.cards.forEach(card => {
            card.geometry.dispose();
            card.material.dispose();
        });
        this.scene.remove(this.group);
    }
}
