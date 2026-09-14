import { ToolButton } from "./tool-button";
import { useTools } from "./use-tools";
import type { UseToolsOptions } from "./use-tools";

export type ToolsGridProps = UseToolsOptions;

export function ToolsGrid(props: ToolsGridProps) {
  const tools = useTools(props);

  return (
    <div className="a11y-grid a11y-grid-cols-3 a11y-gap-3">
      {tools.map((tool) => (
        <ToolButton
          key={tool.id}
          icon={tool.icon}
          label={tool.label}
          active={tool.active}
          level={tool.level}
          dotCount={tool.dotCount}
          onClick={tool.onClick}
          aria-label={tool.ariaLabel}
        />
      ))}
    </div>
  );
}
