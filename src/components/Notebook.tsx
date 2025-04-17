import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useDeskContext } from '../contexts/UseDeskContext.tsx';
import { NotebookAnimationType } from '../utils/Animations.tsx';

// page constants 
const PAGE_ASPECT_RATIO = Math.sqrt(2); // a4 
const PAGE_WIDTH = 7; // in units
const LEFT_PAGE_TOP_LEFT = new THREE.Vector3(-7.5, 0, -3.5);
const RIGHT_PAGE_TOP_LEFT = new THREE.Vector3(0.5, 0, -3.5);
const PAGE_FLIP_AXIS = 0; // z direction

// animation constants 

interface NotebookProps {
  pageCount: number;
  pageXResolution: number;
  pageYResolution: number;
}

const Notebook: React.FC<NotebookProps> = (props: NotebookProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { pushNotebookAnimationEventQueue, popNotebookAnimationEventQueue } = useDeskContext();

  const generateLeftPageMeshes = (): THREE.Mesh[] => {
    let meshes = [];
    for (let i = 0; i < props.pageXResolution; i++) {
      for (let j = 0; j < props.pageYResolution; j++) {
        const geometry = new THREE.BoxGeometry(PAGE_WIDTH / props.pageXResolution, 0.1,
          PAGE_WIDTH * PAGE_ASPECT_RATIO / props.pageYResolution);
        const material = new THREE.MeshBasicMaterial({ color: 'white' });

        // left page 
        const leftMesh = new THREE.Mesh(geometry, material);
        leftMesh.position.set(
          LEFT_PAGE_TOP_LEFT.x + (i * PAGE_WIDTH) / props.pageXResolution + PAGE_WIDTH / (props.pageXResolution * 2),
          0,
          LEFT_PAGE_TOP_LEFT.z + (j * PAGE_WIDTH * PAGE_ASPECT_RATIO) / props.pageYResolution + (PAGE_WIDTH * PAGE_ASPECT_RATIO) / (props.pageYResolution * 2)
        );

        material.color.set(Math.random() * 0xffffff); // Random color for each page

        meshes.push(leftMesh);
      }
    }

    return meshes;
  };

  const generateRightPageMeshes = (): THREE.Mesh[] => {
    let meshes = [];
    for (let i = 0; i < props.pageXResolution; i++) {
      for (let j = 0; j < props.pageYResolution; j++) {
        const geometry = new THREE.BoxGeometry(PAGE_WIDTH / props.pageXResolution, 0.1,
          PAGE_WIDTH * PAGE_ASPECT_RATIO / props.pageYResolution);
        const material = new THREE.MeshBasicMaterial({ color: 'white' });

        // right page 
        const rightMesh = new THREE.Mesh(geometry, material);
        rightMesh.position.set(
          RIGHT_PAGE_TOP_LEFT.x + (i * PAGE_WIDTH) / props.pageXResolution + PAGE_WIDTH / (props.pageXResolution * 2),
          0,
          RIGHT_PAGE_TOP_LEFT.z + (j * PAGE_WIDTH * PAGE_ASPECT_RATIO) / props.pageYResolution + (PAGE_WIDTH * PAGE_ASPECT_RATIO) / (props.pageYResolution * 2)
        );

        material.color.set(Math.random() * 0xffffff); // Random color for each page

        meshes.push(rightMesh);
      }
    }

    return meshes;
  }

  // moving from right to left
  const forwardFlipAnimation = (meshes: THREE.Mesh[], elapsedDuration: number, totalDuration: number) => {
    const flipAngle = Math.PI; // 180 degrees

    meshes.forEach((mesh) => {
      const progress = Math.min(elapsedDuration / totalDuration, 1);
      const angle = flipAngle * progress;
      mesh.rotation.z = angle; // Rotate around the Y-axis
    });
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 10, 0); // Position the camera above the boxes
    camera.lookAt(0, 0, 0); // Point the camera at the center of the scene

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const leftPageMeshes = generateLeftPageMeshes();
    const rightPageMeshes = generateRightPageMeshes();

    leftPageMeshes.forEach((mesh) => {
      scene.add(mesh);
    });

    rightPageMeshes.forEach((mesh) => {
      scene.add(mesh);
    });

    // Add a light source (optional)
    const light = new THREE.AmbientLight(0xffffff); // Soft white light
    scene.add(light);

    // Animation loop
    let currentAnimationEvent: NotebookAnimationEvent | undefined = undefined;
    let lastTimestamp: number = performance.now();

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
      console.log("currentAnimationEvent", currentAnimationEvent);

      // every animate call, calculate the time elapsed since the last frame 
      // add that to the elapsed duration of the current animation event 
      // if goes over, then cap to max, and then call the animate function and then move to the next animation event  
      if (!currentAnimationEvent) {
        currentAnimationEvent = popNotebookAnimationEventQueue();
        if (currentAnimationEvent) {
          console.log('popping off queue')
          currentAnimationEvent.elapsedDuration = 0;
        }

        lastTimestamp = performance.now();
        return;
      }

      const currentTimestamp = performance.now();
      const lastFrameDuration = currentTimestamp - lastTimestamp;
      lastTimestamp = currentTimestamp;

      currentAnimationEvent.elapsedDuration += lastFrameDuration;
      currentAnimationEvent.elapsedDuration = Math.min(currentAnimationEvent.elapsedDuration, currentAnimationEvent.duration);

      switch (currentAnimationEvent.animationType) {
        case 'FORWARD_FLIP':
          forwardFlipAnimation(rightPageMeshes, currentAnimationEvent.elapsedDuration, currentAnimationEvent.duration);
          break;
        case 'BACKWARD_FLIP':
          // TODO: implement backward flip
          break;
        default:
          break;
      }

      if (currentAnimationEvent.elapsedDuration >= currentAnimationEvent.duration) {
        currentAnimationEvent = undefined;
      }
    };

    animate();

    // Clean up when the component unmounts
    return () => {
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div ref={containerRef} style={{ width: '100vw', height: '100vh' }}>
      <button onClick={() => {
        pushNotebookAnimationEventQueue({
          duration: 1000,
          elapsedDuration: 0,
          animationType: NotebookAnimationType.ForwardFlip
        })
      }}>Flip</button>
    </div>
  );
};

export default Notebook;
