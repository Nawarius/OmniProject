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
        this.top.position = pos
    }
    setTopRotation(rot){
        this.top.rotation = rot
    }
    setBottom(bottom){
        this.bottom = bottom
    }
    getBottom(){
        return this.bottom
    }
    setBottomPosition(pos){
        this.bottom.position = pos
    }
    setBottomRotation(rot){
        this.bottom.rotation = rot
    }
    setRotationYButton(button){
        this.rotationYButton = button
    }
    getRotationYButton(button){
        return this.rotationYButton 
    }
    setRotationYButtonPosition(pos){
        this.rotationYButton.position = pos
    }
    setRotationYButtonRotation(rot){
        this.rotationYButton.rotation = rot
    }
}

export default Antenna