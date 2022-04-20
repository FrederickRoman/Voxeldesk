import type { Model3d } from "types/editorTypes";

type Validation = { err: true; msg: string } | { err: false; msg: "" };

function isMtlColorLineValid(colorLine: string[]): boolean {
  return colorLine.length == 2 && colorLine[0] == "usemtl";
}

function isHexColorString(str: string): boolean {
  const HEX_PARSE_REGEX = /^[0-9A-F]{6}$|0/i;
  return HEX_PARSE_REGEX.test(str);
}

function isVertexLineValid(vertexLine: string[]): boolean {
  return (
    vertexLine.length == 4 &&
    vertexLine.every((v) => v != "") &&
    vertexLine[0] == "v"
  );
}

function isCoordinateWithinLimits(coordVal: number): boolean {
  const OFFSET = 25;
  const MAX_VOXEL_DIM = 100;
  return (
    Math.abs(coordVal) % OFFSET != 0 ||
    Math.abs(coordVal) / OFFSET > MAX_VOXEL_DIM
  );
}

class ModelValidator {
  static validate(model3d: Model3d): Validation {
    const VOXEL_NUM_LINES = 15;
    const COORD_NAMES = Object.freeze(["x", "y", "z"]);

    if (model3d.obj == "")
      return { err: true, msg: "Cannot load empty .obj file!" };

    const objLines = model3d.obj.trim().split(/\r?\n/).slice(1);
    for (let i = 0; i < objLines.length / VOXEL_NUM_LINES; i++) {
      const colorLine = objLines[i * VOXEL_NUM_LINES].split(/\s/);
      const vertexLine = objLines[i * VOXEL_NUM_LINES + 1].split(/\s/);
      if (!isMtlColorLineValid(colorLine))
        return { err: true, msg: `Invalid color line ${colorLine}` };
      if (!isHexColorString(colorLine[1]))
        return { err: true, msg: `Invalid hex value ${colorLine[1]}` };
      if (!isVertexLineValid(vertexLine))
        return { err: true, msg: `Line ${vertexLine} has invalid format` };
      if (!isVertexLineValid(vertexLine))
        return { err: true, msg: `Invalid vertex ${vertexLine}` };
      vertexLine.forEach((coordVal, i) => {
        if (i != 0) {
          if (!isCoordinateWithinLimits(parseInt(coordVal))) {
            const coordName = COORD_NAMES[i - 1];
            return {
              err: true,
              msg: `Vertex ${coordName} value exceeds allowed dimensions ${coordVal}`,
            };
          }
        }
      });
    }

    return { err: false, msg: "" };
  }
}

export default ModelValidator;
