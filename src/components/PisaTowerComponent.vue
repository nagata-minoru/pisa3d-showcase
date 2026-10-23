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

      <!-- 立方体の追加ボタン -->
      <div class="form-check">
        <button @click="addCube" class="btn btn-primary">立方体を追加</button>
      </div>

      <!-- 追加した立方体の削除ボタン -->
      <div class="form-check">
        <button @click="removeCubes" class="btn btn-secondary" :disabled="cubeCount === 0">
          追加した立方体を削除（{{ cubeCount }}）
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// VueとThree.jsのインポート
import { ref, onMounted, onBeforeUnmount, Ref } from "vue";
import * as THREE from "three";

// OrbitControlsとGLTFLoaderをインポート
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// AABB・OBB付きのグループ
import { ExtendedGroup } from "../ExtendedGroup";
import { createCube } from "../createCube";

/**
 * PisaTowerComponent - 3Dのピサの斜塔を表示するVueコンポーネント
 */
export default {
  name: "PisaTowerComponent",
  setup() {
    const rendererDom: Ref<unknown> = ref(null); // レンダリング領域の参照

    // ワイヤフレームとカメラヘルパーの表示状態
    const isWireframe = ref(true);
    const showCameraHelper = ref(false);

    // X, Y, Z軸での回転の状態を管理するリアクティブ変数
    const rotateX = ref(false);
    const rotateY = ref(false);
    const rotateZ = ref(false);

    // その他の変数と初期化処理
    let animationId: number;
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let cameraHelper: THREE.CameraHelper;
    let glbModel: ExtendedGroup | null = null; // GLBモデルの参照を保存する変数
    const cubes: ExtendedGroup[] = []; // 「立方体を追加」で追加した立方体
    const cubeCount = ref(0); // 追加した立方体の数（削除ボタンの表示用）

    /**
     * 回転・衝突判定・ワイヤフレーム表示の対象（GLBモデルと追加した立方体）を返す。
     * @returns {ExtendedGroup[]} 対象のグループ。GLBモデルの読み込みに失敗した場合は立方体だけ。
     */
    const targets = () => (glbModel ? [glbModel, ...cubes] : cubes);

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
          `${import.meta.env.BASE_URL}target.glb`,
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

            // // モデルのスケールを5倍に変更
            // gltf.scene.scale.set(5, 5, 5);

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

      targets().forEach((target) => {
        rotateX.value && target.rotateX(0.005);
        rotateY.value && target.rotateY(0.005);
        rotateZ.value && target.rotateZ(0.005);
      });

      // 各小さい球と、GLBモデル・立方体のOBBとの間で衝突判定を行う
      // （対象がない場合はすべて青になる）
      const transformedOBBs = targets().map((target) => target.getOBB());
      scene.children.forEach((child) => {
        if (!(child instanceof THREE.Mesh) || !(child.geometry instanceof THREE.SphereGeometry)) return;

        // いずれかのOBBの内側にある場合は球の色を赤に, そうでない場合は青に変更
        const hit = transformedOBBs.some((obb) => obb.containsPoint(child.position));
        (child.material as THREE.MeshPhongMaterial).color.set(hit ? "red" : "blue");
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

    /**
     * ワイヤフレームの表示を更新します。
     */
    const updateWireframeVisibility = () => {
      targets().forEach((target) => {
        (target.aabb.material as THREE.MeshPhongMaterial).wireframe = isWireframe.value;
      });
    }

    /**
     * CameraHelperの表示を更新します。
     */
    const updateCameraHelperVisibility = () => (cameraHelper.visible = showCameraHelper.value);

    // GLBモデルと立方体のローテーションをリセットする関数
    const resetRotation = () => targets().forEach((target) => target.rotation.set(0, 0, 0));

    /**
     * 球を並べた範囲の中に、ランダムなサイズ・位置・色の立方体を追加します。
     */
    const addCube = () => {
      const size = THREE.MathUtils.randFloat(1.5, 3);
      const position = new THREE.Vector3(
        THREE.MathUtils.randFloat(-4, 4.8),
        THREE.MathUtils.randFloat(1, 9.8),
        THREE.MathUtils.randFloat(-4, 4.8)
      );
      const color = new THREE.Color().setHSL(Math.random(), 0.7, 0.5);

      const cube = createCube(size, position, color);
      (cube.aabb.material as THREE.MeshPhongMaterial).wireframe = isWireframe.value;
      scene.add(cube);
      cubes.push(cube);
      cubeCount.value = cubes.length;
    };

    /**
     * 追加した立方体をすべて削除します（GLBモデルは残します）。
     */
    const removeCubes = () => {
      cubes.forEach((cube) => {
        scene.remove(cube);
        cube.traverse((child) => {
          if (!(child instanceof THREE.Mesh)) return;

          child.geometry.dispose();
          (child.material as THREE.Material).dispose();
        });
      });
      cubes.length = 0;
      cubeCount.value = 0;
    };

    return {
      // レンダリング用のDOM要素と状態変数を返す
      rendererDom,
      isWireframe,
      updateWireframeVisibility,
      showCameraHelper,
      updateCameraHelperVisibility,
      rotateX,
      rotateY,
      rotateZ,
      resetRotation,
      addCube,
      removeCubes,
      cubeCount,
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
