const { Animation, Vector3, ActionManager } = require("@babylonjs/core");
function addAnimatedMoveForCamera(camera, scene, x, y, z){
    console.log(Math.abs(camera.position.x - x))
    if(Math.abs(camera.position.x - x) > 10 || Math.abs(camera.position.z - z) > 10){
        return
    }
    const xMove = new Animation('xMove', 'position.x', 10, Animation.ANIMATIONTYPE_FLOAT,Animation.ANIMATIONLOOPMODE_CYCLE)
    const yMove = new Animation('yMove', 'position.y', 10, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE)
    const zMove = new Animation('zMove', 'position.z', 10, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE)
    
    const keyFramesX = []; 
        keyFramesX.push({
            frame: 0,
            value: camera.position.x
        })
        keyFramesX.push({
            frame: 20,
            value: x
        })
    const keyFramesY = []; 
        keyFramesY.push({
            frame: 0,
            value: camera.position.y
        })
        keyFramesY.push({
            frame: 20,
            value: y
        })
    const keyFramesZ = []; 
        keyFramesZ.push({
            frame: 0,
            value: camera.position.z
        })
        keyFramesZ.push({
            frame: 20,
            value: z
        })

    xMove.setKeys(keyFramesX)
    yMove.setKeys(keyFramesY)
    zMove.setKeys(keyFramesZ)

    scene.beginDirectAnimation(camera,[xMove, yMove, zMove], 0, 20, false)
}

export default addAnimatedMoveForCamera
