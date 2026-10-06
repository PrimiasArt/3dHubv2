import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ThreeMFLoader } from 'three/examples/jsm/loaders/3MFLoader.js';

export interface ILoadedCustomModel {
  group: THREE.Group;
  dimensionsMm: { x: number; y: number; z: number };
  originalDimensionsMm: { x: number; y: number; z: number };
  volumeCm3: number;
  triangleCount: number;
  fileName: string;
  fileSizeBytes: number;
  height: number;
}

export class CustomModelLoader {
  /**
   * Tính toán thể tích chính xác của geometry theo công thức phân kỳ Gauss (Signed Volume of Tetrahedra)
   */
  static calculateVolume(geometry: THREE.BufferGeometry): number {
    const position = geometry.attributes.position;
    if (!position) return 0;

    const index = geometry.index;
    const faces = index ? index.count / 3 : position.count / 3;
    let totalVolume = 0;

    const p1 = new THREE.Vector3();
    const p2 = new THREE.Vector3();
    const p3 = new THREE.Vector3();

    for (let i = 0; i < faces; i++) {
      const i1 = index ? index.getX(i * 3) : i * 3;
      const i2 = index ? index.getX(i * 3 + 1) : i * 3 + 1;
      const i3 = index ? index.getX(i * 3 + 2) : i * 3 + 2;

      p1.fromBufferAttribute(position, i1);
      p2.fromBufferAttribute(position, i2);
      p3.fromBufferAttribute(position, i3);

      totalVolume += p1.dot(p2.clone().cross(p3)) / 6.0;
    }

    return Math.abs(totalVolume) / 1000.0;
  }

