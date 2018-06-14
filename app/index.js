import "styles/index.scss";

import * as THREE from "three";
import * as AR from "three.ar.js";

console.log(THREE);
console.log(AR);

var vrDisplay;
var vrControls;
var arView;
var canvas;
var camera;
var scene;
var renderer;
var reticle;

AR.ARUtils.getARDisplay().then(function(display) {
    if (display) {
        vrDisplay = display;
        init();
    } else {
        AR.ARUtils.displayUnsupportedMessage();
    }
});

function init() {
    // Turn on the debugging panel
    var arDebug = new AR.ARDebug(vrDisplay);
    document.body.appendChild(arDebug.getElement());
    // Setup the three.js rendering environment
    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.autoClear = false;
    canvas = renderer.domElement;
    document.body.appendChild(canvas);
    scene = new THREE.Scene();
    // Creating the ARView, which is the object that handles
    // the rendering of the camera stream behind the three.js
    // scene
    arView = new AR.ARView(vrDisplay, renderer);
    // The ARPerspectiveCamera is very similar to THREE.PerspectiveCamera,
    // except when using an AR-capable browser, the camera uses
    // the projection matrix provided from the device, so that the
    // perspective camera's depth planes and field of view matches
    // the physical camera on the device.
    camera = new AR.ARPerspectiveCamera(
        vrDisplay,
        60,
        window.innerWidth / window.innerHeight,
        0.01,
        100
    );
    // Create our ARReticle, which will continuously fire `hitTest` to trace
    // the detected surfaces
    reticle = new AR.ARReticle(
        vrDisplay,
        0.03, // innerRadius
        0.04, // outerRadius
        0xff0077, // color
        0.25
    ); // easing
    scene.add(reticle);
    // VRControls is a utility from three.js that applies the device's
    // orientation/position to the perspective camera, keeping our
    // real world and virtual world in sync.
    // vrControls = new THREE.VRControls(camera);
    // Bind our event handlers
    window.addEventListener("resize", onWindowResize, false);
    update();
}
/**
 * The render loop, called once per frame. Handles updating
 * our scene and rendering.
 */
function update() {
    // Clears color from the frame before rendering the camera (arView) or scene.
    renderer.clearColor();
    // Render the device's camera stream on screen first of all.
    // It allows to get the right pose synchronized with the right frame.
    arView.render();
    // Update our camera projection matrix in the event that
    // the near or far planes have updated
    camera.updateProjectionMatrix();
    // Update our ARReticle's position, and provide normalized
    // screen coordinates to send the hit test -- in this case, (0.5, 0.5)
    // is the middle of our screen
    reticle.update(0.5, 0.5);
    // Update our perspective camera's positioning
    vrControls.update();
    // Render our three.js virtual scene
    renderer.clearDepth();
    renderer.render(scene, camera);
    // Kick off the requestAnimationFrame to call this function
    // when a new VRDisplay frame is rendered
    vrDisplay.requestAnimationFrame(update);
}
/**
 * On window resize, update the perspective camera's aspect ratio,
 * and call `updateProjectionMatrix` so that we can get the latest
 * projection matrix provided from the device
 */
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
