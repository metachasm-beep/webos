<script>
  import { Parallax, ParallaxLayer } from 'svelte-parallax';
  import { Canvas } from '@threlte/core';
  import { T } from '@threlte/core';
  import { OrbitControls } from '@threlte/extras';
</script>

<div class="fixed inset-0 z-[-1] overflow-hidden bg-[#050505]">
  <Parallax>
    <!-- Background Stars / Particles -->
    <ParallaxLayer rate={0.1} class="opacity-30">
        <div class="absolute top-20 left-1/4 w-1 h-1 bg-primary rounded-full blur-[1px]" />
        <div class="absolute top-80 right-1/4 w-1 h-1 bg-primary rounded-full blur-[1px]" />
    </ParallaxLayer>

    <!-- Midground: Threlte Canvas -->
    <ParallaxLayer rate={0.3}>
      <div class="h-full w-full opacity-20">
        <Canvas>
          <T.PerspectiveCamera makeDefault position={[0, 0, 5]}>
            <OrbitControls enableZoom={false} autoRotate />
          </T.PerspectiveCamera>
          
          <T.DirectionalLight position={[10, 10, 10]} />
          <T.AmbientLight intensity={0.5} />

          <T.Mesh rotation.x={0.5}>
            <T.IcosahedronGeometry args={[2, 1]} />
            <T.MeshStandardMaterial color="#3b82f6" wireframe />
          </T.Mesh>
        </Canvas>
      </div>
    </ParallaxLayer>

    <!-- Foreground Gradient Overlay -->
    <ParallaxLayer rate={0.5} class="pointer-events-none">
      <div class="h-full w-full bg-gradient-to-b from-transparent via-black/20 to-black" />
    </ParallaxLayer>
  </Parallax>
</div>

<style>
  :global(.parallax-container) {
    height: 100vh !important;
  }
</style>
