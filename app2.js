const clickableObjects = [];
// Set up the scene, camera, and renderer

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Set up skybox
var skyBoxLoader = new THREE.CubeTextureLoader();
var skyBoxTexture = skyBoxLoader.load([
    'px.jpg', 'nx.jpg',
    'py.jpg', 'ny.jpg',
    'pz.jpg', 'nz.jpg',
]);
scene.background = skyBoxTexture;

// Set up fog
var fogColor = new THREE.Color(0xcceeff);
scene.fog = new THREE.Fog(fogColor, 20, 300);  // Adjust the 0.0003 value to control the density of the fog

// Shader code for the wind effect
const grassVertexShader = `
    uniform float time;
    varying vec2 vUv;
    void main() {
        vUv = uv;
        vec3 newPosition = position;
        newPosition.x += sin(position.x * 10.0 + time) * 0.2;
        newPosition.z += sin(position.z * 10.0 + time) * 0.2;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
`;

const grassFragmentShader = `
    varying vec2 vUv;
    uniform sampler2D grassTexture;
    void main() {
        gl_FragColor = texture2D(grassTexture, vUv);
    }
`;
// Set up grassland plane
var grassTexture = new THREE.TextureLoader().load('grass_texture.jpg');
grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
grassTexture.repeat.set(100, 100);

var grassMaterial = new THREE.ShaderMaterial({
  uniforms: {
      time: { value: 0 },
      grassTexture: { value: grassTexture }
  },
  vertexShader: grassVertexShader,
  fragmentShader: grassFragmentShader,
});

var grassMaterial = new THREE.MeshStandardMaterial({ map: grassTexture });
var grassGeometry = new THREE.PlaneGeometry(1000, 1000);
var grassPlane = new THREE.Mesh(grassGeometry, grassMaterial);
grassPlane.rotation.x = -Math.PI / 2;
scene.add(grassPlane);

var tileTexture = new THREE.TextureLoader().load('tile_texture.jpg');
var imageTexture = new THREE.TextureLoader().load('VKB.png');

function createCircularRing(innerRadius, outerRadius, radialSegments, tubularSegments, isInnermostRing) {
  const ringGeometry = new THREE.TorusGeometry(
    (innerRadius + outerRadius) / 2,
    (outerRadius - innerRadius) / 2,
    radialSegments,
    tubularSegments
  );
  const ringColor = isInnermostRing ? 0xFFA500 : null;
  const ringMaterial = new THREE.MeshStandardMaterial({ map: isInnermostRing ? null : tileTexture, color: ringColor, side: THREE.DoubleSide });

  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.position.y = 0.01; // Position the ring slightly above the grassland surface to avoid z-fighting
  ring.rotation.x = Math.PI / 2; // Rotate the ring so that it is parallel to the grassland surface

  return ring;
}

function createImagePlane(width, height, texture) {
  const imageGeometry = new THREE.PlaneGeometry(width, height);
  const imageMaterial = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: THREE.DoubleSide
  });

  const imagePlane = new THREE.Mesh(imageGeometry, imageMaterial);
  return imagePlane;
}

// Set up a light source
var light = new THREE.PointLight(0xffffff, 1, 0);
light.position.set(0, 50, 50);
scene.add(light);

// Set up ambient light
var ambientLight = new THREE.AmbientLight(0x404040, 1);
scene.add(ambientLight);

// Set up globe
var globeTexture = new THREE.TextureLoader().load('earth-texture.jpg');
var globeBumpMap = new THREE.TextureLoader().load('earth-bump.png');
var globeGeometry = new THREE.SphereGeometry(5, 64, 64);
var globeMaterial = new THREE.MeshPhongMaterial({
  map: globeTexture,
  bumpMap: globeBumpMap,
  bumpScale: 0.1
});

var globeMesh = new THREE.Mesh(globeGeometry, globeMaterial);
globeMesh.position.y = 10;
scene.add(globeMesh);




function createWhiteRing(innerRadius, outerRadius, radialSegments, tubularSegments) {
  const ringGeometry = new THREE.TorusGeometry(
    (innerRadius + outerRadius) / 2,
    (outerRadius - innerRadius) / 2,
    radialSegments,
    tubularSegments
  );
  const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, side: THREE.DoubleSide });

  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.position.y = -0.02; // Position the ring slightly below the grassland surface to avoid z-fighting
  ring.rotation.x = Math.PI / 2; // Rotate the ring so that it is parallel to the grassland surface

  return ring;
}

