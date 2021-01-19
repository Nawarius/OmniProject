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
    setBottomParent(parent){
        this.getBottom().parent = parent
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
    setActions(type, currentRoom, scene){
        this.getAntennaYButton().actionManager = new ActionManager(scene)
        let interval = null

        this.getAntennaYButton().actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnLongPressTrigger, function(){
            interval = setInterval(()=>{
                currentRoom.send('changeAntennaCoords', {x:0, y:0.01, z:0})
            }, 35)
        }))
        this.getAntennaYButton().actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickUpTrigger, function(){
            clearInterval(interval)
        }))
        this.getAntennaYButton().actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, function(){
            clearInterval(interval)
        }))
    }
}

export default Antenna