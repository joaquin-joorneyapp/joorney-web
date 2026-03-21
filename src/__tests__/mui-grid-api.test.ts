/**
 * Static-analysis guard for MUI v7 Grid v2 API compliance.
 *
 * MUI v7 stable Grid (Grid v2) breaks silently when the old API is used:
 *   - `<Grid item>` — the item prop is ignored; Grid v2 doesn't need it.
 *   - `<Grid xs={n}>` — direct breakpoint props are forwarded as HTML
 *     attributes, NOT converted to CSS. Use size={{ xs: n }} instead.
 *   - `<Grid alignItems="…">` — system props on Grid are forwarded to the
 *     DOM and ignored. Use sx={{ alignItems: "…" }} instead.
 *
 * These tests scan every .tsx file in src/ and fail loudly if a violation
 * is introduced, so layout regressions are caught before they ship.
 */
import { readdirSync, readFileSync, statSync } from 'fs';
import { join, resolve } from 'path';
import { describe, expect, it } from 'vitest';

const SRC_DIR = resolve(__dirname, '..');

function getAllTsxFiles(dir: string): string[] {
  const result: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      result.push(...getAllTsxFiles(full));
    } else if (entry.endsWith('.tsx')) {
      result.push(full);
    }
  }
  return result;
}

function rel(file: string) {
  return file.replace(SRC_DIR + '/', '');
}

const tsxFiles = getAllTsxFiles(SRC_DIR);

describe('MUI Grid v7 API compliance', () => {
  it('no file uses the Grid v1 "item" prop — Grid v2 does not need it', () => {
    const violations = tsxFiles.filter((f) =>
      readFileSync(f, 'utf-8').includes('<Grid item')
    );
    expect(violations.map(rel)).toEqual([]);
  });

  it('no file uses direct breakpoint props on <Grid> — use size={{ xs, md }} instead', () => {
    // xs={n} sm={n} md={n} lg={n} xl={n} and xs={false} are forwarded as
    // HTML attributes in Grid v2 and do NOT generate CSS column widths.
    const pattern = /\b(?:xs|sm|md|lg|xl)=\{/;
    const violations = tsxFiles.filter((f) =>
      pattern.test(readFileSync(f, 'utf-8'))
    );
    expect(violations.map(rel)).toEqual([]);
  });

  it('no file uses alignItems/justifyContent as a direct JSX prop on a line containing <Grid', () => {
    // alignItems="…" and justifyContent="…" on a Grid element are NOT
    // processed as CSS in MUI v7. They must live inside sx={{}}.
    // We check each line: if a line has both <Grid and the forbidden prop
    // (without being inside sx={{}}) it is a violation.
    const violations = tsxFiles.filter((f) => {
      const lines = readFileSync(f, 'utf-8').split('\n');
      return lines.some(
        (line) =>
          line.includes('<Grid') &&
          /\b(?:alignItems|justifyContent)=/.test(line) &&
          !line.includes('sx=')
      );
    });
    expect(violations.map(rel)).toEqual([]);
  });
});