const globePivot = new THREE.Object3D();
scene.add(globePivot);
globePivot.add(globeMesh);

const hieght = 9.5;

function latLonToVector3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z =  radius * Math.sin(phi) * Math.sin(theta);
  const y = hieght + radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

function createPin(height, color) {
  const coneGeometry = new THREE.CylinderGeometry(0, 0.075, height, 20);
  const coneMaterial = new THREE.MeshStandardMaterial({ color: color });
  const cone = new THREE.Mesh(coneGeometry, coneMaterial);

  const sphereGeometry = new THREE.SphereGeometry(height / 8, 25, 15);
  const sphereMaterial = new THREE.MeshStandardMaterial({ color: color });
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphere.position.y = height;

  const pin = new THREE.Group();
  pin.add(cone);
  pin.add(sphere);

  return pin;
}
const aravalliPin0 = createPin(0.5, 0xff0000);
const aravalliCoords = { lat: 27.5157, lon: 76.0408 }; // Aravalli range coordinates
const aravalliVector = latLonToVector3(aravalliCoords.lat, aravalliCoords.lon, 5.25);
aravalliPin0.position.set(aravalliVector.x, aravalliVector.y, aravalliVector.z);
aravalliPin0.lookAt(globeMesh.position);
// globeMesh.add(aravalliPin0);

// Aravalli Ranges coordinates
const aravalliLat = 24.6;
const aravalliLon = 73.7;
const globeRadius = 4;

// Pin geometry and material
const pinHeight = 2;
const pinGeometry = new THREE.CylinderGeometry(0.1, 0.1, pinHeight);
const pinMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });

// Create the pin
const aravalliPin = new THREE.Mesh(pinGeometry, pinMaterial);

// Position the pin
const aravalliPos = latLonToVector3(aravalliLat, aravalliLon, globeRadius);
aravalliPin.position.copy(aravalliPos);
aravalliPin.position.y += pinHeight / 2;

// Rotate the pin to face outwards from the globe's center
aravalliPin.lookAt(globeMesh.position);

// Add the pin to the globe pivot
globePivot.add(aravalliPin);

// Add user data to the pin for clicking
aravalliPin.userData = {
  url: "https://www.google.com/maps/d/edit?hl=en&mid=1NT5N-1k8DYSnvzveHQA_f5XGDuhwJ6M&ll=26.860283559017063%2C75.52528935000001&z=7",
};
clickableObjects.push(aravalliPin);


function createOrangeDisk(radius, radialSegments) {
  const diskGeometry = new THREE.CircleGeometry(radius, radialSegments);
  const diskMaterial = new THREE.MeshStandardMaterial({ color:  0xF4C430 , side: THREE.DoubleSide });

  const disk = new THREE.Mesh(diskGeometry, diskMaterial);
  disk.position.y = 0.02; // Position the disk slightly above the grassland surface to avoid z-fighting
  disk.rotation.x = Math.PI / 2; // Rotate the disk so that it is parallel to the grassland surface

  return disk;
}

const innermostRingInnerRadius = 14;
const orangeDisk = createOrangeDisk(innermostRingInnerRadius, 64);
scene.add(orangeDisk);

function createWhitePlane(innerRadius, outerRadius, radialSegments, height) {
  const planeGeometry = new THREE.RingGeometry(innerRadius, outerRadius, radialSegments);
  const planeMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, side: THREE.DoubleSide });

  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.position.y = 0.01; // Position the plane slightly below the grassland surface to avoid z-fighting
  plane.rotation.x = -Math.PI / 2; // Rotate the plane so that it is parallel to the grassland surface

  return plane;
}
// Add the circular rings to the scene
const numRings = 4;
const ringGap = 10;

for (let i = 0; i < numRings; i++) {
  const innerRadius = 14 + i * ringGap;
  const outerRadius = 16 + i * ringGap;
  const radialSegments = 32;
  const tubularSegments = 64;
  
  const isInnermostRing = (i === 0);
  const circularRing = createCircularRing(innerRadius, outerRadius, radialSegments, tubularSegments, isInnermostRing);
  const whiteRing = createWhiteRing(innerRadius, outerRadius, radialSegments, tubularSegments);
  const whitePlane = createWhitePlane(innerRadius, outerRadius, radialSegments, grassGeometry.parameters.height);
  scene.add(circularRing);
  scene.add(whiteRing)
  scene.add(whitePlane);
}



