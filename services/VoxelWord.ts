import {
  AmbientLight,
  BoxGeometry,
  Color,
  DirectionalLight,
  GridHelper,
  Intersection,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Raycaster,
  Scene,
  Vector2,
  WebGLRenderer,
} from "three";
import type { Model3d, Voxel, VoxelTopology } from "types/editorTypes";
import EventBus from "./EventBus";

class VoxelWorld {
  private camera!: PerspectiveCamera;
  private scene!: Scene;
  private renderer!: WebGLRenderer;
  private raycaster = new Raycaster();
  private pointer = new Vector2();
  private rollOverMesh!: Mesh;
  private objects: any[] = [];
  private isMouseDown = false;
  private onMouseDownPosition = new Vector2();
  private theta = 45;
  private onMouseDownTheta = 45;
  private phi = 60;
  private onMouseDownPhi = 60;
  private plane!: Mesh;
  private pickedColor = new Color(0xfeb74c);
  private usedColors: Color[] = [];
  private readonly cubeGeo = new BoxGeometry(50, 50, 50);
  private cubeMaterial = new MeshLambertMaterial({ color: 0xfeb74c });
  public eventBus = new EventBus();
  constructor(canvas: HTMLCanvasElement) {
    this.camera = this.createCamera();
    this.scene = this.createScene();
    this.renderer = this.createRenderer(canvas);
  }
  public setPickedColor(color: THREE.ColorRepresentation) {
    this.pickedColor = new Color(color);
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
  public onMouseDown(event: React.MouseEvent): void {
    event.preventDefault();
    if (event.button !== 0) return;
    const { top, left } = event.currentTarget.getBoundingClientRect();
    this.isMouseDown = true;
    this.onMouseDownTheta = this.theta;
    this.onMouseDownPhi = this.phi;
    this.onMouseDownPosition.x = event.clientX - left;
    this.onMouseDownPosition.y = event.clientY - top;
  }
  private clipToTopView(phi: number): number {
    return Math.min(180, Math.max(0, phi));
  }
  public onMouseMove(event: React.MouseEvent): void {
    event.preventDefault();
    if (event.button !== 0) return;
    const { top, left } = event.currentTarget.getBoundingClientRect();
    if (this.isMouseDown) {
      this.theta =
        -((event.clientX - left - this.onMouseDownPosition.x) * 0.5) +
        this.onMouseDownTheta;
      this.phi = this.clipToTopView(
        (event.clientY - top - this.onMouseDownPosition.y) * 0.5 +
          this.onMouseDownPhi
      );
      this.orbit(this.theta, this.phi);
    }
    this.pointer.set(
      ((event.clientX - left) / window.innerWidth) * 2 - 1,
      -((event.clientY - top) / window.innerHeight) * 2 + 1
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
  private emitWorldChange(state: string): void {
    if (state == "usedColors") {
      if (!this.usedColors.some((color) => color.equals(this.pickedColor)))
        this.usedColors.push(this.pickedColor);
      const payload = { usedColors: [...this.usedColors] };
      this.eventBus.emit("usedColorsChange", payload);
    }
  }
  public onMouseUp(event: React.MouseEvent): void {
    event.preventDefault();
    if (event.button !== 0) return;
    const { top, left } = event.currentTarget.getBoundingClientRect();
    this.isMouseDown = false;
    this.onMouseDownPosition.x =
      event.clientX - left - this.onMouseDownPosition.x;
    this.onMouseDownPosition.y =
      event.clientY - top - this.onMouseDownPosition.y;
    if (this.onMouseDownPosition.length() > 5) return;

    this.pointer.set(
      ((event.clientX - left) / window.innerWidth) * 2 - 1,
      -((event.clientY - top) / window.innerHeight) * 2 + 1
    );

    const intersects = this.checkIntersects();
    if (intersects.length > 0) {
      const intersect = intersects[0];
      if (intersect.face) {
        const cubeMaterial = this.cubeMaterial.clone();
        cubeMaterial.color = this.pickedColor;
        const voxel = new Mesh(this.cubeGeo, cubeMaterial);
        voxel.position
          .copy(intersect.point)
          .add(intersect.face.normal)
          .divideScalar(50)
          .floor()
          .multiplyScalar(50)
          .addScalar(25);
        this.scene.add(voxel);
        this.objects.push(voxel);
        this.emitWorldChange("usedColors");
      }
      this.render();
    }
  }
  public onRightClick(event: React.MouseEvent): void {
    event.preventDefault();
    if (event.button === 0) return;
    const { top, left } = event.currentTarget.getBoundingClientRect();
    this.pointer.set(
      ((event.clientX - left) / window.innerWidth) * 2 - 1,
      -((event.clientY - top) / window.innerHeight) * 2 + 1
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
  private topologizeVoxel(voxel: Voxel, id: number): VoxelTopology {
    const OFFSET = 25;
    const CUBE_FACES = Object.freeze([
      [1, 2, 3, 4],
      [2, 5, 6, 3],
      [5, 6, 7, 8],
      [8, 7, 4, 1],
      [3, 6, 7, 4],
      [2, 1, 8, 5],
    ]);
    const center = voxel.position;
    const vertices = [
      { x: center.x - OFFSET, y: center.y - OFFSET, z: center.z + OFFSET },
      { x: center.x + OFFSET, y: center.y - OFFSET, z: center.z + OFFSET },
      { x: center.x + OFFSET, y: center.y + OFFSET, z: center.z + OFFSET },
      { x: center.x - OFFSET, y: center.y + OFFSET, z: center.z + OFFSET },
      { x: center.x + OFFSET, y: center.y - OFFSET, z: center.z - OFFSET },
      { x: center.x + OFFSET, y: center.y + OFFSET, z: center.z - OFFSET },
      { x: center.x - OFFSET, y: center.y + OFFSET, z: center.z - OFFSET },
      { x: center.x - OFFSET, y: center.y - OFFSET, z: center.z - OFFSET },
    ];
    const faces = CUBE_FACES.map((row) => row.map((entry) => entry + id));
    const color = voxel.material.color;
    return { vertices, faces, color };
  }
  private isVoxel(object: typeof this.objects[0]): boolean {
    return (
      object instanceof Mesh &&
      object !== this.plane &&
      object !== this.rollOverMesh
    );
  }
  public onSave(): Model3d {
    const NUM_CUBE_VERTICES = 8;
    const mtlSet = new Set<Color>();
    let objString = "";
    let mtlString = "";
    this.objects
      .filter((object) => this.isVoxel(object))
      .map((voxel, i) => this.topologizeVoxel(voxel, NUM_CUBE_VERTICES * i))
      .forEach(({ vertices, faces, color }) => {
        const colorName = color.getHex().toString(16);
        if (!mtlSet.has(color)) {
          mtlString += `newmtl ${colorName}\n`;
          mtlString += `Kd ${color.r} ${color.g} ${color.b}\n\n`;
          mtlSet.add(color);
        }
        objString += `usemtl ${colorName}\n`;
        vertices.forEach((vertex) => {
          objString += `v ${vertex.x} ${vertex.y} ${vertex.z}\n`;
        });
        faces.forEach((face) => {
          objString += `f ${face.join(" ")}\n`;
        });
      });
    if (mtlString.length > 0) {
      objString = "mtllib ./material.mtl\n" + objString;
    }
    console.log(objString);
    console.log(mtlString);
    return { obj: objString, mtl: mtlString };
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
    const camera = new PerspectiveCamera(fov, aspect, near, far);
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
    const scene = new Scene();
    scene.background = new Color(0xf0f0f0);
    scene.add(rollOverMesh);
    scene.add(gridHelper);
    scene.add(plane);
    this.objects.push(plane);
    scene.add(ambientLight);
    scene.add(directionalLight);
    return scene;
  }
  private createRenderer(canvas: HTMLCanvasElement) {
    const renderer = new WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    return renderer;
  }
  private createRollOver(): Mesh {
    const rollOverGeo = new BoxGeometry(50, 50, 50);
    const rollOverMaterial = new MeshBasicMaterial({
      color: 0xff0000,
      opacity: 0.5,
      transparent: true,
    });
    const rollOverMesh = new Mesh(rollOverGeo, rollOverMaterial);
    this.rollOverMesh = rollOverMesh;
    return rollOverMesh;
  }
  private createGridHelper(): GridHelper {
    const gridHelper = new GridHelper(1000, 20);
    return gridHelper;
  }
  private createPlane(): Mesh {
    const geometry = new PlaneGeometry(1000, 1000);
    geometry.rotateX(-Math.PI / 2);
    const material = new MeshBasicMaterial({ visible: false });
    const plane = new Mesh(geometry, material);
    return plane;
  }
  private createAmbientLight(): AmbientLight {
    const ambientLight = new AmbientLight(0x606060);
    return ambientLight;
  }
  private createDirectionalLight(): DirectionalLight {
    const directionalLight = new DirectionalLight(0xffffff);
    directionalLight.position.set(1, 0.75, 0.5).normalize();
    return directionalLight;
  }
}

export default VoxelWorld;