  /**
   * Tải và xử lý file 3D từ máy tính người dùng (.stl, .obj, .glb, .gltf, .3mf)
   * Tự động chuyển đổi hệ tọa độ chuẩn in 3D (Z-up) sang Three.js (Y-up) để mô hình luôn nằm phẳng trên bàn in.
   */
  static async loadFromFile(file: File, material: THREE.Material): Promise<ILoadedCustomModel> {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const arrayBuffer = await file.arrayBuffer();

    let rootGroup = new THREE.Group();
    let totalTriangles = 0;
    let calculatedVolume = 0;

    if (ext === 'stl') {
      const loader = new STLLoader();
      const geometry = loader.parse(arrayBuffer);
      geometry.computeVertexNormals();

      // Trong chuẩn in 3D (STL/3MF), trục Z là trục thẳng đứng vuông góc bàn in (Z-up).
      // Trong Three.js, trục Y là trục thẳng đứng hướng lên (Y-up).
      // Quay -90 độ quanh trục X để chuyển tọa độ Z-up sang Y-up, giúp mô hình nằm phẳng đúng thiết kế gốc!
      geometry.rotateX(-Math.PI / 2);

      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      rootGroup.add(mesh);

      totalTriangles = geometry.attributes.position.count / 3;
      calculatedVolume = this.calculateVolume(geometry);
    } else if (ext === 'obj') {
      const text = new TextDecoder().decode(arrayBuffer);
      const loader = new OBJLoader();
      const obj = loader.parse(text);

      obj.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const m = child as THREE.Mesh;
          m.material = material;
          m.castShadow = true;
          m.receiveShadow = true;
          if (m.geometry) {
            // Chuẩn hóa OBJ từ Z-up sang Y-up
            m.geometry.rotateX(-Math.PI / 2);
            totalTriangles += m.geometry.attributes.position.count / 3;
            calculatedVolume += this.calculateVolume(m.geometry);
          }
        }
      });
      rootGroup = obj;
    } else if (ext === 'glb' || ext === 'gltf') {
      const loader = new GLTFLoader();
      const gltf = await new Promise<any>((resolve, reject) => {
        loader.parse(arrayBuffer, '', resolve, reject);
      });

      gltf.scene.traverse((child: any) => {
        if (child.isMesh) {
          child.material = material;
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.geometry) {
            totalTriangles += child.geometry.attributes.position.count / 3;
            calculatedVolume += this.calculateVolume(child.geometry);
          }
        }
      });
      rootGroup = gltf.scene;
    } else if (ext === '3mf') {
      const loader = new ThreeMFLoader();
      const group3mf = loader.parse(arrayBuffer);

      // Chuẩn 3MF cũng dùng Z-up, xoay -90 độ quanh X sang Y-up
      group3mf.rotation.x = -Math.PI / 2;

      group3mf.traverse((child: any) => {
        if (child.isMesh) {
          child.material = material;
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.geometry) {
            totalTriangles += child.geometry.attributes.position.count / 3;
            calculatedVolume += this.calculateVolume(child.geometry);
          }
        }
      });
      rootGroup = group3mf;
    } else {
      throw new Error(`Định dạng .${ext} không được hỗ trợ. Vui lòng chọn .STL, .OBJ, .GLB, hoặc .3MF`);
    }

    // 1. Tính toán bounding box thực tế của mô hình (mm)
    rootGroup.updateMatrixWorld(true);
    let box = new THREE.Box3().setFromObject(rootGroup);
    let size = new THREE.Vector3();
    box.getSize(size);
    let center = new THREE.Vector3();
    box.getCenter(center);

    // Xử lý đơn vị nếu file xuất theo Mét (< 2mm ở cả 3 chiều)
    if (size.y < 2.0 && size.x < 2.0 && size.z < 2.0) {
      const unitMultiplier = 1000.0;
      rootGroup.scale.multiplyScalar(unitMultiplier);
      rootGroup.updateMatrixWorld(true);
      box.setFromObject(rootGroup);
      box.getSize(size);
      box.getCenter(center);
      calculatedVolume *= 1000000;
    }

    // 2. Thuật toán tự động áp phẳng bàn in (Auto Lay-Flat):
    // Đối với các chi tiết phẳng hoặc bánh răng (đĩa, plate, gear):
    // Trục mỏng nhất phải luôn là trục Y (thẳng đứng, hướng vuông góc với bàn in)
    if (size.z < size.y * 0.45 && size.z < size.x * 0.45) {
      // Chiều Z mỏng nhất -> xoay 90° quanh X để Z thành chiều cao Y (nằm bẹp xuống bàn)
      rootGroup.rotation.x += Math.PI / 2;
      rootGroup.updateMatrixWorld(true);
      box.setFromObject(rootGroup);
      box.getSize(size);
      box.getCenter(center);
    } else if (size.x < size.y * 0.45 && size.x < size.z * 0.45) {
      // Chiều X mỏng nhất -> xoay 90° quanh Z để X thành chiều cao Y
      rootGroup.rotation.z += Math.PI / 2;
      rootGroup.updateMatrixWorld(true);
      box.setFromObject(rootGroup);
      box.getSize(size);
      box.getCenter(center);
    }

    // Kích thước thực tế ban đầu (mm)
    // Three.js X = Slicer X (Rộng)
    // Three.js Y = Slicer Z (Cao vuông góc bàn in)
    // Three.js Z = Slicer Y (Sâu)
    const realX = Math.max(1, Math.round(size.x * 10) / 10);
    const realY = Math.max(1, Math.round(size.z * 10) / 10); // Slicer Y là chiều sâu
    const realZ = Math.max(1, Math.round(size.y * 10) / 10); // Slicer Z là chiều cao

    // 3. Chuẩn hóa tỷ lệ hiển thị trên 3D Studio Canvas (khung nhìn tiêu chuẩn ~ 2.0 đơn vị Three.js)
    const maxDim = Math.max(size.x, size.y, size.z, 0.001);
    const displayScale = 2.0 / maxDim;

    rootGroup.scale.multiplyScalar(displayScale);
    rootGroup.updateMatrixWorld(true);

    const scaledBox = new THREE.Box3().setFromObject(rootGroup);
    const scaledCenter = new THREE.Vector3();
    scaledBox.getCenter(scaledCenter);

    // Căn giữa trục X, Z và đặt đáy tiếp xúc mặt phẳng Y = 0
    rootGroup.position.x -= scaledCenter.x;
    rootGroup.position.z -= scaledCenter.z;
    rootGroup.position.y -= scaledBox.min.y;

    // Đóng gói vào wrapper group độc lập với transform chuẩn sạch
    const finalContainer = new THREE.Group();
    finalContainer.add(rootGroup);
    finalContainer.updateMatrixWorld(true);

    const finalBox = new THREE.Box3().setFromObject(finalContainer);
    const finalHeight = Math.max(0.05, finalBox.max.y - finalBox.min.y);

    const initialDims = {
      x: Math.round(realX),
      y: Math.round(realY),
      z: Math.round(realZ),
    };

    return {
      group: finalContainer,
      dimensionsMm: initialDims,
      originalDimensionsMm: initialDims,
      volumeCm3: Math.max(0.1, Math.round(calculatedVolume * 10) / 10),
      triangleCount: Math.round(totalTriangles),
      fileName: file.name,
      fileSizeBytes: file.size,
      height: finalHeight,
    };
  }
}
