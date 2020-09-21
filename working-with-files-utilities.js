const fs = require("fs");
const path = require("path");

/* =================================================== 
      WORKING WITH FILES - UTILITIES
=================================================== */
const pathExists = (absPath) => fs.existsSync(absPath);
const isAFile = (absPath) => fs.lstatSync(absPath).isFile();
const isADirectory = (absPath) => fs.lstatSync(absPath).isDirectory();
const deleteFile = (absPath) => (pathExists(absPath) ? fs.unlinkSync(absPath) : null);
const deleteDirectory = (absPath) => {
  if (!pathExists(absPath)) {
    return;
  }
  rmdir(absPath);

  function rmdir(dir) {
    const list = ls(dir);
    for (var i = 0, l = list.length; i < l; i++) {
      const filePath = list[i];

      if (filePath == "." || filePath == "..") {
        // pass these files
      } else if (isADirectory(filePath)) {
        // rmdir recursively
        rmdir(filePath);
      } else {
        // rm fiilename
        deleteFile(filePath);
      }
    }
    fs.rmdirSync(dir);
  }
};
const createDirectory = (absPath) => fs.mkdirSync(absPath, { recursive: true });
const ls = (absPath) => fs.readdirSync(absPath).map((c) => absPath + "/" + c);
const getAllFiles = (absPath) => {
  const list = ls(absPath);
  const onlyFiles = list.filter((p) => isAFile(p));
  return onlyFiles;
};
const getFileExtension = (fileName) => {
  const parts = fileName.split(".");
  return String(parts[parts.length - 1]);
};
const getAllSubFoldersRecursive = (absPath) => {
  let result = [];
  getAllSubFolder(absPath);
  return result;

  function getAllSubFolder(b) {
    const list = ls(b);
    const onlyFolders = list.filter((p) => isADirectory(p));

    result = [...result, ...onlyFolders];

    onlyFolders.forEach((dir) => {
      getAllSubFolder(dir);
    });
  }
};
const copyFileSync = (source, target) => {
  var targetFile = target;

  //if target is a directory a new file with the same name will be created
  if (fs.existsSync(target)) {
    if (fs.lstatSync(target).isDirectory()) {
      targetFile = path.join(target, path.basename(source));
    }
  }

  fs.writeFileSync(targetFile, fs.readFileSync(source));
};

module.exports = {
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
};
