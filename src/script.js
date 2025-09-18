import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Galaxy
 */
const parameters = {
    count: 100000,
    size: 0.01,
    radius: 5,
    branches: 5,
    spin: 1,
    randomness: 0.2,
    randomnessPower: 3,
    innerColor: '#ff6030',
    outerColor: '#1b3984'
};

let pointsGeometry = null;
let pointsMaterial = null;
let points = null;

const generateGalaxy = () => {
    if(points !== null){
        pointsGeometry.dispose()
        pointsMaterial.dispose()
        scene.remove(points)
    }

    pointsGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(parameters.count * 3)
    const colors = new Float32Array(parameters.count * 3)

    //Mix inner and outer colors
    const colorInside = new THREE.Color(parameters.innerColor)
    const colorOutside = new THREE.Color(parameters.outerColor)

    for(let i = 0; i < parameters.count; i++){
        //For XYZ triples
        const i3 = i * 3;
        //Random value along Radius
        const randomRadius = Math.random() * parameters.radius;
        const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2;
        const spinAngle = randomRadius * parameters.spin;

        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1);
        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1);
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1);

        //Colors
        const mixedColor = colorInside.clone();
        mixedColor.lerp(colorOutside, randomRadius / parameters.radius)

        colors[i3] = mixedColor.r;
        colors[i3 + 1] = mixedColor.g;
        colors[i3 + 2] = mixedColor.b;

        //Every First positions array index (x)
        positions[i3] = Math.cos(branchAngle + spinAngle) * randomRadius + randomX;
        
        //Every Second positions array index (y)
        positions[i3 + 1] = randomY;

        //Every Third positions array index (z)
        positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * randomRadius + randomZ;
    }

    pointsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    pointsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    /**
     * Material
     */
    pointsMaterial = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true
    })

    points = new THREE.Points(pointsGeometry, pointsMaterial)
    scene.add(points)
}

generateGalaxy();

gui.add(parameters, 'count').min(100).max(10000).step(100).name('Point Count').onFinishChange(generateGalaxy)
gui.add(parameters, 'size').min(0.001).max(1).step(0.001).name('Point Size').onFinishChange(generateGalaxy)
gui.add(parameters, 'radius').min(0.01).max(20).step(0.001).name('gRadius').onFinishChange(generateGalaxy)
gui.add(parameters, 'branches').min(2).max(20).step(1).name('Branches').onFinishChange(generateGalaxy)
gui.add(parameters, 'spin').min(-5).max(5).step(0.001).name('Spin').onFinishChange(generateGalaxy)
gui.add(parameters, 'randomness').min(0).max(2).step(0.001).name('Randomness').onFinishChange(generateGalaxy)
gui.add(parameters, 'randomnessPower').min(1).max(10).step(0.001).name('RandomnessPower').onFinishChange(generateGalaxy)
gui.addColor(parameters, 'innerColor').onFinishChange(generateGalaxy)
gui.addColor(parameters, 'outerColor').onFinishChange(generateGalaxy)


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    //Update Galaxy
    points.rotation.y = Math.sin(elapsedTime * 0.1) * Math.PI;

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()