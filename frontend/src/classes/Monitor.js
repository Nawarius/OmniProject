import { Color3, MeshBuilder, StandardMaterial, Vector3 } from "@babylonjs/core"
import * as GUI from 'babylonjs-gui'

class Monitor{ 
    constructor(name, width, height){
        this.name = name
        this.advancedTexture = null
        this.plane = MeshBuilder.CreatePlane(this.name,{width,height}) 
    }
    getPlane(){
        return this.plane
    }
    setParent(parent){
        this.getPlane().parent = parent
    }
    addDefaultMaterial(scene){
        const material = new StandardMaterial('CoordsMonitor', scene)
        material.diffuseColor = new Color3.Black()
        this.getPlane().material = material
    }
    setPosition(pos){
        this.getPlane().position = pos
    }
    setRotation(rotX, rotY, rotZ){
        this.getPlane().addRotation(rotX, 0, 0).addRotation(0,rotY,rotZ)
    }
    createDefaultGUI(){
        this.advancedTexture = GUI.AdvancedDynamicTexture.CreateForMesh(this.getPlane())
    }
    addDefaultText(){
        const text = new GUI.Button.CreateSimpleButton('text', `Click for change camera`)
        text.fontSize = 50
        text.color = "white";
        this.advancedTexture.addControl(text)
    }
    

}
class MonitorWithCoords extends Monitor{
    constructor(name, width, height){
        super(name, width, height)
    }
    setNewCoord(type, top, antennaCoord){
        const newCoord = new GUI.TextBlock('monitorYCoords', `Locator ${type.toUpperCase()} Coord: ${((Math.PI * antennaCoord)/180).toFixed(3)}`)
        newCoord.top = `${top}px`
        newCoord.fontSize = 50
        newCoord.color = "white";
        this.advancedTexture.addControl(newCoord)
        return newCoord
    }
}

export {MonitorWithCoords, Monitor}