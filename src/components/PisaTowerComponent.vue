<template>
  <!-- メインのコンテナ -->
  <div>
    <!-- 3Dレンダリング領域 -->
    <div ref="rendererDom" style="width: 100vw; height: 100vh;"></div>
    <!-- ツールバーの配置 -->
    <div class="toolbar">
      <!-- ワイヤフレーム表示のスイッチ -->
      <div class="form-check form-switch">
        <input
          class="form-check-input"
          type="checkbox"
          id="wireframeSwitch"
          v-model="isWireframe"
          @change="updateWireframeVisibility"
        />
        <label class="form-check-label" for="wireframeSwitch">ワイヤフレーム表示</label>
      </div>

      <!-- CameraHelper 表示のスイッチ -->
      <div class="form-check form-switch">
        <input
          class="form-check-input"
          type="checkbox"
          id="cameraHelperSwitch"
          v-model="showCameraHelper"
          @change="updateCameraHelperVisibility"
        />
        <label class="form-check-label" for="cameraHelperSwitch">CameraHelper 表示</label>
      </div>

      <!-- X軸での回転スイッチ -->
      <div class="form-check form-switch">
        <input class="form-check-input" type="checkbox" id="rotateXSwitch" v-model="rotateX" />
        <label class="form-check-label" for="rotateXSwitch">X軸で回転</label>
      </div>

      <!-- Y軸での回転スイッチ -->
      <div class="form-check form-switch">
        <input class="form-check-input" type="checkbox" id="rotateYSwitch" v-model="rotateY" />
        <label class="form-check-label" for="rotateYSwitch">Y軸で回転</label>
      </div>

      <!-- Z軸での回転スイッチ -->
      <div class="form-check form-switch">
        <input class="form-check-input" type="checkbox" id="rotateZSwitch" v-model="rotateZ" />
        <label class="form-check-label" for="rotateZSwitch">Z軸で回転</label>
      </div>

      <!-- ローテーションリセットボタン -->
      <div class="form-check">
        <button @click="resetRotation" class="btn btn-primary">ローテーションリセット</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, onMounted, onBeforeUnmount, Ref } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OBB } from "three/examples/jsm/math/OBB";

/**
 * THREE.Group クラスを拡張して、AABB（Axis-Aligned Bounding Box）を自動的に計算し、
 * それを表すMeshをこのグループに追加するクラス。
 *
 * @example
 * const loadGLBModel = (): Promise<THREE.Group> => {
 *   return new Promise((resolve, reject) => {
 *     const loader = new GLTFLoader();
 *     loader.load(
 *       `${process.env.BASE_URL}your_model.glb`,
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
class ExtendedGroup extends THREE.Group {
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

  add(...object: THREE.Object3D<THREE.Object3DEventMap>[]) {
    super.add(...object);

    const box = new THREE.Box3();
    box.setFromObject(this);

    // AABBのサイズと中心を取得
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    // AABBを表すMeshを作成
    const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    const material = new THREE.MeshPhongMaterial({
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

  getOBB(): OBB {
    if (!this._aabb) throw "ExtendedGroup.getOBB: _aabb is invalid";
    return this.obb.clone().applyMatrix4(this._aabb.matrixWorld);
  }
}

/**
 * PisaTowerComponent - 3Dのピサの斜塔を表示するVueコンポーネント
 */
