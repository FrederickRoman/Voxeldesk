import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  AmbientLight,
  DirectionalLight,
  GridHelper,
  Mesh,
  PerspectiveCamera,
  Scene,
  Vector2,
  WebGLRenderer,
} from "three";

class VoxelWorld {
  public camera!: PerspectiveCamera;
  public scene!: Scene;
  private renderer!: WebGLRenderer;
  public raycaster = new THREE.Raycaster();
  public pointer = new THREE.Vector2();
  public rollOverMesh!: Mesh;
  public objects: any = [];
  public isMouseDown = false;
  onMouseDownPosition = new THREE.Vector2();
  radius = 1600;
  theta = 45;
  onMouseDownTheta = 45;
  phi = 60;
  onMouseDownPhi = 60;
  isShiftDown = false;
  plane!: Mesh;
  cubeGeo = new THREE.BoxGeometry(50, 50, 50);
  cubeMaterial = new THREE.MeshLambertMaterial({ color: 0xfeb74c });
  constructor(canvas: HTMLCanvasElement) {
    this.camera = this.createCamera();
    this.scene = this.createScene();
    this.renderer = this.createRenderer(canvas);
  }
  public render(): void {
    this.renderer.render(this.scene, this.camera);
  }
  public resize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.render();
  }
  public orbit(theta: number, phi: number) {
    const RADIUS = 1600;
    this.camera.position.x =
      RADIUS *
      Math.sin((theta * Math.PI) / 360) *
      Math.cos((phi * Math.PI) / 360);
    this.camera.position.y = RADIUS * Math.sin((phi * Math.PI) / 360);
    this.camera.position.z =
      RADIUS *
      Math.cos((theta * Math.PI) / 360) *
      Math.cos((phi * Math.PI) / 360);
    this.camera.updateMatrix();
    this.camera.lookAt(0, 0, 0);
  }
  private createCamera(): PerspectiveCamera {
    const fov = 45;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 1;
    const far = 10000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(500, 800, 1300);
    camera.lookAt(0, 0, 0);
    return camera;
  }
  private createScene(): Scene {
    const rollOverMesh = this.createRollOver();
    const gridHelper = this.createGridHelper();
    const plane = this.createPlane();
    this.plane = plane;
    const ambientLight = this.createAmbientLight();
    const directionalLight = this.createDirectionalLight();
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    scene.add(rollOverMesh);
    scene.add(gridHelper);
    scene.add(plane);
    this.objects.push(plane);
    scene.add(ambientLight);
    scene.add(directionalLight);
    console.log(this.camera);
    return scene;
  }
  private createRenderer(canvas: HTMLCanvasElement) {
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    return renderer;
  }
  private createRollOver(): Mesh {
    const rollOverGeo = new THREE.BoxGeometry(50, 50, 50);
    const rollOverMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      opacity: 0.5,
      transparent: true,
    });
    const rollOverMesh = new THREE.Mesh(rollOverGeo, rollOverMaterial);
    this.rollOverMesh = rollOverMesh;
    return rollOverMesh;
  }
  private createGridHelper(): GridHelper {
    const gridHelper = new THREE.GridHelper(1000, 20);
    return gridHelper;
  }
  private createPlane(): Mesh {
    const geometry = new THREE.PlaneGeometry(1000, 1000);
    geometry.rotateX(-Math.PI / 2);
    const material = new THREE.MeshBasicMaterial({ visible: false });
    const plane = new THREE.Mesh(geometry, material);
    return plane;
  }
  private createAmbientLight(): AmbientLight {
    const ambientLight = new THREE.AmbientLight(0x606060);
    return ambientLight;
  }
  private createDirectionalLight(): DirectionalLight {
    const directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(1, 0.75, 0.5).normalize();
    return directionalLight;
  }
  onDocumentMouseDown(event: React.MouseEvent): void {
    event.preventDefault();
    this.isMouseDown = true;
    this.onMouseDownTheta = this.theta;
    this.onMouseDownPhi = this.phi;
    this.onMouseDownPosition.x = event.clientX;
    this.onMouseDownPosition.y = event.clientY;
  }
  onDocumentMouseMove(event: React.MouseEvent): void {
    event.preventDefault();

    if (this.isMouseDown) {
      this.theta =
        -((event.clientX - this.onMouseDownPosition.x) * 0.5) +
        this.onMouseDownTheta;
      this.phi =
        (event.clientY - this.onMouseDownPosition.y) * 0.5 +
        this.onMouseDownPhi;

      this.phi = Math.min(180, Math.max(0, this.phi));

      this.camera.position.x =
        this.radius *
        Math.sin((this.theta * Math.PI) / 360) *
        Math.cos((this.phi * Math.PI) / 360);
      this.camera.position.y =
        this.radius * Math.sin((this.phi * Math.PI) / 360);
      this.camera.position.z =
        this.radius *
        Math.cos((this.theta * Math.PI) / 360) *
        Math.cos((this.phi * Math.PI) / 360);
      this.camera.updateMatrix();
      this.camera.lookAt(0, 0, 0);
    }

    this.pointer.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );

    this.raycaster.setFromCamera(this.pointer, this.camera);

    const intersects = this.raycaster.intersectObjects(this.objects, false);

    if (intersects.length > 0) {
      const intersect = intersects[0];

      this.rollOverMesh.position
        .copy(intersect.point)
        //@ts-ignore
        .add(intersect.face.normal);
      this.rollOverMesh.position
        .divideScalar(50)
        .floor()
        .multiplyScalar(50)
        .addScalar(25);
    }
    this.render();
  }
  onDocumentMouseUp(event: React.MouseEvent): void {
    event.preventDefault();

    this.isMouseDown = false;

    this.onMouseDownPosition.x = event.clientX - this.onMouseDownPosition.x;
    this.onMouseDownPosition.y = event.clientY - this.onMouseDownPosition.y;

    if (this.onMouseDownPosition.length() > 5) {
      return;
    }

    this.pointer.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );

    this.raycaster.setFromCamera(this.pointer, this.camera);

    const intersects = this.raycaster.intersectObjects(this.objects, false);

    if (intersects.length > 0) {
      const intersect = intersects[0];

      // delete cube

      if (this.isShiftDown) {
        if (intersect.object !== this.plane) {
          this.scene.remove(intersect.object);

          this.objects.splice(this.objects.indexOf(intersect.object), 1);
        }

        // create cube
      } else {
        const voxel = new THREE.Mesh(this.cubeGeo, this.cubeMaterial);
        voxel.position
          .copy(intersect.point)
          //@ts-ignore
          .add(intersect.face.normal);
        voxel.position
          .divideScalar(50)
          .floor()
          .multiplyScalar(50)
          .addScalar(25);
        this.scene.add(voxel);

        this.objects.push(voxel);
      }

      this.render();
    }
  }
}

function VoxelCanvas(): JSX.Element {
  const DEFAULT_THETA = 45;
  const DEFAULT_PHI = 60;
  let mouseDownPos = new THREE.Vector2();
  let isMouseDown = false;
  let theta = DEFAULT_THETA;
  let phi = DEFAULT_PHI;
  //const [mouseDownPos, setMouseDownPos] = useState<Vector2>(DEFAULT_POSITION);
  const [world, setWorld] = useState<VoxelWorld | null>(null);
  const canvaRef = useRef(null);

  useEffect(() => {
    const canvas = canvaRef.current;
    if (canvas) {
      const world = new VoxelWorld(canvas);
      const resize = world.resize.bind(world);
      window.addEventListener("resize", resize);
      world.render();
      setWorld(world);
      return () => {
        canvaRef.current = null;
        window.removeEventListener("resize", resize);
      };
    }
  }, []);

  const handleMouseDown = world?.onDocumentMouseDown.bind(world);

  const handleMouseMove = world?.onDocumentMouseMove.bind(world);

  const handleMouseUp = world?.onDocumentMouseUp.bind(world);

  return (
    <canvas
      ref={canvaRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    />
  );
}

export default VoxelCanvas;
