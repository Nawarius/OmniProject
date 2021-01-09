import { ActionManager, ExecuteCodeAction, Matrix } from "@babylonjs/core"

class Antenna {
    constructor(){
        this.top = null
        this.bottom = null
        this.rotationYButton = null
    }
    setTop(top){
        this.top = top
    }
    getTop(){
        return this.top
    }
    setTopPosition(pos){
        this.getTop().position = pos
    }
    setTopRotation(rot){
        this.getTop().rotation = rot
    }
    getTopRotation(){
        return this.getTop().rotation
    }
    setPivotForTop(vector3){
      let translation = this.getTop().position.subtract(vector3)
      this.getTop().setPivotMatrix(Matrix.Translation(translation.x, translation.y, translation.z))
    }
    setBottom(bottom){
        this.bottom = bottom
    }
    getBottom(){
        return this.bottom
    }
    setBottomPosition(pos){
        this.getBottom().position = pos
    }
    setBottomRotation(rot){
        this.getBottom().rotation = rot
    }
    setAntennaYButton(button){
        this.rotationYButton = button
    }
    getAntennaYButton(){
        return this.rotationYButton 
    }
    setAntennaYButtonPosition(pos){
        this.getAntennaYButton().position = pos
    }
    setAntennaYButtonRotation(rot){
        this.getAntennaYButton().rotation = rot
    }
    setParentAntennaYButton(parent){
        this.getAntennaYButton().parent = parent
    }
    setActions(type, socketRef, scene, coords){
        this.getAntennaYButton().actionManager = new ActionManager(scene)
      
        this.getAntennaYButton().actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnLongPressTrigger, function(){
            socketRef.current.emit('rotateY', true)
        }))
        this.getAntennaYButton().actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickUpTrigger, function(){
            socketRef.current.emit('rotateY', false)
        }))
        this.getAntennaYButton().actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, function(){
            socketRef.current.emit('rotateY', false)
            socketRef.current.emit('new coords', coords)
        }))
    }
}

export default Antenna