<script lang="ts">
  import { onMount } from "svelte";
  import * as d3 from "d3";
  import { darkMode } from "../stores";

  export let variables: Map<string, LogVariable>;
  export let currentIndex: number;

  let containerElement: HTMLDivElement;
  let robotWidth = 16;
  let robotHeight = 16;

  $: robotPoseVar = variables.get('robotPose');
  $: robotPose = robotPoseVar && currentIndex >= 0 && currentIndex < robotPoseVar.values.length
    ? (robotPoseVar.values.find(v => v.index <= currentIndex)?.value as Pose2d) || { x: 0, y: 0, heading: 0 }
    : { x: 0, y: 0, heading: 0 };

  $: x = d3
    .scaleLinear()
    .domain([-72, 72])
    .range([0, containerElement?.clientWidth ?? 144]);

  $: y = d3
    .scaleLinear()
    .domain([-72, 72])
    .range([containerElement?.clientHeight ?? 144, 0]);

  $: scale = d3
    .scaleLinear()
    .domain([0, 144])
    .range([0, containerElement?.clientWidth ?? 144]);

  $: robotX = x(robotPose.x);
  $: robotY = y(robotPose.y);
  $: robotHeadingDeg = -(robotPose.heading * 180 / Math.PI);

  $: fieldImageSrc = $darkMode === "light" ? "/fields/decode-light.webp" : "/fields/decode.webp";
</script>

<div
  bind:this={containerElement}
  class="w-full h-full relative bg-neutral-50 dark:bg-neutral-900 rounded-lg overflow-hidden"
>
  <img
    src={fieldImageSrc}
    alt="Field"
    class="absolute top-0 left-0 w-full h-full object-cover"
  />
  <img
    src="/robotimage copy.webp"
    alt="Robot"
    style={`position: absolute; top: ${robotY}px; left: ${robotX}px; transform: translate(-50%, -50%) rotate(${robotHeadingDeg}deg); width: ${scale(robotWidth)}px; height: ${scale(robotHeight)}px;`}
  />
</div>
