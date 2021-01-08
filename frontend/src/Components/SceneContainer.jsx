import React from 'react';
import { FreeCamera, Vector3, HemisphericLight, SceneLoader, MeshBuilder , StandardMaterial, Color3, Matrix, ActionManager, ExecuteCodeAction } from '@babylonjs/core';
import SceneComponent from './ScenePresent'; 
import Antenna from '../classes/Antenna'


const Locator = new Antenna()
let house = null
let counter = 0, counter2 = 0, counter3 = 0
let res = null
const onSceneReady = async function(scene) {
  let camera = new FreeCamera("camera1", new Vector3(5,3,7), scene);
  //scene.createDefaultVRExperience({useMultiview: true})
  //camera.setTarget(Vector3.Zero());
  const canvas = scene.getEngine().getRenderingCanvas();
  camera.speed = 0.5
  camera.attachControl(canvas, true);

  

  let light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
  light.intensity = 0.8;

  let spherePivot = MeshBuilder.CreateSphere("sphereP", {diameter:.5}, scene);
	spherePivot.material = new StandardMaterial("pivot", scene);
  spherePivot.material.diffuseColor = new Color3(1, 0, 0);

  
  res = await SceneLoader.ImportMeshAsync("", "models/", "SM_Ground.babylon")
    const ground = res.meshes[1]
  res = await SceneLoader.ImportMeshAsync("SM_Antenna_Bottom", "models/", "Antenna_Bottom.babylon")
    Locator.setBottom(res.meshes[0])
    Locator.setBottomPosition(new Vector3(-40,-0.9,10)) 
  
  res = await SceneLoader.ImportMeshAsync("SM_Antenna_Top", "models/", "Antenna_Top.babylon")
    Locator.setTop(res.meshes[0])
    Locator.getTop().parent = Locator.getBottom()
    Locator.setTopPosition(new Vector3(0,5,1.1))
    Locator.setTopRotation(new Vector3(0,3.5,0))

    spherePivot.parent = Locator.getBottom()
    spherePivot.position = new Vector3(0,4.5,0)
    let translation = Locator.getTop().position.subtract(spherePivot.position)
    Locator.getTop().setPivotMatrix(Matrix.Translation(translation.x, translation.y, translation.z))

  res = await SceneLoader.ImportMeshAsync("Button", "models/", "Button.babylon")
    Locator.setRotationYButton(res.meshes[0])
    Locator.getRotationYButton().parent = Locator.getBottom()

    Locator.setRotationYButtonRotation(new Vector3(1.7,1.5,-0.6)) 
    Locator.setRotationYButtonPosition(new Vector3(0.15,1,-0.1))

    Locator.getRotationYButton().actionManager = new ActionManager(scene)
    
    Locator.getRotationYButton().actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnLongPressTrigger, function(){
      counter = 1
    }))
    Locator.getRotationYButton().actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickUpTrigger, function(){
      counter = 0
    }))
    Locator.getRotationYButton().actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, function(){
      counter = 0
    }))
    res = await SceneLoader.ImportMeshAsync("", "models/", "Constructor.babylon")
      house = res.meshes
      const table = house.find(item=>item.name === 'SO_Wall_Divider')
      console.log(table)

    res = await SceneLoader.ImportMeshAsync("Button", "models/", "Button.babylon")
      const innerButton = res.meshes[0]
      innerButton.parent = table
      innerButton.scaling.scaleInPlace(1)
      innerButton.position = new Vector3(0,0.5,-1.2)
      innerButton.rotation = new Vector3(-1.1,0,0)
      innerButton.actionManager = new ActionManager(scene)
      innerButton.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnLongPressTrigger, function(){
        counter = 1
      }))
      innerButton.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickUpTrigger, function(){
        counter = 0
      }))
      innerButton.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, function(){
        counter = 0
      }))

    res = await SceneLoader.ImportMeshAsync("Button", "models/", "Button.babylon")
      const innerButton2 = res.meshes[0]
      innerButton2.parent = table
      innerButton2.scaling.scaleInPlace(1)
      innerButton2.position = new Vector3(0.5,0.5,-1.2)
      innerButton2.rotation = new Vector3(0,1.6,-1.1)

      innerButton2.actionManager = new ActionManager(scene)
      innerButton2.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnLongPressTrigger, function(){
        counter2 = 1
      }))
      innerButton2.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickUpTrigger, function(){
        counter2 = 0
      }))
      innerButton2.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, function(){
        counter2 = 0
      }))

    res = await SceneLoader.ImportMeshAsync("Button", "models/", "Button.babylon")
      const innerButton3 = res.meshes[0]
      innerButton3.parent = table
      innerButton3.scaling.scaleInPlace(1)
      innerButton3.position = new Vector3(1,0.5,-1.2)
      innerButton3.rotation = new Vector3(3,1.6,-2.1)

      innerButton3.actionManager = new ActionManager(scene)
      innerButton3.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnLongPressTrigger, function(){
        counter3 = 1
      }))
      innerButton2.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickUpTrigger, function(){
        counter3 = 0
      }))
      innerButton3.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, function(){
        counter3 = 0
      }))


    scene.gravity = new Vector3(0, -0.9, 0);
  
    scene.collisionsEnabled = true;

    //camera.ellipsoid = new Vector3(1.5, 1.5, 1.5);
    
    camera.checkCollisions = true;
    camera.applyGravity = true;

    ground.checkCollisions = true;
    Locator.getBottom().checkCollisions = true;
    house.forEach(item=>{
      item.checkCollisions = true
    })
    

  
  
    
  
}
const onRender = scene => {
  if(counter){
    Locator.getTop().rotation.y += 0.01
  }
  if(counter2){
    Locator.getTop().rotation.x -=0.01
  }
  if(counter3){
    Locator.getTop().rotation.x +=0.01
  }
    // switch(counter){
    //   case 0:{
    //     Antenna.top.rotation.x -=0.01
    //     Antenna.top.rotation.x <= -1? counter = 1 : counter = 0
    //     break
    //   }
    //   case 1:{
    //     Antenna.top.rotation.x +=0.01
    //     Antenna.top.rotation.x >= 0.2? counter = 0 : counter = 1
    //     break
    //   }
    //   default:
    //     break
    // }
  
  
}
export default () => (
    <div>
      <SceneComponent antialias onSceneReady={onSceneReady} onRender={onRender} id='my-canvas' />
    </div>
)