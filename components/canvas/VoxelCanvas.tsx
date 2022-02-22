import { useEffect } from "react";
import * as THREE from "three";

function VoxelCanvas(): JSX.Element {
  useEffect(() => {
    import * as THREE from 'three';

    let camera, scene, renderer;
    let plane;
    let pointer, raycaster, isShiftDown = false;
    let isMouseDown = false, onMouseDownPosition,
    radius = 1600, theta = 45, onMouseDownTheta = 45, phi = 60, onMouseDownPhi = 60;

    let rollOverMesh, rollOverMaterial;
    let cubeGeo, cubeMaterial;

    const objects = [];

    init();
    render();

    function init() {

      camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
      camera.position.set( 500, 800, 1300 );
      camera.lookAt( 0, 0, 0 );

      scene = new THREE.Scene();
      scene.background = new THREE.Color( 0xf0f0f0 );

      // roll-over helpers

      const rollOverGeo = new THREE.BoxGeometry( 50, 50, 50 );
      rollOverMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, opacity: 0.5, transparent: true } );
      rollOverMesh = new THREE.Mesh( rollOverGeo, rollOverMaterial );
      scene.add( rollOverMesh );

      // cubes

      cubeGeo = new THREE.BoxGeometry( 50, 50, 50 );
      cubeMaterial = new THREE.MeshLambertMaterial( { color: 0xfeb74c} );

      // grid

      const gridHelper = new THREE.GridHelper( 1000, 20 );
      scene.add( gridHelper );

      //

      raycaster = new THREE.Raycaster();
      pointer = new THREE.Vector2();

      const geometry = new THREE.PlaneGeometry( 1000, 1000 );
      geometry.rotateX( - Math.PI / 2 );

      plane = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { visible: false } ) );
      scene.add( plane );

      objects.push( plane );

      onMouseDownPosition = new THREE.Vector2();

      // lights

      const ambientLight = new THREE.AmbientLight( 0x606060 );
      scene.add( ambientLight );

      const directionalLight = new THREE.DirectionalLight( 0xffffff );
      directionalLight.position.set( 1, 0.75, 0.5 ).normalize();
      scene.add( directionalLight );

      renderer = new THREE.WebGLRenderer( { antialias: true } );
      renderer.setPixelRatio( window.devicePixelRatio );
      renderer.setSize( window.innerWidth, window.innerHeight );
      document.body.appendChild( renderer.domElement );

      // document.addEventListener( 'pointermove', onPointerMove );
      // document.addEventListener( 'pointerdown', onPointerDown );
      document.addEventListener( 'mousemove', onDocumentMouseMove, false );
      document.addEventListener( 'mousedown', onDocumentMouseDown, false );
      document.addEventListener( 'mouseup', onDocumentMouseUp, false );

      document.addEventListener( 'keydown', onDocumentKeyDown );
      document.addEventListener( 'keyup', onDocumentKeyUp );

      //

      window.addEventListener( 'resize', onWindowResize );
      document.getElementById("saveBtn").addEventListener ("click", save, false);

    }

    function onWindowResize() {

      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize( window.innerWidth, window.innerHeight );

      render();

    }

    function onDocumentMouseDown( event ) {

      event.preventDefault();

      isMouseDown = true;

      onMouseDownTheta = theta;
      onMouseDownPhi = phi;
      onMouseDownPosition.x = event.clientX;
      onMouseDownPosition.y = event.clientY;

    }

    function onDocumentMouseMove( event ) {

      event.preventDefault();

      if ( isMouseDown ) {

        theta = - ( ( event.clientX - onMouseDownPosition.x ) * 0.5 ) + onMouseDownTheta;
        phi = ( ( event.clientY - onMouseDownPosition.y ) * 0.5 ) + onMouseDownPhi;

        phi = Math.min( 180, Math.max( 0, phi ) );

        camera.position.x = radius * Math.sin( theta * Math.PI / 360 ) * Math.cos( phi * Math.PI / 360 );
        camera.position.y = radius * Math.sin( phi * Math.PI / 360 );
        camera.position.z = radius * Math.cos( theta * Math.PI / 360 ) * Math.cos( phi * Math.PI / 360 );
        camera.updateMatrix();
        camera.lookAt( 0, 0, 0 );

      }

      pointer.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );

      raycaster.setFromCamera( pointer, camera );

      const intersects = raycaster.intersectObjects( objects, false );

      if ( intersects.length > 0 ) {

        const intersect = intersects[ 0 ];

        rollOverMesh.position.copy( intersect.point ).add( intersect.face.normal );
        rollOverMesh.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );

        

      }
      render();

    }

    function onDocumentMouseUp( event ) {

      event.preventDefault();

      isMouseDown = false;

      onMouseDownPosition.x = event.clientX - onMouseDownPosition.x;
      onMouseDownPosition.y = event.clientY - onMouseDownPosition.y;

      if ( onMouseDownPosition.length() > 5 ) {

        return;

      }

      pointer.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );

      raycaster.setFromCamera( pointer, camera );

      const intersects = raycaster.intersectObjects( objects, false );

      if ( intersects.length > 0 ) {

        const intersect = intersects[ 0 ];

        // delete cube

        if ( isShiftDown ) {

          if ( intersect.object !== plane ) {

            scene.remove( intersect.object );

            objects.splice( objects.indexOf( intersect.object ), 1 );

          }

          // create cube

        } else {

          const voxel = new THREE.Mesh( cubeGeo, cubeMaterial );
          voxel.position.copy( intersect.point ).add( intersect.face.normal );
          voxel.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );
          scene.add( voxel );

          objects.push( voxel );

        }

        render();

      }

    }

    function onDocumentKeyDown( event ) {

      switch ( event.keyCode ) {

        case 16: isShiftDown = true; break;

      }

    }

    function onDocumentKeyUp( event ) {

      switch ( event.keyCode ) {

        case 16: isShiftDown = false; break;

      }

    }

    function render() {

      renderer.render( scene, camera );

    }

    function save() {
      let objString = "";
      const offset = 25;
      let numVertices = 0;

      for ( var object of objects ) {
        if ( object instanceof THREE.Mesh && object !== plane && object !== rollOverMesh ) {
          let v1 = {"x":object.position.x-offset,"y":object.position.y-offset,"z":object.position.z+offset};
          let v2 = {"x":object.position.x+offset,"y":object.position.y-offset,"z":object.position.z+offset};
          let v3 = {"x":object.position.x+offset,"y":object.position.y+offset,"z":object.position.z+offset};
          let v4 = {"x":object.position.x-offset,"y":object.position.y+offset,"z":object.position.z+offset};
          let v5 = {"x":object.position.x+offset,"y":object.position.y-offset,"z":object.position.z-offset};
          let v6 = {"x":object.position.x+offset,"y":object.position.y+offset,"z":object.position.z-offset};
          let v7 = {"x":object.position.x-offset,"y":object.position.y+offset,"z":object.position.z-offset};
          let v8 = {"x":object.position.x-offset,"y":object.position.y-offset,"z":object.position.z-offset};
          let vertices = [v1,v2,v3,v4,v5,v6,v7,v8];
          for( const vertex of vertices){
            objString += `v ${vertex.x} ${vertex.y} ${vertex.z}\n`;
            
          }
          objString += `f ${numVertices+1} ${numVertices+2} ${numVertices+3} ${numVertices+4}\n`;
          objString += `f ${numVertices+2} ${numVertices+5} ${numVertices+6} ${numVertices+3}\n`;
          objString += `f ${numVertices+5} ${numVertices+6} ${numVertices+7} ${numVertices+8}\n`;
          objString += `f ${numVertices+8} ${numVertices+7} ${numVertices+4} ${numVertices+1}\n`;
          objString += `f ${numVertices+3} ${numVertices+6} ${numVertices+7} ${numVertices+4}\n`;
          objString += `f ${numVertices+2} ${numVertices+1} ${numVertices+8} ${numVertices+5}\n`;
          numVertices +=8;
        }
      }
      console.log(objString);

    }
  }, []);
  return <canvas />;
}

export default VoxelCanvas;
