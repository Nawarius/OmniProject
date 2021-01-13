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

import {MonitorWithCoords, Monitor} from '../classes/Monitor'

const Locator = new Antenna()
let house = null
let counter = 0, counter2 = 0, counter3 = 0
let res = null
let rotationAntennaCoords = 0
let monitorYCoords = null
let monitorXCoords = null
const users = []
const totalMeshes = []

const MainComponent = () => {
  const socketRef = useRef()
  const userVideoRef = useRef()
  const partnerVideoRef = useRef()
  const userStreamRef = useRef()
  const otherUserRef = useRef()
  const peerRef = useRef()

  useEffect(()=>{
   socketRef.current = io.connect('/')
   socketRef.current.emit('join game')
   socketRef.current.on('new antennaRotation', ({x,y,z}) => {
    if(Locator.getTop()){
      Locator.setTopRotation(new Vector3(x,y,z))
    } else {
      rotationAntennaCoords = {x,y,z}
    }
   })
   socketRef.current.on('rotationAccessY', bool=>{counter = bool})
   socketRef.current.on('rotationAccessXUp', bool=>{counter2 = bool})
   socketRef.current.on('rotationAccessXDown', bool=>{counter3 = bool})

   socketRef.current.on('get all users coords', allUsers=>{
      allUsers.forEach(item=>{
        const user = MeshBuilder.CreateBox(`user${item.id}`, {width:1, height:1})
        user.position = new Vector3(item.x, item.y, item.z)
        user.id = item.id
        users.push(user)
      })
   })
   socketRef.current.on('other user coords', item=>{
      const userExist = users.find(user=>user.id === item.id)
      if(!userExist){
        const user = MeshBuilder.CreateBox(`user${item.id}`, {width:1, height:1})
        user.position = new Vector3(item.x, item.y, item.z)
        user.id = item.id
        users.push(user)
      } else {
        userExist.position = new Vector3(item.x, item.y, item.z)
      }
   })
   socketRef.current.on('delete mesh', id => {
    console.log('here')
    const index = users.findIndex(item=>item.id === id)
    if(users[index]){
      users[index].dispose()
      users.splice(index, 1)
    }
  })
   //WebRTC BEGIN
   navigator.mediaDevices.getUserMedia({audio:true}).then(stream=>{
    userStreamRef.current = stream
    socketRef.current.emit('join audio')
    socketRef.current.on('other user webrtc', userID=>{
        callUser(userID, peerRef, socketRef, otherUserRef, partnerVideoRef)
        otherUserRef.current = userID
    })
    socketRef.current.on('user joined to webrtc', userID=>{
      otherUserRef.current = userID
    })
    socketRef.current.on('offer', (incoming) => {
      handleRecieveCall(incoming, peerRef, userStreamRef, socketRef, createPeer, otherUserRef, partnerVideoRef)
    })
    socketRef.current.on('answer', handleAnswer)
    socketRef.current.on('ice-candidate', handleNewICECandidate)
  }).catch(err=>{console.log(err)})

  },[])

  const callUser = (userID, peerRef, socketRef, otherUserRef, partnerVideoRef) => {
    peerRef.current = createPeer(userID, peerRef, socketRef, otherUserRef, partnerVideoRef)
    userStreamRef.current.getTracks().forEach(track => peerRef.current.addTrack(track, userStreamRef.current))
  }

  const handleAnswer = (message) => {
    const desc = new RTCSessionDescription(message.sdp)
    peerRef.current.setRemoteDescription(desc).catch(err => console.log(err))
  }
  const handleNewICECandidate = (incoming) => {
    const candidate = new RTCIceCandidate(incoming)
    peerRef.current.addIceCandidate(candidate).catch(err => console.log(err))
  }
//WebRTC END
  const onSceneReady = async function(scene, engine) {
    engine.displayLoadingUI() 

    let camera = new FreeCamera("camera1", new Vector3(5,3,7), scene)
    let skyCamera = new FreeCamera('skyCamera', new Vector3(5,3,7), scene)

    const canvas = scene.getEngine().getRenderingCanvas()
    camera.speed = 0.5
    camera.attachControl(canvas, true)

    let light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.8;
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
      Locator.setTopRotation(new Vector3(rotationAntennaCoords.x,rotationAntennaCoords.y,rotationAntennaCoords.z))
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
      Locator.setActions('y', socketRef, scene, rotationAntennaCoords)
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
      monitorYCoords = CoordsMonitor.setNewCoord('y', -400, rotationAntennaCoords.y)
      monitorXCoords = CoordsMonitor.setNewCoord('x', -300, rotationAntennaCoords.x)

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
      YControlButton.setActions('y', socketRef, scene, rotationAntennaCoords)
  
    res = await SceneLoader.ImportMeshAsync("Button", "models/", "Button.babylon")
      const XUpControlButton = new ControlButton(res.meshes[0])
      XUpControlButton.setParent(table)
      XUpControlButton.setPosition(new Vector3(0.5,0.5,-1.2))
      XUpControlButton.setRotation(new Vector3(0,1.6,-1.1))
      XUpControlButton.setActions('xup', socketRef, scene, rotationAntennaCoords)
  
    res = await SceneLoader.ImportMeshAsync("Button", "models/", "Button.babylon")
      const XDownControlButton = new ControlButton(res.meshes[0])
      XDownControlButton.setParent(table)
      XDownControlButton.setPosition(new Vector3(1,0.5,-1.2))
      XDownControlButton.setRotation(new Vector3(3,1.6,-2.1))
      XDownControlButton.setActions('xdown', socketRef, scene, rotationAntennaCoords)

      addGravity(scene,camera,[ground, Locator.getBottom(), house])

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
                socketRef.current.emit('my new coords', camera.position)
              break
          }
          default:
            break
      }
  });
    engine.hideLoadingUI();
  }
  const onRender = scene => {
    if(counter){
      Locator.setTopRotation(rotationAntennaCoords) 
      rotationAntennaCoords.y += 0.01
      monitorYCoords.text = `Locator Y Coord:${((Math.PI * rotationAntennaCoords.y)/180).toFixed(3)}`
    }
    if(counter2){
      Locator.setTopRotation(rotationAntennaCoords)
      if(rotationAntennaCoords.x >= -1) rotationAntennaCoords.x -=0.01
      monitorXCoords.text = `Locator X Coord:${((Math.PI * rotationAntennaCoords.x)/180).toFixed(3)}`
    }
    if(counter3){
      Locator.setTopRotation(rotationAntennaCoords)
      if(rotationAntennaCoords.x <= 0.5) rotationAntennaCoords.x +=0.01
      monitorXCoords.text = `Locator X Coord:${((Math.PI * rotationAntennaCoords.x)/180).toFixed(3)}`
    }
  }
  
    return <>
      <div>
        <audio autoPlay ref = {partnerVideoRef} />
        <SceneComponent antialias onSceneReady={onSceneReady} onRender={onRender} id='my-canvas' />
      </div>
    </>
}

export default MainComponent

