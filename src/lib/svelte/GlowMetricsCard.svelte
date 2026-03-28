<script>
  export let label = "";
  export let value = "";
  export let color = "text-primary";
  
  let mouseX = 0;
  let mouseY = 0;
  let container;

  function handleMouseMove(e) {
    if (!container) return;
    const rect = container.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  }
</script>

<div 
  bind:this={container}
  on:mousemove={handleMouseMove}
  class="relative overflow-hidden p-8 rounded-3xl bg-white/5 border border-white/10 transition-all hover:bg-white/10 group"
>
  <!-- Glow Effect Layer -->
  <div 
    class="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
    style="background: radial-gradient(400px circle at {mouseX}px {mouseY}px, rgba(59, 130, 246, 0.15), transparent 80%);"
  />

  <div class="relative z-10 space-y-1">
    <p class="text-[8px] font-bold uppercase tracking-[0.3em] text-primary">{label}</p>
    <div class="flex items-baseline gap-2">
      <span class="text-3xl font-heading font-bold {color} text-glow-soft">{value}</span>
    </div>
  </div>
</div>

<style>
  .text-glow-soft {
    text-shadow: 0 0 10px currentColor;
  }
</style>
