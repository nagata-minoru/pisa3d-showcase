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
          @change="toggleWireframe"
        />
        <label class="form-check-label" for="wireframeSwitch">ワイヤフレーム表示</label>
      </div>
      <div class="form-check form-switch" style="margin-top: 10px;">
        <input
          class="form-check-input"
          type="checkbox"
          id="cameraHelperSwitch"
          v-model="showCameraHelper"
          @change="toggleCameraHelper"
        />
        <label class="form-check-label" for="cameraHelperSwitch">CameraHelper 表示</label>
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
    const showCameraHelper = ref(false);
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let cube: THREE.Mesh;
    let animationId: number;
    let cameraHelper: THREE.CameraHelper;

    onMounted(() => {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      renderer = new THREE.WebGLRenderer();
      renderer.setSize(window.innerWidth, window.innerHeight);
      (rendererDom.value as HTMLDivElement).appendChild(renderer.domElement);
      renderer.shadowMap.enabled = true;

      scene.add(new THREE.AmbientLight(0xffffff, 0.5));

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(1, 1, 1); // 光の位置を設定
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 4096;
      directionalLight.shadow.mapSize.height = 4096;
      directionalLight.shadow.camera.left = -5;
      directionalLight.shadow.camera.right = 5;
      directionalLight.shadow.camera.top = 5;
      directionalLight.shadow.camera.bottom = -5;
      directionalLight.shadow.camera.far = 10;
      scene.add(directionalLight);

      cameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
      scene.add(cameraHelper);
      cameraHelper.visible = showCameraHelper.value;

      scene.add(createPlane());

      cube = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshPhongMaterial({ color: 0x00ff00 }));
      cube.castShadow = true;
      scene.add(cube);

      camera.position.z = 5;

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

    const toggleWireframe = () => {
      isWireframe.value = !isWireframe.value;
      (cube.material as THREE.MeshPhongMaterial).wireframe = isWireframe.value;
    };

    const toggleCameraHelper = () => {
      cameraHelper.visible = !cameraHelper.visible;
    };

    const createPlane = (): THREE.Mesh => {
      const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(10, 10),
        new THREE.MeshLambertMaterial({ color: 0x0096d6, side: THREE.DoubleSide })
      );
      plane.position.y = -2;
      plane.rotateX(Math.PI / 2);
      plane.receiveShadow = true;
      return plane;
    };

    return { rendererDom, isWireframe, toggleWireframe, showCameraHelper, toggleCameraHelper };
  },
};
</script>

<style scoped>
/* 必要に応じてスタイルを追加 */
</style>
