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
const numRings = 21;
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

const innerRadius = 15; // Change this value to the radius of the innermost ring
const circleSegments = 32; // The number of segments in the circle; you can increase this value for better roundness
const circleGeometry = new THREE.CircleGeometry(innerRadius, circleSegments);
const loader = new THREE.TextureLoader();
const indiaFlagTexture = loader.load('flags/india.png');

const flagMaterial = new THREE.MeshBasicMaterial({ map: indiaFlagTexture, side: THREE.DoubleSide });
const indiaFlag = new THREE.Mesh(circleGeometry, flagMaterial);
indiaFlag.position.set(0, 0.1, 0); // You can adjust the y value (0.1) to set the flag's height above the grassland
indiaFlag.rotation.x = Math.PI / 2; // Rotate the flag plane to be parallel to the grassland surface
scene.add(indiaFlag);

// Use the global THREE object instead of importing
const fontLoader = new THREE.FontLoader();

fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
    const textGeometry = new THREE.TextGeometry('India', {
        font: font,
        size: 2,
        height: 0.2,
    });

    const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(0, 2, 0);
    scene.add(textMesh);
});

const fontLoader1 = new THREE.FontLoader();

fontLoader1.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
    const textGeometry = new THREE.TextGeometry('Argentina', {
        font: font,
        size: 2,
        height: 0.2,
    });

    const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(0, 2, -16);
    scene.add(textMesh);
});

fontLoader1.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
    const textGeometry = new THREE.TextGeometry('Australia', {
        font: font,
        size: 2,
        height: 0.2,
    });

    const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(0, 2, -30);
    scene.add(textMesh);
});

fontLoader1.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
    const textGeometry = new THREE.TextGeometry('Brazil', {
        font: font,
        size: 2,
        height: 0.2,
    });

    const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(0, 2, -40);
    scene.add(textMesh);
});

fontLoader1.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
    const textGeometry = new THREE.TextGeometry('Canada', {
        font: font,
        size: 2,
        height: 0.2,
    });

    const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(0, 2, -45);
    scene.add(textMesh);
});

fontLoader1.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
    const textGeometry = new THREE.TextGeometry('China', {
        font: font,
        size: 2,
        height: 0.2,
    });

    const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(0, 2, -55);
    scene.add(textMesh);
});

fontLoader1.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
    const textGeometry = new THREE.TextGeometry('Europian Union', {
        font: font,
        size: 2,
        height: 0.2,
    });

    const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(0, 2, -65);
    scene.add(textMesh);
});

fontLoader1.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
    const textGeometry = new THREE.TextGeometry('France', {
        font: font,
        size: 2,
        height: 0.2,
    });

    const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(0, 2, -75);
    scene.add(textMesh);
});

fontLoader1.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
    const textGeometry = new THREE.TextGeometry('Germany', {
        font: font,
        size: 2,
        height: 0.2,
    });

    const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(0, 2, -85);
    scene.add(textMesh);
});

fontLoader1.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
    const textGeometry = new THREE.TextGeometry('Indonesia', {
        font: font,
        size: 2,
        height: 0.2,
    });

    const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(0, 2, -95);
    scene.add(textMesh);
});

fontLoader1.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
    const textGeometry = new THREE.TextGeometry('Italy', {
        font: font,
        size: 2,
        height: 0.2,
    });

    const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(0, 2, -105);
    scene.add(textMesh);
});

fontLoader1.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
    const textGeometry = new THREE.TextGeometry('Japan', {
        font: font,
        size: 2,
        height: 0.2,
    });

    const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(0, 2, -120);
    scene.add(textMesh);
});

fontLoader1.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
    const textGeometry = new THREE.TextGeometry('Russia', {
        font: font,
        size: 2,
        height: 0.2,
    });

    const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(0, 2, -130);
    scene.add(textMesh);
});

fontLoader1.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
    const textGeometry = new THREE.TextGeometry('South Korea', {
        font: font,
        size: 2,
        height: 0.2,
    });

    const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(0, 2, -140);
    scene.add(textMesh);
});

