<template>
  <div>
    <div ref="rendererDom" style="width: 100vw; height: 100vh;"></div>
    <div style="position: absolute; top: 10px; left: 10px;">
      <div class="form-check form-switch">
        <input class="form-check-input" type="checkbox" id="wireframeSwitch" v-model="isWireframe" @change="toggleWireframe">
        <label class="form-check-label" for="wireframeSwitch">ワイヤフレーム表示</label>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, onMounted, onBeforeUnmount, Ref, toRefs } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default {
  name: 'CubeComponent',
  setup() {
    const rendererDom: Ref<unknown> = ref(null);
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let cube: THREE.Mesh;
    let isWireframe = false;
    let animationId: number;

    onMounted(() => {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      renderer = new THREE.WebGLRenderer();
      renderer.setSize(window.innerWidth, window.innerHeight);
      (rendererDom.value as HTMLDivElement).appendChild(renderer.domElement);

      const geometry = new THREE.BoxGeometry();
      const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      cube = new THREE.Mesh(geometry, material);
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
      isWireframe = !isWireframe;
      (cube.material as THREE.MeshBasicMaterial).wireframe = isWireframe;
    };

    return {
      ...toRefs({ rendererDom, isWireframe }),
      toggleWireframe
    };
  }
};
</script>

<style scoped>
/* 必要に応じてスタイルを追加 */
</style>
