import type { Mesh, BoxGeometry, MeshLambertMaterial, Color } from "three";

export type Voxel = Mesh<BoxGeometry, MeshLambertMaterial>;
export type Action = "Color" | "Undo" | "Reset" | "Save" | "";

export interface VoxelTopology {
  vertices: { x: number; y: number; z: number }[];
  faces: number[][];
  color: Color;
}

export interface Model3d {
  obj: string;
  mtl: string;
}
