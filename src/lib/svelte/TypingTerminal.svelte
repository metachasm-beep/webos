<script>
  import { typewriter } from 'svelte-typewriter';
  export let text = "";
  export let speed = 20;
</script>

<div class="terminal-container p-6 bg-black/40 border border-primary/20 rounded-2xl font-mono text-sm leading-relaxed">
  <div class="flex items-center gap-2 mb-4 border-b border-primary/10 pb-2">
    <div class="h-2 w-2 rounded-full bg-red-500" />
    <div class="h-2 w-2 rounded-full bg-yellow-500" />
    <div class="h-2 w-2 rounded-full bg-green-500" />
    <span class="ml-2 text-[10px] uppercase tracking-widest text-primary/50">Neural Logic Synthesis</span>
  </div>
  
  <div use:typewriter={{ delay: 500, speed }}>
    <p class="text-foreground/90">{text}</p>
  </div>
</div>

<style>
  .terminal-container {
    box-shadow: inset 0 0 20px rgba(59, 130, 246, 0.05);
  }
</style>
