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
    setActions(type, socketRef, scene, coords){
        switch(type){
            case 'y':{
                this.getControlButton().actionManager = new ActionManager(scene)
                this.getControlButton().actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnLongPressTrigger, function(){
                    socketRef.current.emit('rotateY', true)
                }))
                this.getControlButton().actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickUpTrigger, function(){
                    socketRef.current.emit('rotateY', false)
                }))
                this.getControlButton().actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, function(){
                    socketRef.current.emit('rotateY', false)
                    socketRef.current.emit('new coords', coords)
                }))
                break
            }
            case 'xup':{
                this.getControlButton().actionManager = new ActionManager(scene)
                this.getControlButton().actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnLongPressTrigger, function(){
                    socketRef.current.emit('rotateXUp', true)
                }))
                this.getControlButton().actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickUpTrigger, function(){
                    socketRef.current.emit('rotateXUp', false)
                }))
                this.getControlButton().actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, function(){
                    socketRef.current.emit('rotateXUp', false)
                    socketRef.current.emit('new coords', coords)
                }))
                break
            }
            case 'xdown':{
                this.getControlButton().actionManager = new ActionManager(scene)
                this.getControlButton().actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnLongPressTrigger, function(){
                    socketRef.current.emit('rotateXDown', true)
                }))
                this.getControlButton().actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickUpTrigger, function(){
                    socketRef.current.emit('rotateXDown', false)
                }))
                this.getControlButton().actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, function(){
                    socketRef.current.emit('rotateXDown', false)
                    socketRef.current.emit('new coords', coords)
                }))
                break
            }
            default:
                break
        }
       
    }
}

export default ControlButton