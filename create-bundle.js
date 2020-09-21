const fs = require("fs");
const path = require("path");

const {
  pathExists,
  isAFile,
  isADirectory,
  deleteFile,
  deleteDirectory,
  createDirectory,
  ls,
  getAllFiles,
  getFileExtension,
  getAllSubFoldersRecursive,
  copyFileSync,
} = require("./working-with-files-utilities");

/* =================================================== 
      INITIALIZE TASK
=================================================== */

const ABSTRACT_CLONE = function (rules) {
  const { source, output, options = {} } = rules;
  const { hasGroups = false, css_js_subs = false } = options;

  //create destination folders
  createDirectory(output.js);
  createDirectory(output.css);

  // get all folders whre to search for "assets" sub folder..
  const allFoldersWhereToSearch = (function () {
    // special conditions for "9_load_assets"
    if (css_js_subs) {
      return [source];
    }

    // get all sub folders , one level
    const list = ls(source);
    const subFolders = list.filter((c) => isADirectory(c));
    if (!hasGroups) {
      return subFolders;
    }

    //special condition for "class_component"
    const classComponentGroups = [...subFolders];
    let result = [];
    classComponentGroups.forEach((group) => {
      const list = ls(group);
      const onlyFolders = list.filter((c) => isADirectory(c));
      result = [...result, ...onlyFolders];
    });
    return result;
  })();

  allFoldersWhereToSearch.forEach((comp) => {
    // there is an "assets" subdirectory ???
    let assets = fs.readdirSync(comp).find((x) => x === "assets");

    // if thereis not , next one...
    if (!assets) return;

    // make "assets" an absolute path
    assets = comp + "/" + assets;

    // add "assets" absolute path to an array
    // append also all subdirectories absolute path of "assets" ...
    const dirs = [assets, ...getAllSubFoldersRecursive(assets)];

    //get all files in all directories...
    let allFiles = [];
    dirs.forEach((dir) => (allFiles = [...allFiles, ...getAllFiles(dir)]));

    // filter only JS files
    const jsFiles = allFiles.filter((f) => getFileExtension(f).toLowerCase() === "js");

    // filter only CSS files
    const cssFiles = allFiles.filter((f) => getFileExtension(f).toLowerCase() === "css");

    // copy all JS files
    jsFiles.forEach((jsFile) => copyFileSync(jsFile, output.js));
    // copy all CSS files
    cssFiles.forEach((cssFile) => copyFileSync(cssFile, output.css));
  });
};
const ABSTRACT_BUNDLE = function (rules) {
  const { sources: dirs, output } = rules;

  //get all files absolute path...
  let allFiles = [];
  dirs.forEach((dir) => (allFiles = [...allFiles, ...getAllFiles(dir)]));

  // concat all the files content
  let content = "";
  allFiles.forEach((file) => {
    content += "\n" + String(fs.readFileSync(file)).trim() + "\n";
  });

  // write to a new file
  createDirectory(output.dir);
  const destination = output.dir + "/" + output.file;
  fs.writeFileSync(destination, content);
};

/* =================================================== 
      GO
=================================================== */

const BASE = String(__dirname);
const THEME_ROOT = [...BASE.split("/")].slice(0, -1).join("/");

/* =================================================== 
      CLONE SOURCE FILES INTO "src" FOLDER
=================================================== */
// const SOURCE_BASE = BASE;
const SOURCE_BASE = THEME_ROOT;

