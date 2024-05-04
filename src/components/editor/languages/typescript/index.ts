import { Monaco } from "@monaco-editor/react";
import { configureFormatting } from "./format";

export function configureTs(monaco: Monaco) {
  configureFormatting(monaco);

  monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);

  // Typescript settings
  const _compilerOptions = {
    // jsx: m.languages.typescript.JsxEmit.Preserve,
    // jsxFactory: "React.createElement",
  };

  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    // https://github.com/microsoft/TypeScript-Website/blob/v2/packages/sandbox/src/compilerOptions.ts
    strict: true,
    noImplicitAny: true,
    strictNullChecks: true,
    strictFunctionTypes: true,
    strictPropertyInitialization: true,
    strictBindCallApply: true,
    noImplicitThis: true,
    noImplicitReturns: true,
    noUncheckedIndexedAccess: false,

    // 3.7 off, 3.8 on I think
    useDefineForClassFields: false,

    alwaysStrict: true,
    allowUnreachableCode: false,
    allowUnusedLabels: false,

    downlevelIteration: false,
    noEmitHelpers: false,
    noLib: false,
    noStrictGenericChecks: false,
    noUnusedLocals: false,
    noUnusedParameters: false,

    esModuleInterop: true,
    preserveConstEnums: false,
    removeComments: false,
    skipLibCheck: false,

    checkJs: false,
    allowJs: false,
    declaration: true,

    importHelpers: false,

    experimentalDecorators: true,
    emitDecoratorMetadata: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,

    target: monaco.languages.typescript.ScriptTarget.ES2020,
    jsx: monaco.languages.typescript.JsxEmit.React,
    module: monaco.languages.typescript.ModuleKind.ESNext,
  });

  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
  });
}
