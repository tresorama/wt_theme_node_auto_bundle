const { deleteDirectory } = require("./working-with-files-utilities");

/* =================================================== 
      GO
=================================================== */
const BASE = String(__dirname);

/* =================================================== 
  REMOVE DIRECTORY THAT EVEREY BUILD PROCESS WILL CREATE
=================================================== */
deleteDirectory(BASE + "/src");
deleteDirectory(BASE + "/pre_bundle");
deleteDirectory(BASE + "/preprocess");
deleteDirectory(BASE + "/postprocess");
