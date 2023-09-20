<template>
  <!-- メインのコンテナ -->
  <div>
    <!-- 3Dレンダリング領域 -->
    <div ref="rendererDom" style="width: 100vw; height: 100vh;"></div>
    <!-- ツールバーの配置 -->
    <div style="position: absolute; top: 10px; left: 10px;">
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
      <div class="form-check form-switch" style="margin-top: 10px;">
        <input
          class="form-check-input"
          type="checkbox"
          id="cameraHelperSwitch"
          v-model="showCameraHelper"
          @change="updateCameraHelperVisibility"
        />
        <label class="form-check-label" for="cameraHelperSwitch">CameraHelper 表示</label>
      </div>
      <!-- OBB 表示のスイッチ -->
      <div class="form-check form-switch" style="margin-top: 10px;">
        <input
          class="form-check-input"
          type="checkbox"
          id="obbSwitch"
          v-model="showOBB"
          @change="updateOBBVisibility"
        />
        <label class="form-check-label" for="obbSwitch">OBB 表示</label>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, onMounted, onBeforeUnmount, Ref } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { OBB } from 'three/examples/jsm/math/OBB';

export default {
  name: "CubeComponent",
  setup() {
    const rendererDom: Ref<unknown> = ref(null); // レンダリング領域の参照

    // 各種状態の定義
    const isWireframe = ref(true);
    const showCameraHelper = ref(false);
    const showOBB = ref(false);

    const obb = new OBB();

    let animationId: number;
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let cameraHelper: THREE.CameraHelper;
    let cube: THREE.Mesh;
    let obbHelper: THREE.BoxHelper;

    // 平行光源の作成
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

    // カメラの作成
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
      scene.add(new THREE.AmbientLight(0xffffff, 0.1));
      scene.add(new THREE.GridHelper(50, 20));
      scene.add(createFloorPlane());
      return scene;
    };

    // 小さい球を作成する関数
    const createSmallSphere = (x: number, y: number, z: number): THREE.Mesh => {
      const sphereGeometry = new THREE.SphereGeometry(0.15, 32, 32);
      const sphereMaterial = new THREE.MeshPhongMaterial({ color: "blue" });
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      sphere.position.set(x, y, z);
      sphere.castShadow = true;
      return sphere;
    };

    // アニメーションのループ処理
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      // 各小さい球とキューブのOBBとの間で衝突判定を行う
      const transformedOBB = obb.clone().applyMatrix4(cube.matrixWorld);
      scene.children.forEach(child => {
        if (child instanceof THREE.Mesh && child.geometry instanceof THREE.SphereGeometry) {
          const sphere = new THREE.Sphere();
          child.geometry.computeBoundingSphere();
          sphere.copy(child.geometry.boundingSphere!);
          sphere.applyMatrix4(child.matrixWorld);

          if (transformedOBB.intersectsSphere(sphere)) {
            (child.material as THREE.MeshPhongMaterial).color.set(0xff0000); // 衝突した場合、球の色を赤に変更
          } else {
            (child.material as THREE.MeshPhongMaterial).color.set(0x0000ff); // 衝突していない場合、球の色を青に戻す
          }
        }
      });

      renderer.render(scene, camera);
    };

    // コンポーネントがマウントされたときの処理
    onMounted(() => {
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

      // キューブのセットアップとシーンへの追加
      cube = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), new THREE.MeshPhongMaterial({ color: "springgreen" }));
      cube.castShadow = true;

      const cubeHeight = (cube.geometry as THREE.BoxGeometry).parameters.height;
      cube.position.y = cubeHeight / 2;
      updateWireframeVisibility();
      scene.add(cube);

      // キューブのOBBの計算とヘルパーの追加
      cube.geometry.computeBoundingBox();
      obb.fromBox3(cube.geometry.boundingBox as THREE.Box3);
      obbHelper = new THREE.BoxHelper(cube, 0xff0000); // 赤色でOBBを表示
      obbHelper.visible = showOBB.value;
      scene.add(obbHelper);

      // キューブに沿って小さい球を10x10x10個追加
      const spacing = 1.2; // 球と球の間のスペース
      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
          for (let k = 0; k < 10; k++) {
            const sphere = createSmallSphere(
              -5 + i * spacing,
              -5 + j * spacing + cubeHeight / 2,
              -5 + k * spacing
            );
            scene.add(sphere);
          }
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
    const updateWireframeVisibility = () => ((cube.material as THREE.MeshPhongMaterial).wireframe = isWireframe.value);
    const updateCameraHelperVisibility = () => (cameraHelper.visible = showCameraHelper.value);
    const updateOBBVisibility = () => (obbHelper.visible = showOBB.value);

    return {
      rendererDom,
      isWireframe,
      updateWireframeVisibility,
      showCameraHelper,
      updateCameraHelperVisibility,
      showOBB,
      updateOBBVisibility,
    };
  },
};
</script>

<style scoped>
/* 必要に応じてスタイルを追加 */
</style>
