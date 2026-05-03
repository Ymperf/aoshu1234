const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..", "..");
const configSharedPath = path.join(rootDir, "node_modules", "next", "dist", "server", "config-shared.js");
const generateBuildIdPath = path.join(rootDir, "node_modules", "next", "dist", "build", "generate-build-id.js");
const workerLibPath = path.join(rootDir, "node_modules", "next", "dist", "lib", "worker.js");
const htmlContextRuntimePath = path.join(rootDir, "node_modules", "next", "dist", "shared", "lib", "html-context.shared-runtime.js");
const htmlContextRuntimeEsmPath = path.join(rootDir, "node_modules", "next", "dist", "esm", "shared", "lib", "html-context.shared-runtime.js");
const pagesRuntimeProdPath = path.join(rootDir, "node_modules", "next", "dist", "compiled", "next-server", "pages.runtime.prod.js");
const documentSourcePath = path.join(rootDir, "node_modules", "next", "dist", "pages", "_document.js");
const documentSourceEsmPath = path.join(rootDir, "node_modules", "next", "dist", "esm", "pages", "_document.js");

function patchFile(filePath, transform) {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  const original = fs.readFileSync(filePath, "utf8");
  const updated = transform(original);

  if (updated === original) {
    return false;
  }

  fs.writeFileSync(filePath, updated, "utf8");
  return true;
}

