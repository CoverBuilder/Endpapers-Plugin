/*
  
  Endpapers: A CoverBuilder plugin

  Create end-papers in InDesign

  https://github.com/CoverBuilder/Endpapers

  Bruno Herfst 2018

*/

targetengine "Endpapers"

var myApp = {
    version: 1.0
};

//-------------
// Load Modules
//-------------
#include 'node_modules/@extendscript/modules.init/modules.init.js'

//-------------
// Load Application
//-------------

#include 'src/body.js'

#include 'src/foot.js'

//-------------
// EOF
