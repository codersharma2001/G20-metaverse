// // Set up the scene, camera, and renderer
// var scene = new THREE.Scene();
// var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// var renderer = new THREE.WebGLRenderer();
// renderer.setSize(window.innerWidth, window.innerHeight);
// document.body.appendChild(renderer.domElement);

// // Set up skybox
// var skyBoxLoader = new THREE.CubeTextureLoader();
// var skyBoxTexture = skyBoxLoader.load([
//     'px.jpg', 'nx.jpg',
//     'py.jpg', 'ny.jpg',
//     'pz.jpg', 'nz.jpg',
// ]);
// scene.background = skyBoxTexture;

// // Set up fog
// var fogColor = new THREE.Color(0xcceeff);
// scene.fog = new THREE.Fog(fogColor, 20, 300);  // Adjust the 0.0003 value to control the density of the fog

// // Shader code for the wind effect
// const grassVertexShader = `
//     uniform float time;
//     varying vec2 vUv;
//     void main() {
//         vUv = uv;
//         vec3 newPosition = position;
//         newPosition.x += sin(position.x * 10.0 + time) * 0.2;
//         newPosition.z += sin(position.z * 10.0 + time) * 0.2;
//         gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
//     }
// `;

// const grassFragmentShader = `
//     varying vec2 vUv;
//     uniform sampler2D grassTexture;
//     void main() {
//         gl_FragColor = texture2D(grassTexture, vUv);
//     }
// `;
// // Set up grassland plane
// var grassTexture = new THREE.TextureLoader().load('grass_texture.jpg');
// grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
// grassTexture.repeat.set(100, 100);

// var grassMaterial = new THREE.ShaderMaterial({
//   uniforms: {
//       time: { value: 0 },
//       grassTexture: { value: grassTexture }
//   },
//   vertexShader: grassVertexShader,
//   fragmentShader: grassFragmentShader,
// });

// var grassMaterial = new THREE.MeshStandardMaterial({ map: grassTexture });
// var grassGeometry = new THREE.PlaneGeometry(1000, 1000);
// var grassPlane = new THREE.Mesh(grassGeometry, grassMaterial);
// grassPlane.rotation.x = -Math.PI / 2;
// scene.add(grassPlane);

// var tileTexture = new THREE.TextureLoader().load('tile_texture.jpg');
// var imageTexture = new THREE.TextureLoader().load('VKB.png');

// function createCircularRing(innerRadius, outerRadius, radialSegments, tubularSegments, isInnermostRing) {
//   const ringGeometry = new THREE.TorusGeometry(
//     (innerRadius + outerRadius) / 2,
//     (outerRadius - innerRadius) / 2,
//     radialSegments,
//     tubularSegments
//   );
//   const ringColor = isInnermostRing ? 0xFFA500 : null;
//   const ringMaterial = new THREE.MeshStandardMaterial({ map: isInnermostRing ? null : tileTexture, color: ringColor, side: THREE.DoubleSide });

//   const ring = new THREE.Mesh(ringGeometry, ringMaterial);
//   ring.position.y = 0.01; // Position the ring slightly above the grassland surface to avoid z-fighting
//   ring.rotation.x = Math.PI / 2; // Rotate the ring so that it is parallel to the grassland surface

//   return ring;
// }

// function createImagePlane(width, height, texture) {
//   const imageGeometry = new THREE.PlaneGeometry(width, height);
//   const imageMaterial = new THREE.MeshBasicMaterial({
//     map: texture,
//     transparent: true,
//     side: THREE.DoubleSide
//   });

//   const imagePlane = new THREE.Mesh(imageGeometry, imageMaterial);
//   return imagePlane;
// }

// // Set up a light source
// var light = new THREE.PointLight(0xffffff, 1, 0);
// light.position.set(0, 50, 50);
// scene.add(light);

// // Set up ambient light
// var ambientLight = new THREE.AmbientLight(0x404040, 1);
// scene.add(ambientLight);

// // Set up globe
// var globeTexture = new THREE.TextureLoader().load('earth-texture.jpg');
// var globeBumpMap = new THREE.TextureLoader().load('earth-bump.png');
// var globeGeometry = new THREE.SphereGeometry(5, 64, 64);
// var globeMaterial = new THREE.MeshPhongMaterial({
//   map: globeTexture,
//   bumpMap: globeBumpMap,
//   bumpScale: 0.1
// });

// var globeMesh = new THREE.Mesh(globeGeometry, globeMaterial);
// globeMesh.position.y = 10;
// scene.add(globeMesh);

// function latLonToVector3(lat, lon, radius) {
//   const phi = (90 - lat) * (Math.PI / 180);
//   const theta = (lon + 180) * (Math.PI / 180);

//   const x = -(radius * Math.sin(phi) * Math.cos(theta));
//   const z = radius * Math.sin(phi) * Math.sin(theta);
//   const y = radius * Math.cos(phi);

//   return new THREE.Vector3(x, y, z);
// }