fontLoader1.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
    const textGeometry = new THREE.TextGeometry('Saudi Arabia', {
        font: font,
        size: 2,
        height: 0.2,
    });

    const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(0, 2, -150);
    scene.add(textMesh);
});

fontLoader1.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
    const textGeometry = new THREE.TextGeometry('South Africa', {
        font: font,
        size: 2,
        height: 0.2,
    });

    const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(0, 2, -160);
    scene.add(textMesh);
});

fontLoader1.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
    const textGeometry = new THREE.TextGeometry('Turkey', {
        font: font,
        size: 2,
        height: 0.2,
    });

    const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(0, 2, -166);
    scene.add(textMesh);
});

fontLoader1.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
    const textGeometry = new THREE.TextGeometry('Mexico', {
        font: font,
        size: 2,
        height: 0.2,
    });

    const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(0, 2, -176);
    scene.add(textMesh);
});

fontLoader1.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
    const textGeometry = new THREE.TextGeometry('United States of America', {
        font: font,
        size: 2,
        height: 0.2,
    });

    const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(0, 2, -186);
    scene.add(textMesh);
});

fontLoader1.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
    const textGeometry = new THREE.TextGeometry('United Kingdom', {
        font: font,
        size: 2,
        height: 0.2,
    });

    const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(0, 2, -196);
    scene.add(textMesh);
});



const innerRadius1 = 15; // Change this value to the radius of the innermost ring
const outerRadius = 25; // Change this value to the radius of the next consecutive ring

const ringSegments = 32; // The number of segments in the ring; you can increase this value for better roundness
const ringGeometry = new THREE.RingGeometry(innerRadius1, outerRadius, ringSegments);

const loader1 = new THREE.TextureLoader();
const argentinaFlagTexture = loader1.load('flags/argentina.png');

const flagMaterial1 = new THREE.MeshBasicMaterial({ map: argentinaFlagTexture, side: THREE.DoubleSide });
const argentinaFlag = new THREE.Mesh(ringGeometry, flagMaterial1);

argentinaFlag.position.set(0, 0.1, 0); // You can adjust the y value (0.1) to set the flag's height above the grassland
argentinaFlag.rotation.x = Math.PI / 2; // Rotate the flag ring to be parallel to the grassland surface

scene.add(argentinaFlag);



const innerRadiusAustralia = 25; // Change this value to the radius of the Argentina flag's outer ring
const outerRadiusAustralia = 35; // Change this value to the radius of the next consecutive ring after the Argentina flag

const ringSegmentsAustralia = 32; // The number of segments in the ring; you can increase this value for better roundness
const ringGeometryAustralia = new THREE.RingGeometry(innerRadiusAustralia, outerRadiusAustralia, ringSegmentsAustralia);
const australiaFlagTexture = loader.load('flags/australia.png');

const flagMaterialAustralia = new THREE.MeshBasicMaterial({ map: australiaFlagTexture, side: THREE.DoubleSide });
const australiaFlag = new THREE.Mesh(ringGeometryAustralia, flagMaterialAustralia);
australiaFlag.position.set(0, 0.1, 0); // You can adjust the y value (0.1) to set the flag's height above the grassland
australiaFlag.rotation.x = Math.PI / 2; // Rotate the flag ring to be parallel to the grassland surface
scene.add(australiaFlag);



const innerRadiusBrazil = 35; // Change this value to the radius of the Australia flag's outer ring
const outerRadiusBrazil = 45; // Change this value to the radius of the next consecutive ring after the Australia flag
const ringSegmentsBrazil = 32; // The number of segments in the ring; you can increase this value for better roundness
const ringGeometryBrazil = new THREE.RingGeometry(innerRadiusBrazil, outerRadiusBrazil, ringSegmentsBrazil);
const brazilFlagTexture = loader.load('flags/brazil.png');

const flagMaterialBrazil = new THREE.MeshBasicMaterial({ map: brazilFlagTexture, side: THREE.DoubleSide });
const brazilFlag = new THREE.Mesh(ringGeometryBrazil, flagMaterialBrazil);
brazilFlag.position.set(0, 0.1, 0); // You can adjust the y value (0.1) to set the flag's height above the grassland
brazilFlag.rotation.x = Math.PI / 2; // Rotate the flag ring to be parallel to the grassland surface
scene.add(brazilFlag);



