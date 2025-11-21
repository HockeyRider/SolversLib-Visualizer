<script lang="ts">
  import { onMount } from "svelte";
  import Navbar from "./lib/Navbar.svelte";
  import VariableSidebar from "./lib/VariableSidebar.svelte";
  import LineChart from "./lib/LineChart.svelte";
  import FieldView from "./lib/FieldView.svelte";
  import { parseLogFile } from "./utils/logParser";
  import hotkeys from 'hotkeys-js';

  let variables: Map<string, LogVariable> = new Map();
  let entries: LogEntry[] = [];
  let currentIndex: number = 0;
  let playing = false;
  let animationFrame: number;
  let previousTime: number | null = null;

  function loadFile(evt: Event) {
    const elem = evt.target as HTMLInputElement;
    const file = elem.files?.[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = function (e: ProgressEvent<FileReader>) {
        try {
          const result = e.target?.result as string;
          const parsedData = parseLogFile(result);
          entries = parsedData.entries;
          variables = parsedData.variables;
          currentIndex = 0;
        } catch (err) {
          console.error("Error parsing log file:", err);
          alert("Error parsing log file. Please check the file format.");
        }
      };

      reader.readAsText(file);
    }
  }

  function animate(timestamp: number) {
    if (previousTime !== null) {
      const deltaTime = timestamp - previousTime;

      const maxIndex = entries.length - 1;
      if (currentIndex >= maxIndex) {
        currentIndex = 0;
      } else {
        currentIndex += deltaTime * 0.01;
        if (currentIndex > maxIndex) {
          currentIndex = maxIndex;
        }
      }
    }

    previousTime = timestamp;

    if (playing) {
      requestAnimationFrame(animate);
    }
  }

  function play() {
    if (!playing && entries.length > 0) {
      playing = true;
      previousTime = null;
      animationFrame = requestAnimationFrame(animate);
    }
  }

  function pause() {
    playing = false;
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
  }

  function onSeek(index: number) {
    currentIndex = index;
  }

  onMount(() => {
    document.addEventListener("keydown", function (evt) {
      if (evt.code === "Space" && document.activeElement === document.body) {
        evt.preventDefault();
        if (playing) {
          pause();
        } else {
          play();
        }
      }
    });
  });
</script>

<Navbar {loadFile} />
<div class="w-screen h-screen pt-20 flex flex-row">
  <VariableSidebar {variables} {currentIndex} />

  <div class="flex-1 flex flex-col p-4 gap-4">
    <div class="flex-1 bg-white dark:bg-neutral-800 rounded-lg shadow-md p-4">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-semibold">Line Chart</h2>
        <div class="flex gap-2">
          {#if playing}
            <button
              on:click={pause}
              class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Pause
            </button>
          {:else}
            <button
              on:click={play}
              class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              disabled={entries.length === 0}
            >
              Play
            </button>
          {/if}
        </div>
      </div>

      {#if entries.length > 0}
        <LineChart {variables} currentIndex={Math.round(currentIndex)} {onSeek} />
      {:else}
        <div class="flex items-center justify-center h-full text-neutral-500">
          Load a log file to visualize data
        </div>
      {/if}
    </div>
  </div>

  <div class="w-96 p-4">
    <div class="h-full bg-white dark:bg-neutral-800 rounded-lg shadow-md p-4">
      <h2 class="text-lg font-semibold mb-4">Robot Position</h2>
      <div class="w-full h-[calc(100%-2rem)]">
        {#if entries.length > 0}
          <FieldView {variables} currentIndex={Math.round(currentIndex)} />
        {:else}
          <div class="flex items-center justify-center h-full text-neutral-500">
            No data loaded
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
