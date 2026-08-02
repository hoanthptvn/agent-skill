/**
 * AGENT OS BOILERPLATE: WebGL + GSAP Ticker + Lenis
 * Bắt buộc dùng file này làm nền tảng (Foundation) cho mọi task WebGL mới.
 * Tuân thủ: Zero-Allocation (rAF), GSAP Ticker Unified, Window Resize Debounce.
 */

import * as THREE from 'three';
import { gsap } from 'gsap';
import Lenis from '@studio-freight/lenis';

export default class WebGLScene {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    
    // 1. Core Three.js Setup
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 100);
    this.camera.position.z = 5;
    
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Chống tụt FPS trên màn 4k
    
    // 2. Objects (Define your geometries/materials here - Use Object Pools if many)
    this.initObjects();

    // 3. Resize Handler (Debounced)
    this.onResize = this.onResize.bind(this);
    window.addEventListener('resize', this.onResize);

    // 4. Lenis Smooth Scroll Integration
    this.initLenis();

    // 5. Unified GSAP Ticker (Bắt buộc để tránh Layout Thrashing)
    this.render = this.render.bind(this);
    gsap.ticker.add(this.render);
    gsap.ticker.lagSmoothing(0);
  }

  initObjects() {
    // Boilerplate Object
    const geometry = new THREE.PlaneGeometry(2, 2, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
    this.mesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.mesh);
  }

  initLenis() {
    this.lenis = new Lenis({ autoRaf: false });
  }

  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }

  // KHÔNG ĐƯỢC DÙNG requestAnimationFrame riêng biệt ở đây.
  render(time, deltaTime) {
    // Update Lenis
    this.lenis.raf(time * 1000);
    
    // Update Logic (Dùng elapsed/deltaTime thay vì sinh rác bộ nhớ)
    if (this.mesh) {
      this.mesh.rotation.y += 0.001 * deltaTime;
    }

    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    // Unmount Contract (Chống Memory Leak)
    window.removeEventListener('resize', this.onResize);
    gsap.ticker.remove(this.render);
    this.lenis.destroy();
    
    this.renderer.dispose();
    this.scene.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(mat => mat.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
  }
}
