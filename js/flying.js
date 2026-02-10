/**
 * Flying Gallery 3D - Enhanced with layers, love messages, and hearts
 * Activated by double-click on the page
 */
class FlyingGallery3D {
    constructor(scene, images = []) {
        this.scene = scene;
        this.images = images;
        this.cards = [];
        this.textSprites = [];
        this.heartParticles = [];
        this.visible = false;
        this.group = new THREE.Group();
        this.scene.add(this.group);
        this.group.visible = false;

        // Flying speed
        this.flySpeed = 0.6;
        
        // Love messages in Vietnamese
        this.loveMessages = [
            "Anh yêu em 💕",
            "Mãi bên nhau ❤️",
            "I Love You 💖",
            "Forever & Always 💗",
            "Em là tất cả 💝",
            "Yêu em nhiều lắm 💘",
            "Happy Valentine 💟",
            "My Love 💞",
            "Hạnh phúc mãi mãi 💓",
            "Together Forever 💑",
            "You & Me 💏",
            "Tình yêu đích thực ✨",
            "Trái tim anh 💖",
            "Soulmate 💫",
            "My Everything 🌹",
            "Người yêu dấu 💐",
        ];

        // Actual images from images folder - UPDATED with all new photos
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

    async createCards() {
        // Clear existing elements
        this.clearAll();

        const loader = new THREE.TextureLoader();
        
        // Create multiple layers of images
        await this.createImageLayers(loader);
        
        // Create floating hearts
        this.createFloatingHearts();
        
        // Create love message texts
        this.createLoveTexts();
    }

    async createImageLayers(loader) {
        const imagesToUse = this.actualImages;
        
        // Create tunnel effect - elements around the viewer (increased for density)
        const totalCards = 60;
        
        for (let i = 0; i < totalCards; i++) {
            const imgIndex = i % imagesToUse.length;
            const img = imagesToUse[imgIndex];
            
            // Varied sizes for depth perception
            const scale = 0.5 + Math.random() * 0.8;
            const geometry = new THREE.PlaneGeometry(2.5 * scale, 4 * scale);
            
            let material;
            try {
                const texture = await this.loadTexture(loader, img);
                material = new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: true,
                    opacity: 0.9,
                    side: THREE.DoubleSide,
                });
            } catch (error) {
                const canvas = this.createGradientCanvas(i);
                const texture = new THREE.CanvasTexture(canvas);
                material = new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: true,
                    opacity: 0.85,
                    side: THREE.DoubleSide,
                });
            }

            const card = new THREE.Mesh(geometry, material);

            // Position in a cylinder around the camera - tunnel effect
            const angle = (i / totalCards) * Math.PI * 2 + Math.random() * 0.5;
            const radius = 8 + Math.random() * 25; // Distance from center
            const startY = -15 - Math.random() * 30; // CLOSER spawn - more visible at once

            card.position.x = Math.cos(angle) * radius;
            card.position.z = Math.sin(angle) * radius;
            card.position.y = startY;

            // Don't set rotation here - will use lookAt camera in update loop
            // This ensures images ALWAYS face the camera perfectly flat

            // Speed based on distance - closer = faster
            const speedFactor = 1 - (radius - 8) / 25;
            
            card.userData = {
                baseSpeed: 0.08 + speedFactor * 0.05 + Math.random() * 0.02,
                swayPhase: Math.random() * Math.PI * 2,
                angle: angle,
                radius: radius,
            };

            this.cards.push(card);
            this.group.add(card);
        }
    }

    createFloatingHearts() {
        const heartSymbols = ['❤️', '💕', '💖', '💗', '💘', '💝', '💞', '💓', '💟', '🌹', '✨', '💫'];
        const heartCount = 80; // Increased for better density

        for (let i = 0; i < heartCount; i++) {
            const canvas = document.createElement('canvas');
            canvas.width = 128;
            canvas.height = 128;
            const ctx = canvas.getContext('2d');

            const symbol = heartSymbols[Math.floor(Math.random() * heartSymbols.length)];
            
            ctx.font = '80px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(symbol, 64, 64);

            const texture = new THREE.CanvasTexture(canvas);
            const spriteMaterial = new THREE.SpriteMaterial({
                map: texture,
                transparent: true,
                opacity: 0.8 + Math.random() * 0.2,
            });

            const sprite = new THREE.Sprite(spriteMaterial);
            
            const scale = 0.6 + Math.random() * 1.2;
            sprite.scale.set(scale, scale, 1);

            // Cylindrical positioning around viewer
            const angle = Math.random() * Math.PI * 2;
            const radius = 5 + Math.random() * 30;
            const startY = -15 - Math.random() * 30; // CLOSER spawn

            sprite.position.x = Math.cos(angle) * radius;
            sprite.position.z = Math.sin(angle) * radius;
            sprite.position.y = startY;

            sprite.userData = {
                baseSpeed: 0.15 + Math.random() * 0.05,
                swayPhase: Math.random() * Math.PI * 2,
                rotateSpeed: (Math.random() - 0.5) * 0.01,
                angle: angle,
                radius: radius,
            };

            this.heartParticles.push(sprite);
            this.group.add(sprite);
        }
    }

    createLoveTexts() {
        const textCount = 30; // Increased for better density

        for (let i = 0; i < textCount; i++) {
            const message = this.loveMessages[i % this.loveMessages.length];
            
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 128;
            const ctx = canvas.getContext('2d');

            ctx.shadowColor = '#ff69b4';
            ctx.shadowBlur = 20;
            
            ctx.font = 'bold 40px "Segoe UI", Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
            gradient.addColorStop(0, '#ff69b4');
            gradient.addColorStop(0.5, '#ffffff');
            gradient.addColorStop(1, '#ff1493');
            ctx.fillStyle = gradient;
            
            ctx.fillText(message, 256, 64);

            const texture = new THREE.CanvasTexture(canvas);
            const spriteMaterial = new THREE.SpriteMaterial({
                map: texture,
                transparent: true,
                opacity: 0.95,
            });

            const sprite = new THREE.Sprite(spriteMaterial);
            
            sprite.scale.set(6, 1.5, 1);

            // Cylindrical positioning
            const angle = Math.random() * Math.PI * 2;
            const radius = 10 + Math.random() * 20;
            const startY = -15 - Math.random() * 35; // CLOSER spawn

            sprite.position.x = Math.cos(angle) * radius;
            sprite.position.z = Math.sin(angle) * radius;
            sprite.position.y = startY;

            sprite.userData = {
                baseSpeed: 0.08 + Math.random() * 0.03,
                swayPhase: Math.random() * Math.PI * 2,
                angle: angle,
                radius: radius,
            };

            this.textSprites.push(sprite);
            this.group.add(sprite);
        }
    }

    loadTexture(loader, src) {
        return new Promise((resolve, reject) => {
            loader.load(
                src, 
                resolve, 
                undefined, 
                () => reject(new Error('Failed to load'))
            );
        });
    }

    createGradientCanvas(index) {
        const canvas = document.createElement('canvas');
        canvas.width = 250;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');

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

        ctx.font = '60px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillText('💕', canvas.width / 2, canvas.height / 2);

        return canvas;
    }

    update(time) {
        if (!this.visible) return;

        // Update image cards - tunnel rising effect
        this.cards.forEach((card) => {
            const data = card.userData;
            
            // Move upward
            card.position.y += data.baseSpeed * this.flySpeed;

            // Slight orbital movement
            const newAngle = data.angle + Math.sin(time * 0.2 + data.swayPhase) * 0.02;
            card.position.x = Math.cos(newAngle) * data.radius;
            card.position.z = Math.sin(newAngle) * data.radius;
            
            // FIXED: Make cards ALWAYS face camera (billboard effect)
            // Cards look at camera position (0, card.position.y, 0)
            // This makes images FLAT and EASY TO SEE
            card.lookAt(0, card.position.y, 0);

            // Reset when above camera view
            if (card.position.y > 50) {
                card.position.y = -20 - Math.random() * 25; // CLOSER reset
                data.angle = Math.random() * Math.PI * 2;
                data.radius = 8 + Math.random() * 25;
            }
        });

        // Update hearts - spiral upward
        this.heartParticles.forEach((heart) => {
            const data = heart.userData;
            
            heart.position.y += data.baseSpeed * this.flySpeed;
            
            // Gentle spiral motion
            const spiralAngle = data.angle + time * 0.1;
            heart.position.x = Math.cos(spiralAngle) * data.radius;
            heart.position.z = Math.sin(spiralAngle) * data.radius;
            
            heart.material.rotation += data.rotateSpeed;

            if (heart.position.y > 45) {
                heart.position.y = -20 - Math.random() * 20; // CLOSER reset
                data.angle = Math.random() * Math.PI * 2;
                data.radius = 5 + Math.random() * 30;
            }
        });

        // Update text sprites
        this.textSprites.forEach((text) => {
            const data = text.userData;
            
            text.position.y += data.baseSpeed * this.flySpeed;
            
            // Gentle sway
            const swayAngle = data.angle + Math.sin(time * 0.15 + data.swayPhase) * 0.1;
            text.position.x = Math.cos(swayAngle) * data.radius;
            text.position.z = Math.sin(swayAngle) * data.radius;

            // Pulsing glow
            text.material.opacity = 0.75 + Math.sin(time * 2 + data.swayPhase) * 0.2;

            if (text.position.y > 40) {
                text.position.y = -15 - Math.random() * 25; // CLOSER reset
                data.angle = Math.random() * Math.PI * 2;
                data.radius = 10 + Math.random() * 20;
            }
        });
    }

    show() {
        this.group.visible = true;
        this.visible = true;
        // Reset all elements to starting positions
        this.cards.forEach((card) => {
            card.position.y = -60 - Math.random() * 80;
        });
        this.heartParticles.forEach((heart) => {
            heart.position.y = -50 - Math.random() * 100;
        });
        this.textSprites.forEach((text) => {
            text.position.y = -40 - Math.random() * 120;
        });
    }

    hide() {
        this.group.visible = false;
        this.visible = false;
    }

    clearAll() {
        this.cards.forEach(card => {
            if (card.geometry) card.geometry.dispose();
            if (card.material) card.material.dispose();
            this.group.remove(card);
        });
        this.cards = [];

        this.heartParticles.forEach(heart => {
            if (heart.material) heart.material.dispose();
            this.group.remove(heart);
        });
        this.heartParticles = [];

        this.textSprites.forEach(text => {
            if (text.material) text.material.dispose();
            this.group.remove(text);
        });
        this.textSprites = [];
    }

    dispose() {
        this.clearAll();
        this.scene.remove(this.group);
    }
}
