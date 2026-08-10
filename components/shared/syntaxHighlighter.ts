import { PrismLight } from "react-syntax-highlighter";

import bash from "react-syntax-highlighter/dist/esm/languages/prism/bash";
import c from "react-syntax-highlighter/dist/esm/languages/prism/c";
import cpp from "react-syntax-highlighter/dist/esm/languages/prism/cpp";
import csharp from "react-syntax-highlighter/dist/esm/languages/prism/csharp";
import css from "react-syntax-highlighter/dist/esm/languages/prism/css";
import dart from "react-syntax-highlighter/dist/esm/languages/prism/dart";
import diff from "react-syntax-highlighter/dist/esm/languages/prism/diff";
import docker from "react-syntax-highlighter/dist/esm/languages/prism/docker";
import elixir from "react-syntax-highlighter/dist/esm/languages/prism/elixir";
import go from "react-syntax-highlighter/dist/esm/languages/prism/go";
import graphql from "react-syntax-highlighter/dist/esm/languages/prism/graphql";
import haskell from "react-syntax-highlighter/dist/esm/languages/prism/haskell";
import ini from "react-syntax-highlighter/dist/esm/languages/prism/ini";
import java from "react-syntax-highlighter/dist/esm/languages/prism/java";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import jsx from "react-syntax-highlighter/dist/esm/languages/prism/jsx";
import kotlin from "react-syntax-highlighter/dist/esm/languages/prism/kotlin";
import lua from "react-syntax-highlighter/dist/esm/languages/prism/lua";
import makefile from "react-syntax-highlighter/dist/esm/languages/prism/makefile";
import markdown from "react-syntax-highlighter/dist/esm/languages/prism/markdown";
import markup from "react-syntax-highlighter/dist/esm/languages/prism/markup";
import nginx from "react-syntax-highlighter/dist/esm/languages/prism/nginx";
import objectivec from "react-syntax-highlighter/dist/esm/languages/prism/objectivec";
import perl from "react-syntax-highlighter/dist/esm/languages/prism/perl";
import php from "react-syntax-highlighter/dist/esm/languages/prism/php";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
import r from "react-syntax-highlighter/dist/esm/languages/prism/r";
import ruby from "react-syntax-highlighter/dist/esm/languages/prism/ruby";
import rust from "react-syntax-highlighter/dist/esm/languages/prism/rust";
import scala from "react-syntax-highlighter/dist/esm/languages/prism/scala";
import scss from "react-syntax-highlighter/dist/esm/languages/prism/scss";
import sql from "react-syntax-highlighter/dist/esm/languages/prism/sql";
import swift from "react-syntax-highlighter/dist/esm/languages/prism/swift";
import toml from "react-syntax-highlighter/dist/esm/languages/prism/toml";
import tsx from "react-syntax-highlighter/dist/esm/languages/prism/tsx";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import yaml from "react-syntax-highlighter/dist/esm/languages/prism/yaml";
import zig from "react-syntax-highlighter/dist/esm/languages/prism/zig";

/**
 * Prism with an explicit language list.
 *
 * `import { Prism } from "react-syntax-highlighter"` pulls in `refractor/all`,
 * which is 594 language grammars — a 780 KB / 266 KB gzip chunk loaded eagerly
 * on every page that renders markdown. Registering the languages people
 * actually write about costs a fraction of that. A language that isn't
 * registered still renders, just without highlighting.
 */
const LANGUAGES: Record<string, unknown> = {
  bash,
  c,
  cpp,
  csharp,
  css,
  dart,
  diff,
  docker,
  elixir,
  go,
  graphql,
  haskell,
  ini,
  java,
  javascript,
  json,
  jsx,
  kotlin,
  lua,
  makefile,
  markdown,
  markup,
  nginx,
  objectivec,
  perl,
  php,
  python,
  r,
  ruby,
  rust,
  scala,
  scss,
  sql,
  swift,
  toml,
  tsx,
  typescript,
  yaml,
  zig,
};

/** Names people write in fences that Prism knows under a different key. */
const ALIASES: Record<string, unknown> = {
  "c++": cpp,
  "c#": csharp,
  cs: csharp,
  dockerfile: docker,
  gomod: go,
  html: markup,
  js: javascript,
  jsonc: json,
  kt: kotlin,
  mjs: javascript,
  objc: objectivec,
  py: python,
  rb: ruby,
  rs: rust,
  sass: scss,
  sh: bash,
  shell: bash,
  svg: markup,
  ts: typescript,
  xml: markup,
  yml: yaml,
  zsh: bash,
};

for (const [name, language] of Object.entries({ ...LANGUAGES, ...ALIASES })) {
  PrismLight.registerLanguage(name, language);
}

export { PrismLight as SyntaxHighlighter };
