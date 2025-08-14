import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { GLView } from 'expo-gl';
import * as THREE from 'three';
import { Renderer } from 'expo-three';
// @ts-ignore - GLTFLoader path from three examples
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

type Props = { meshUrl?: string; overlay?: any };

export default function OverlayViewer3D({ meshUrl, overlay }: Props) {
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <View style={styles.container}>
      <GLView
        style={{ flex: 1 }}
        onContextCreate={async (gl) => {
          const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;
          const renderer = new Renderer({ gl });
          renderer.setSize(width, height);

          const scene = new THREE.Scene();
          scene.background = new THREE.Color(0x111111);
          const camera = new THREE.PerspectiveCamera(70, width / height, 0.01, 1000);
          camera.position.set(0, 2, 4);

          const ambient = new THREE.AmbientLight(0xffffff, 0.6);
          scene.add(ambient);
          const light = new THREE.DirectionalLight(0xffffff, 0.8);
          light.position.set(3, 5, 7);
          scene.add(light);

          let root: THREE.Object3D | null = null;
          if (meshUrl) {
            try {
              const loader = new GLTFLoader();
              const gltf = await loader.loadAsync(meshUrl);
              root = gltf.scene;
              scene.add(root);
            } catch (_e) { /* ignore mesh load errors */ }
          }

          if (!root) {
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshPhongMaterial({ color: 0x156289, emissive: 0x072534, flatShading: true });
            const cube = new THREE.Mesh(geometry, material);
            scene.add(cube);
            root = cube;
          }

          // Overlay: draw crack lines
          if (overlay?.cracks?.length) {
            const crackMaterial = new THREE.LineBasicMaterial({ color: 0xff3333 });
            overlay.cracks.forEach((c: any) => {
              if (Array.isArray(c.coordinates) && c.coordinates.length >= 2) {
                const points = c.coordinates.map((p: any) => new THREE.Vector3(p.x, p.y, p.z ?? 0));
                const geometry = new THREE.BufferGeometry().setFromPoints(points);
                const line = new THREE.Line(geometry, crackMaterial);
                scene.add(line);
              }
            });
          }

          // Overlay: draw distress polygons (e.g., gatoring)
          if (overlay?.distress_zones?.length) {
            overlay.distress_zones.forEach((zone: any) => {
              const color = zone.type === 'gatoring' ? 0xffaa00 : 0xffff00;
              const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.35, side: THREE.DoubleSide });
              const shape = new THREE.Shape();
              const vertices = zone.polygon || [];
              if (vertices.length >= 3) {
                shape.moveTo(vertices[0].x, vertices[0].y);
                for (let i = 1; i < vertices.length; i++) {
                  shape.lineTo(vertices[i].x, vertices[i].y);
                }
                const geometry = new THREE.ShapeGeometry(shape);
                const mesh = new THREE.Mesh(geometry, material);
                mesh.position.z = vertices[0].z ?? 0.01; // slightly above ground
                scene.add(mesh);
              }
            });
          }

          // Overlay: slope vectors as arrows
          if (overlay?.slope_analysis?.slope_vectors?.length) {
            const arrowColor = 0x33aaff;
            overlay.slope_analysis.slope_vectors.forEach((vec: any) => {
              const start = new THREE.Vector3(vec.start.x, vec.start.y, vec.start.z ?? 0);
              const end = new THREE.Vector3(vec.end.x, vec.end.y, vec.end.z ?? 0);
              const dir = new THREE.Vector3().subVectors(end, start).normalize();
              const length = start.distanceTo(end);
              const arrow = new THREE.ArrowHelper(dir, start, length, arrowColor, 0.1, 0.05);
              scene.add(arrow);
            });
          }

          const animate = () => {
            requestRef.current = requestAnimationFrame(animate);
            if (root) {
              root.rotation.y += 0.003;
            }
            renderer.render(scene, camera);
            gl.endFrameEXP();
          };
          animate();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 300,
    backgroundColor: '#000',
  },
});