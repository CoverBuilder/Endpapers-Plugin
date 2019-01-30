Endpapers.showUI = function ( Settings ) {
    
    // Load ExtendScript-Modules
    var Rulers = Sky.getUtil("rulers", Sky.throwCallback($.fileName, $.line));

    // Process Settings
    //- - - - - - - - - 
    var Data = { booktitle   : "Untitled",
                 units       : (Settings && Settings.units)? Settings.units : "mm",
                 width       : 0,
                 height      : 0,
                 bleed       : 5,
                 marginTop   : 0,
                 marginBot   : 0, 
                 marginLeft  : 0, 
                 marginRight : 0 };

    var sourceDoc = (Settings && Settings.sourceDoc)? Settings.sourceDoc : app.documents[0];

    if( sourceDoc.isValid ) {
        Data = Endpapers.getDocSettings( sourceDoc, Data.units );
    };

    // Override Settings
    Data.booktitle   = ( Settings && Settings.booktitle   )? Settings.booktitle   : Data.booktitle;
    Data.width       = ( Settings && Settings.width       )? Settings.width       : Data.width;
    Data.height      = ( Settings && Settings.height      )? Settings.height      : Data.height;
    Data.bleed       = ( Settings && Settings.bleed       )? Settings.bleed       : Data.bleed;
    Data.marginTop   = ( Settings && Settings.marginTop   )? Settings.marginTop   : Data.marginTop;
    Data.marginBot   = ( Settings && Settings.marginBot   )? Settings.marginBot   : Data.marginBot;
    Data.marginLeft  = ( Settings && Settings.marginLeft  )? Settings.marginLeft  : Data.marginLeft;
    Data.marginRight = ( Settings && Settings.marginRight )? Settings.marginRight : Data.marginRight;

    // Build UI
    //- - - - - - - - - 

    var dlg = app.dialogs.add({name:"Create Endpapers"});

    with(dlg.dialogColumns.add()){
        with(dialogRows.add()){
            with(dialogColumns.add()){
                var widthLabel  = staticTexts.add({staticLabel:"Width:"});
                var heightLabel = staticTexts.add({staticLabel:"Height:"});
                var bleedLabel  = staticTexts.add({staticLabel:"Bleed:"});
            }
            with(dialogColumns.add()){
                // MeasurementEditbox values are always in points
                var widthField  = measurementEditboxes.add({ editUnits: MeasurementUnits.MILLIMETERS, editValue: Rulers.convert(Data.width,  Data.units, "pt", 3) });
                var heightField = measurementEditboxes.add({ editUnits: MeasurementUnits.MILLIMETERS, editValue: Rulers.convert(Data.height, Data.units, "pt", 3) });
                var bleedField  = measurementEditboxes.add({ editUnits: MeasurementUnits.MILLIMETERS, editValue: Rulers.convert(Data.bleed,  Data.units, "pt", 3) });
            }
        }
    };

    if(dlg.show() == true){
        // TODO: Validate
        Data.height = Rulers.convert(heightField.editValue, "pt", Data.units, 3); 
        Data.width  = Rulers.convert(widthField.editValue,  "pt", Data.units, 3); 
        Data.bleed  = Rulers.convert(bleedField.editValue,  "pt", Data.units, 3); 
        return Endpapers.create( Data );
    } else {
        return "User pressed cancel";
    };
};
