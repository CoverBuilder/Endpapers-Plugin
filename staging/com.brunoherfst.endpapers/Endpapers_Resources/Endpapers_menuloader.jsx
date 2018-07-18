#target indesign
#targetengine "Endpapers"

$.localize = true; // enable ExtendScript localisation engine

function load_Menu( menuSetup ) {
    try{
        var ID_APP_MENU = app.menus.item( '$ID/Main' );
        var cbHandlers = {
            'onInvoke' : function() {
                try{
                    app.doScript(main, ScriptLanguage.JAVASCRIPT, undefined, UndoModes.ENTIRE_SCRIPT, "Expand State Abbreviations");
                } catch(e){
                    throw(e);
                }
            }};

        var menuInstaller = menuInstaller || ( function( MENU_ACTION_HANDLERS ) {

            var MENU_ACTION = app.scriptMenuActions.add( menuSetup.menuName );

            var eventListener;
            
            for( eventListener in MENU_ACTION_HANDLERS ) {
                MENU_ACTION.eventListeners.add( eventListener, MENU_ACTION_HANDLERS[eventListener] );
            }

            var mainMenu = ID_APP_MENU.submenus.item( "$ID/" + menuSetup.mainMenu );
            // We need to be able to handle arrays for submenus here
            var subMenu = mainMenu.submenus.item( "$ID/" + menuSetup.subMenus[0] );

            var refItem  = subMenu.menuItems.item( "$ID/" + menuSetup.reference );
            
            subMenu.menuItems.add( MENU_ACTION, menuSetup.beforeAfter, refItem );

            return true;

        })(cbHandlers);
    } catch (e) {
        alert("Error loading Endpapers menu:\n" + e.message + " (Line " + e.line + " in file " + e.fileName + ")");
    }
}

function main(){

    // Locate script file
    //-------------------
    var scriptPath = $.fileName.toString().replace(/[^\\\/]*$/, '');

    // The script files that need loading
    var TARGETS = ["Endpapers.jsxinc"];

    var TARGETPATHS = [];
    var TARGETFILES = [];

    for (var i = 0; i < TARGETS.length; i++) {
        TARGETPATHS.push( scriptPath + TARGETS[i]  );
        TARGETFILES.push( new File(TARGETPATHS[i]) );
    };

    for (var i = 0; i < TARGETFILES.length; i++) {
        if(!TARGETFILES[i].exists) {
            throw String( "Expected to find a file at: " + TARGETPATHS[i] );
        }
    };

    // Run the Export script file
    //---------------------------
    try {
        for (var i = 0; i < TARGETFILES.length; i++) {
            $.evalFile(TARGETFILES[i]);
        }
    } catch( err ) {
        alert("Endpapers Plugin:\n" + err.message + " (Line " + err.line + " in file " + err.fileName + ")");
    };
}

var menuSetup = {
    mainMenu: app.translateKeyString("$ID/File"),
    subMenus: [app.translateKeyString("$ID/New...")],
    beforeAfter: LocationOptions.after,
    reference: app.translateKeyString("$ID/Document..."),
    menuName: "Endpapers...",
    invokeFunction: main
};


load_Menu( menuSetup );
