<script lang="ts">
  export let variables: Map<string, LogVariable>;
  export let currentIndex: number;

  function toggleVariable(name: string) {
    const variable = variables.get(name);
    if (variable) {
      variable.visible = !variable.visible;
      variables = variables;
    }
  }

  $: sortedVariables = Array.from(variables.values()).sort((a, b) => a.name.localeCompare(b.name));

  function getCurrentValue(variable: LogVariable) {
    if (currentIndex < 0 || currentIndex >= variable.values.length) {
      return 'N/A';
    }
    const value = variable.values[currentIndex]?.value;
    if (value === undefined) {
      const closestValue = variable.values.find(v => v.index <= currentIndex);
      return closestValue ? formatValue(closestValue.value) : 'N/A';
    }
    return formatValue(value);
  }

  function formatValue(value: any): string {
    if (typeof value === 'number') {
      return value.toFixed(3);
    }
    if (typeof value === 'object' && value !== null) {
      if ('x' in value && 'y' in value && 'heading' in value) {
        return `(${value.x.toFixed(2)}, ${value.y.toFixed(2)}, ${value.heading.toFixed(3)})`;
      }
      return JSON.stringify(value);
    }
    return String(value);
  }
</script>

<div class="w-64 h-full bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700 overflow-y-auto p-4">
  <h2 class="text-lg font-semibold mb-4">Variables</h2>

  <div class="space-y-2">
    {#each sortedVariables as variable}
      <div class="flex flex-col gap-1 p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700">
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={variable.visible}
            on:change={() => toggleVariable(variable.name)}
            class="cursor-pointer"
          />
          <div
            class="w-3 h-3 rounded-full"
            style="background-color: {variable.color}"
          ></div>
          <span class="text-sm font-medium flex-1">{variable.name}</span>
        </label>
        <div class="ml-8 text-xs text-neutral-600 dark:text-neutral-400">
          <div>Type: {variable.type}</div>
          <div>Value: {getCurrentValue(variable)}</div>
        </div>
      </div>
    {/each}
  </div>
</div>
