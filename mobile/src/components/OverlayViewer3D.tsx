import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { GLView } from 'expo-gl';
import * as THREE from 'three';
import { Renderer } from 'expo-three';

export default function OverlayViewer3D() {
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
          const camera = new THREE.PerspectiveCamera(70, width / height, 0.01, 1000);
          camera.position.z = 2.2;

          const light = new THREE.DirectionalLight(0xffffff, 1);
          light.position.set(3, 3, 5);
          scene.add(light);

          const geometry = new THREE.BoxGeometry(1, 1, 1);
          const material = new THREE.MeshPhongMaterial({ color: 0x156289, emissive: 0x072534, flatShading: true });
          const cube = new THREE.Mesh(geometry, material);
          scene.add(cube);

          const animate = () => {
            requestRef.current = requestAnimationFrame(animate);
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.02;
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