const CLONE = {
  wpCoreEnhancer: {
    source: SOURCE_BASE + "/functions-parts/0_WP/2_core_enhancer",
    output: {
      js: BASE + "/src/wp_core_enhancer/js",
      css: BASE + "/src/wp_core_enhancer/css",
    },
  },
  wpPluggable: {
    source: SOURCE_BASE + "/functions-parts/0_WP/3_wp_pluggable",
    output: {
      js: BASE + "/src/wp_pluggable/js",
      css: BASE + "/src/wp_pluggable/css",
    },
  },
  wcCoreEnhancer: {
    source: SOURCE_BASE + "/functions-parts/1_WC/2_core_enhancer",
    output: {
      js: BASE + "/src/wc_core_enhancer/js",
      css: BASE + "/src/wc_core_enhancer/css",
    },
  },
  wcPluggable: {
    source: SOURCE_BASE + "/functions-parts/1_WC/3_wc_pluggable",
    output: {
      js: BASE + "/src/wc_pluggable/js",
      css: BASE + "/src/wc_pluggable/css",
    },
  },
  classComponent: {
    source: SOURCE_BASE + "/functions-parts/3_THIS_PROJECT/5_class_components",
    output: {
      js: BASE + "/src/class_component/js",
      css: BASE + "/src/class_component/css",
    },
  },
  thisProject: {
    source: SOURCE_BASE + "/functions-parts/3_THIS_PROJECT/9_load_assets",
    output: {
      js: BASE + "/src/this_project/js",
      css: BASE + "/src/this_project/css",
    },
  },
};

ABSTRACT_CLONE(CLONE.wpCoreEnhancer);
ABSTRACT_CLONE(CLONE.wpPluggable);
ABSTRACT_CLONE(CLONE.wcCoreEnhancer);
ABSTRACT_CLONE(CLONE.wcPluggable);
ABSTRACT_CLONE({ ...CLONE.classComponent, options: { hasGroups: true } });
ABSTRACT_CLONE({ ...CLONE.thisProject, options: { css_js_subs: true } });

/* =================================================== 
      BUNDLE - STEP 1 - 
=================================================== */

const PREBUNDLE_CORE_JS = {
  sources: [
    CLONE.wpCoreEnhancer.output.js,
    CLONE.wpPluggable.output.js,
    CLONE.wcCoreEnhancer.output.js,
    CLONE.wcPluggable.output.js,
    CLONE.classComponent.output.js,
  ],
  output: {
    dir: BASE + "/pre_bundle/js",
    file: "core.js",
  },
};
const PREBUNDLE_CORE_CSS = {
  sources: [
    CLONE.wpCoreEnhancer.output.css,
    CLONE.wpPluggable.output.css,
    CLONE.wcCoreEnhancer.output.css,
    CLONE.wcPluggable.output.css,
    CLONE.classComponent.output.css,
  ],
  output: {
    dir: BASE + "/pre_bundle/css",
    file: "core.css",
  },
};

const PREBUNDLE_THIS_PROJECT_JS = {
  sources: [CLONE.thisProject.output.js],
  output: {
    dir: BASE + "/pre_bundle/js",
    file: "this_project.js",
  },
};
const PREBUNDLE_THIS_PROJECT_CSS = {
  sources: [CLONE.thisProject.output.css],
  output: {
    dir: BASE + "/pre_bundle/css",
    file: "this_project.css",
  },
};

ABSTRACT_BUNDLE(PREBUNDLE_CORE_JS);
ABSTRACT_BUNDLE(PREBUNDLE_CORE_CSS);
ABSTRACT_BUNDLE(PREBUNDLE_THIS_PROJECT_JS);
ABSTRACT_BUNDLE(PREBUNDLE_THIS_PROJECT_CSS);

/* =================================================== 
      BUNDLE - STEP 2 
=================================================== */

const FINALBUNDLE_JS = {
  sources: [PREBUNDLE_CORE_JS.output.dir],
  output: {
    dir: BASE + "/preprocess",
    file: "bundle.js",
  },
};
const FINALBUNDLE_CSS = {
  sources: [PREBUNDLE_CORE_CSS.output.dir],
  output: {
    dir: BASE + "/preprocess",
    file: "bundle.css",
  },
};

ABSTRACT_BUNDLE(FINALBUNDLE_JS);
ABSTRACT_BUNDLE(FINALBUNDLE_CSS);
