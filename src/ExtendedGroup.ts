import * as THREE from "three";

// OBB（Oriented Bounding Box）をインポート
import { OBB } from "three/examples/jsm/math/OBB.js";

/**
 * ExtendedGroup クラス。
 * THREE.Group クラスを拡張して、AABB（Axis-Aligned Bounding Box）を自動的に計算し、
 * それを表すMeshをこのグループに追加します。
 *
 * @example
 * const loadGLBModel = (): Promise<THREE.Group> => {
 *   return new Promise((resolve, reject) => {
 *     const loader = new GLTFLoader();
 *     loader.load(
 *       `${import.meta.env.BASE_URL}your_model.glb`,
 *       (gltf) => {
 *         const extendedGroup = new ExtendedGroup();
 *         // ロードしたモデルをExtendedGroupに追加
 *         extendedGroup.add(gltf.scene);
 *         resolve(extendedGroup);
 *       },
 *       undefined,
 *       (error) => {
 *         console.error("An error occurred while loading the GLB model:", error);
 *         reject(error);
 *       }
 *     );
 *   });
 * };
 */
export class ExtendedGroup extends THREE.Group {
  _aabb: THREE.Mesh | null;
  obb: OBB;

  constructor() {
    super();
    this._aabb = null;
    this.obb = new OBB();
  }

  get aabb(): THREE.Mesh {
    if (!this._aabb) throw "ExtendedGroup.aabb: _aabb is invalid";
    return this._aabb;
  }

  /**
   * オブジェクトをグループに追加する。
   * @param {THREE.Object3D[]} object - 追加するオブジェクト。
   * @returns {ExtendedGroup} このExtendedGroup。
   */
  add(...object: THREE.Object3D<THREE.Object3DEventMap>[]) {
    super.add(...object);

    // 2回目以降は古いAABBを取り除いてから作り直す（マテリアルはワイヤフレーム表示の設定ごと引き継ぐ）
    const oldAABB = this._aabb;
    if (oldAABB) {
      this.remove(oldAABB);
      oldAABB.geometry.dispose();
    }

    const box = new THREE.Box3();
    box.setFromObject(this);

    // AABBのサイズと中心を取得
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    // AABBを表すMeshを作成
    const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    const material = oldAABB?.material ?? new THREE.MeshPhongMaterial({
      color: `green`,
      wireframe: true,
    });

    this._aabb = new THREE.Mesh(geometry, material);
    this._aabb.position.copy(center);

    // AABB Meshをこのグループに追加
    super.add(this._aabb);
    this._aabb.geometry.computeBoundingBox();
    this.obb.fromBox3(this._aabb.geometry.boundingBox as THREE.Box3);

    return this;
  }

  /**
   * Oriented Bounding Box (OBB) を取得する。
   * @returns {OBB} OBB。
   */
  getOBB(): OBB {
    if (!this._aabb) throw "ExtendedGroup.getOBB: _aabb is invalid";
    return this.obb.clone().applyMatrix4(this._aabb.matrixWorld);
  }
}
