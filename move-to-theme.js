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
      MOVE INTO THEME
=================================================== */
const BASE = String(__dirname);
const THEME_ROOT = [...BASE.split("/")].slice(0, -1).join("/");

const MOVE = {
  destination: THEME_ROOT + "/assets/dist",
  sources: [BASE + "/postprocess", BASE + "/minified"],
};

const ABSTRACT_MOVE = function (rules) {
  const { destination, sources: dirs } = rules;

  //get all files absolute path...
  let allFiles = [];
  dirs.forEach((dir) => (allFiles = [...allFiles, ...getAllFiles(dir)]));

  // filter only JS files
  const jsFiles = allFiles.filter((f) => getFileExtension(f).toLowerCase() === "js");

  // filter only CSS files
  const cssFiles = allFiles.filter((f) => getFileExtension(f).toLowerCase() === "css");

  // merge
  const toMove = [...jsFiles, ...cssFiles];

  // create final directory
  createDirectory(destination);

  toMove.forEach((file) => {
    copyFileSync(file, destination);
  });
};

ABSTRACT_MOVE(MOVE);
