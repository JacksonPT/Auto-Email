import { templateDefinitions } from "@/lib/domain";

const variablePattern = /{{\s*([a-z_]+)\s*}}/g;

export function extractVariables(content: string): string[] {
  return [...content.matchAll(variablePattern)].map((match) => match[1]);
}

export function unsupportedVariables(
  templateKey: string,
  subject: string,
  body: string,
): string[] {
  const definition =
    templateDefinitions[templateKey as keyof typeof templateDefinitions];
  if (!definition) return [templateKey];
  const supported = new Set<string>(definition.variables);
  return [
    ...new Set([...extractVariables(subject), ...extractVariables(body)]),
  ].filter((variable) => !supported.has(variable));
}

export function renderTemplate(
  content: string,
  values: Record<string, string | number | null>,
): string {
  return content.replace(variablePattern, (_, variable: string) => {
    const value = values[variable];
    if (value === null || value === undefined || value === "") {
      throw new Error(`Missing value for {{${variable}}}`);
    }
    return String(value);
  });
}