// Set up image plane above the globe
const imagePlaneWidth = 20;
const imagePlaneHeight = 10;
const imagePlaneDistance = 15;

const imagePlane = createImagePlane(imagePlaneWidth, imagePlaneHeight, imageTexture);
imagePlane.position.set(0, globeMesh.position.y + imagePlaneDistance, 0);
globePivot.add(imagePlane);

// Position camera and set controls
camera.position.set(0, 10, 25);
var controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enablePan = false;
controls.minDistance = 10;
controls.maxDistance = 100;


window.addEventListener('click', onMouseClick, false);


let collegeNames = [];

function loadCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        resolve(results.data);
      },
      error: function (error) {
        reject(error);
      },
    });
  });
}

async function loadCollegeNames() {
  try {
    const csvData = await loadCSV("institution.csv");
    collegeNames = csvData.map((row) => row.name);
  } catch (error) {
    console.error("Error loading CSV file:", error);
  }
}
function loadFont(url) {
  return new Promise((resolve, reject) => {
    new THREE.FontLoader().load(
      url,
      (font) => {
        resolve(font);
      },
      undefined,
      (error) => {
        reject(error);
      }
    );
  });
}

function generateSphericalPlots(countryNames, gridSize, innerRadius, outerRadius) {
  const plotSize = 3;
  const margin = 0.1;
  const sphereGeometry = new THREE.SphereGeometry(plotSize / 2, 32, 32);
  const sphereMaterial = new THREE.MeshLambertMaterial({ color: 0x0000A0 });

  countryNames.forEach((countryName, index) => {
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

    const radius = innerRadius + (outerRadius - innerRadius) / 2;
    const angleIncrement = (2 * Math.PI) / gridSize;
    const angle = index * angleIncrement;

    const x = radius * Math.cos(angle);
    const z = radius * Math.sin(angle);
    sphere.position.set(x, plotSize / 2, z);
    scene.add(sphere);

    // Add country flag to the top of the sphere
    const textureLoader = new THREE.TextureLoader();
    const flagUrl = `flags/${countryName}.png`;

    textureLoader.load(flagUrl, (texture) => {
      const imageWidth = 1;
      const imageHeight = 1;
      const imageGeometry = new THREE.PlaneGeometry(imageWidth, imageHeight);
      const imageMaterial = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });
      const imagePlane = new THREE.Mesh(imageGeometry, imageMaterial);
      imagePlane.userData = {
        url: `https://silly-longma-33db0f.netlify.app/`,
      };
      
      imagePlane.position.y = plotSize / 2 + 1;
      sphere.add(imagePlane);
      clickableObjects.push(imagePlane);
    });
  });
}





// Set up raycaster for click detection
// const clickableObjects = [];
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseClick(event) {
  // Update the mouse position
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Update the raycaster with the mouse position and camera
  raycaster.setFromCamera(mouse, camera);

  // Get the intersected objects
  const intersects = raycaster.intersectObjects(clickableObjects);

  // If the image is clicked, open the provided URL in a new tab
  if (intersects.length > 0) {
    const url = intersects[0].object.userData.url;
    if (url) {
      window.open(url, "_blank");
    }
  }
}

// const clickableObjects = [];
window.addEventListener("click", onMouseClick, false);
const countryNames = ['argentina', 'australia', 'brazil', 'canada', 'china', 'europian union', 'france', 'germany', 'india', 'indonesia', 'italy', 'japan', 'korea', 'mexico', 'russia', 'saudi arabia', 'south africa', 'turkey', 'uk', 'usa'];

// Animation loop
async function animate() {
  await loadCollegeNames();
  generateSphericalPlots(countryNames, 20, 20 , 20);
  renderLoop();
}

function renderLoop() {
  requestAnimationFrame(renderLoop);
  // grassMaterial.uniforms.time.value += 0.01;
  // globePivot.rotation.y += 0.005;
  // imagePlane.rotation.y += 0.01;

  renderer.render(scene, camera);
}

animate();