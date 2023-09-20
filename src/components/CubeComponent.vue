<template>
  <div>
    <div ref="rendererDom" style="width: 100vw; height: 100vh;"></div>
    <div style="position: absolute; top: 10px; left: 10px;">
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

export default {
  name: "CubeComponent",
  setup() {
    const rendererDom: Ref<unknown> = ref(null);
    const isWireframe = ref(false);
    const showCameraHelper = ref(true);
    const showOBB = ref(false);
    let animationId: number;
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let cameraHelper: THREE.CameraHelper;
    let cube: THREE.Mesh;
    let obbHelper: THREE.BoxHelper;

    const createDirectionalLight = () => {
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(20, 20, 20); // 光の位置を設定
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 4096;
      directionalLight.shadow.mapSize.height = 4096;
      directionalLight.shadow.camera.left = -5;
      directionalLight.shadow.camera.right = 5;
      directionalLight.shadow.camera.top = 5;
      directionalLight.shadow.camera.bottom = -5;
      directionalLight.shadow.camera.far = 40;
      return directionalLight;
    };

    const createCamera = () => {
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(5, 5, -5);
      return camera;
    };

    const createRenderer = () => {
      const renderer = new THREE.WebGLRenderer();
      renderer.setSize(window.innerWidth, window.innerHeight);
      (rendererDom.value as HTMLDivElement).appendChild(renderer.domElement);
      renderer.shadowMap.enabled = true;
      renderer.setClearColor("lightsteelblue");
      return renderer;
    };

    const createPlane = (): THREE.Mesh => {
      const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(10, 10),
        new THREE.MeshLambertMaterial({ color: "darkgreen", side: THREE.DoubleSide })
      );
      plane.position.y = -0.1;
      plane.rotateX(Math.PI / 2);
      plane.receiveShadow = true;
      return plane;
    };

    const createScene = () => {
      const scene = new THREE.Scene();
      scene.add(new THREE.AmbientLight(0xffffff, 0.5));
      scene.add(new THREE.GridHelper(20, 20));
      scene.add(createPlane());
      return scene;
    };

    onMounted(() => {
      camera = createCamera();
      renderer = createRenderer();
      scene = createScene();

      const directionalLight = createDirectionalLight();
      scene.add(directionalLight);
      cameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
      scene.add(cameraHelper);
      cameraHelper.visible = showCameraHelper.value;

      scene.add(new THREE.GridHelper(20, 20));
      scene.add(createPlane());

      cube = new THREE.Mesh(new THREE.BoxGeometry(5, 5, 5), new THREE.MeshPhongMaterial({ color: "springgreen" }));
      cube.castShadow = true;
      cube.position.y = (cube.geometry as THREE.BoxGeometry).parameters.height / 2;
      scene.add(cube);

      // OBBの計算とヘルパーの追加
      new THREE.Box3().setFromObject(cube);
      obbHelper = new THREE.BoxHelper(cube, 0xff0000); // 赤色でOBBを表示
      obbHelper.visible = showOBB.value;
      scene.add(obbHelper);

      new OrbitControls(camera, renderer.domElement);

      animate();
    });

    onBeforeUnmount(() => {
      cancelAnimationFrame(animationId);
    });

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };

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