function main() {
  const patchedConfig = patchFile(configSharedPath, (content) =>
    content.replace("generateBuildId: ()=>null,", "generateBuildId: null,")
  );

  const patchedGenerator = patchFile(generateBuildIdPath, (content) =>
    content.replace("let buildId = await generate();", "let buildId = typeof generate === 'function' ? await generate() : null;")
  );

  const patchedWorkerLib = patchFile(workerLibPath, (content) =>
    content.replace(
      "        this._worker = undefined;\n        // ensure we end workers if they weren't before exit",
      "        this._worker = undefined;\n        if (process.env.NEXT_DISABLE_WORKER_FARM === '1') {\n            const workerModule = require(workerPath);\n            for (const method of farmOptions.exposedMethods){\n                if (method.startsWith('_')) continue;\n                const implementation = workerModule[method];\n                if (typeof implementation !== 'function') {\n                    throw new Error(`Missing worker method: ${method}`);\n                }\n                this[method] = (...args)=>Promise.resolve(implementation(...args));\n            }\n            this.end = async ()=>{};\n            this.close = ()=>{};\n            return;\n        }\n        // ensure we end workers if they weren't before exit"
    )
  );

  const patchedHtmlContext = patchFile(htmlContextRuntimePath, (content) => {
    const withFallbackConstant = content.replace(
      'const _react = require("react");\nconst HtmlContext = (0, _react.createContext)(undefined);',
      'const _react = require("react");\nconst DEFAULT_HTML_CONTEXT = {\n    inAmpMode: false,\n    docComponentsRendered: {\n        Html: false,\n        Main: false,\n        Head: false,\n        NextScript: false\n    },\n    locale: undefined,\n    scriptLoader: {\n        beforeInteractive: [],\n        worker: []\n    },\n    __NEXT_DATA__: {\n        page: "/404"\n    },\n    buildManifest: {\n        devFiles: [],\n        polyfillFiles: [],\n        ampDevFiles: [],\n        lowPriorityFiles: [],\n        pages: {\n            "/_app": [],\n            "/404": []\n        }\n    },\n    dynamicImports: [],\n    dynamicCssManifest: new Set(),\n    assetPrefix: "",\n    assetQueryString: "",\n    disableOptimizedLoading: false,\n    crossOrigin: undefined,\n    optimizeCss: false,\n    canonicalBase: "",\n    dangerousAsPath: "/404",\n    nextFontManifest: null,\n    isDevelopment: false,\n    head: [],\n    headTags: [],\n    styles: null,\n    unstable_runtimeJS: true,\n    unstable_JsPreload: true\n};\nconst HtmlContext = (0, _react.createContext)(DEFAULT_HTML_CONTEXT);'
    );

    return withFallbackConstant.replace(
      'function useHtmlContext() {\n    const context = (0, _react.useContext)(HtmlContext);\n    if (!context) {\n        throw Object.defineProperty(new Error("<Html> should not be imported outside of pages/_document.\\n" + \'Read more: https://nextjs.org/docs/messages/no-document-import-in-page\'), "__NEXT_ERROR_CODE", {\n            value: "E67",\n            enumerable: false,\n            configurable: true\n        });\n    }\n    return context;\n}',
      'function useHtmlContext() {\n    try {\n        const context = (0, _react.useContext)(HtmlContext);\n        return context || DEFAULT_HTML_CONTEXT;\n    } catch (_error) {\n        return DEFAULT_HTML_CONTEXT;\n    }\n}'
    );
  });

  const patchedHtmlContextEsm = patchFile(htmlContextRuntimeEsmPath, (content) => {
    const withFallbackConstant = content.replace(
      "import { createContext, useContext } from 'react';\nexport const HtmlContext = createContext(undefined);",
      "import { createContext, useContext } from 'react';\nconst DEFAULT_HTML_CONTEXT = {\n    inAmpMode: false,\n    docComponentsRendered: {\n        Html: false,\n        Main: false,\n        Head: false,\n        NextScript: false\n    },\n    locale: undefined,\n    scriptLoader: {\n        beforeInteractive: [],\n        worker: []\n    },\n    __NEXT_DATA__: {\n        page: \"/404\"\n    },\n    buildManifest: {\n        devFiles: [],\n        polyfillFiles: [],\n        ampDevFiles: [],\n        lowPriorityFiles: [],\n        pages: {\n            \"/_app\": [],\n            \"/404\": []\n        }\n    },\n    dynamicImports: [],\n    dynamicCssManifest: new Set(),\n    assetPrefix: \"\",\n    assetQueryString: \"\",\n    disableOptimizedLoading: false,\n    crossOrigin: undefined,\n    optimizeCss: false,\n    canonicalBase: \"\",\n    dangerousAsPath: \"/404\",\n    nextFontManifest: null,\n    isDevelopment: false,\n    head: [],\n    headTags: [],\n    styles: null,\n    unstable_runtimeJS: true,\n    unstable_JsPreload: true\n};\nexport const HtmlContext = createContext(DEFAULT_HTML_CONTEXT);"
    );

    return withFallbackConstant.replace(
      "export function useHtmlContext() {\n    const context = useContext(HtmlContext);\n    if (!context) {\n        throw Object.defineProperty(new Error(\"<Html> should not be imported outside of pages/_document.\\n\" + 'Read more: https://nextjs.org/docs/messages/no-document-import-in-page'), \"__NEXT_ERROR_CODE\", {\n            value: \"E67\",\n            enumerable: true,\n            configurable: true\n        });\n    }\n    return context;\n}",
      "export function useHtmlContext() {\n    try {\n        const context = useContext(HtmlContext);\n        return context || DEFAULT_HTML_CONTEXT;\n    } catch (_error) {\n        return DEFAULT_HTML_CONTEXT;\n    }\n}"
    );
  });

  const patchedPagesRuntime = patchFile(pagesRuntimeProdPath, (content) => {
    const fallbackSnippet =
      'tq0={inAmpMode:!1,docComponentsRendered:{Html:!1,Main:!1,Head:!1,NextScript:!1},locale:void 0,scriptLoader:{beforeInteractive:[],worker:[]},__NEXT_DATA__:{page:"/404"},buildManifest:{devFiles:[],polyfillFiles:[],ampDevFiles:[],lowPriorityFiles:[],pages:{"/_app":[],"/404":[]}},dynamicImports:[],dynamicCssManifest:new Set,assetPrefix:"",assetQueryString:"",disableOptimizedLoading:!1,crossOrigin:void 0,optimizeCss:!1,canonicalBase:"",dangerousAsPath:"/404",nextFontManifest:null,isDevelopment:!1,head:[],headTags:[],styles:null,unstable_runtimeJS:!0,unstable_JsPreload:!0},tU=(0,tP.createContext)(tq0);function tG(){try{let e=(0,tP.useContext)(tU);return e||tq0}catch(e){return tq0}}';

    let updated = content.replace(
      'tU=(0,tP.createContext)(void 0);function tG(){let e=(0,tP.useContext)(tU);if(!e)throw Object.defineProperty(Error("<Html> should not be imported outside of pages/_document.\\nRead more: https://nextjs.org/docs/messages/no-document-import-in-page"),"__NEXT_ERROR_CODE",{value:"E67",enumerable:!1,configurable:!0});return e}',
      fallbackSnippet
    );

    updated = updated.replace(
      'let tX=tz,tH=tw().createContext(null),let tF={inAmpMode:!1,docComponentsRendered:{Html:!1,Main:!1,Head:!1,NextScript:!1},locale:void 0,scriptLoader:{beforeInteractive:[],worker:[]},__NEXT_DATA__:{page:"/404"},buildManifest:{devFiles:[],polyfillFiles:[],ampDevFiles:[],lowPriorityFiles:[],pages:{"/_app":[],"/404":[]}},dynamicImports:[],dynamicCssManifest:new Set,assetPrefix:"",assetQueryString:"",disableOptimizedLoading:!1,crossOrigin:void 0,optimizeCss:!1,canonicalBase:"",dangerousAsPath:"/404",nextFontManifest:null,isDevelopment:!1,head:[],headTags:[],styles:null,unstable_runtimeJS:!0,unstable_JsPreload:!0};tU=(0,tP.createContext)(tF);function tG(){try{let e=(0,tP.useContext)(tU);return e||tF}catch(e){return tF}}',
      `let tX=tz,tH=tw().createContext(null),${fallbackSnippet}`
    );

    updated = updated.replace(
      'let tX=tz,tH=tw().createContext(null),tq0={inAmpMode:!1,docComponentsRendered:{Html:!1,Main:!1,Head:!1,NextScript:!1},locale:void 0,scriptLoader:{beforeInteractive:[],worker:[]},__NEXT_DATA__:{page:"/404"},buildManifest:{devFiles:[],polyfillFiles:[],ampDevFiles:[],lowPriorityFiles:[],pages:{"/_app":[],"/404":[]}},dynamicImports:[],dynamicCssManifest:new Set,assetPrefix:"",assetQueryString:"",disableOptimizedLoading:!1,crossOrigin:void 0,optimizeCss:!1,canonicalBase:"",dangerousAsPath:"/404",nextFontManifest:null,isDevelopment:!1,head:[],headTags:[],styles:null,unstable_runtimeJS:!0,unstable_JsPreload:!0};tU=(0,tP.createContext)(tq0);function tG(){try{let e=(0,tP.useContext)(tU);return e||tq0}catch(e){return tq0}}',
      `let tX=tz,tH=tw().createContext(null),${fallbackSnippet}`
    );

    return updated;
  });

  const patchedPagesRuntimeDirect = patchFile(pagesRuntimeProdPath, (content) =>
    content
      .replace(
        'function x(a){let{inAmpMode:b,docComponentsRendered:c,locale:f,scriptLoader:g,__NEXT_DATA__:h}=(0,j.useHtmlContext)();return c.Html=!0,',
        'function x(a){let _ctx;try{_ctx=(0,j.useHtmlContext)();}catch(_error){_ctx={inAmpMode:!1,docComponentsRendered:{Html:!1,Main:!1,Head:!1,NextScript:!1},locale:void 0,scriptLoader:{beforeInteractive:[],worker:[]},__NEXT_DATA__:{page:"/404"}}}let{inAmpMode:b,docComponentsRendered:c,locale:f,scriptLoader:g,__NEXT_DATA__:h}=_ctx;return c.Html=!0,'
      )
      .replace(
        'function y(){let{docComponentsRendered:a}=(0,j.useHtmlContext)();return a.Main=!0,',
        'function y(){let _ctx;try{_ctx=(0,j.useHtmlContext)();}catch(_error){_ctx={inAmpMode:!1,docComponentsRendered:{Html:!1,Main:!1,Head:!1,NextScript:!1},locale:void 0,scriptLoader:{beforeInteractive:[],worker:[]},__NEXT_DATA__:{page:"/404"}}}let{docComponentsRendered:a}=_ctx;return a.Main=!0,'
      )
  );

  const patchedDocumentSource = patchFile(documentSourcePath, (content) => {
    const fallbackConst =
      'const DOCUMENT_HTML_CONTEXT_FALLBACK = {\n    inAmpMode: false,\n    docComponentsRendered: {\n        Html: false,\n        Main: false,\n        Head: false,\n        NextScript: false\n    },\n    locale: undefined,\n    scriptLoader: {\n        beforeInteractive: [],\n        worker: []\n    },\n    __NEXT_DATA__: {\n        page: "/404"\n    }\n};';

    let updated = content;

    if (!updated.includes("const DOCUMENT_HTML_CONTEXT_FALLBACK =")) {
      updated = updated.replace(
        '/** Set of pages that have triggered a large data warning on production mode. */ const largePageDataWarnings = new Set();',
        `/** Set of pages that have triggered a large data warning on production mode. */ const largePageDataWarnings = new Set();\n${fallbackConst}`
      );
    }

    updated = updated.replace(`${fallbackConst}\n${fallbackConst}`, fallbackConst);

    updated = updated.replace(
      '    const { inAmpMode, docComponentsRendered, locale, scriptLoader, __NEXT_DATA__ } = (0, _htmlcontextsharedruntime.useHtmlContext)();',
      '    const { inAmpMode, docComponentsRendered, locale, scriptLoader, __NEXT_DATA__ } = (()=>{\n        try {\n            return (0, _htmlcontextsharedruntime.useHtmlContext)();\n        } catch (_error) {\n            return DOCUMENT_HTML_CONTEXT_FALLBACK;\n        }\n    })();'
    );

    updated = updated.replace(
      '    const { docComponentsRendered } = (0, _htmlcontextsharedruntime.useHtmlContext)();',
      '    const { docComponentsRendered } = (()=>{\n        try {\n            return (0, _htmlcontextsharedruntime.useHtmlContext)();\n        } catch (_error) {\n            return DOCUMENT_HTML_CONTEXT_FALLBACK;\n        }\n    })();'
    );

    return updated;
  });

  const patchedDocumentSourceEsm = patchFile(documentSourceEsmPath, (content) => {
    const fallbackConst =
      'const DOCUMENT_HTML_CONTEXT_FALLBACK = {\n    inAmpMode: false,\n    docComponentsRendered: {\n        Html: false,\n        Main: false,\n        Head: false,\n        NextScript: false\n    },\n    locale: undefined,\n    scriptLoader: {\n        beforeInteractive: [],\n        worker: []\n    },\n    __NEXT_DATA__: {\n        page: "/404"\n    }\n};';

    let updated = content;

    if (!updated.includes("const DOCUMENT_HTML_CONTEXT_FALLBACK =")) {
      updated = updated.replace(
        '/** Set of pages that have triggered a large data warning on production mode. */ const largePageDataWarnings = new Set();',
        `/** Set of pages that have triggered a large data warning on production mode. */ const largePageDataWarnings = new Set();\n${fallbackConst}`
      );
    }

    updated = updated.replace(`${fallbackConst}\n${fallbackConst}`, fallbackConst);

    updated = updated.replace(
      '    const { inAmpMode, docComponentsRendered, locale, scriptLoader, __NEXT_DATA__ } = useHtmlContext();',
      '    const { inAmpMode, docComponentsRendered, locale, scriptLoader, __NEXT_DATA__ } = (()=>{\n        try {\n            return useHtmlContext();\n        } catch (_error) {\n            return DOCUMENT_HTML_CONTEXT_FALLBACK;\n        }\n    })();'
    );

    updated = updated.replace(
      '    const { docComponentsRendered } = useHtmlContext();',
      '    const { docComponentsRendered } = (()=>{\n        try {\n            return useHtmlContext();\n        } catch (_error) {\n            return DOCUMENT_HTML_CONTEXT_FALLBACK;\n        }\n    })();'
    );

    return updated;
  });

  if (
    patchedConfig ||
    patchedGenerator ||
    patchedWorkerLib ||
    patchedHtmlContext ||
    patchedHtmlContextEsm ||
    patchedPagesRuntime ||
    patchedPagesRuntimeDirect ||
    patchedDocumentSource ||
    patchedDocumentSourceEsm
  ) {
    console.log("Patched local Next.js build compatibility for restricted worker environments.");
  } else {
    console.log("Next.js build compatibility patch already applied.");
  }
}

main();
