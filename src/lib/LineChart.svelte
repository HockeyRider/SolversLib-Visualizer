<script lang="ts">
  import { onMount } from "svelte";
  import * as d3 from "d3";

  export let variables: Map<string, LogVariable>;
  export let currentIndex: number;
  export let onSeek: (index: number) => void;

  let svgElement: SVGSVGElement;
  let width = 800;
  let height = 400;
  const margin = { top: 20, right: 80, bottom: 40, left: 60 };

  $: visibleNumericVars = Array.from(variables.values()).filter(
    v => v.visible && typeof v.values[0]?.value === 'number'
  );

  $: {
    if (svgElement && visibleNumericVars.length > 0) {
      drawChart();
    }
  }

  function drawChart() {
    const svg = d3.select(svgElement);
    svg.selectAll("*").remove();

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const maxLength = Math.max(...visibleNumericVars.map(v => v.values.length));

    const xScale = d3
      .scaleLinear()
      .domain([0, maxLength - 1])
      .range([0, chartWidth]);

    const allValues = visibleNumericVars.flatMap(v => v.values.map(d => d.value as number));
    const yScale = d3
      .scaleLinear()
      .domain([Math.min(...allValues), Math.max(...allValues)])
      .nice()
      .range([chartHeight, 0]);

    g.append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale).ticks(10))
      .append("text")
      .attr("x", chartWidth / 2)
      .attr("y", 35)
      .attr("fill", "currentColor")
      .attr("text-anchor", "middle")
      .text("Time Index");

    g.append("g")
      .call(d3.axisLeft(yScale))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -45)
      .attr("x", -chartHeight / 2)
      .attr("fill", "currentColor")
      .attr("text-anchor", "middle")
      .text("Value");

    const line = d3
      .line<{ timestamp: string; value: any; index: number }>()
      .x(d => xScale(d.index))
      .y(d => yScale(d.value as number));

    visibleNumericVars.forEach(variable => {
      g.append("path")
        .datum(variable.values)
        .attr("fill", "none")
        .attr("stroke", variable.color)
        .attr("stroke-width", 2)
        .attr("d", line);

      const lastValue = variable.values[variable.values.length - 1];
      g.append("text")
        .attr("x", chartWidth + 5)
        .attr("y", yScale(lastValue.value as number))
        .attr("fill", variable.color)
        .attr("font-size", "12px")
        .attr("alignment-baseline", "middle")
        .text(variable.name);
    });

    if (currentIndex >= 0 && currentIndex < maxLength) {
      g.append("line")
        .attr("x1", xScale(currentIndex))
        .attr("x2", xScale(currentIndex))
        .attr("y1", 0)
        .attr("y2", chartHeight)
        .attr("stroke", "red")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5");
    }

    svg
      .append("rect")
      .attr("x", margin.left)
      .attr("y", margin.top)
      .attr("width", chartWidth)
      .attr("height", chartHeight)
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .style("cursor", "pointer")
      .on("click", (event: MouseEvent) => {
        const [mouseX] = d3.pointer(event);
        const index = Math.round(xScale.invert(mouseX - margin.left));
        if (index >= 0 && index < maxLength) {
          onSeek(index);
        }
      });
  }

  onMount(() => {
    const resizeObserver = new ResizeObserver(entries => {
      const entry = entries[0];
      width = entry.contentRect.width;
      height = entry.contentRect.height;
      if (svgElement) drawChart();
    });

    const parent = svgElement.parentElement;
    if (parent) resizeObserver.observe(parent);

    return () => resizeObserver.disconnect();
  });
</script>

<svg bind:this={svgElement} {width} {height} class="w-full h-full"></svg>
