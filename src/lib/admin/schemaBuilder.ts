export type SchemaBuilderProperty = {
  id: string;
  key: string;
  value: string;
};

export type SchemaBuilderGroup = {
  id: string;
  label: string;
  properties: SchemaBuilderProperty[];
};

export type SchemaBuilderState = {
  rootLabel: string;
  properties: SchemaBuilderProperty[];
  groups: SchemaBuilderGroup[];
};

export function createSchemaBuilderProperty(
  key = "",
  value = "",
): SchemaBuilderProperty {
  return {
    id: `prop-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    key,
    value,
  };
}

export function createDefaultSchemaBuilderState(): SchemaBuilderState {
  return {
    rootLabel: "",
    properties: [createSchemaBuilderProperty("@type", "")],
    groups: [],
  };
}

export function createSchemaBuilderGroup(): SchemaBuilderGroup {
  return {
    id: `group-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    label: "",
    properties: [createSchemaBuilderProperty("@type", "")],
  };
}

export function buildSchemaBuilderJsonLd(
  state: SchemaBuilderState,
): Record<string, unknown> {
  const graph: Record<string, unknown> = {};

  for (const property of state.properties) {
    const key = property.key.trim();

    if (!key) {
      continue;
    }

    graph[key] = property.value.trim();
  }

  for (const group of state.groups) {
    const groupKey = group.label.trim();

    if (!groupKey) {
      continue;
    }

    const groupValue: Record<string, string> = {};

    for (const property of group.properties) {
      const key = property.key.trim();

      if (!key) {
        continue;
      }

      groupValue[key] = property.value.trim();
    }

    graph[groupKey] = groupValue;
  }

  if (state.rootLabel.trim()) {
    graph.name = state.rootLabel.trim();
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

export function formatSchemaBuilderJson(state: SchemaBuilderState): string {
  return JSON.stringify(buildSchemaBuilderJsonLd(state), null, 2);
}

export function getSchemaBuilderType(state: SchemaBuilderState): string {
  const typeProperty = state.properties.find(
    (property) => property.key.trim() === "@type",
  );

  return typeProperty?.value.trim() || "Custom Schema";
}
