import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  AmbientLight,
  DirectionalLight,
  GridHelper,
  Intersection,
  Mesh,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";

class VoxelWorld {
  private camera!: PerspectiveCamera;
  private scene!: Scene;
  private renderer!: WebGLRenderer;
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private rollOverMesh!: Mesh;
  private objects: any[] = [];
  private isMouseDown = false;
  private onMouseDownPosition = new THREE.Vector2();
  private theta = 45;
  private onMouseDownTheta = 45;
  private phi = 60;
  private onMouseDownPhi = 60;
  private plane!: Mesh;
  private readonly cubeGeo = new THREE.BoxGeometry(50, 50, 50);
  private readonly cubeMaterial = new THREE.MeshLambertMaterial({
    color: 0xfeb74c,
  });
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
  public onDocumentMouseDown(event: React.MouseEvent): void {
    event.preventDefault();
    if (event.button !== 0) return;
    this.isMouseDown = true;
    this.onMouseDownTheta = this.theta;
    this.onMouseDownPhi = this.phi;
    this.onMouseDownPosition.x = event.clientX;
    this.onMouseDownPosition.y = event.clientY;
  }
  private clipToTopView(phi: number): number {
    return Math.min(180, Math.max(0, phi));
  }
  public onDocumentMouseMove(event: React.MouseEvent): void {
    event.preventDefault();
    if (event.button !== 0) return;
    if (this.isMouseDown) {
      this.theta =
        -((event.clientX - this.onMouseDownPosition.x) * 0.5) +
        this.onMouseDownTheta;
      this.phi = this.clipToTopView(
        (event.clientY - this.onMouseDownPosition.y) * 0.5 + this.onMouseDownPhi
      );
      this.orbit(this.theta, this.phi);
    }
    this.pointer.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );
    const intersects = this.checkIntersects();
    if (intersects.length > 0) {
      const intersect = intersects[0];
      if (intersect.face) {
        this.rollOverMesh.position
          .copy(intersect.point)
          .add(intersect.face.normal)
          .divideScalar(50)
          .floor()
          .multiplyScalar(50)
          .addScalar(25);
      }
    }
    this.render();
  }
  private checkIntersects(): Intersection[] {
    this.raycaster.setFromCamera(this.pointer, this.camera);
    return this.raycaster.intersectObjects(this.objects, false);
  }
  public onDocumentMouseUp(event: React.MouseEvent): void {
    event.preventDefault();
    if (event.button !== 0) return;
    this.isMouseDown = false;
    this.onMouseDownPosition.x = event.clientX - this.onMouseDownPosition.x;
    this.onMouseDownPosition.y = event.clientY - this.onMouseDownPosition.y;
    if (this.onMouseDownPosition.length() > 5) return;

    this.pointer.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );

    const intersects = this.checkIntersects();
    if (intersects.length > 0) {
      const intersect = intersects[0];
      if (intersect.face) {
        const voxel = new THREE.Mesh(this.cubeGeo, this.cubeMaterial);
        voxel.position
          .copy(intersect.point)
          .add(intersect.face.normal)
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
  public onDocumentRightClick(event: React.MouseEvent): void {
    event.preventDefault();
    console.log("context menu");

    this.pointer.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );

    const intersects = this.checkIntersects();
    console.log(intersects);
    if (intersects.length > 0) {
      const intersect = intersects[0];
      if (intersect.object !== this.plane) {
        this.scene.remove(intersect.object);
        this.objects.splice(this.objects.indexOf(intersect.object), 1);
      }
      this.render();
    }
  }
  private orbit(theta: number, phi: number): void {
    const RADIUS = 1600;
    const { sin, cos, PI } = Math;
    const x = RADIUS * sin((theta * PI) / 360) * cos((phi * PI) / 360);
    const y = RADIUS * sin((phi * PI) / 360);
    const z = RADIUS * cos((theta * PI) / 360) * cos((phi * PI) / 360);
    this.camera.position.set(x, y, z);
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
}

function VoxelCanvas(): JSX.Element {
  const [world, setWorld] = useState<VoxelWorld | null>(null);
  const canvaRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvaRef.current;
    if (canvas) {
      const world = new VoxelWorld(canvas);
      world.render();
      setWorld(world);
      return () => {
        canvaRef.current = null;
        setWorld(null);
      };
    }
  }, []);
  
  useEffect(() => {
    if (world) {
      const resize = world.resize.bind(world);
      window.addEventListener("resize", resize);
      return () => window.removeEventListener("resize", resize);
    }
  }, []);

  const handleMouseDown = world?.onDocumentMouseDown.bind(world);
  const handleMouseMove = world?.onDocumentMouseMove.bind(world);
  const handleMouseUp = world?.onDocumentMouseUp.bind(world);
  const handleLeftClick = world?.onDocumentRightClick.bind(world);

  return (
    <canvas
      ref={canvaRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onContextMenu={handleLeftClick}
    />
  );
}

export default VoxelCanvas;