const innerRadiusCanada = 45; // Change this value to the radius of the Brazil flag's outer ring
const outerRadiusCanada = 55; // Change this value to the radius of the next consecutive ring after the Brazil flag
const ringSegmentsCanada = 32; // The number of segments in the ring; you can increase this value for better roundness
const ringGeometryCanada = new THREE.RingGeometry(innerRadiusCanada, outerRadiusCanada, ringSegmentsCanada);
const canadaFlagTexture = loader.load('flags/canada.png');

const flagMaterialCanada = new THREE.MeshBasicMaterial({ map: canadaFlagTexture, side: THREE.DoubleSide });
const canadaFlag = new THREE.Mesh(ringGeometryCanada, flagMaterialCanada);
canadaFlag.position.set(0, 0.1, 0); // You can adjust the y value (0.1) to set the flag's height above the grassland
canadaFlag.rotation.x = Math.PI / 2; // Rotate the flag ring to be parallel to the grassland surface
scene.add(canadaFlag);



const innerRadiusChina = 55; // Change this value to the radius of the Brazil flag's outer ring
const outerRadiusChina = 65; // Change this value to the radius of the next consecutive ring after the Brazil flag
const ringSegmentsChina = 32; // The number of segments in the ring; you can increase this value for better roundness
const ringGeometryChina = new THREE.RingGeometry(innerRadiusChina, outerRadiusChina, ringSegmentsChina);
const ChinaFlagTexture = loader.load('flags/china.png');

const flagMaterialChina = new THREE.MeshBasicMaterial({ map: ChinaFlagTexture, side: THREE.DoubleSide });
const ChinaFlag = new THREE.Mesh(ringGeometryChina, flagMaterialChina);
ChinaFlag.position.set(0, 0.1, 0); // You can adjust the y value (0.1) to set the flag's height above the grassland
ChinaFlag.rotation.x = Math.PI / 2; // Rotate the flag ring to be parallel to the grassland surface
scene.add(ChinaFlag);


const innerRadiusEuro = 65; // Change this value to the radius of the Brazil flag's outer ring
const outerRadiusEuro = 75; // Change this value to the radius of the next consecutive ring after the Brazil flag
const ringSegmentsEuro = 32; // The number of segments in the ring; you can increase this value for better roundness
const ringGeometryEuro = new THREE.RingGeometry(innerRadiusEuro, outerRadiusEuro, ringSegmentsEuro);
const EuroFlagTexture = loader.load('flags/europian union.png');

const flagMaterialEuro = new THREE.MeshBasicMaterial({ map: EuroFlagTexture, side: THREE.DoubleSide });
const EuroFlag = new THREE.Mesh(ringGeometryEuro, flagMaterialEuro);
EuroFlag.position.set(0, 0.1, 0); // You can adjust the y value (0.1) to set the flag's height above the grassland
EuroFlag.rotation.x = Math.PI / 2; // Rotate the flag ring to be parallel to the grassland surface
scene.add(EuroFlag);



const innerRadiusFrance = 75; // Change this value to the radius of the Brazil flag's outer ring
const outerRadiusFrance = 85; // Change this value to the radius of the next consecutive ring after the Brazil flag
const ringSegmentsFrance = 32; // The number of segments in the ring; you can increase this value for better roundness
const ringGeometryFrance = new THREE.RingGeometry(innerRadiusFrance, outerRadiusFrance, ringSegmentsFrance);
const FranceFlagTexture = loader.load('flags/france.png');

const flagMaterialFrance = new THREE.MeshBasicMaterial({ map: FranceFlagTexture, side: THREE.DoubleSide });
const FranceFlag = new THREE.Mesh(ringGeometryFrance, flagMaterialFrance);
FranceFlag.position.set(0, 0.1, 0); // You can adjust the y value (0.1) to set the flag's height above the grassland
FranceFlag.rotation.x = Math.PI / 2; // Rotate the flag ring to be parallel to the grassland surface
scene.add(FranceFlag);

