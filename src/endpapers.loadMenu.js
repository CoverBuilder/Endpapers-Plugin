Endpapers.loadMenu = function ( ) {

    // Load ExtendScript-Modules
    var MenuLoader = Sky.getUtil("menuloader", Sky.throwCallback($.fileName, $.line) );

    var MenuTemplate = new MenuLoader.template("Endpapers...", {
        path: [app.translateKeyString('$ID/TouchMenuFile'), app.translateKeyString("$ID/New")],
        loc: LocationOptions.AFTER,
        ref: app.translateKeyString("$ID/Document") + "...",
        fun: Endpapers.showUI
    });

    MenuLoader.load( MenuTemplate, true );

};