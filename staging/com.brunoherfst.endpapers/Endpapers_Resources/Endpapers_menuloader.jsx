#target indesign
#targetengine "Endpapers"

$.localize = true; // enable ExtendScript localisation engine

function load_Menu( menuSetup ) {
    try{
        var ID_APP_MENU = app.menus.item( '$ID/Main' );
        var menuHandlers = {
            'onInvoke' : function() {
                app.doScript(menuSetup.invokeFunction, ScriptLanguage.JAVASCRIPT, undefined, UndoModes.ENTIRE_SCRIPT, "Expand State Abbreviations");
            }};

        var menuInstaller = menuInstaller || ( function( MENU_ACTION_HANDLERS ) {

            var MENU_ACTION = app.scriptMenuActions.add( menuSetup.menuName );

            var eventListener;    
            for( eventListener in MENU_ACTION_HANDLERS ) {
                MENU_ACTION.eventListeners.add( eventListener, MENU_ACTION_HANDLERS[eventListener] );
            };

            var location = ID_APP_MENU;            
            for (var i = 0; i < menuSetup.locationPath.length; i++) {
                location = location.submenus.item( menuSetup.locationPath[i] );
            };

            var refItem  = location.menuItems.item( menuSetup.reference );

            location.menuItems.add( MENU_ACTION, menuSetup.beforeAfter, refItem );

            return true;

        })(menuHandlers);

    } catch (e) {
        alert("Error loading Export menu:\n" + e.message + " (Line " + e.line + " in file " + e.fileName + ")");
    };
};

function cleanPath(p){
    // Remove filename from path
    var r = /[^\\\/]*$/;
    return p.toString().replace(r, '');
};

function main(){

    // Locate script file
    //-------------------
    var scriptPath = cleanPath($.fileName);

    // The script file that needs loading
    var TARGETPATH = scriptPath + "Endpapers.jsxinc"
    var TARGETFILE = new File(TARGETPATH);

    if(!TARGETFILE.exists) {
        throw String( "Expected to find a file at: " + TARGETPATH );
    };

    // Run the Export script file
    //---------------------------
    try {
        var Endpapers = $.evalFile(TARGETFILE);
        Endpapers.create();
    } catch( err ) {
        alert("Endpapers Plugin:\n" + err.message + " (Line " + err.line + " in file " + err.fileName + ")");
    };
}

var menuSetup = {
    locationPath: [app.translateKeyString('$ID/TouchMenuFile'), app.translateKeyString("$ID/New")], // Array
    beforeAfter: LocationOptions.AFTER,
    reference: app.translateKeyString("$ID/Document") + "...",
    menuName: "Endpapers...",
    invokeFunction: main
};


load_Menu( menuSetup );
