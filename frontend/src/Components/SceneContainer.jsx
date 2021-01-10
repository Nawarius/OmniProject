import React, { useEffect, useRef } from 'react';
import { FreeCamera, Vector3, HemisphericLight, SceneLoader } from '@babylonjs/core';
import SceneComponent from './ScenePresent'; 
import Antenna from '../classes/Antenna'
import ControlButton from '../classes/ControlButton'
import addGravity from '../functions/addGravity'
import io from 'socket.io-client'
import createPeer from '../WebRTC/createPeer'
import handleRecieveCall from '../WebRTC/Answer'

const Locator = new Antenna()
let house = null
let counter = 0, counter2 = 0, counter3 = 0
let res = null
let rotationAntennaCoords = 0

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

   //WebRTC
   navigator.mediaDevices.getUserMedia({audio:true}).then(stream=>{
    //userVideoRef.current.srcObject = stream
    userStreamRef.current = stream

    socketRef.current.emit('join audio')
    //Здесь вижу тех юзеров, которые уже есть
    socketRef.current.on('other user', userID=>{
        callUser(userID, peerRef, socketRef, otherUserRef, partnerVideoRef)
        otherUserRef.current = userID
    })
    socketRef.current.on('user joined', userID=>{
      otherUserRef.current = userID
    })
    socketRef.current.on('offer', (incoming) => {
      console.log(otherUserRef.current)
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

  const onSceneReady = async function(scene, engine) {
    engine.displayLoadingUI()
    let camera = new FreeCamera("camera1", new Vector3(5,3,7), scene);
    //scene.createDefaultVRExperience({useMultiview: true})
    //camera.setTarget(Vector3.Zero());
    const canvas = scene.getEngine().getRenderingCanvas();
    camera.speed = 0.5
    camera.attachControl(canvas, true);
    
    let light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.8;
    res = await SceneLoader.ImportMeshAsync("", "models/", "SM_Ground.babylon")
      const ground = res.meshes[1]

    res = await SceneLoader.ImportMeshAsync("SM_Antenna_Bottom", "models/", "Antenna_Bottom.babylon")
      Locator.setBottom(res.meshes[0])
      Locator.setBottomPosition(new Vector3(-40,-0.9,10)) 

    res = await SceneLoader.ImportMeshAsync("SM_Antenna_Top", "models/", "Antenna_Top.babylon")
      Locator.setTop(res.meshes[0])
      Locator.getTop().parent = Locator.getBottom()
      Locator.setTopPosition(new Vector3(0,5,1.1))
      Locator.setTopRotation(new Vector3(rotationAntennaCoords.x,rotationAntennaCoords.y,rotationAntennaCoords.z))
      Locator.setPivotForTop(new Vector3(0,4.5,0))

    res = await SceneLoader.ImportMeshAsync("Button", "models/", "Button.babylon")
      Locator.setAntennaYButton(res.meshes[0])
      Locator.setParentAntennaYButton(Locator.getBottom()) 
      Locator.setAntennaYButtonRotation(new Vector3(1.7,1.5,-0.6)) 
      Locator.setAntennaYButtonPosition(new Vector3(0.15,1,-0.1))
      Locator.setActions('y', socketRef, scene, rotationAntennaCoords)

    res = await SceneLoader.ImportMeshAsync("", "models/", "Constructor.babylon")
      house = res.meshes
      const table = house.find(item=>item.name === 'SO_Wall_Divider')
  
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
      addGravity(scene,camera,[ground, Locator.getBottom(), house ])
      engine.hideLoadingUI();
  }
  const onRender = scene => {
    if(counter){
      Locator.setTopRotation(rotationAntennaCoords) 
      rotationAntennaCoords.y += 0.01
    }
    if(counter2){
      Locator.setTopRotation(rotationAntennaCoords)
      rotationAntennaCoords.x -=0.01
    }
    if(counter3){
      Locator.setTopRotation(rotationAntennaCoords)
      rotationAntennaCoords.x +=0.01
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

