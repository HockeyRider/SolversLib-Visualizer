import { getRandomColor } from "./draw";

export function parseLogFile(content: string): ParsedLogData {
  const lines = content.trim().split('\n');
  const entries: LogEntry[] = [];
  const variablesMap = new Map<string, LogVariable>();

  lines.forEach((line, index) => {
    const parts = line.split(';');
    if (parts.length >= 4) {
      const timestamp = parts[0];
      const type = parts[1];
      const name = parts[2];
      const valueStr = parts.slice(3).join(';');

      let value: any;

      if (type === 'Pose2d') {
        const match = valueStr.match(/\(([^,]+),\s*([^,]+),\s*([^)]+)\)/);
        if (match) {
          value = {
            x: parseFloat(match[1]),
            y: parseFloat(match[2]),
            heading: parseFloat(match[3])
          };
        }
      } else {
        value = parseFloat(valueStr);
        if (isNaN(value)) {
          value = valueStr;
        }
      }

      const entry: LogEntry = { timestamp, type, name, value };
      entries.push(entry);

      if (!variablesMap.has(name)) {
        variablesMap.set(name, {
          name,
          type,
          values: [],
          color: getRandomColor(),
          visible: true
        });
      }

      const variable = variablesMap.get(name)!;
      variable.values.push({ timestamp, value, index });
    }
  });

  return {
    entries,
    variables: variablesMap
  };
}

export function isNumericType(type: string): boolean {
  const numericTypes = ['int', 'long', 'double', 'float', 'short', 'byte', 'Integer', 'Long', 'Double', 'Float'];
  return numericTypes.includes(type) || type.toLowerCase().includes('number');
}
