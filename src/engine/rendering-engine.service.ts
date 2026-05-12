import { Injectable, ElementRef } from '@angular/core';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root'
})
export class RenderingEngine {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer | null = null;
  private particles: THREE.Points | null = null;

  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    this.camera.position.z = 2;
  }

  init(container: ElementRef): void {
    if (this.renderer) return;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(container.nativeElement.clientWidth, container.nativeElement.clientHeight);
    container.nativeElement.appendChild(this.renderer.domElement);

    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    for (let i = 0; i < 5000; i++) {
      vertices.push(THREE.MathUtils.randFloatSpread(10)); // x
      vertices.push(THREE.MathUtils.randFloatSpread(10)); // y
      vertices.push(THREE.MathUtils.randFloatSpread(10)); // z
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    const material = new THREE.PointsMaterial({
      color: 0xF59E0B,
      size: 0.02,
      transparent: true,
      opacity: 0.5
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);

    this.animate();
  }

  private animate(): void {
    if (!this.renderer || !this.particles) return;
    requestAnimationFrame(() => this.animate());

    this.particles.rotation.y += 0.001;
    this.particles.rotation.x += 0.0005;

    this.renderer.render(this.scene, this.camera);
  }

  updateSize(width: number, height: number): void {
    if (!this.renderer) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
}
