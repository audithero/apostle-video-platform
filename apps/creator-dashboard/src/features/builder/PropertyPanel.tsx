/**
 * Property Panel — right panel of the builder
 *
 * Dynamically renders form fields for the currently selected component
 * based on the component's propSchema from the registry.
 */
import { useEditor, useNode } from "@craftjs/core";
import { componentRegistry } from "@platform/component-registry";
import type { SDUIPropDef } from "@platform/sdui-schema";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ------------------------------------------------------------------ */
/*  Selected component inspector                                       */
/* ------------------------------------------------------------------ */

function NodeInspector() {
  const { id } = useEditor((state) => {
    const selectedIds = state.events.selected;
    return { id: selectedIds.size > 0 ? selectedIds.values().next().value : null };
  });

  if (!id) {
    return (
      <div className="flex h-full items-center justify-center px-4 text-center text-sm text-neutral-400">
        <div>
          <p className="font-medium">No component selected</p>
          <p className="mt-1 text-xs">Click a component on the canvas to edit its properties</p>
        </div>
      </div>
    );
  }

  return <NodeProperties nodeId={id as string} />;
}

/* ------------------------------------------------------------------ */
/*  Node properties form                                               */
/* ------------------------------------------------------------------ */

function NodeProperties({ nodeId }: { readonly nodeId: string }) {
  const { actions, node } = useEditor((state) => ({
    node: state.nodes[nodeId],
  }));

  if (!node) {
    return (
      <div className="p-4 text-sm text-neutral-400">Component not found</div>
    );
  }

  const resolvedName =
    typeof node.data.type === "string"
      ? node.data.type
      : (node.data.type as { resolvedName: string }).resolvedName;

  const def = componentRegistry.get(resolvedName);
  if (!def) {
    return (
      <div className="p-4 text-sm text-neutral-400">
        Unknown component type: {resolvedName}
      </div>
    );
  }

  const props = node.data.props as Record<string, unknown>;

  const updateProp = (key: string, value: unknown) => {
    actions.setProp(nodeId, (p: Record<string, unknown>) => {
      p[key] = value;
    });
  };

  return (
    <div className="flex h-full flex-col">
      {/* Component header */}
      <div className="border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          {def.displayName}
        </h3>
        <p className="mt-0.5 text-[11px] text-neutral-500">{def.description}</p>
      </div>

      {/* Property fields */}
      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4">
          {Object.entries(def.propSchema).map(([key, propDef]) => (
            <PropField
              key={key}
              propKey={key}
              propDef={propDef}
              value={props[key]}
              onChange={(value) => updateProp(key, value)}
            />
          ))}

          {Object.keys(def.propSchema).length === 0 && (
            <p className="text-sm text-neutral-400">
              This component has no configurable properties.
            </p>
          )}

          <Separator />

          {/* Delete button */}
          <button
            type="button"
            className="w-full rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
            onClick={() => {
              actions.delete(nodeId);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                actions.delete(nodeId);
              }
            }}
          >
            Delete Component
          </button>
        </div>
      </ScrollArea>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Individual property field renderer                                 */
/* ------------------------------------------------------------------ */

interface PropFieldProps {
  readonly propKey: string;
  readonly propDef: SDUIPropDef;
  readonly value: unknown;
  readonly onChange: (value: unknown) => void;
}

function PropField({ propKey, propDef, value, onChange }: PropFieldProps) {
  const fieldId = `prop-${propKey}`;

  switch (propDef.type) {
    case "string":
    case "url":
    case "image":
      return (
        <div className="space-y-1.5">
          <Label htmlFor={fieldId} className="text-xs font-medium">
            {propDef.label}
            {propDef.required && <span className="ml-1 text-red-500">*</span>}
          </Label>
          <Input
            id={fieldId}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={propDef.description ?? `Enter ${propDef.label.toLowerCase()}`}
            className="h-8 text-sm"
          />
          {propDef.description && propDef.type !== "string" && (
            <p className="text-[10px] text-neutral-400">{propDef.description}</p>
          )}
        </div>
      );

    case "richtext":
      return (
        <div className="space-y-1.5">
          <Label htmlFor={fieldId} className="text-xs font-medium">
            {propDef.label}
          </Label>
          <Textarea
            id={fieldId}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={propDef.description}
            rows={4}
            className="text-sm"
          />
        </div>
      );

    case "number":
      return (
        <div className="space-y-1.5">
          <Label htmlFor={fieldId} className="text-xs font-medium">
            {propDef.label}
          </Label>
          <Input
            id={fieldId}
            type="number"
            value={(value as number) ?? 0}
            onChange={(e) => onChange(Number(e.target.value))}
            step="any"
            className="h-8 text-sm"
          />
          {propDef.description && (
            <p className="text-[10px] text-neutral-400">{propDef.description}</p>
          )}
        </div>
      );

    case "boolean":
      return (
        <div className="flex items-center justify-between">
          <Label htmlFor={fieldId} className="text-xs font-medium">
            {propDef.label}
          </Label>
          <Switch
            id={fieldId}
            checked={Boolean(value)}
            onCheckedChange={(checked) => onChange(checked)}
          />
        </div>
      );

    case "color":
      return (
        <div className="space-y-1.5">
          <Label htmlFor={fieldId} className="text-xs font-medium">
            {propDef.label}
          </Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              id={fieldId}
              value={(value as string) ?? "#000000"}
              onChange={(e) => onChange(e.target.value)}
              className="h-8 w-8 cursor-pointer rounded border border-neutral-200"
            />
            <Input
              value={(value as string) ?? ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder="#000000"
              className="h-8 flex-1 text-sm"
            />
          </div>
        </div>
      );

    case "select":
      return (
        <div className="space-y-1.5">
          <Label htmlFor={fieldId} className="text-xs font-medium">
            {propDef.label}
          </Label>
          <Select
            value={(value as string) ?? ""}
            onValueChange={(v) => onChange(v)}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder={`Select ${propDef.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {propDef.options?.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );

    case "object":
      return (
        <div className="space-y-1.5">
          <Label htmlFor={fieldId} className="text-xs font-medium">
            {propDef.label}
          </Label>
          <Textarea
            id={fieldId}
            value={typeof value === "string" ? value : JSON.stringify(value ?? {}, null, 2)}
            onChange={(e) => {
              try {
                onChange(JSON.parse(e.target.value));
              } catch {
                // Keep the raw string while editing
              }
            }}
            rows={3}
            className="font-mono text-xs"
            placeholder="{}"
          />
          {propDef.description && (
            <p className="text-[10px] text-neutral-400">{propDef.description}</p>
          )}
        </div>
      );

    case "array":
      return (
        <div className="space-y-1.5">
          <Label htmlFor={fieldId} className="text-xs font-medium">
            {propDef.label}
          </Label>
          <Textarea
            id={fieldId}
            value={typeof value === "string" ? value : JSON.stringify(value ?? [], null, 2)}
            onChange={(e) => {
              try {
                onChange(JSON.parse(e.target.value));
              } catch {
                // Keep the raw string while editing
              }
            }}
            rows={4}
            className="font-mono text-xs"
            placeholder="[]"
          />
          {propDef.description && (
            <p className="text-[10px] text-neutral-400">{propDef.description}</p>
          )}
        </div>
      );

    default:
      return (
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">{propDef.label}</Label>
          <Input
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            className="h-8 text-sm"
          />
        </div>
      );
  }
}

/* ------------------------------------------------------------------ */
/*  Export                                                              */
/* ------------------------------------------------------------------ */

export function PropertyPanel() {
  return (
    <div className="flex h-full flex-col">
      <NodeInspector />
    </div>
  );
}
