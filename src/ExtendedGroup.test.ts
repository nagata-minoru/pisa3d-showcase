import { describe, expect, it } from "vitest";
import * as THREE from "three";

import { ExtendedGroup } from "./ExtendedGroup";

/**
 * 指定したサイズ・位置の箱のメッシュを作る。
 * GLBモデルの代わりにExtendedGroupへ追加して使う。
 * @param {THREE.Vector3} size - 箱のサイズ。
 * @param {THREE.Vector3} position - 箱の中心の位置。
 * @returns {THREE.Mesh} 作成したメッシュ。
 */
const createBox = (size: THREE.Vector3, position = new THREE.Vector3()) => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(size.x, size.y, size.z));
  mesh.position.copy(position);
  return mesh;
};

/**
 * 原点を中心とする 2×2×2 の箱を追加したExtendedGroupを作る。
 * @returns {ExtendedGroup} 作成したグループ。
 */
const createCubeGroup = () => {
  const group = new ExtendedGroup();
  group.add(createBox(new THREE.Vector3(2, 2, 2)));
  return group;
};

describe("ExtendedGroup", () => {
  describe("add", () => {
    it("追加したオブジェクトを囲むAABBのメッシュを作る", () => {
      const group = new ExtendedGroup();
      group.add(createBox(new THREE.Vector3(2, 4, 6), new THREE.Vector3(1, 2, 3)));

      const { parameters } = group.aabb.geometry as THREE.BoxGeometry;
      expect([parameters.width, parameters.height, parameters.depth]).toEqual([2, 4, 6]);
      expect(group.aabb.position.toArray()).toEqual([1, 2, 3]);
      expect(group.children).toContain(group.aabb);
    });

    it("自分自身を返す", () => {
      const group = new ExtendedGroup();
      expect(group.add(createBox(new THREE.Vector3(1, 1, 1)))).toBe(group);
    });
  });

  describe("オブジェクトを追加する前", () => {
    it("aabbを参照すると例外を投げる", () => {
      const group = new ExtendedGroup();
      expect(() => group.aabb).toThrow("ExtendedGroup.aabb: _aabb is invalid");
    });

    it("getOBBを呼ぶと例外を投げる", () => {
      const group = new ExtendedGroup();
      expect(() => group.getOBB()).toThrow("ExtendedGroup.getOBB: _aabb is invalid");
    });
  });

  describe("getOBB", () => {
    it("回転していないとき、箱の内側の点だけを含む", () => {
      const group = createCubeGroup();
      group.updateMatrixWorld(true);

      const obb = group.getOBB();
      expect(obb.containsPoint(new THREE.Vector3(0, 0, 0))).toBe(true);
      expect(obb.containsPoint(new THREE.Vector3(0.9, 0.9, 0.9))).toBe(true);
      expect(obb.containsPoint(new THREE.Vector3(1.3, 0, 0))).toBe(false);
    });

    it("グループを回転させると、判定も回転に追従する", () => {
      const group = createCubeGroup();
      group.rotateY(Math.PI / 4);
      group.updateMatrixWorld(true);

      // Y軸まわりに45°回すと、箱の角がX軸方向（距離√2）に来て、辺の中点が斜め方向に来る
      const obb = group.getOBB();
      expect(obb.containsPoint(new THREE.Vector3(1.3, 0, 0))).toBe(true);
      expect(obb.containsPoint(new THREE.Vector3(0.9, 0, 0.9))).toBe(false);
    });

    it("グループを移動させると、判定も移動に追従する", () => {
      const group = createCubeGroup();
      group.position.set(5, 0, 0);
      group.updateMatrixWorld(true);

      const obb = group.getOBB();
      expect(obb.containsPoint(new THREE.Vector3(5, 0, 0))).toBe(true);
      expect(obb.containsPoint(new THREE.Vector3(0, 0, 0))).toBe(false);
    });

    it("元のOBBは変更しない", () => {
      const group = createCubeGroup();
      group.position.set(5, 0, 0);
      group.updateMatrixWorld(true);

      group.getOBB();
      expect(group.obb.center.toArray()).toEqual([0, 0, 0]);
    });
  });
});
