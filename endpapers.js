/*
  
  Endpapers: A CoverBuilder plug-in

  Create end-papers in InDesign

  https://github.com/CoverBuilder/Endpapers-Plugin

  Bruno Herfst 2018

*/

(function() {

    var Endpapers = {
        version: 1.0
    };

    //--------------------------
    // Load Modules
    //--------------------------

    #include 'node_modules/@extendscript/modules.init/init.js'
    #include 'node_modules/@extendscript/ind.util.rulers/rulers.js'

    //--------------------------
    // Load Application
    //--------------------------
    #include 'src/endpapers.create.js'

    return Endpapers;

})();