const innerRadiusGermany = 85; // Change this value to the radius of the Brazil flag's outer ring
const outerRadiusGermany = 95; // Change this value to the radius of the next consecutive ring after the Brazil flag
const ringSegmentsGermany = 32; // The number of segments in the ring; you can increase this value for better roundness
const ringGeometryGermany = new THREE.RingGeometry(innerRadiusGermany, outerRadiusGermany, ringSegmentsGermany);
const GermanyFlagTexture = loader.load('flags/germany.png');

const flagMaterialGermany = new THREE.MeshBasicMaterial({ map: GermanyFlagTexture, side: THREE.DoubleSide });
const GermanyFlag = new THREE.Mesh(ringGeometryGermany, flagMaterialGermany);
GermanyFlag.position.set(0, 0.1, 0); // You can adjust the y value (0.1) to set the flag's height above the grassland
GermanyFlag.rotation.x = Math.PI / 2; // Rotate the flag ring to be parallel to the grassland surface
scene.add(GermanyFlag);

const innerRadiusIndo = 95; // Change this value to the radius of the Brazil flag's outer ring
const outerRadiusIndo = 105; // Change this value to the radius of the next consecutive ring after the Brazil flag
const ringSegmentsIndo = 32; // The number of segments in the ring; you can increase this value for better roundness
const ringGeometryIndo = new THREE.RingGeometry(innerRadiusIndo, outerRadiusIndo, ringSegmentsIndo);
const IndoFlagTexture = loader.load('flags/indonesia.png');

const flagMaterialIndo = new THREE.MeshBasicMaterial({ map: IndoFlagTexture, side: THREE.DoubleSide });
const IndoFlag = new THREE.Mesh(ringGeometryIndo, flagMaterialIndo);
IndoFlag.position.set(0, 0.1, 0); // You can adjust the y value (0.1) to set the flag's height above the grassland
IndoFlag.rotation.x = Math.PI / 2; // Rotate the flag ring to be parallel to the grassland surface
scene.add(IndoFlag);

const innerRadiusIT = 105; // Change this value to the radius of the Brazil flag's outer ring
const outerRadiusIT = 115; // Change this value to the radius of the next consecutive ring after the Brazil flag
const ringSegmentsIT = 32; // The number of segments in the ring; you can increase this value for better roundness
const ringGeometryIT = new THREE.RingGeometry(innerRadiusIT, outerRadiusIT, ringSegmentsIT);
const ITFlagTexture = loader.load('flags/italy.png');

const flagMaterialIT = new THREE.MeshBasicMaterial({ map: ITFlagTexture, side: THREE.DoubleSide });
const ITFlag = new THREE.Mesh(ringGeometryIT, flagMaterialIT);
ITFlag.position.set(0, 0.1, 0); // You can adjust the y value (0.1) to set the flag's height above the grassland
ITFlag.rotation.x = Math.PI / 2; // Rotate the flag ring to be parallel to the grassland surface
scene.add(ITFlag);


const innerRadiusJP = 115; // Change this value to the radius of the Brazil flag's outer ring
const outerRadiusJP = 125; // Change this value to the radius of the next consecutive ring after the Brazil flag
const ringSegmentsJP = 32; // The number of segments in the ring; you can increase this value for better roundness
const ringGeometryJP = new THREE.RingGeometry(innerRadiusJP, outerRadiusJP, ringSegmentsJP);
const JPFlagTexture = loader.load('flags/japan.png');

const flagMaterialJP = new THREE.MeshBasicMaterial({ map: JPFlagTexture, side: THREE.DoubleSide });
const JPFlag = new THREE.Mesh(ringGeometryJP, flagMaterialJP);
JPFlag.position.set(0, 0.1, 0); // You can adjust the y value (0.1) to set the flag's height above the grassland
JPFlag.rotation.x = Math.PI / 2; // Rotate the flag ring to be parallel to the grassland surface
scene.add(JPFlag);