export default {
  name: "PisaTowerComponent",
  setup() {
    const rendererDom: Ref<unknown> = ref(null); // レンダリング領域の参照

    // 各種状態の定義
    const isWireframe = ref(true);
    const showCameraHelper = ref(false);

    // X, Y, Z軸での回転の状態を管理するリアクティブ変数
    const rotateX = ref(false);
    const rotateY = ref(false);
    const rotateZ = ref(false);

    let animationId: number;
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let cameraHelper: THREE.CameraHelper;
    let glbModel: ExtendedGroup | null = null; // GLBモデルの参照を保存する変数

    /**
     * 平行光源を作成する関数
     * @returns {THREE.DirectionalLight} 作成された平行光源
     */
    const createDirectionalLight = () => {
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(20, 20, 20); // 光の位置を設定
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 4096;
      directionalLight.shadow.mapSize.height = 4096;
      directionalLight.shadow.camera.left = -15;
      directionalLight.shadow.camera.right = 15;
      directionalLight.shadow.camera.top = 15;
      directionalLight.shadow.camera.bottom = -15;
      directionalLight.shadow.camera.far = 100;
      return directionalLight;
    };

    /**
     * カメラを作成する関数
     * @returns {THREE.PerspectiveCamera} 作成されたカメラ
     */
    const createCamera = () => {
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(15, 15, -15);
      return camera;
    };

    // レンダラの作成
    const createRenderer = () => {
      const renderer = new THREE.WebGLRenderer();
      renderer.setSize(window.innerWidth, window.innerHeight);
      (rendererDom.value as HTMLDivElement).appendChild(renderer.domElement);
      renderer.shadowMap.enabled = true;
      renderer.setClearColor("lightsteelblue");
      return renderer;
    };

    // 地面の作成
    const createFloorPlane = (): THREE.Mesh => {
      const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(40, 40),
        new THREE.MeshLambertMaterial({ color: "tan", side: THREE.DoubleSide })
      );
      plane.position.y = -0.1;
      plane.rotateX(Math.PI / 2);
      plane.receiveShadow = true;
      return plane;
    };

    // シーンの作成
    const createScene = () => {
      const scene = new THREE.Scene();
      scene.add(new THREE.AmbientLight(0xffffff, 0.3));
      scene.add(new THREE.GridHelper(50, 20));
      scene.add(createFloorPlane());
      return scene;
    };

    /**
     * 小さい球を作成する関数
     * @param {number} x - 球のx座標
     * @param {number} y - 球のy座標
     * @param {number} z - 球のz座標
     * @returns {THREE.Mesh} 作成された球
     */
    const createSmallSphere = (x: number, y: number, z: number): THREE.Mesh => {
      const sphereGeometry = new THREE.SphereGeometry(0.15, 32, 32);
      const sphereMaterial = new THREE.MeshPhongMaterial({ color: "blue" });
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      sphere.position.set(x, y, z);
      return sphere;
    };

    /**
     * GLBモデルを読み込む関数
     * @returns {Promise<ExtendedGroup>} ロードされたGLBモデルとAABBのボックス
     */
    const loadGLBModel = (): Promise<ExtendedGroup> => {
      return new Promise((resolve, reject) => {
        const loader = new GLTFLoader();
        loader.load(
          `${process.env.BASE_URL}ennchuBaoundingBox.glb`,
          (gltf) => {
            gltf.scene.traverse((child) => {
             if (child instanceof THREE.Mesh) {
               child.castShadow = true; // メッシュが影を落とすように設定
               child.receiveShadow = true; // メッシュが影を受けるように設定

               // メッシュの枠線を表示
               const edges = new THREE.EdgesGeometry(child.geometry);
               const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 'mediumseagreen' }));
               child.add(line);
             }
           });

            // モデルのスケールを5倍に変更
            gltf.scene.scale.set(5, 5, 5);

            // ロードしたモデルをExtendedGroupに追加
            const extendedGroup = new ExtendedGroup();
            extendedGroup.add(gltf.scene);
            extendedGroup.aabb.castShadow = true;
            extendedGroup.aabb.receiveShadow = true;

            resolve(extendedGroup);
          },
          undefined,
          (error) => {
            console.error("An error occurred while loading the GLB model:", error);
            reject(error);
          }
        );
      });
    };

    // アニメーションのループ処理
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      if (glbModel) {
        rotateX.value && glbModel.rotateX(0.005);
        rotateY.value && glbModel.rotateY(0.005);
        rotateZ.value && glbModel.rotateZ(0.005);
      }

      // 各小さい球とキューブのOBBとの間で衝突判定を行う
      const transformedOBB = glbModel?.getOBB() as OBB;
      scene.children.forEach((child) => {
        if (!(child instanceof THREE.Mesh) || !(child.geometry instanceof THREE.SphereGeometry)) return;

        // 衝突した場合球の色を赤に, そうでない場合は青に変更
        (child.material as THREE.MeshPhongMaterial).color.set(
          transformedOBB.containsPoint(child.position) ? "red" : "blue"
        );
      });

      renderer.render(scene, camera);
    };

    /**
     * ビューポートがリサイズされたときの処理
     */
    window.onresize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    // コンポーネントがマウントされたときの処理
    onMounted(async () => {
      // 3Dのセットアップ処理
      camera = createCamera();
      renderer = createRenderer();
      scene = createScene();

      // 平行光源のセットアップとシーンへの追加
      const directionalLight = createDirectionalLight();
      scene.add(directionalLight);

      // CameraHelperのセットアップとシーンへの追加
      cameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
      scene.add(cameraHelper);
      cameraHelper.visible = showCameraHelper.value; // CameraHelperの初期表示状態の設定

      const cubeHeight = 10;

      try {
        glbModel = await loadGLBModel();
        scene.add(glbModel);
      } catch (error) {
        console.error("An error occurred while loading the GLB model:", error);
      }

      // キューブに沿って小さい球を10x10x10個追加
      const spacing = 1.2; // 球と球の間のスペース
      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
          for (let k = 0; k < 10; k++)
            scene.add(createSmallSphere(-5 + i * spacing, -5 + j * spacing + cubeHeight / 2, -5 + k * spacing));
        }
      }

      new OrbitControls(camera, renderer.domElement); // カメラのコントロールのセットアップ
      animate(); // アニメーションの開始
    });

    // コンポーネントがアンマウントされる前の処理
    onBeforeUnmount(() => {
      cancelAnimationFrame(animationId);
    });

    // 各種表示の更新処理
    const updateWireframeVisibility = () => {
      if (!glbModel) throw 'updateWireframeVisibility: invalid glbModel';
      (glbModel.aabb.material as THREE.MeshPhongMaterial).wireframe = isWireframe.value;
    }

    const updateCameraHelperVisibility = () => (cameraHelper.visible = showCameraHelper.value);

    // キューブのローテーションをリセットする関数
    const resetRotation = () => (glbModel as THREE.Object3D).rotation.set(0, 0, 0);

    return {
      rendererDom,
      isWireframe,
      updateWireframeVisibility,
      showCameraHelper,
      updateCameraHelperVisibility,
      rotateX,
      rotateY,
      rotateZ,
      resetRotation,
    };
  },
};
</script>

<style scoped>
.toolbar {
  position: absolute;
  top: 10px;
  left: 10px;
}

.form-check {
  margin-top: 10px;
}
</style>
