/**
 * @file Manages the 3D graphics shown on the voxel editor scene.
 * @author Frederick Roman, Homero Roman (and three.js authors)
 * @license MIT
 *
 * The purpose of this class is to represent and render the 3D scene shown
 * in the editor as described by editing actions.
 *
 * |Editor Scene Canvas| <----> |VoxelWorld Class| <----> |Editor Actions Menu|
 *
 * VoxelWorld is based off the official three.js example
 * by mrdoob (and other three.js authors) named webgl_interactive_voxelpainter.html
 * @see {@link https://github.com/mrdoob/three.js/blob/master/examples/webgl_interactive_voxelpainter.html}
 *
 * Main changes on top of the three.js example.
 * Frederick Roman and Homero Roman:
 * - turned the the script into a typescript class
 * - extended said class to enable more editing actions
 * - implemented an event bus for bidirectional communication
 * - implemented editing-history tracking
 * - implemented saving and loading a 3D model in .obj format
 * - made many changes that enable the 3D scene to live in a React web app
 *
 */

import {
  AmbientLight,
  BoxGeometry,
  Color,
  ColorRepresentation,
  DirectionalLight,
  GridHelper,
  Intersection,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  Raycaster,
  Scene,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import type {
  Edit,
  EditMode,
  Model3d,
  Voxel,
  VoxelTopology,
} from "types/editorTypes";
import EventBus from "services/bus/EventBus";

/**
 * @classdesc It creates a 3D scene for the Voxeldesk editor.
 *
 * VoxelWorld interacts with:
 * - the canvas through canvas ref and canvas mouse/touch events.
 * - the external code through its VoxelWorld.eventBus.
 */
class VoxelWorld {
  public eventBus = new EventBus();
  private readonly DEFAULT_VOXEL_LENGTH = 50;
  private readonly DEFAULT_VOXEL_COLOR = 0xfeb74c;
  private readonly DEFAULT_VOXEL_GEOMETRY = new BoxGeometry(
    ...new Array(3).fill(this.DEFAULT_VOXEL_LENGTH)
  );
  private readonly DEFAULT_VOXEL_MATERIAL = new MeshLambertMaterial({
    color: this.DEFAULT_VOXEL_COLOR,
  });
  private camera!: PerspectiveCamera;
  private scene!: Scene;
  private renderer!: WebGLRenderer;
  private raycaster = new Raycaster();
  private pointer = new Vector2();
  private rollOverMesh!: Mesh;
  private objects: (Voxel | Object3D<THREE.Event>)[] = [];
  private isMouseDown: boolean = false;
  private onMouseDownPosition = new Vector2();
  private theta: number = 45;
  private onMouseDownTheta: number = 45;
  private phi: number = 60;
  private onMouseDownPhi: number = 60;
  private plane!: Mesh;
  private pickedColor = new Color(this.DEFAULT_VOXEL_COLOR);
  private usedColors: Color[] = [];
  private history: Edit.History = [];
  /**
   * Set up a new world with a camera, a scene and a renderer.
   * @param canvas html element where the scene gets rendered
   */
  constructor(canvas: HTMLCanvasElement) {
    this.camera = this.createCamera();
    this.scene = this.createScene();
    this.renderer = this.createRenderer(canvas);
  }
  /**
   * Store color currently selected by the user
   * @param color
   */
  public setPickedColor(color: THREE.ColorRepresentation): void {
    this.pickedColor = new Color(color);
  }
  /**
   * Render the scene seen through the camera onto the canvas.
   */
  public render(): void {
    this.renderer.render(this.scene, this.camera);
  }
  /**
   * Resize the world on window resize.
   */
  public resize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.render();
  }
  /**
   * On (left-click) mousedown, set:
   * - spherical angle (θ, ϕ) w.r.t. the camera
   * - position (x, y) w.r.t. the canvas
   * @param event - mousedown from canvas
   */
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
  /**
   * On touchstart, set:
   * - spherical angle (θ, ϕ) w.r.t. the camera
   * - position (x, y) w.r.t. the canvas
   * @param event - touchstart from canvas
   */
  public onTouchStart(event: React.TouchEvent): void {
    const { top, left } = event.currentTarget.getBoundingClientRect();
    this.isMouseDown = true;
    this.onMouseDownTheta = this.theta;
    this.onMouseDownPhi = this.phi;
    this.onMouseDownPosition.x = event.touches[0].clientX - left;
    this.onMouseDownPosition.y = event.touches[0].clientY - top;
  }
  /**
   * On mousemove, orbit the camera and show new-voxel placement preview.
   * @param event - mousemove from canvas
   */
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
  /**
   * On mouseup, edit canvas scene.
   * @param event - mouseup from canvas
   * @param mode - add or remove voxels
   */
  public onMouseUp(event: React.MouseEvent, mode: EditMode): void {
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
      if (mode == "add") this.addVoxelAt(intersect);
      else if (mode == "remove") this.removeVoxelAt(intersect);
      this.render();
    }
  }
  /**
   * On touchmove, orbit the camera and show new-voxel placement preview.
   * @param event - touchmove from canvas
   */
  public onTouchMove(event: React.TouchEvent): void {
    const { top, left } = event.currentTarget.getBoundingClientRect();
    if (this.isMouseDown) {
      this.theta =
        -(
          (event.touches[0].clientX - left - this.onMouseDownPosition.x) *
          0.5
        ) + this.onMouseDownTheta;
      this.phi = this.clipToTopView(
        (event.touches[0].clientY - top - this.onMouseDownPosition.y) * 0.5 +
          this.onMouseDownPhi
      );
      this.orbit(this.theta, this.phi);
    }
    this.pointer.set(
      ((event.touches[0].clientX - left) / window.innerWidth) * 2 - 1,
      -((event.touches[0].clientY - top) / window.innerHeight) * 2 + 1
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
  /**
   * On touchend, edit canvas scene.
   * @param event - touchend from canvas
   * @param mode - add or remove voxels
   */
  public onTouchEnd(event: React.TouchEvent, mode: EditMode): void {
    event.preventDefault();

    const { top, left } = event.currentTarget.getBoundingClientRect();
    this.isMouseDown = false;
    this.onMouseDownPosition.x =
      event.changedTouches[0].clientX - left - this.onMouseDownPosition.x;
    this.onMouseDownPosition.y =
      event.changedTouches[0].clientY - top - this.onMouseDownPosition.y;
    if (this.onMouseDownPosition.length() > 5) return;

    this.pointer.set(
      ((event.changedTouches[0].clientX - left) / window.innerWidth) * 2 - 1,
      -((event.changedTouches[0].clientY - top) / window.innerHeight) * 2 + 1
    );

    const intersects = this.checkIntersects();
    if (intersects.length > 0) {
      const intersect = intersects[0];
      if (mode == "add") this.addVoxelAt(intersect);
      else if (mode == "remove") this.removeVoxelAt(intersect);
      this.render();
    }
  }
  /**
   * On right click, remove clicked voxel.
   * @param event contextmenu (right-click)
   */
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
      this.removeVoxelAt(intersect);
      this.render();
    }
  }
  /**
   * Undo last editing action.
   */
  public onUndo(): void {
    if (this.history.length > 0) {
      const lastStep = this.history.pop();
      if (lastStep && lastStep.object.type == "voxel") {
        const { color, position } = lastStep.object;
        if (lastStep.action == "addition") this.removeVoxelByPosition(position);
        else if (lastStep.action == "removal") this.addVoxel(color, position);
      }
    }
    this.render();
  }
  /**
   * Zero pad hexadecimal string numbers (e.g. '6')
   * to have six digits (e.g '6' -> '000006')
   * @param hex - raw number string
   * @returns padded hex string of standard length
   */
  private zeroPadHexString(hex: string): string {
    const STD_HEX_LENGTH = 6;
    const hexLength = hex.length;
    if (hexLength > STD_HEX_LENGTH) {
      console.log(`hex color was cut to be ${STD_HEX_LENGTH} of length`);
      return hex.slice(0, STD_HEX_LENGTH);
    } else if (hexLength == STD_HEX_LENGTH) {
      return hex;
    } else {
      const zerosLength = STD_HEX_LENGTH - hexLength;
      const zeros = Array(zerosLength).fill("0").join("");
      return `${zeros}${hex}`;
    }
  }
  /**
   * Extract the current world 3D model and convert it to .obj and .mtl
   * @returns 3d model as {obj: string, mtl: string}
   */
  public onSave(): Model3d {
    const NUM_CUBE_VERTICES = 8;
    const mtlColorSet = new Set<Color>();
    const model3d = Object.seal({ obj: "", mtl: "" });
    this.objects
      .filter((object) => this.isVoxel(object))
      .map((voxel): Voxel => voxel as Voxel)
      .map((voxel, i) => this.topologizeVoxel(voxel, NUM_CUBE_VERTICES * i))
      .forEach(({ vertices, faces, color }) => {
        const colorName = this.zeroPadHexString(color.getHex().toString(16));
        if (!mtlColorSet.has(color)) {
          model3d.mtl += `newmtl ${colorName}\n`;
          model3d.mtl += `Kd ${color.r} ${color.g} ${color.b}\n\n`;
          mtlColorSet.add(color);
        }
        model3d.obj += `usemtl ${colorName}\n`;
        vertices.forEach((vertex) => {
          model3d.obj += `v ${vertex.x} ${vertex.y} ${vertex.z}\n`;
        });
        faces.forEach((face) => {
          model3d.obj += `f ${face.join(" ")}\n`;
        });
      });
    if (model3d.mtl.length > 0)
      model3d.obj = "mtllib ./material.mtl\n" + model3d.obj;
    return model3d;
  }
  /**
   * Render the given model3d onto the canvas and store its picked colors.
   * @param model3d as {obj: string, mtl: string}
   */
  public onLoadModel(model3d: Model3d): void {
    try {
      const VOXEL_NUM_LINES = 15;
      const OFFSET = this.DEFAULT_VOXEL_LENGTH / 2;
      const offsetVector = new Vector3(OFFSET, OFFSET, -OFFSET);
      const objLines = model3d.obj.trim().split(/\r?\n/).slice(1);
      const voxelsData: { color: Color; position: Vector3 }[] = [];
      for (let i = 0; i < objLines.length / VOXEL_NUM_LINES; i++) {
        const colorLine = objLines[i * VOXEL_NUM_LINES].split(/\s/);
        const vertexLine = objLines[i * VOXEL_NUM_LINES + 1].split(/\s/);
        const color = new Color(`#${colorLine[1]}` as ColorRepresentation);
        const [x, y, z] = vertexLine.slice(1).map((v) => Number(v));
        const position = new Vector3(x, y, z).add(offsetVector);
        voxelsData.push({ color, position });
      }
      voxelsData.forEach(({ color, position }) => {
        this.addVoxel(color, position);
        this.setPickedColor(color);
        this.emitWorldChange("usedColors");
      });
    } catch (error) {
      console.log(error);
    }
  }
  /**
   * Clip phi to top view
   * @param phi - raw polar angle
   * @returns polar angle on [0, 180]
   */
  private clipToTopView(phi: number): number {
    return Math.min(180, Math.max(0, phi));
  }
  /**
   * Checks all intersections of camera -> pointer -> object
   * @returns all such intersections sorted by distance
   */
  private checkIntersects(): Intersection[] {
    this.raycaster.setFromCamera(this.pointer, this.camera);
    return this.raycaster.intersectObjects(this.objects, false);
  }
  /**
   * Emits change in the world through the eventBus
   * @fires eventBus#usedColorsChange with list of used colors as payload
   */
  private emitWorldChange(state: string): void {
    if (state == "usedColors") {
      if (!this.usedColors.some((color) => color.equals(this.pickedColor)))
        this.usedColors.push(this.pickedColor);
      const payload = { usedColors: [...this.usedColors] };
      this.eventBus.emit("usedColorsChange", payload);
    }
  }
  /**
   * Add voxel at intersection.
   * @param intersect - intersection of camera -> pointer -> object
   */
  private addVoxelAt(intersect: Intersection<Object3D<THREE.Event>>): void {
    if (intersect.face) {
      const cubeMaterial = this.DEFAULT_VOXEL_MATERIAL.clone();
      cubeMaterial.color = this.pickedColor;
      const voxel = new Mesh(this.DEFAULT_VOXEL_GEOMETRY, cubeMaterial);
      voxel.position
        .copy(intersect.point)
        .add(intersect.face.normal)
        .divideScalar(50)
        .floor()
        .multiplyScalar(50)
        .addScalar(25);
      this.scene.add(voxel);
      this.objects.push(voxel);
      this.history.push({
        action: "addition",
        object: {
          type: "voxel",
          position: voxel.position,
          color: voxel.material.color,
        },
      });
      this.emitWorldChange("usedColors");
    }
  }
  /**
   * Remove voxel at intersection.
   * @param intersect - intersection of camera -> pointer -> object
   */
  private removeVoxelAt(intersect: Intersection<Object3D<THREE.Event>>): void {
    if (intersect.object !== this.plane) {
      const object = this.objects.find((obj) => obj == intersect.object);
      if (object && this.isVoxel(object)) {
        this.scene.remove(intersect.object);
        this.objects.splice(this.objects.indexOf(intersect.object), 1);
        this.history.push({
          action: "removal",
          object: {
            type: "voxel",
            position: intersect.object.position,
            color: (object as Voxel).material.color,
          },
        });
      }
    }
  }
  /**
   * Add voxel at a given position.
   * @param color - voxel color
   * @param position - voxel cartesian position in the world
   */
  private addVoxel(color: Color, position: Vector3): void {
    const cubeMaterial = this.DEFAULT_VOXEL_MATERIAL.clone();
    cubeMaterial.color = color;
    const voxel: Voxel = new Mesh(this.DEFAULT_VOXEL_GEOMETRY, cubeMaterial);
    voxel.position.copy(position);
    this.scene.add(voxel);
    this.objects.push(voxel);
  }
  /**
   * Remove voxel at a given position.
   * @param position - voxel cartesian position in the world
   */
  private removeVoxelByPosition(position: Vector3): void {
    const voxel = this.objects.find(
      (object) => this.isVoxel(object) && object.position.equals(position)
    );
    if (voxel) {
      this.scene.remove(voxel);
      this.objects.splice(this.objects.indexOf(voxel), 1);
    }
  }
  /**
   * Topologize a given voxel with a unique id.
   * @param voxel - Minimal unit of creation: a mesh with box geometry
   * @param id - voxel id to match its corresponding attributes
   * @returns voxel topology as {vertics, faces, colors}
   */
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
  /**
   * Test whether an object is a voxel (and not the plane, rollOverMesh, etc.)
   * @param object - object on the scene
   * @returns true if it is a voxel, else false
   */
  private isVoxel(object: Voxel | Object3D<THREE.Event>): boolean {
    return (
      object instanceof Mesh &&
      object !== this.plane &&
      object !== this.rollOverMesh &&
      object.position &&
      object.material !== undefined
    );
  }
  /**
   * Orbit camera around the scene's origin (0, 0, 0)
   * @param theta - camera's equator angle in radians around the y (up) axis.
   * @param phi - camera's polar angle in radians around the y (up) axis.
   */
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
  /**
   * Create word's camera setting fov, aspect, near and far constants.
   * @returns world's camera looking away at the origin in oblique angle
   */
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
  /**
   * Create a scene that has a grid plane lit by an ambient directional light.  
   * @returns scene
   */
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
  /**
   * Create webGL renderer on canvas with window's size and pixel device ratio.
   * @param canvas - ref to html canvas element where the scene is rendered
   * @returns webGL renderer
   */
  private createRenderer(canvas: HTMLCanvasElement): WebGLRenderer {
    const renderer = new WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    return renderer;
  }
  /**
   * Create a rollover mesh (which is a temporary transparent voxel that 
   * shows on hover where on the canvas a voxel would be added on press)
   * @returns rollover mesh
   */
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
  /**
   * Create a grid (a 2D array of lines) with constant size and divisions
   * @returns grid helper
   */
  private createGridHelper(): GridHelper {
    const gridHelper = new GridHelper(1000, 20);
    return gridHelper;
  }
  /**
   * Create invisible floor plane with constant size 
   * @returns plane
   */
  private createPlane(): Mesh {
    const geometry = new PlaneGeometry(1000, 1000);
    geometry.rotateX(-Math.PI / 2);
    const material = new MeshBasicMaterial({ visible: false });
    const plane = new Mesh(geometry, material);
    return plane;
  }
  /**
   * Create soft ambient light for the secondary lighting of the scene.
   * @returns ambient light
   */
  private createAmbientLight(): AmbientLight {
    const ambientLight = new AmbientLight(0x606060);
    return ambientLight;
  }
  /**
   * Create hard point directional light for the primary lighting of the scene.
   * @returns directinal light
   */
  private createDirectionalLight(): DirectionalLight {
    const directionalLight = new DirectionalLight(0xffffff);
    directionalLight.position.set(1, 0.75, 0.5).normalize();
    return directionalLight;
  }
}

export default VoxelWorld;