const innerRadiusRS = 125; // Change this value to the radius of the Brazil flag's outer ring
const outerRadiusRS = 135; // Change this value to the radius of the next consecutive ring after the Brazil flag
const ringSegmentsRS = 32; // The number of segments in the ring; you can increase this value for better roundness
const ringGeometryRS = new THREE.RingGeometry(innerRadiusRS, outerRadiusRS, ringSegmentsRS);
const RSFlagTexture = loader.load('flags/russia.png');

const flagMaterialRS = new THREE.MeshBasicMaterial({ map: RSFlagTexture, side: THREE.DoubleSide });
const RSFlag = new THREE.Mesh(ringGeometryRS, flagMaterialRS);
RSFlag.position.set(0, 0.1, 0); // You can adjust the y value (0.1) to set the flag's height above the grassland
RSFlag.rotation.x = Math.PI / 2; // Rotate the flag ring to be parallel to the grassland surface
scene.add(RSFlag);

const innerRadiusSK = 135; // Change this value to the radius of the Brazil flag's outer ring
const outerRadiusSK = 145; // Change this value to the radius of the next consecutive ring after the Brazil flag
const ringSegmentsSK = 32; // The number of segments in the ring; you can increase this value for better roundness
const ringGeometrySK = new THREE.RingGeometry(innerRadiusSK, outerRadiusSK, ringSegmentsSK);
const SKFlagTexture = loader.load('flags/korea.png');

const flagMaterialSK = new THREE.MeshBasicMaterial({ map: SKFlagTexture, side: THREE.DoubleSide });
const SKFlag = new THREE.Mesh(ringGeometrySK, flagMaterialSK);
SKFlag.position.set(0, 0.1, 0); // You can adjust the y value (0.1) to set the flag's height above the grassland
SKFlag.rotation.x = Math.PI / 2; // Rotate the flag ring to be parallel to the grassland surface
scene.add(SKFlag);

const innerRadiusSA = 145; // Change this value to the radius of the Brazil flag's outer ring
const outerRadiusSA = 155; // Change this value to the radius of the next consecutive ring after the Brazil flag
const ringSegmentsSA = 32; // The number of segments in the ring; you can increase this value for better roundness
const ringGeometrySA = new THREE.RingGeometry(innerRadiusSA, outerRadiusSA, ringSegmentsSA);
const SAFlagTexture = loader.load('flags/saudi arabia.png');

const flagMaterialSA = new THREE.MeshBasicMaterial({ map: SAFlagTexture, side: THREE.DoubleSide });
const SAFlag = new THREE.Mesh(ringGeometrySA, flagMaterialSA);
SAFlag.position.set(0, 0.1, 0); // You can adjust the y value (0.1) to set the flag's height above the grassland
SAFlag.rotation.x = Math.PI / 2; // Rotate the flag ring to be parallel to the grassland surface
scene.add(SAFlag);


const innerRadiusSAF = 155; // Change this value to the radius of the Brazil flag's outer ring
const outerRadiusSAF = 165; // Change this value to the radius of the next consecutive ring after the Brazil flag
const ringSegmentsSAF = 32; // The number of segments in the ring; you can increase this value for better roundness
const ringGeometrySAF = new THREE.RingGeometry(innerRadiusSAF, outerRadiusSAF, ringSegmentsSAF);
const SAFFlagTexture = loader.load('flags/south africa.png');

const flagMaterialSAF = new THREE.MeshBasicMaterial({ map: SAFFlagTexture, side: THREE.DoubleSide });
const SAFFlag = new THREE.Mesh(ringGeometrySAF, flagMaterialSAF);
SAFFlag.position.set(0, 0.1, 0); // You can adjust the y value (0.1) to set the flag's height above the grassland
SAFFlag.rotation.x = Math.PI / 2; // Rotate the flag ring to be parallel to the grassland surface
scene.add(SAFFlag);

const innerRadiusTur = 165; // Change this value to the radius of the Brazil flag's outer ring
const outerRadiusTur = 175; // Change this value to the radius of the next consecutive ring after the Brazil flag
const ringSegmentsTur = 32; // The number of segments in the ring; you can increase this value for better roundness
const ringGeometryTur = new THREE.RingGeometry(innerRadiusTur, outerRadiusTur, ringSegmentsTur);
const TurFlagTexture = loader.load('flags/turkey.png');

