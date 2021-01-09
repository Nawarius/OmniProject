const { Vector3 } = require("@babylonjs/core")

function addGrabity(scene, camera, arr){
    scene.gravity = new Vector3(0, -0.9, 0);
    scene.collisionsEnabled = true;

    //camera.ellipsoid = new Vector3(1.5, 1.5, 1.5);
    camera.checkCollisions = true;
    camera.applyGravity = true;

    arr.forEach(item=>{
        item.checkCollisions = true
        if(Array.isArray(item)){
            item.forEach(item=>{
                item.checkCollisions = true
            })
        }
    })
}

export default addGrabity