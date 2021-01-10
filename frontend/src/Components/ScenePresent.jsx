import { Engine, Scene } from '@babylonjs/core'
import React, { useEffect, useRef } from 'react'
const ScenePresent = (props) => {
    const reactCanvas = useRef(null);
    
    useEffect(() => {
        if (reactCanvas.current) {
            const { antialias, engineOptions, adaptToDeviceRatio, sceneOptions, onRender, onSceneReady } = props

            const engine = new Engine(reactCanvas.current, antialias, engineOptions, adaptToDeviceRatio);
            const scene = new Scene(engine, sceneOptions);
            //engine.displayLoadingUI()
            if (scene.isReady()) {
                onSceneReady(scene, engine)
            } else {
                scene.onReadyObservable.addOnce(scene => onSceneReady(scene));
            }
            engine.runRenderLoop(() => {
                if (typeof onRender === 'function') {
                    onRender(scene);
                }
                scene.render();
            })
            
            const resize = () => {
                scene.getEngine().resize();
            }
            if (window) {
                window.addEventListener('resize', resize);
            }
            return () => {
                scene.getEngine().dispose();
                if (window) {
                    window.removeEventListener('resize', resize);
                }
            }
            
        }
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reactCanvas])
    return (
        <canvas ref={reactCanvas} style = {{position:'absolute',width:'100%', height:'100%'}}/>
    );
}

export default ScenePresent