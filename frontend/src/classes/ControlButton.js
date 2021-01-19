import { ActionManager, ExecuteCodeAction } from "@babylonjs/core"

class ControlButton {
    constructor(button){
        this.button = button
    }
    getControlButton(){
        return this.button
    }
    setParent(parent){
        this.getControlButton().parent = parent
    }
    setPosition(position){
        this.getControlButton().position = position
    }
    setRotation(rotation){
        this.getControlButton().rotation = rotation
    }
    setActions(type, currentRoom, scene){
        switch(type){
            case 'y':{
                this.getControlButton().actionManager = new ActionManager(scene)
                let interval = null
                this.getControlButton().actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnLongPressTrigger, function(){
                    interval = setInterval(()=>{
                        currentRoom.send('changeAntennaCoords', {x:0, y:0.01, z:0})
                    }, 35)
                }))
                this.getControlButton().actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickUpTrigger, function(){
                    clearInterval(interval)
                }))
                this.getControlButton().actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, function(){
                    clearInterval(interval)
                }))
                break
            }
            case 'xup':{
                this.getControlButton().actionManager = new ActionManager(scene)
                let interval = null
                this.getControlButton().actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnLongPressTrigger, function(){
                    interval = setInterval(()=>{
                        currentRoom.send('changeAntennaCoords', {x:-0.01, y:0, z:0})
                    }, 35)
                }))
                this.getControlButton().actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickUpTrigger, function(){
                    clearInterval(interval)
                }))
                this.getControlButton().actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, function(){
                    clearInterval(interval)
                }))
                break
            }
            case 'xdown':{
                this.getControlButton().actionManager = new ActionManager(scene)
                let interval = null
                this.getControlButton().actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnLongPressTrigger, function(){
                    interval = setInterval(()=>{
                        currentRoom.send('changeAntennaCoords', {x:0.01, y:0, z:0})
                    }, 35)
                }))
                this.getControlButton().actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickUpTrigger, function(){
                    clearInterval(interval)
                }))
                this.getControlButton().actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, function(){
                    clearInterval(interval)
                }))
                break
            }
            default:
                break
        }
       
    }
}

export default ControlButton