// function createWhiteRing(innerRadius, outerRadius, radialSegments, tubularSegments) {
//   const ringGeometry = new THREE.TorusGeometry(
//     (innerRadius + outerRadius) / 2,
//     (outerRadius - innerRadius) / 2,
//     radialSegments,
//     tubularSegments
//   );
//   const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, side: THREE.DoubleSide });

//   const ring = new THREE.Mesh(ringGeometry, ringMaterial);
//   ring.position.y = -0.02; // Position the ring slightly below the grassland surface to avoid z-fighting
//   ring.rotation.x = Math.PI / 2; // Rotate the ring so that it is parallel to the grassland surface

//   return ring;
// }

// const symbolGeometry = new THREE.SphereGeometry(0.2, 32, 32);
// const symbolMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
// const symbol = new THREE.Mesh(symbolGeometry, symbolMaterial);

// const locationLat = 28.5439106;
// const locationLon = 77.3309198;
// const globeRadius = 5;

// symbol.position.copy(latLonToVector3(locationLat, locationLon, globeRadius));
// globeMesh.add(symbol);

// const globePivot = new THREE.Object3D();
// scene.add(globePivot);
// globePivot.add(globeMesh);

// function createOrangeDisk(radius, radialSegments) {
//   const diskGeometry = new THREE.CircleGeometry(radius, radialSegments);
//   const diskMaterial = new THREE.MeshStandardMaterial({ color:  0xF4C430 , side: THREE.DoubleSide });

//   const disk = new THREE.Mesh(diskGeometry, diskMaterial);
//   disk.position.y = 0.02; // Position the disk slightly above the grassland surface to avoid z-fighting
//   disk.rotation.x = Math.PI / 2; // Rotate the disk so that it is parallel to the grassland surface

//   return disk;
// }

// const innermostRingInnerRadius = 14;
// const orangeDisk = createOrangeDisk(innermostRingInnerRadius, 64);
// scene.add(orangeDisk);

// function createWhitePlane(innerRadius, outerRadius, radialSegments, height) {
//   const planeGeometry = new THREE.RingGeometry(innerRadius, outerRadius, radialSegments);
//   const planeMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, side: THREE.DoubleSide });

//   const plane = new THREE.Mesh(planeGeometry, planeMaterial);
//   plane.position.y = 0.01; // Position the plane slightly below the grassland surface to avoid z-fighting
//   plane.rotation.x = -Math.PI / 2; // Rotate the plane so that it is parallel to the grassland surface

//   return plane;
// }
// // Add the circular rings to the scene
// const numRings = 4;
// const ringGap = 10;

// for (let i = 0; i < numRings; i++) {
//   const innerRadius = 14 + i * ringGap;
//   const outerRadius = 16 + i * ringGap;
//   const radialSegments = 32;
//   const tubularSegments = 64;
  
//   const isInnermostRing = (i === 0);
//   const circularRing = createCircularRing(innerRadius, outerRadius, radialSegments, tubularSegments, isInnermostRing);
//   const whiteRing = createWhiteRing(innerRadius, outerRadius, radialSegments, tubularSegments);
//   const whitePlane = createWhitePlane(innerRadius, outerRadius, radialSegments, grassGeometry.parameters.height);
//   scene.add(circularRing);
//   scene.add(whiteRing)
//   scene.add(whitePlane);
// }



// // Set up image plane above the globe
// const imagePlaneWidth = 15;
// const imagePlaneHeight = 5;
// const imagePlaneDistance = 10;

// const imagePlane = createImagePlane(imagePlaneWidth, imagePlaneHeight, imageTexture);
// imagePlane.position.set(0, globeMesh.position.y + imagePlaneDistance, 0);
// globePivot.add(imagePlane);

// // Position camera and set controls
// camera.position.set(0, 10, 25);
// var controls = new THREE.OrbitControls(camera, renderer.domElement);
// controls.enablePan = false;
// controls.minDistance = 10;
// controls.maxDistance = 100;

// // Set up raycaster for click detection
// const raycaster = new THREE.Raycaster();
// const mouse = new THREE.Vector2();

// function onMouseClick(event) {
//   // Update the mouse position
//   const mouse = new THREE.Vector2(
//     (event.clientX / window.innerWidth) * 2 - 1,
//     -(event.clientY / window.innerHeight) * 2 + 1
//   );

//   // Update the raycaster with the mouse position and camera
//   const raycaster = new THREE.Raycaster();
//   raycaster.setFromCamera(mouse, camera);
  
//   // Get the intersected objects
//   const intersects = raycaster.intersectObjects([symbol], true);

//   // If the symbol is clicked, open the Google Maps URL in a new tab
//   if (intersects.length > 0) {
//     const url = `https://www.google.com/maps/@${locationLat},${locationLon},20.32z/data=!3m1!1e3!5m1!1e1`;
//     window.open(url, '_blank');
//   }
// }

// window.addEventListener('click', onMouseClick, false);

// // Animation loop
// function animate() {
//   requestAnimationFrame(animate);
//   // grassMaterial.uniforms.time.value += 0.01;
//   globePivot.rotation.y += 0.005;
//   imagePlane.rotation.y += 0.01;
 
//   renderer.render(scene, camera);
// }

// animate();