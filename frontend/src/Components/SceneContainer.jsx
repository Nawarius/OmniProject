import React, { useEffect, useRef } from 'react';
import { FreeCamera, Vector3, HemisphericLight, SceneLoader, PointerEventTypes, MeshBuilder, StandardMaterial, Color3, ArcRotateCamera, Color4, KeyboardEventTypes, RenderTargetTexture } from '@babylonjs/core';
import * as GUI from 'babylonjs-gui'
import SceneComponent from './ScenePresent'; 
import Antenna from '../classes/Antenna'
import ControlButton from '../classes/ControlButton'
import addGravity from '../functions/addGravity'
import io from 'socket.io-client'
import createPeer from '../WebRTC/createPeer'
import handleRecieveCall from '../WebRTC/Answer'
import addAnimatedMoveForCamera from '../functions/movePointerAnimation'
//Colyseus
import * as Colyseus from 'colyseus.js'

import {MonitorWithCoords, Monitor} from '../classes/Monitor'

const Locator = new Antenna()
let house = null
let res = null
let initialRotationAntennaCoords = {}
let monitorYCoords = null
let monitorXCoords = null
const users = []

const MainComponent = () => {
  const clientRef = useRef()
  const roomRef = useRef()

  const onSceneReady = async function(scene, engine) {
    let camera = new FreeCamera("camera1", new Vector3(5,3,7), scene)

    clientRef.current = new Colyseus.Client('ws://localhost:4000')
      roomRef.current = await clientRef.current.joinOrCreate('mainGame')

      roomRef.current.onMessage('changeAntennaCoords', ({x,y,z})=>{
        if(Locator.getTop()){
          Locator.setTopRotation(new Vector3(x,y,z))
        } else {
          initialRotationAntennaCoords.x = x
          initialRotationAntennaCoords.y = y
          initialRotationAntennaCoords.z = z
        }
      })

      roomRef.current.onMessage('getAllUsersCoords', players=>{
        players.forEach(item=>{
          const user = MeshBuilder.CreateBox(`user${item.id}`, {width:1, height:1})
          user.position = new Vector3(item.x, item.y, item.z)
          user.id = item.id
          users.push(user)
        })
      })
      roomRef.current.onMessage('user joined', ({coords, id})=>{
          console.log(coords)
          const user = MeshBuilder.CreateBox(`user${id}`, {width:1, height:1})
          user.position = new Vector3(coords.x, coords.y, coords.z)
          user.id = id
          users.push(user)
      })
      roomRef.current.onMessage('other user coords', ({coords, id})=>{
        const userExist = users.find(user=>user.id === id)
        if(!userExist){
          const user = MeshBuilder.CreateBox(`user${id}`, {width:1, height:1})
          user.position = new Vector3(coords.x, coords.y, coords.z)
          user.id = id
          users.push(user)
        } else {
          userExist.position = new Vector3(coords.x, coords.y, coords.z)
        }
     })

     roomRef.current.onMessage('delete mesh', id => {
      const index = users.findIndex(item=>item.id === id)
      if(users[index]){
        users[index].dispose()
        users.splice(index, 1)
      }
    })

    engine.displayLoadingUI() 
    
    let skyCamera = new FreeCamera('skyCamera', new Vector3(5,3,7), scene)

    const canvas = scene.getEngine().getRenderingCanvas()
    camera.speed = 0.5
    camera.attachControl(canvas, true)

    let light = new HemisphericLight("light", new Vector3(0, 1, 0), scene)
    light.intensity = 0.8
    
    res = await SceneLoader.ImportMeshAsync("", "models/", "SM_Ground.babylon")
      const ground = res.meshes[1]
    res = await SceneLoader.ImportMeshAsync("SM_Antenna_Bottom", "models/", "Antenna_Bottom.babylon")
      const planeMaterial = new StandardMaterial('planeYellow', scene)
      planeMaterial.diffuseColor = new Color4.FromHexString('#d9b790')
      const planeForLocator = MeshBuilder.CreateGround('palneForLocator', {width:10, height:10})
      planeForLocator.material = planeMaterial
      planeForLocator.position = new Vector3(40,-1,10)
      Locator.setBottom(res.meshes[0])
      Locator.setBottomParent(planeForLocator)
    res = await SceneLoader.ImportMeshAsync("SM_Antenna_Top", "models/", "Antenna_Top.babylon")
      Locator.setTop(res.meshes[0])
      Locator.getTop().parent = Locator.getBottom()
      Locator.setTopPosition(new Vector3(0,5,1.1))
      Locator.setTopRotation(new Vector3(initialRotationAntennaCoords.x,initialRotationAntennaCoords.y,initialRotationAntennaCoords.z))
      Locator.setPivotForTop(new Vector3(0,4.5,0))
      let cube = MeshBuilder.CreateSphere('sphere', {})
      cube.parent = Locator.getTop()
      cube.position = new Vector3(0,1.5,5)
      skyCamera.parent = cube
      skyCamera.position = new Vector3(0,1.5,5)
      skyCamera.rotation = new Vector3(0,0,Math.PI)

    res = await SceneLoader.ImportMeshAsync("Button", "models/", "Button.babylon")
      Locator.setAntennaYButton(res.meshes[0])
      Locator.setParentAntennaYButton(Locator.getBottom()) 
      Locator.setAntennaYButtonRotation(new Vector3(1.7,1.5,-0.6)) 
      Locator.setAntennaYButtonPosition(new Vector3(0.15,1,-0.1))
      Locator.setActions('y', roomRef.current, scene)
    res = await SceneLoader.ImportMeshAsync("", "models/", "Constructor.babylon")
      house = res.meshes
      const table = house.find(item=>item.name === 'SO_Wall_Divider')
      const monitor = house.find(item=>item.name === 'SO_Monitor_02')

      const CoordsMonitor = new MonitorWithCoords('LocatorCoordsMonitor', 1.35, 0.85)
      CoordsMonitor.addDefaultMaterial()
      CoordsMonitor.setParent(monitor)
      CoordsMonitor.setPosition(new Vector3(0.76,0.42,-1.2))
      CoordsMonitor.setRotation(-Math.PI/2, -0.26, 0)
      CoordsMonitor.createDefaultGUI()
      monitorYCoords = CoordsMonitor.setNewCoord('y', -400, initialRotationAntennaCoords.y)
      monitorXCoords = CoordsMonitor.setNewCoord('x', -300, initialRotationAntennaCoords.x)

      const SkyMonitor = new Monitor('SkyViewMonitor', 1.871, 1.151)
      SkyMonitor.setParent(monitor)
      SkyMonitor.setPosition(new Vector3(-1,0.568,-1.685))
      SkyMonitor.setRotation(1.82, -0.235 ,0.066)

      let renderTarget = new RenderTargetTexture('skyCameraView', 512, scene, true)
      renderTarget.activeCamera = skyCamera
      scene.customRenderTargets.push(renderTarget)
      house.forEach(mesh=>{
        renderTarget.renderList.push(mesh)
      })
      renderTarget.renderList.push(ground)
      let skyMonitorViewMaterial = new StandardMaterial('RTT mat', scene)
      skyMonitorViewMaterial.emissiveTexture = renderTarget
      SkyMonitor.getPlane().material = skyMonitorViewMaterial

    res = await SceneLoader.ImportMeshAsync("Button", "models/", "Button.babylon")
      const YControlButton = new ControlButton(res.meshes[0])
      YControlButton.setParent(table)
      YControlButton.setPosition(new Vector3(0,0.5,-1.2))
      YControlButton.setRotation(new Vector3(-1.1,0,0))
      YControlButton.setActions('y', roomRef.current, scene)
  
    res = await SceneLoader.ImportMeshAsync("Button", "models/", "Button.babylon")
      const XUpControlButton = new ControlButton(res.meshes[0])
      XUpControlButton.setParent(table)
      XUpControlButton.setPosition(new Vector3(0.5,0.5,-1.2))
      XUpControlButton.setRotation(new Vector3(0,1.6,-1.1))
      XUpControlButton.setActions('xup', roomRef.current, scene)
  
    res = await SceneLoader.ImportMeshAsync("Button", "models/", "Button.babylon")
      const XDownControlButton = new ControlButton(res.meshes[0])
      XDownControlButton.setParent(table)
      XDownControlButton.setPosition(new Vector3(1,0.5,-1.2))
      XDownControlButton.setRotation(new Vector3(3,1.6,-2.1))
      XDownControlButton.setActions('xdown', roomRef.current, scene)

      //addGravity(scene,camera,[ground, Locator.getBottom(), house])
      
      const setNewCameraCoords = ()=>{
        const pickInfo = scene.pick(scene.pointerX, scene.pointerY)
        if(pickInfo.pickedMesh.name === 'SkyViewMonitor'){
          scene.activeCamera = skyCamera
        }
        else if(pickInfo.pickedMesh.name !== 'Button' && pickInfo.pickedMesh.name !== 'locatorPositionPlane'){
          addAnimatedMoveForCamera(camera, scene, pickInfo.pickedPoint._x, pickInfo.pickedPoint._y+2, pickInfo.pickedPoint._z)
        } 

      }
      const movePointerAccess = ()=>{
        
      }
      scene.onPointerObservable.add((pointerInfo) => {      		
        switch (pointerInfo.type) {
			    case PointerEventTypes.POINTERPICK:{   
              setNewCameraCoords()
              break
          }
          case PointerEventTypes.POINTERMOVE:{
              movePointerAccess()
              break
          }
          case PointerEventTypes.POINTERDOUBLETAP:{
            scene.activeCamera = camera
          }
          default:
            break
        }
    });
    scene.onKeyboardObservable.add((kbInfo) => {
      switch (kbInfo.type) {
          case KeyboardEventTypes.KEYDOWN:{
              if(kbInfo.event.key === 'Escape') scene.activeCamera = camera
                roomRef.current.send('my new coords', {position: camera.position, id: roomRef.current.sessionId})
              break
          }
          default:
            break
      }
  });
    engine.hideLoadingUI();
  }
  const onRender = scene => {
    if(monitorXCoords && monitorYCoords){
      monitorYCoords.text = `Locator Y Coord:${((Math.PI * Locator.getTop().rotation.y)/180).toFixed(3)}`
      monitorXCoords.text = `Locator X Coord:${((Math.PI * Locator.getTop().rotation.x)/180).toFixed(3)}`
    }
  }
  
    return <>
      <div>
        {/* <audio autoPlay ref = {partnerVideoRef} /> */}
        <SceneComponent antialias onSceneReady={onSceneReady} onRender={onRender} id='my-canvas' />
      </div>
    </>
}

export default MainComponent

