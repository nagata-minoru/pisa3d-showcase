import { describe, expect, it } from "vitest";
import * as THREE from "three";

import { createCube } from "./createCube";

describe("createCube", () => {
  it("指定したサイズ・位置の立方体を囲むAABBを作る", () => {
    const group = createCube(2, new THREE.Vector3(3, 4, 5), "orange");

    const { parameters } = group.aabb.geometry as THREE.BoxGeometry;
    expect([parameters.width, parameters.height, parameters.depth]).toEqual([2, 2, 2]);
    expect(group.aabb.position.toArray()).toEqual([0, 0, 0]);
    expect(group.position.toArray()).toEqual([3, 4, 5]);
  });

  it("OBBは立方体の位置にあり、回転させても中心は変わらない", () => {
    const group = createCube(2, new THREE.Vector3(3, 4, 5), "orange");
    group.rotateY(Math.PI / 4);
    group.updateMatrixWorld(true);

    const obb = group.getOBB();
    expect(obb.center.x).toBeCloseTo(3);
    expect(obb.center.y).toBeCloseTo(4);
    expect(obb.center.z).toBeCloseTo(5);
    expect(obb.containsPoint(new THREE.Vector3(3, 4, 5))).toBe(true);
    expect(obb.containsPoint(new THREE.Vector3(0, 0, 0))).toBe(false);
  });
});
