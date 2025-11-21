interface LogEntry {
  timestamp: string;
  type: string;
  name: string;
  value: any;
}

interface Pose2d {
  x: number;
  y: number;
  heading: number;
}

interface ParsedLogData {
  entries: LogEntry[];
  variables: Map<string, LogVariable>;
}

interface LogVariable {
  name: string;
  type: string;
  values: { timestamp: string; value: any; index: number }[];
  color: string;
  visible: boolean;
}
