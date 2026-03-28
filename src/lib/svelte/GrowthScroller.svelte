<script>
  import Scroller from '@sveltejs/svelte-scroller';
  export let segments = [];
  
  let index, offset, progress;
</script>

<Scroller
  top={0.2}
  bottom={0.8}
  bind:index
  bind:offset
  bind:progress
>
  <div slot="background" class="h-screen w-full flex items-center justify-center pointer-events-none">
    <div class="relative w-full max-w-4xl px-8">
      <!-- Background visualization that changes based on index -->
      <div class="absolute inset-0 bg-primary/5 blur-3xl transition-opacity druation-1000" style="opacity: {progress}" />
      <div class="text-[200px] font-black opacity-5 select-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 italic">
        NODE 0{index + 1}
      </div>
    </div>
  </div>

  <div slot="foreground" class="pointer-events-none">
    {#each segments as segment, i}
      <section class="h-screen flex items-center justify-center p-8">
        <div class="max-w-xl glass-card p-12 pointer-events-auto border-primary/20 bg-black/60 backdrop-blur-xl">
          <h2 class="text-4xl font-heading font-bold italic mb-6 text-primary">{segment.title}</h2>
          <p class="text-lg text-foreground/80 leading-relaxed font-body">{segment.content}</p>
        </div>
      </section>
    {/each}
  </div>
</Scroller>

<style>
  section {
    height: 100vh;
  }
</style>
