let scene, camera, renderer, model, controls;

function init() {
    const container = document.getElementById('container');

    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xeeeeee);
    console.log('Scene created');

    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 0); // Adjusted camera position for side view
    console.log('Camera created at position', camera.position);

    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
    console.log('Renderer created and added to DOM');

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    console.log('Ambient light added');

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);
    console.log('Directional light added');

    // Load model
    const loader = new THREE.FBXLoader();
    loader.load('model.fbx', function (object) {
        model = object;
        model.scale.set(0.1, 0.1, 0.1); // Adjust scale values as needed

        // Center the model in the scene
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);

        scene.add(model);
        console.log('Model loaded successfully');

        // Adjust camera position relative to the model
        const boundingBox = new THREE.Box3().setFromObject(model);
        const size = boundingBox.getSize(new THREE.Vector3()).length();
        const centerModel = boundingBox.getCenter(new THREE.Vector3());

        // Update camera position
        camera.position.copy(centerModel);
        camera.position.x += size / 2.0; // Adjust distance from the model
        camera.position.y += size / 5.0; // Adjust height from the model
        camera.position.z += size / 2.0; // Adjust distance from the model
        camera.lookAt(centerModel);
    }, undefined, function (error) {
        console.error('An error happened while loading the model:', error);

        // Fallback: Add a cube if the model fails to load
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);
        model = cube;
        console.log('Fallback cube added');

        // Adjust camera position relative to the fallback cube
        const boundingBox = new THREE.Box3().setFromObject(model);
        const size = boundingBox.getSize(new THREE.Vector3()).length();
        const centerModel = boundingBox.getCenter(new THREE.Vector3());

        // Update camera position
        camera.position.copy(centerModel);
        camera.position.x += size / 2.0; // Adjust distance from the model
        camera.position.y += size / 5.0; // Adjust height from the model
        camera.position.z += size / 2.0; // Adjust distance from the model
        camera.lookAt(centerModel);
    });

    // Orbit controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enablePan = true;
    controls.enableZoom = true;
    controls.maxPolarAngle = Math.PI / 2; // Restrict rotation to avoid viewing from the bottom
    controls.zoomSpeed = 1.0; // Adjust zoom speed

    console.log('Orbit controls added');

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);

    // Event listeners for zoom
    window.addEventListener('wheel', onMouseWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: false });
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    console.log('Window resized, camera and renderer updated');
}

function animate() {
    requestAnimationFrame(animate);

    controls.update();
    renderer.render(scene, camera);
}

// Function to handle mouse wheel zoom
function onMouseWheel(event) {
    event.preventDefault();

    if (event.deltaY < 0) {
        // Zoom in
        camera.position.multiplyScalar(0.9);
    } else if (event.deltaY > 0) {
        // Zoom out
        camera.position.multiplyScalar(1.1);
    }

    camera.updateProjectionMatrix();
}

// Variables to track touch events for mobile zoom
let touchZoomDistanceStart = 0;

// Function to handle touch start for zoom
function onTouchStart(event) {
    const touch = event.touches;

    if (touch.length === 2) {
        const dx = touch[0].clientX - touch[1].clientX;
        const dy = touch[0].clientY - touch[1].clientY;
        touchZoomDistanceStart = Math.sqrt(dx * dx + dy * dy);
    }
}

// Function to handle touch end for zoom
function onTouchEnd(event) {
    touchZoomDistanceStart = 0;
}

init();
animate();
