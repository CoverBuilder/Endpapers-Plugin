/*
  
  Endpapers: A CoverBuilder plug-in

  Create end-papers in InDesign

  https://github.com/CoverBuilder/Endpapers-Plugin

  Bruno Herfst 2018

*/

#targetengine "CoverBuilder"

var Endpapers = {
    version: 1.0
};

//--------------------------
// Load Modules
//--------------------------

#include 'node_modules/@extendscript/modules.init/init.js'
#include 'node_modules/@extendscript/aes.patch.bundle.array/array.js'
#include 'node_modules/@extendscript/ind.util.menuloader/menuloader.js'
#include 'node_modules/@extendscript/ind.util.rulers/rulers.js'
#include 'node_modules/@extendscript/ind.util.bounds/bounds.js'
#include 'node_modules/@extendscript/ind.util.pages/pages.js'
#include 'node_modules/@extendscript/ind.util.layer/layer.js'
#include 'node_modules/@extendscript/ind.util.pageitems/pageitems.js'

//--------------------------
// Load Application
//--------------------------
#include 'src/endpapers.create.js'
#include 'src/endpapers.getDocSettings.js'
#include 'src/endpapers.showUI.js'
#include 'src/endpapers.loadMenu.js'

//--------------------------
// Load Menu
//--------------------------
try {
    Endpapers.loadMenu();
} catch( err ) {
    alert("Endpapers Plugin:\n" + err.message + " (Line " + err.line + " in file " + err.fileName + ")");
};
