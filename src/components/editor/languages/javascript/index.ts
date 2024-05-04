import { Monaco } from "@monaco-editor/react";
import { configureFormatting } from "./format";

export function configureJs(m: Monaco) {
  configureFormatting(m);

  m.languages.typescript.javascriptDefaults.setEagerModelSync(true);

  const compilerOptions = {
    // https://github.com/microsoft/TypeScript-Website/blob/v2/packages/sandbox/src/compilerOptions.ts
    strict: true,
    noImplicitAny: true,
    strictNullChecks: false,
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

    checkJs: true,
    allowJs: true,
    declaration: true,

    importHelpers: false,

    experimentalDecorators: true,
    emitDecoratorMetadata: true,
    moduleResolution: m.languages.typescript.ModuleResolutionKind.NodeJs,

    target: m.languages.typescript.ScriptTarget.ES2020,
    jsx: m.languages.typescript.JsxEmit.React,
    module: m.languages.typescript.ModuleKind.ESNext,
  };

  m.languages.typescript.javascriptDefaults.setCompilerOptions(compilerOptions);
  m.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
  });
}
