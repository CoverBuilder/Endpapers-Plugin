#include "../staging/com.brunoherfst.endpapers/Endpapers_Resources/Endpapers.jsxinc"

var Doc = app.documents.add();

var originalUnits = Sky.getUtil("rulers").set( Doc, {units: "ciceros"} );

var newUnits = Doc.viewPreferences.horizontalMeasurementUnits;

Doc.close(SaveOptions.NO);

$.writeln( true == "CICEROS" );
