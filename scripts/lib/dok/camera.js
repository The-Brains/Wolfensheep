define([
    'threejs', 'dok/loop',
], function(THREE, Loop) {
    'use strict';

    var camera;
    var camera2d = new THREE.OrthographicCamera(-innerWidth / 2, innerWidth / 2, innerHeight / 2, -innerHeight / 2, 0.1, 1000000);
    var camera3d = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000000);
    var cameraQuaternionData = {
            array: new Float32Array(4),
            forwardMovement: new THREE.Vector3(0, 0, 1),
            version: 0,
        }, lastQuat = new THREE.Quaternion(), tempQuat = new THREE.Quaternion(),
        tempQuatArray = new Float32Array(4), upVector = new THREE.Vector3(0, 1, 0);
    var groundQuat = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(1, 0, 0), -Math.PI / 2
    );

    /**
     *  FUNCTION DEFINITIONS
     */
    function getCamera() {
        return camera;
    }

    function nop() {
    }

    function setCamera3d(value) {
        if (value && camera !== camera3d) {
            camera = camera3d;
            copyCamera(camera2d, camera);
        } else if (!value && camera === camera3d) {
            camera = camera2d;
            copyCamera(camera3d, camera);
        }
        updateQuaternionData();
    }

    function updateQuaternionData() {
        camera.quaternion.toArray(cameraQuaternionData.array);
        cameraQuaternionData.forwardMovement.set(0, 0, 1);
        cameraQuaternionData.forwardMovement.applyQuaternion(camera.quaternion);
    }

    function getCameraQuaternionData() {
        if (!camera.quaternion.equals(lastQuat)) {
            updateQuaternionData();
            lastQuat.copy(camera.quaternion);
        }
        return cameraQuaternionData;
    }

    function initCameras() {
        camera2d.position.set(0, 0, 400);
        camera3d.position.set(0, 0, 400);
    }

    function isCamera3d() {
        return camera === camera3d;
    }

    function copyCamera(from, to) {
        to.position.copy(from.position);
        to.quaternion.copy(from.quaternion);
    }

    function getCameraPosition() {
        return {
            'is3d': isCamera3d(),
            'position': camera.position.toArray(),
            'quaternion': camera.quaternion.toArray(),
        };
    }

    function setCameraPosition(data) {
        setCamera3d(data.is3d);
        camera.quaternion.fromArray(data.quaternion);
        camera.position.fromArray(data.position);
        camera.updateProjectionMatrix();
    }

    function shadowQuatArray(x, y) {
        var angle = -Math.atan2(y - camera.position.z, x - camera.position.x) - Math.PI / 2;
        tempQuat.setFromAxisAngle(upVector, angle);
        tempQuat.multiply(groundQuat);
        return tempQuat.toArray(tempQuatArray);
    }

    function quaternionArrays() {
        var quaternions = {};
        quaternions.groundQuaternionArray =  new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(1,0,0), -Math.PI/2
        ).toArray(new Float32Array(4));
        quaternions.southQuaternionArray =  new THREE.Quaternion().toArray(new Float32Array(4));
        quaternions.northQuaternionArray =  new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(0,1,0), -Math.PI
        ).toArray(new Float32Array(4));
        quaternions.westQuaternionArray =  new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(0,1,0), -Math.PI/2
        ).toArray(new Float32Array(4));
        quaternions.eastQuaternionArray =  new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(0,1,0), Math.PI/2
        ).toArray(new Float32Array(4));
        quaternions.ceilingQuaternionArray = new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(1,0,0), Math.PI/2
        ).toArray(new Float32Array(4));
        return quaternions;
    }

    function checkWindowSize() {
        var gameWidth = innerWidth;
        var gameHeight = innerHeight;
        camera2d.left = -gameWidth / 2;
        camera2d.right = gameWidth / 2;
        camera2d.top = gameHeight / 2;
        camera2d.bottom = -gameHeight / 2;
        camera2d.updateProjectionMatrix();
        camera3d.aspect = gameWidth / gameHeight;
        camera3d.updateProjectionMatrix();
    }

    /**
     *  PUBLIC DECLARATIONS
     */
    function Camera() {
    }

    Camera.setCamera3d = setCamera3d;
    Camera.isCamera3d = isCamera3d;
    Camera.getCamera = getCamera;
    Camera.setCameraPosition = setCameraPosition;
    Camera.getCameraPosition = getCameraPosition;
    Camera.getCameraQuaternionData = getCameraQuaternionData;
    Camera.shadowQuatArray = shadowQuatArray;
    Camera.quaternions = quaternionArrays();

    /**
     *   PROCESSES
     */
    initCameras();
    setCamera3d(true);

    Loop.addLoop(checkWindowSize);

    return Camera;
});