const flagMaterialTur = new THREE.MeshBasicMaterial({ map: TurFlagTexture, side: THREE.DoubleSide });
const TurFlag = new THREE.Mesh(ringGeometryTur, flagMaterialTur);
TurFlag.position.set(0, 0.1, 0); // You can adjust the y value (0.1) to set the flag's height above the grassland
TurFlag.rotation.x = Math.PI / 2; // Rotate the flag ring to be parallel to the grassland surface
scene.add(TurFlag);

const innerRadiusMex = 175; // Change this value to the radius of the Brazil flag's outer ring
const outerRadiusMex = 185; // Change this value to the radius of the next consecutive ring after the Brazil flag
const ringSegmentsMex = 32; // The number of segments in the ring; you can increase this value for better roundness
const ringGeometryMex = new THREE.RingGeometry(innerRadiusMex, outerRadiusMex, ringSegmentsMex);
const MexFlagTexture = loader.load('flags/mexico.png');

const flagMaterialMex = new THREE.MeshBasicMaterial({ map: MexFlagTexture, side: THREE.DoubleSide });
const MexFlag = new THREE.Mesh(ringGeometryMex, flagMaterialMex);
MexFlag.position.set(0, 0.1, 0); // You can adjust the y value (0.1) to set the flag's height above the grassland
MexFlag.rotation.x = Math.PI / 2; // Rotate the flag ring to be parallel to the grassland surface
scene.add(MexFlag);

const innerRadiusUS = 185; // Change this value to the radius of the Brazil flag's outer ring
const outerRadiusUS = 195; // Change this value to the radius of the next consecutive ring after the Brazil flag
const ringSegmentsUS = 32; // The number of segments in the ring; you can increase this value for better roundness
const ringGeometryUS = new THREE.RingGeometry(innerRadiusUS, outerRadiusUS, ringSegmentsUS);
const USFlagTexture = loader.load('flags/usa.png');

const flagMaterialUS = new THREE.MeshBasicMaterial({ map: USFlagTexture, side: THREE.DoubleSide });
const USFlag = new THREE.Mesh(ringGeometryUS, flagMaterialUS);
USFlag.position.set(0, 0.1, 0); // You can adjust the y value (0.1) to set the flag's height above the grassland
USFlag.rotation.x = Math.PI / 2; // Rotate the flag ring to be parallel to the grassland surface
scene.add(USFlag);

const innerRadiusuk = 195; // Change this value to the radius of the Brazil flag's outer ring
const outerRadiusuk = 205; // Change this value to the radius of the next consecutive ring after the Brazil flag
const ringSegmentsuk = 32; // The number of segments in the ring; you can increase this value for better roundness
const ringGeometryuk = new THREE.RingGeometry(innerRadiusuk, outerRadiusuk, ringSegmentsuk);
const ukFlagTexture = loader.load('flags/uk.png');

const flagMaterialuk = new THREE.MeshBasicMaterial({ map: ukFlagTexture, side: THREE.DoubleSide });
const ukFlag = new THREE.Mesh(ringGeometryuk, flagMaterialuk);
ukFlag.position.set(0, 0.1, 0); // You can adjust the y value (0.1) to set the flag's height above the grassland
ukFlag.rotation.x = Math.PI / 2; // Rotate the flag ring to be parallel to the grassland surface
scene.add(ukFlag);








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
// const countryNames = ['argentina', 'australia', 'brazil', 'canada', 'china', 'europian union', 'france', 'germany', 'india', 'indonesia', 'italy', 'japan', 'korea', 'mexico', 'russia', 'saudi arabia', 'south africa', 'turkey', 'uk', 'usa'];

// Animation loop
async function animate() {
  await loadCollegeNames();
  // generateSphericalPlots(countryNames, 20, 20 , 20);
  renderLoop();
}

function renderLoop() {
  requestAnimationFrame(renderLoop);
  // grassMaterial.uniforms.time.value += 0.01;
  globePivot.rotation.y += 0.005;
  imagePlane.rotation.y += 0.01;

  renderer.render(scene, camera);
}

animate();