import type { Mesh, BoxGeometry, MeshLambertMaterial, Color } from "three";

export type Voxel = Mesh<BoxGeometry, MeshLambertMaterial>;
export type Action =
  | "Add/Remove"
  | "Color"
  | "Undo"
  | "Reset"
  | "Save"
  | "Load"
  | "";
export type EditMode = "add" | "remove";

export interface VoxelTopology {
  vertices: { x: number; y: number; z: number }[];
  faces: number[][];
  color: Color;
}

export interface Model3d {
  obj: string;
  mtl: string;
}

export namespace Edit {
  interface Step {
    action: "addition" | "removal";
    object: {
      type: "voxel";
      position: THREE.Vector3;
      color: THREE.Color;
    };
  }
  export type History = Step[];
}
