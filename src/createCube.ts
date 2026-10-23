import * as THREE from "three";

import { ExtendedGroup } from "./ExtendedGroup";

/**
 * 立方体を作り、AABB・OBB付きのExtendedGroupに入れて返す。
 * 立方体はグループの原点に置き、グループの位置を動かすので、回転させると立方体の中心まわりに回る。
 * @param {number} size - 立方体の一辺の長さ。
 * @param {THREE.Vector3} position - 立方体の中心の位置。
 * @param {THREE.ColorRepresentation} color - 立方体の色。
 * @returns {ExtendedGroup} 立方体を入れたグループ。
 */
export const createCube = (size: number, position: THREE.Vector3, color: THREE.ColorRepresentation) => {
  const cube = new THREE.Mesh(
    new THREE.BoxGeometry(size, size, size),
    new THREE.MeshPhongMaterial({ color })
  );
  cube.castShadow = true;
  cube.receiveShadow = true;

  // ExtendedGroup.add() はグループの現在位置を含めてAABBを計算するため、位置は追加した後に設定する
  const group = new ExtendedGroup();
  group.add(cube);
  group.position.copy(position);
  return group;
};
